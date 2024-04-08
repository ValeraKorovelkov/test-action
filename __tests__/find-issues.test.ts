/**
 * Unit tests for src/wait.ts
 */

import { findIssues } from '../src/findIssues'
import { expect } from '@jest/globals'

describe('findIssues.ts', () => {
  it('find one issuet', async () => {
    const body = `This is a multiline text
    with a DASH-123 issue in it`
    const issueTag = 'DASH'
    const issues = findIssues(body, issueTag)
    expect(issues).toEqual(['DASH-123'])
  })

  it('find multiple issues', async () => {
    const body = `This is a multiline text
    with a DASH-123 issue in it and a DASH-456 issue`
    const issueTag = 'DASH'
    const issues = findIssues(body, issueTag)
    expect(issues).toEqual(['DASH-123', 'DASH-456'])
  })

  it('find no issues', async () => {
    const body = `This is a multiline text
    with no issues in it and a fake issue EX-123`
    const issueTag = 'DASH'
    const issues = findIssues(body, issueTag)
    expect(issues).toEqual([])
  })
})
