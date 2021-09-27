import * as core from '@actions/core'
import {Endpoints} from '@octokit/types'
import {RequestError} from '@octokit/request-error'
import Octokit from './getOctokit'

export interface CreateOrUpdateIssueOpts {
  owner: string
  repo: string
  username: string
  issueName: string
  issueContent: string
  issueAssignee?: string
  labelName: string
  labelColor: string
  runNumber: number
  shouldClose?: boolean
  forceCreateIssue?: boolean
}

type Octo = InstanceType<typeof Octokit>

/**
 * Create or update a single up-to-date issue with the latest output from the
 * repolinter action.
 *
 * This function exists to limit the number of issues created by this action to
 * the fewest possible, instead opting to quietly update the content of the
 * existing issue (if one is present). This function uses a specific label
 * (options.labelName) as well as verifying that the issue was created by the
 * user this action is impersonating (usually github-actions-bot), and that the
 * issue has not been updated by an action run number greater than the current one.
 *
 * Note: options.labelName should be a label that is unique to the repolinter
 * action, otherwise there is a small chance this function may attempt to edit
 * other people's issues.
 *
 * @param options.owner The owner of the repository to create an issue on
 * @param options.repo The repository to create the issue on
 * @param options.username The username associated with the octokit instance
 * @param options.issueContent The text content to use for the issue body (ex.
 *   the markdown output of repolinter).
 * @param options.issueName The name to use for this issue
 * @param options.issueAssignee The username to assign this issue to, falsey for no one.
 * @param options.labelName The name of the label to use to track issues opened
 *   by this bot.
 * @param options.labelColor The color to use when creating this label (this
 *   value will be ignored if the label already exists). Should be a hex string
 *   with no prefix (ex. "ff2a63").
 * @param options.runNumber The current GITHUB_RUN_NUMBER, used to determine if
 *   the issue should be updated or not.
 * @param options.shouldClose Set this to true to close the issue. If this value
 *   is true and no issue exists, this function will do nothing.
 * @param options.forceCreateIssue Set to truthy to always create a new issue,
 *   instead of editing the old one. The old issue will automatically be closed if found.
 * @returns The issue number of the created issue, or null if no issue was created.
 */
export default async function createOrUpdateIssue(
  client: Octo,
  options: CreateOrUpdateIssueOpts
): Promise<number | null> {
  // error check
  if (options.forceCreateIssue && options.shouldClose)
    throw new Error(`Both forceCreateIssue and shouldClose cannot be set!`)
  // attempt to find an issue created by Repolinter
  const issue = await findRepolinterIssue(
    client,
    Object.assign({}, options, {selfUsername: options.username})
  )
  // if no issue exists or the issue is closed and we should close the issue, exit and do nothing
  if (options.shouldClose && (!issue || issue.state === 'closed')) {
    core.debug(`No open issue was found and shouldClose is set, doing nothing.`)
    return null
  }
  // if the issue exists and the workflow number is larger than the current number, do nothing
  // this includes closed issues to prevent a previous workflow from opening an issue with old results
  if (issue?.body) {
    const number = decodeWorkflowNumber(issue.body)
    if (!number)
      core.debug(
        `Found no workflow run number in body of issue #${issue.number}`
      )
    else {
      core.debug(`Found workflow number ${number} in issue #${issue.number}`)
      if (number > options.runNumber) {
        core.debug(
          `Skipping because found workflow number is greater than current workflow number (${options.runNumber})`
        )
        return null
      }
    }
  }
  let res
  // if we should create a new issue
  if (options.forceCreateIssue || !issue || issue.state === 'closed') {
    // if an old issue is present and open, close it
    if (issue?.state == 'open')
      await updateRepolinterIssue(client, {
        issueNumber: issue.number,
        owner: options.owner,
        repo: options.repo,
        shouldClose: true,
        issueContent: options.issueContent,
        runNumber: options.runNumber
      })
    // create a new issue
    res = await createRepolinterIssue(client, options)
    core.info(`Created issue #${res.number}`)
  } else {
    // update the existing issue
    res = await updateRepolinterIssue(
      client,
      Object.assign({}, options, {issueNumber: issue.number})
    )
    core.info(
      options.shouldClose
        ? `Closed issue #${res.number}`
        : `Updated issue #${res.number}`
    )
  }
  return res.number
}

export interface FindRepolinterIssueOpts {
  owner: string
  repo: string
  labelName: string
  selfUsername: string
}

/**
 * Find the issue corresponding to this repolinter action instance, if such an
 * issue exists. If more than one issue matching the criteria is found, the
 * issue that was created soonest will be returned.
 *
 * This function uses the GitHub REST API to perform a search that can be
 * described with the following search query: `type:issue repo:<the current
 * repo> creator:<username> label:<label-name> sort:author-date-desc\`
 *
 * @param client The authenticated octokit client to use
 * @param options.owner The owner of the repository to search
 * @param options.repo The name of the repository to search
 * @param labelName The label to filter repolinter issues by
 * @param selfUsername The current username of this octokit client. Only issues
 *   created by this username will be enumerated.
 * @returns The issue data found, or null if no issue was found.
 */
export async function findRepolinterIssue(
  client: Octo,
  options: FindRepolinterIssueOpts
): Promise<
  | Endpoints['GET /repos/{owner}/{repo}/issues']['response']['data'][number]
  | null
