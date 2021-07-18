import * as core from '@actions/core'
import {RequestError} from '@octokit/request-error'
import Octokit from './getOctokit'
import {ActionInputs, ActionOutputs} from './inputs'
import {
  lint,
  resultFormatter,
  markdownFormatter,
  jsonFormatter
} from 'repolinter'
import * as fs from 'fs'
import createOrUpdateIssue from './createorUpdateIssue'

function getInputs(): {[key: string]: string} {
  return {
    DIRECTORY: core.getInput(ActionInputs.DIRECTORY, {required: true}),
    TOKEN: core.getInput(ActionInputs.TOKEN),
    USERNAME: core.getInput(ActionInputs.USERNAME, {required: true}),
    CONFIG_URL: core.getInput(ActionInputs.CONFIG_URL),
    CONFIG_FILE: core.getInput(ActionInputs.CONFIG_FILE),
    REPO: core.getInput(ActionInputs.REPO, {required: true}),
    OUTPUT_TYPE: core.getInput(ActionInputs.OUTPUT_TYPE, {required: true}),
    OUTPUT_NAME: core.getInput(ActionInputs.OUTPUT_NAME, {required: true}),
    LABEL_NAME: core.getInput(ActionInputs.LABEL_NAME, {required: true}),
    LABEL_COLOR: core.getInput(ActionInputs.LABEL_COLOR, {required: true})
  }
}

function getRunNumber(): number {
  const runNum = parseInt(process.env['GITHUB_RUN_NUMBER'] as string)
  if (!runNum || isNaN(runNum))
    throw new Error(
      `Found invalid GITHUB_RUN_NUMBER "${process.env['GITHUB_RUN_NUMBER']}"`
    )
  return runNum
}

export default async function run(disableRetry?: boolean): Promise<void> {
  // load the configuration from file or url, depending on which one is configured
  try {
    // get all inputs
    const {
      DIRECTORY,
      TOKEN,
      USERNAME,
      CONFIG_FILE,
      CONFIG_URL,
      REPO,
      OUTPUT_TYPE,
      OUTPUT_NAME,
      LABEL_NAME,
      LABEL_COLOR
    } = getInputs()
    const RUN_NUMBER = getRunNumber()
    // verify the directory exists and is a directory
    try {
      const stat = await fs.promises.stat(DIRECTORY)
      if (!stat.isDirectory())
        throw new Error(
          `Supplied input directory ${DIRECTORY} is not a directory`
        )
    } catch (e) {
      throw e
    }
    // verify the output type is correct
    if (OUTPUT_TYPE !== 'exit-code' && OUTPUT_TYPE !== 'issue')
      throw new Error(`Invalid output paramter value ${OUTPUT_TYPE}`)
    // verify the label name is a string
    if (!LABEL_NAME) throw new Error(`Invalid label name value ${LABEL_NAME}`)
    // verify the label color is a color
    if (!/[0-9a-fA-F]{6}/.test(LABEL_COLOR))
      throw new Error(`Invalid label color ${LABEL_COLOR}`)
    // override GITHUB_TOKEN and INPUT_GITHUB_TOKEN if INPUT_TOKEN is present
    if (TOKEN) {
      delete process.env['INPUT_TOKEN']
      delete process.env['INPUT_GITHUB_TOKEN']
      process.env['GITHUB_TOKEN'] = TOKEN
    }
    // get the config
    const config = CONFIG_FILE || CONFIG_URL || null
    // run the linter!
    const result = await lint(DIRECTORY, undefined, config, true)
    core.debug(JSON.stringify(result))
    // print the formatted result
    core.startGroup('Repolinter Output')
    core.info(resultFormatter.formatOutput(result, true))
    core.endGroup()
    // if repolinter errored, set failed
    if (result.errored)
      core.setFailed(`Repolinter failed with error: ${result.errMsg}`)
    else if (OUTPUT_TYPE === 'exit-code') {
      // else output the exit code
      if (!result.passed) core.setFailed('Repolinter ruleset did not pass.')
      else process.exitCode = 0
    } else if (OUTPUT_TYPE === 'issue') {
      // else output an issue, and don't set the exit code
      const octokit = new Octokit({
        request: disableRetry ? {retries: 0} : undefined,
        log: {
          debug: core.debug,
          info: core.info,
          warn: core.warning,
          error: core.error
        }
      })
      octokit.hook.after('request', (response, options) =>
        core.debug(
          `${options.method} ${options.url}: ${JSON.stringify(response)}`
        )
      )

      const [owner, repo] = REPO.split('/')
      const issueContent = markdownFormatter.formatOutput(result, true)
      // create an issue!
      core.startGroup('Creating/Updating Issue')
      await createOrUpdateIssue(octokit, {
        owner,
        repo,
        username: USERNAME,
        issueName: OUTPUT_NAME,
        issueContent,
        labelName: LABEL_NAME,
        labelColor: LABEL_COLOR,
        shouldClose: result.passed === true,
        runNumber: RUN_NUMBER
      })
      core.endGroup()
      process.exitCode = 0
    }
    // set the outputs for this action
    core.setOutput(ActionOutputs.ERRORED, result.errored)
    core.setOutput(ActionOutputs.PASSED, result.passed)
    core.setOutput(
      ActionOutputs.JSON_OUTPUT,
      jsonFormatter.formatOutput(result, true)
    )
  } catch (error) {
    // set the outputs for this action
    core.endGroup()
    core.setOutput(ActionOutputs.ERRORED, true)
    core.setOutput(ActionOutputs.PASSED, false)
    core.setFailed('A fatal error was thrown.')
    if (error.name === 'HttpError') {
      const requestError = error as RequestError
      // Octokit threw an error, so we can print out detailed information
      core.error(
        'Octokit API call failed. This may be due to your token permissions or an issue with the GitHub API. If the error persists, feel free to open an issue.'
      )
      core.error(
        `${requestError.request.method} ${requestError.request.url} returned status ${requestError.status}`
      )
      core.debug(JSON.stringify(error))
    } else if (error.stack) core.error(error.stack)
    else core.error(error)
  }
}
