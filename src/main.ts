import * as core from '@actions/core'
import * as github from '@actions/github'
import axios from 'axios'
import { findIssues } from './findIssues'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    console.log('Running action...')
    const isReleaseEvent: boolean = github.context.eventName === 'release'

    if (!isReleaseEvent) {
      core.setFailed('This action can only be run on release events.')
      return
    }

    console.log('Processing inputs...')
    const releaseBody: string = github.context.payload.release.body
    const releaseTag: string = github.context.payload.release.tag_name
    const releaseWebhookUrl: string = core.getInput('release-webhook-url')
    const issuesWebhookUrl: string = core.getInput('issues-webhook-url')
    const projectName: string = core.getInput('project-name')
    const issueTag: string = core.getInput('issue-tag')

    const versionName = `${projectName}-${releaseTag}`
    console.log(`Version name: ${versionName}`)

    const issues = findIssues(releaseBody, issueTag)
    console.log(`Issues: ${issues}`)

    console.log('Creating a fix version...')
    await axios.post(releaseWebhookUrl, {
      versionName,
      versionDescription: releaseBody
    })

    console.log('Updating issues...')
    await axios.post(issuesWebhookUrl, { versionName, issues })

    console.log('Action complete.')
  } catch (error) {
    if (core.isDebug()) console.log(error)

    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