> {
  // get the list of open issues on this repository
  const issues = await client.issues.listForRepo({
    owner: options.owner,
    repo: options.repo,
    creator: options.selfUsername,
    labels: options.labelName,
    state: 'all',
    sort: 'created',
    direction: 'desc'
  })
  // return none if there's no issue
  if (issues.data.length === 0) return null
  // omit a warning if there's more than one open issue here
  const openIssues = issues.data.filter(({state}) => state === 'open')
  if (openIssues.length > 1)
    core.warning(
      `Found more than one matching open issue: ${openIssues
        .map(i => `#${i.number}`)
        .join(', ')}. Defaulting to the most recent.`
    )
  // return the issue data!
  return issues.data[0]
}

export interface CreateRepolinterIssueOpts {
  owner: string
  repo: string
  issueName: string
  issueContent?: string
  issueAssignee?: string
  labelName: string
  labelColor: string
  runNumber: number
}

/**
 * Creates a label if one doesn't exists, then creates an issue with that label
 * and the specified content, assignee, and so on.
 *
 * @param client The authenticated octokit client to use
 * @param options.owner The owner of the repository the the issue will be created on
 * @param options.repo The name of the repository that the issue will be created on
 * @param options.issueName The title to use for the issue
 * @param options.issueContent The body of the issue, formatted as markdown (optional)
 * @param options.issueAssignee The username of the person to assign this issue
 *   to (optional)
 * @param options.labelName The name of the label to create/assign to this issue
 * @param options.labelColor The color to use when creating the label. This
 *   value will be ignored if the label already exists.
 * @param options.runNumber The current GITHUB_RUN_NUMBER, which will be encoded
 *   and appended to the bottom of the issue body.
 */
export async function createRepolinterIssue(
  client: Octo,
  options: CreateRepolinterIssueOpts
): Promise<Endpoints['POST /repos/{owner}/{repo}/issues']['response']['data']> {
  // create the label, if it doesn't exist
  try {
    await client.issues.getLabel({
      owner: options.owner,
      repo: options.repo,
      name: options.labelName
    })
  } catch (err) {
    if ((err as RequestError).status === 404) {
      core.debug(`Creating label ${options.labelName}`)
      await client.issues.createLabel({
        owner: options.owner,
        repo: options.repo,
        name: options.labelName,
        color: options.labelColor
      })
    } else throw err
  }
  core.debug(`Creating issue "${options.issueName}"...`)
  // create the issue
  let issue
  try {
    issue = await client.issues.create({
      owner: options.owner,
      repo: options.repo,
      title: options.issueName,
      body: `${options.issueContent}${encodeWorkflowNumber(options.runNumber)}`,
      labels: [options.labelName],
      assignees:
        options.issueAssignee !== undefined
          ? [options.issueAssignee]
          : undefined
    })
  } catch (e) {
    if (!(e instanceof RequestError)) throw e

    if (e.status === 404)
      throw new Error(
        'Creating an issue returned a 404! Is your token valid/does it have the correct permissions?'
      )
    else if (e.status === 403)
      throw new Error(
        "Creating an issue returned status 403. This is probably due to a scope limitation of your PAT, check that you set the correct permissions (note that GITHUB_TOKEN cannot write repositories other than it's own)"
      )
    else if (e.status === 410)
      throw new Error(
        'Creating an issue returned status 410, are issues enabled on the target repository?'
      )
    else throw e
  }

  core.debug(`Successfully created issue #${issue.data.number}`)
  return issue.data
}

export interface UpdateReplolinterIssueOpts {
  repo: string
  owner: string
  issueNumber: number
  issueContent: string
  shouldClose?: boolean
  runNumber: number
}

/**
 * Replace the body of a given issue with the specified value, then close the
 * issue if needed. Inserts the runNumber at the bottom of the issue so it can
 * be read later.
 *
 * @param client The authenticated Octokit client
 * @param options.owner The owner of the repository to update the issue on
 * @param options.repo The name of the repository to update the issue on
 * @param options.issueNumber The issue number to update (ex. #2, different from the ID)
 * @param options.issueContent The body to update the issue with, formatted as markdown.
 * @param options.shouldClose Set this to true to close the issue, otherwise the issue
 * @param options.runNumber The current GITHUB_RUN_NUMBER, which will be
 *   inserted at the bottom of the issue.
 * @returns The data returned by the REST API.
 */
export async function updateRepolinterIssue(
  client: Octo,
  options: UpdateReplolinterIssueOpts
): Promise<
  Endpoints['PATCH /repos/{owner}/{repo}/issues/{issue_number}']['response']['data']
> {
  core.debug(`Updating issue ${options.issueNumber}`)
  if (options.shouldClose) core.debug(`Closing it!`)
  else core.debug(`Updating it with content "${options.issueContent}"`)
  // replace the issue body with the new one
  // we may choose to add a comment later but we can just update the body for now
  const res = await client.issues.update({
    owner: options.owner,
    repo: options.repo,
    issue_number: options.issueNumber,
    body: `${options.issueContent}${encodeWorkflowNumber(options.runNumber)}`,
    state: options.shouldClose ? 'closed' : undefined
  })
  return res.data
}

/**
 * Search an issue body for the magic workflow number string that indicates when
 * this issue was last updated.
 *
 * @param body The issue body, formatted as the source markdown
 * @returns The workflow number (GITHUB_RUN_NUMBER) from the issue body, or null
 *   if none was found
 */
function decodeWorkflowNumber(body: string): number | null {
  const match = /<!--\s*repolinter-action-workflow-number:(\d+)\s*-->/i.exec(
    body
  )?.[1]
  if (match) {
    const number = parseInt(match)
    return isNaN(number) ? null : number
  }
  return null
}

/**
 * Returns an encoded magic string to be added to an issue body, allowing
 * repolinter-action to determine when it was last updated.
 *
 * @param workflowNumber The GITHUB_RUN_NUMBER to encode
 * @returns A string that can be appended to the issue body markdown.
 */
function encodeWorkflowNumber(workflowNumber: number): string {
  return `\n<!-- repolinter-action-workflow-number:${workflowNumber} -->\n`
}
