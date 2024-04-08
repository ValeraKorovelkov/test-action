/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 */

import * as core from '@actions/core'
import * as github from '@actions/github'
import axios from 'axios'
import * as main from '../src/main'

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

// Mock the GitHub Actions core library
let errorMock: jest.SpiedFunction<typeof core.error>
let getInputMock: jest.SpiedFunction<typeof core.getInput>
let setFailedMock: jest.SpiedFunction<typeof core.setFailed>
let axiosPostMock: jest.SpiedFunction<typeof axios.post>

const originalContext = { ...github.context }

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    errorMock = jest.spyOn(core, 'error').mockImplementation()
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
    axiosPostMock = jest.spyOn(axios, 'post').mockImplementation()
  })

  afterEach(() => {
    // Restore original @actions/github context
    Object.defineProperty(github, 'context', {
      value: originalContext
    })
  })

  it('calls webhook', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'release-webhook-url':
          return 'https://example.com/release'
        case 'issues-webhook-url':
          return 'https://example.com/issue'
        case 'project-name':
          return 'example'
        case 'issue-tag':
          return 'ISSUE'
        default:
          return ''
      }
    })

    Object.defineProperty(github, 'context', {
      value: {
        eventName: 'release',
        payload: {
          release: {
            body: 'This is a release with ISSUE-1 and ISSUE-2',
            tag_name: '1.0.0'
          }
        }
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(setFailedMock).not.toHaveBeenCalled()
    expect(errorMock).not.toHaveBeenCalled()

    // Verify that the axios.post() calls were made with the correct arguments
    expect(axiosPostMock).toHaveBeenNthCalledWith(
      1,
      'https://example.com/release',
      {
        versionName: 'example-1.0.0',
        versionDescription: 'This is a release with ISSUE-1 and ISSUE-2'
      }
    )
    expect(axiosPostMock).toHaveBeenNthCalledWith(
      2,
      'https://example.com/issue',
      {
        versionName: 'example-1.0.0',
        issues: ['ISSUE-1', 'ISSUE-2']
      }
    )
  })

  it('sets failed if event is not release', async () => {
    Object.defineProperty(github, 'context', {
      value: {
        eventName: 'push'
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(setFailedMock).toHaveBeenCalledWith(
      'This action can only be run on release events.'
    )
    expect(errorMock).not.toHaveBeenCalled()

    // Verify that the axios.post() calls were not made
    expect(axiosPostMock).not.toHaveBeenCalled()
  })
})
