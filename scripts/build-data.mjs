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
    const cmd = `gh api repos/${REPO}/issues/${issueNumber}/comments --jq '.[] | select(.user.login | contains("github-actions") | not) | {author: .user.login, body: .body, createdAt: .created_at}'`
    const raw = execSync(cmd, { encoding: 'utf-8' })
    if (!raw.trim()) return []
    return raw.trim().split('\n').map(line => JSON.parse(line))
  } catch {
    return []
  }
}

function parseIssue(issue) {
  const body = issue.body || ''

  // Parse checkboxes section
  function parseCheckboxes(sectionName) {
    const sectionRegex = new RegExp(`### ${sectionName}[\\s\\S]*?(?=###|\\n---|$)`)
    const match = body.match(sectionRegex)
    if (!match) return []
    const lines = match[0].split('\n')
    const checked = []
    for (const line of lines) {
      const checkedMatch = line.match(/^- \[x\] (.+)/i)
      if (checkedMatch) checked.push(checkedMatch[1].trim())
    }
    return checked
  }

  // Parse section content (for dropdown / single select fields)
  function parseSection(sectionName) {
    const regex = new RegExp(`### ${sectionName}\\s*\\n\\n([^\\n]+)`, 'i')
    const match = body.match(regex)
    return match ? match[1].trim().replace(/_No response_/g, '').replace(/^- /, '') : ''
  }

  // Company: single select dropdown
  const companyRaw = parseSection('公司')
  let company = []
  if (companyRaw && companyRaw !== '请选择公司...') {
    if (companyRaw === '其他' && parseSection('其他公司名称')) {
      company.push(parseSection('其他公司名称'))
    } else {
      company.push(companyRaw)
    }
  }

  // Supplier
  const tokenBoxes = parseCheckboxes('供应商（可多选）')
  const tokenOther = parseSection('其他供应商')
  let tokenType = tokenBoxes.filter(t => t !== '其他')
  if (tokenOther && !tokenType.includes(tokenOther)) {
    tokenType.push(tokenOther)
  }

  // Quota: amount + unit + period
  const quotaAmount = parseSection('额度数值') || '未知'
  const quotaUnitBoxes = parseCheckboxes('额度单位')
  const quotaUnitOther = parseSection('其他单位')
  let quotaUnit = quotaUnitBoxes.filter(u => u !== '其他')
  if (quotaUnitOther && !quotaUnit.includes(quotaUnitOther)) {
    quotaUnit.push(quotaUnitOther)
  }
  const quotaPeriodBoxes = parseCheckboxes('报销周期')
  // Normalize unit display
  const unitMap = { '$（美元）': '$', '¥（人民币）': '¥', 'Token 数量': 'Token' }
  const displayUnit = quotaUnit.map(u => unitMap[u] || u).join('')
  const displayPeriod = quotaPeriodBoxes.join('/')
  const monthlyQuota = displayPeriod
    ? `${quotaAmount} ${displayUnit} / ${displayPeriod}`
    : `${quotaAmount} ${displayUnit}`

  // Reimbursement Method
  const methodBoxes = parseCheckboxes('报销方式')
  const methodOther = parseSection('其他报销方式')
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

  // Build entries - one per company, with all suppliers and methods aggregated
  const entries = []
  const seen = new Map()

  for (const c of company) {
    if (!seen.has(c)) {
      seen.set(c, true)
      entries.push({
        id: `i${issue.number}-${c}`.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9一-龥-]/g, '').slice(0, 80),
        company: c,
        department: parseSection('部门/团队') || '未填写',
        tokenType,
        monthlyQuota,
        reimbursementMethod: reimbursementMethod,
        restrictions: parseSection('限制条件') || '',
        note: parseSection('备注') || '',
        publishedAt: issue.createdAt?.split('T')[0] || '',
        submittedAt: issue.createdAt?.split('T')[0] || '',
        issueNumber: issue.number,
        comments,
      })
    }
  }

  return entries
}

function buildStats(entries) {
  const tokenTypes = {}
  const companies = new Set()
  for (const e of entries) {
    companies.add(e.company)
    for (const t of e.tokenType) {
      tokenTypes[t] = (tokenTypes[t] || 0) + 1
    }
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
