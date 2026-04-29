import { writeFileSync } from 'fs'
import { execSync } from 'child_process'

const REPO = process.env.GITHUB_REPOSITORY || 'PokIsemaine/token_show'

function fetchIssues() {
  const cmd = `gh issue list --repo ${REPO} --label token-info --state open --limit 500 --json number,body,createdAt,updatedAt,labels`
  const raw = execSync(cmd, { encoding: 'utf-8' })
  return JSON.parse(raw)
}

function parseIssue(issue) {
  const body = issue.body || ''
  const fields = {}

  const patterns = [
    ['company', /### 公司[\s\S]*?\n\n(.+?)(?:\n\n|\n$)/],
    ['department', /### 部门\/团队[\s\S]*?\n\n(.+?)(?:\n\n|\n$)/],
    ['tokenType', /### Token 类型[\s\S]*?\n\n(.+?)(?:\n\n|\n$)/],
    ['monthlyQuota', /### 额度[\s\S]*?\n\n(.+?)(?:\n\n|\n$)/],
    ['reimbursementMethod', /### 报销方式[\s\S]*?\n\n(.+?)(?:\n\n|\n$)/],
    ['restrictions', /### 限制条件[\s\S]*?\n\n([\s\S]+?)(?:\n\n###|\n$)/],
    ['note', /### 备注[\s\S]*?\n\n([\s\S]+?)(?:\n\n###|\n$|$)/],
  ]

  for (const [key, regex] of patterns) {
    const match = body.match(regex)
    fields[key] = match ? match[1].trim().replace(/_No response_/g, '') : ''
  }

  return {
    id: `issue-${issue.number}`,
    company: fields.company || '未知',
    department: fields.department || '未填写',
    tokenType: fields.tokenType || '未知',
    monthlyQuota: fields.monthlyQuota || '未知',
    reimbursementMethod: fields.reimbursementMethod || '未知',
    restrictions: fields.restrictions || '',
    note: fields.note || '',
    submittedAt: issue.createdAt?.split('T')[0] || '',
    issueNumber: issue.number,
  }
}

function buildStats(entries) {
  const tokenTypes = {}
  for (const e of entries) {
    tokenTypes[e.tokenType] = (tokenTypes[e.tokenType] || 0) + 1
  }
  return {
    totalEntries: entries.length,
    companies: new Set(entries.map(e => e.company)).size,
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
    console.log('Writing empty data files')
    writeFileSync('data/entries.json', '[]\n')
    writeFileSync('data/stats.json', JSON.stringify(buildStats([]), null, 2) + '\n')
    return
  }

  console.log(`Found ${issues.length} issues with token-info label`)

  const entries = issues.map(parseIssue).filter(e => e.company !== '未知' || e.tokenType !== '未知')

  // Deduplicate by company + department + tokenType (keep latest)
  const seen = new Map()
  for (const e of entries) {
    const key = `${e.company}|${e.department}|${e.tokenType}`
    if (!seen.has(key)) {
      seen.set(key, e)
    }
  }
  const deduped = [...seen.values()]

  const stats = buildStats(deduped)

  writeFileSync('data/entries.json', JSON.stringify(deduped, null, 2) + '\n')
  writeFileSync('data/stats.json', JSON.stringify(stats, null, 2) + '\n')

  console.log(`Wrote ${deduped.length} entries and stats`)
}

main()
