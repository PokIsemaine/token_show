import { writeFileSync } from 'fs'
import { execSync } from 'child_process'

const REPO = process.env.GITHUB_REPOSITORY || 'PokIsemaine/token_show'

function fetchIssues() {
  const cmd = `gh issue list --repo ${REPO} --label token-info --state open --limit 500 --json number,body,createdAt,updatedAt,labels`
  const raw = execSync(cmd, { encoding: 'utf-8' })
  return JSON.parse(raw)
}

function fetchComments(issueNumber) {
  try {
    const cmd = `gh issue comment list --repo ${REPO} ${issueNumber} --json author,body,createdAt --limit 50`
    const raw = execSync(cmd, { encoding: 'utf-8' })
    const comments = JSON.parse(raw)
    // Filter out bot comments (from the data update workflow)
    return comments.filter(c => !c.author.login.includes('github-actions'))
      .map(c => ({
        author: c.author.login,
        body: c.body,
        createdAt: c.createdAt,
      }))
  } catch {
    return []
  }
}

function parseIssue(issue) {
  const body = issue.body || ''

  function parseCheckboxes(sectionName) {
    const sectionRegex = new RegExp(`### ${sectionName}[^\\n]*\\n[\\s\\S]*?(?=###|\\n---|$)`)
    const match = body.match(sectionRegex)
    if (!match) return []
    const lines = match[0].split('\n')
    const checked = []
    for (const line of lines) {
      const checkedMatch = line.match(/^- \\[(x| )\\] (.+)/i)
      if (checkedMatch && checkedMatch[1].toLowerCase() === 'x') {
        checked.push(checkedMatch[2].trim())
      }
    }
    return checked
  }

  function parseInput(fieldName) {
    const regex = new RegExp(`${fieldName}:\\s*(.+?)(?:\\n|$)`, 'i')
    const match = body.match(regex)
    return match ? match[1].trim().replace(/_No response_/g, '').replace(/^- /, '') : ''
  }

  function parseTextarea(fieldName) {
    const regex = new RegExp(`### ${fieldName}[\\s\\S]*?\\n\\n([\\s\\S]*?)(?=###|\\n---|$)`, 'i')
    const match = body.match(regex)
    return match ? match[1].trim().replace(/_No response_/g, '').replace(/^- /, '').trim() : ''
  }

  // Company
  const companyBoxes = parseCheckboxes('公司')
  const companyOther = parseInput('companyOther')
  let company = companyBoxes.filter(c => c !== '其他')
  if (companyOther && !company.includes(companyOther)) {
    company.push(companyOther)
  }

  // Token Type
  const tokenBoxes = parseCheckboxes('Token 类型')
  const tokenOther = parseInput('tokenTypeOther')
  let tokenType = tokenBoxes.filter(t => t !== '其他')
  if (tokenOther && !tokenType.includes(tokenOther)) {
    tokenType.push(tokenOther)
  }

  // Quota
  const quotaAmount = parseInput('quotaAmount') || '未知'
  const quotaUnitBoxes = parseCheckboxes('额度单位')
  const quotaUnitOther = parseInput('quotaUnitOther')
  let quotaUnit = quotaUnitBoxes.filter(u => u !== '其他')
  if (quotaUnitOther && !quotaUnit.includes(quotaUnitOther)) {
    quotaUnit.push(quotaUnitOther)
  }
  const quotaPeriodBoxes = parseCheckboxes('报销周期')
  // Combine quota: amount + unit + period
  const unitStr = [...new Set(quotaUnit)].join('')
  const periodStr = quotaPeriodBoxes.join('、')
  const monthlyQuota = `${quotaAmount} ${unitStr}${periodStr ? ' ' + periodStr : ''}`.trim()

  // Reimbursement Method
  const methodBoxes = parseCheckboxes('报销方式')
  const methodOther = parseInput('reimbursementMethodOther')
  let reimbursementMethod = methodBoxes.filter(m => m !== '其他')
  if (methodOther && !reimbursementMethod.includes(methodOther)) {
    reimbursementMethod.push(methodOther)
  }

  // Deduplicate
  company = [...new Set(company.filter(Boolean))]
  tokenType = [...new Set(tokenType.filter(Boolean))]
  reimbursementMethod = [...new Set(reimbursementMethod.filter(Boolean))]

  // Get comments
  const comments = fetchComments(issue.number)

  // Build entries
  const entries = []
  const seen = new Map()

  for (const c of company) {
    for (const t of tokenType) {
      for (const m of reimbursementMethod) {
        const key = `${c}|${t}|${m}`
        if (!seen.has(key)) {
          seen.set(key, true)
          entries.push({
            id: `issue-${issue.number}-${c}-${t}-${m}`.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').slice(0, 100),
            company: c,
            department: parseInput('部门') || '未填写',
            tokenType: t,
            monthlyQuota: parseInput('额度') || '未知',
            reimbursementMethod: m,
            restrictions: parseTextarea('限制条件'),
            note: parseTextarea('备注'),
            publishedAt: issue.createdAt?.split('T')[0] || '',
            submittedAt: issue.createdAt?.split('T')[0] || '',
            issueNumber: issue.number,
            comments,
          })
        }
      }
    }
  }

  return entries
}

function buildStats(entries) {
  const tokenTypes = {}
  const companies = new Set()
  for (const e of entries) {
    companies.add(e.company)
    tokenTypes[e.tokenType] = (tokenTypes[e.tokenType] || 0) + 1
  }
  return {
    totalEntries: entries.length,
    companies: companies.size,
    tokenTypes,
    lastUpdated: new Date().toISOString().split('T')[0],
  }
}

function main() {
  console.log('Fetching issues...')
  let issues
  try {
    issues = fetchIssues()
  } catch (err) {
    console.error('Failed to fetch issues:', err.message)
    writeFileSync('data/entries.json', '[]\n')
    writeFileSync('data/stats.json', JSON.stringify(buildStats([]), null, 2) + '\n')
    return
  }

  console.log(`Found ${issues.length} issues with token-info label`)

  const allEntries = []
  for (const issue of issues) {
    console.log(`Processing issue #${issue.number}...`)
    const parsed = parseIssue(issue)
    allEntries.push(...parsed)
    console.log(`  -> ${parsed.length} entries`)
  }

  const stats = buildStats(allEntries)

  writeFileSync('data/entries.json', JSON.stringify(allEntries, null, 2) + '\n')
  writeFileSync('data/stats.json', JSON.stringify(stats, null, 2) + '\n')

  console.log(`Wrote ${allEntries.length} entries and stats`)
}

main()
