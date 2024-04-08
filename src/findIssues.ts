/**
 * Finding all issues in the body of a text.
 * @param body Text, release body.
 * @param issueTag Issue tag, i.e. 'DASH' or 'EX' etc.
 * @returns {Array<string>} Array of issues.
 */
export function findIssues(body: string, issueTag: string): string[] {
  const regex = new RegExp(`${issueTag}-\\d+`, 'g')
  return body.match(regex) || []
}
