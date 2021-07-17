import createOrUpdateIssue, * as toolkit from '../src/createorUpdateIssue'
import {Octokit} from '@octokit/rest'
import nock from 'nock'
import {ParsedUrlQuery} from 'querystring'

function paramIsEqual(
  left: undefined | string | string[],
  right: undefined | string | string[]
): boolean {
  if (Array.isArray(left) && left.length === 1) left = left[0]
  if (Array.isArray(right) && right.length === 1) right = right[0]
  if (
    left === undefined ||
    right === undefined ||
    Array.isArray(left) !== Array.isArray(right)
  )
    return false
  if (!Array.isArray(left)) return left === right
  return left.every((v, i) => v === (right as string[])[i])
}

/**
 * Returns a lambda that shallow checks if every key value pair in a matcher is
 * also present in the paramter object. Useful for nock query string matching.
 *
 * @param matcher The object to match against
 * @returns The function that matches against an input and matcher
 */
function atLeastObject(matcher: {
  [key: string]: string | string[] | undefined
}): (queryStringObject: ParsedUrlQuery) => boolean {
  return (path: ParsedUrlQuery) =>
    Object.entries(matcher)
      .filter(([, value]) => value !== undefined)
      .every(
        ([key, value]) =>
          Object.prototype.hasOwnProperty.call(path, key) &&
          paramIsEqual(value, path[key])
      )
}

describe('createOrUpdateIssue', () => {
  // disable live network connections
  nock.disableNetConnect()

  // supress github actions commands inside tests
  beforeEach(() => process.stdout.write('::stop-commands::running-tests\n'))
  afterEach(() => process.stdout.write('::running-tests::\n'))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client: any = new Octokit()

  describe('findRepolinterIssue', () => {
    const config: toolkit.FindRepolinterIssueOpts = {
      owner: 'a-repo-owner',
      repo: 'a-repo',
      labelName: 'repolinter-label',
      selfUsername: 'repolinter-bot'
    }

    const sampleIssue = {
      title: 'My Issue',
      number: 7,
      state: 'open'
    }

    const sampleIssue2 = {
      title: 'My Issue 2',
      number: 8,
      state: 'open'
    }

    const sampleIssue3 = {
      title: 'My Issue 3',
      number: 9,
      state: 'closed'
    }

    function startMock(): nock.Interceptor {
      return nock('https://api.github.com')
        .get(`/repos/${config.owner}/${config.repo}/issues`)
        .query(
          atLeastObject({
            labels: config.labelName,
            creator: config.selfUsername,
            state: 'all',
            sort: 'created'
          })
        )
    }

    test('search for an issue', async () => {
      const scope = startMock().reply(200, [sampleIssue])
      const res = await toolkit.findRepolinterIssue(client, config)
      expect(res).toMatchObject(sampleIssue)
      scope.done()
    })

    test('return null if no issues are found', async () => {
      const scope = startMock().reply(200, [])
      const res = await toolkit.findRepolinterIssue(client, config)
      expect(res).toBeNull()
      scope.done()
    })

    test('return the first issue if more than one issue is found', async () => {
      const scope = startMock().reply(200, [sampleIssue2, sampleIssue])
      const res = await toolkit.findRepolinterIssue(client, config)
      expect(res).toMatchObject(sampleIssue2)
      scope.done()
    })

    test('return the first issue if more than one issue is found, even if it is closed', async () => {
      const scope = startMock().reply(200, [
        sampleIssue3,
        sampleIssue2,
        sampleIssue
      ])
      const res = await toolkit.findRepolinterIssue(client, config)
      expect(res).toMatchObject(sampleIssue3)
      scope.done()
    })

    test('throw an error if an error occurs', async () => {
      const scope = startMock().reply(404, 'blargh')
      await expect(
        toolkit.findRepolinterIssue(client, config)
      ).rejects.toThrowError()
      scope.done()
    })
  })

  describe('createRepolinterIssue', () => {
    const config: toolkit.CreateRepolinterIssueOpts = {
      owner: 'a-repo-owner',
      repo: 'a-repo',
      labelName: 'repolinter-label',
      labelColor: 'ff66ff',
      issueName: 'My Issue Title',
      issueAssignee: 'ThisPerson',
      issueContent: 'This is a markdown document',
      runNumber: 10
    }

    function startMock(): nock.Interceptor {
      return nock('https://api.github.com').post(
        `/repos/${config.owner}/${config.repo}/issues`,
        atLeastObject({
          title: config.issueName,
          body: `${config.issueContent}\n<!-- repolinter-action-workflow-number:${config.runNumber} -->\n`,
          assignees: [config.issueAssignee as string],
          labels: [config.labelName]
        })
      )
    }

    test('create an issue and a label', async () => {
      const issueScope = startMock().reply(201, {number: 7})
      const labelGet = nock('https://api.github.com')
        .get(`/repos/${config.owner}/${config.repo}/labels/${config.labelName}`)
        .reply(404, {})
      const labelPost = nock('https://api.github.com')
        .post(
          `/repos/${config.owner}/${config.repo}/labels`,
          atLeastObject({
            name: config.labelName,
            color: config.labelColor
          })
        )
        .reply(201, {})

      const res = await toolkit.createRepolinterIssue(client, config)

      expect(res).toMatchObject({number: 7})

      issueScope.done()
      labelGet.done()
      labelPost.done()
    })

    test('not create a label if one exists', async () => {
      const issueScope = startMock().reply(201, {number: 7})
      const labelGet = nock('https://api.github.com')
        .get(`/repos/${config.owner}/${config.repo}/labels/${config.labelName}`)
        .reply(200, {})

      const res = await toolkit.createRepolinterIssue(client, config)

      expect(res).toMatchObject({number: 7})

      issueScope.done()
      labelGet.done()
    })

    test('throw an error if getLabel returns status != 404', async () => {
      const labelGet = nock('https://api.github.com')
        .get(`/repos/${config.owner}/${config.repo}/labels/${config.labelName}`)
        .reply(500, {})

      await expect(
        toolkit.createRepolinterIssue(client, config)
      ).rejects.toThrowError()

      labelGet.done()
    })

    test('throw an error if creating an issue fails', async () => {
      const issueScope = startMock().reply(500, {})
      const labelGet = nock('https://api.github.com')
        .get(`/repos/${config.owner}/${config.repo}/labels/${config.labelName}`)
        .reply(200, {})

      await expect(
        toolkit.createRepolinterIssue(client, config)
      ).rejects.toThrowError()

      issueScope.done()
      labelGet.done()
    })
  })

  describe('updateRepolinterIssue', () => {
    test('update the content of an issue', async () => {
      const config: toolkit.UpdateReplolinterIssueOpts = {
        repo: 'a-repo',
        owner: 'a-repo-owner',
        issueNumber: 8,
        issueContent: 'this is a markdown issue',
        shouldClose: false,
        runNumber: 10
      }

      const scope = nock('https://api.github.com')
        .patch(
          `/repos/${config.owner}/${config.repo}/issues/${config.issueNumber}`,
          {
            body: `${config.issueContent}\n<!-- repolinter-action-workflow-number:${config.runNumber} -->\n`
          }
        )
        .reply(200, {number: 8})
      const res = await toolkit.updateRepolinterIssue(client, config)

      expect(res).toMatchObject({number: 8})

      scope.done()
    })

    test('close an issue', async () => {
      const config: toolkit.UpdateReplolinterIssueOpts = {
        repo: 'a-repo',
        owner: 'a-repo-owner',
        issueNumber: 8,
        shouldClose: true,
        runNumber: 10,
        issueContent: 'this is a markdown issue'
      }

      const scope = nock('https://api.github.com')
        .patch(
          `/repos/${config.owner}/${config.repo}/issues/${config.issueNumber}`,
          {
            state: 'closed',
            body: `${config.issueContent}\n<!-- repolinter-action-workflow-number:${config.runNumber} -->\n`
          }
        )
        .reply(200, {number: 8})
      const res = await toolkit.updateRepolinterIssue(client, config)

      expect(res).toMatchObject({number: 8})

      scope.done()
    })

    test('throw an error if the request fails', async () => {
      const config: toolkit.UpdateReplolinterIssueOpts = {
        repo: 'a-repo',
        owner: 'a-repo-owner',
        issueNumber: 8,
        issueContent: 'this is some new issue content',
        runNumber: 10
      }

      const scope = nock('https://api.github.com')
        .patch(
          `/repos/${config.owner}/${config.repo}/issues/${config.issueNumber}`,
          {
            body: `${config.issueContent}\n<!-- repolinter-action-workflow-number:${config.runNumber} -->\n`
          }
        )
        .reply(500, {number: 8})

      await expect(
        toolkit.updateRepolinterIssue(client, config)
      ).rejects.toThrowError()

      scope.done()
    })
  })

  describe('createOrUpdateIssue', () => {
    const config: toolkit.CreateOrUpdateIssueOpts = {
      owner: 'a-repo-owner',
      repo: 'a-repo',
      username: 'my-user',
      issueName: 'Repolinter Issue',
      issueContent: 'Some markdown content here',
      labelName: 'repolinter',
      labelColor: 'ff66ff',
      runNumber: 10
    }

    test('creates a new issue and a label under our username', async () => {
      const findIssueScope = nock('https://api.github.com')
        .get(`/repos/${config.owner}/${config.repo}/issues`)
        .query(atLeastObject({creator: 'my-user'}))
        .reply(200, [])
      const getLabelScope = nock('https://api.github.com')
        .get(`/repos/${config.owner}/${config.repo}/labels/${config.labelName}`)
        .reply(404)
      const createLabelScope = nock('https://api.github.com')
        .post(
          `/repos/${config.owner}/${config.repo}/labels`,
          atLeastObject({
            name: config.labelName,
            color: config.labelColor
          })
        )
        .reply(201, {})
      const createIssueScope = nock('https://api.github.com')
        .post(
          `/repos/${config.owner}/${config.repo}/issues`,
          atLeastObject({
            title: config.issueName,
            body: `${config.issueContent}\n<!-- repolinter-action-workflow-number:${config.runNumber} -->\n`,
            labels: [config.labelName]
          })
        )
        .reply(201, {number: 8})

      const res = await createOrUpdateIssue(client, config)

      expect(res).toBe(8)

      findIssueScope.done()
      createLabelScope.done()
      getLabelScope.done()
      createIssueScope.done()
    })

    test('updates an existing issue under our username', async () => {
      const findIssueScope = nock('https://api.github.com')
        .get(`/repos/${config.owner}/${config.repo}/issues`)
        .query(atLeastObject({creator: 'my-user'}))
        .reply(200, [{number: 7, state: 'open'}])
      const updateIssueScope = nock('https://api.github.com')
        .patch(`/repos/${config.owner}/${config.repo}/issues/7`, {
          body: `${config.issueContent}\n<!-- repolinter-action-workflow-number:${config.runNumber} -->\n`
        })
        .reply(200, {number: 7})
      const res = await createOrUpdateIssue(client, config)

      expect(res).toBe(7)

      findIssueScope.done()
      updateIssueScope.done()
    })

    test('updates an existing issue under our username if the workflow number is equal to our workflow number', async () => {
      const findIssueScope = nock('https://api.github.com')
        .get(`/repos/${config.owner}/${config.repo}/issues`)
        .query(atLeastObject({creator: 'my-user'}))
        .reply(200, [
          {
            number: 7,
            body: 'my issue body\n<!-- repolinter-action-workflow-number:10 -->\n`',
            state: 'open'
          }
        ])
      const updateIssueScope = nock('https://api.github.com')
        .patch(`/repos/${config.owner}/${config.repo}/issues/7`, {
          body: `${config.issueContent}\n<!-- repolinter-action-workflow-number:${config.runNumber} -->\n`
        })
        .reply(200, {number: 7})
      const res = await createOrUpdateIssue(client, config)

      expect(res).toBe(7)

      findIssueScope.done()
      updateIssueScope.done()
    })

    test('updates an existing issue under our username if the workflow number less than our workflow number', async () => {
      const findIssueScope = nock('https://api.github.com')
        .get(`/repos/${config.owner}/${config.repo}/issues`)
        .query(atLeastObject({creator: 'my-user'}))
        .reply(200, [
          {
            number: 7,
            body: 'my issue body\n<!-- repolinter-action-workflow-number:9 -->\n`',
            state: 'open'
          }
        ])
      const updateIssueScope = nock('https://api.github.com')
        .patch(`/repos/${config.owner}/${config.repo}/issues/7`, {
          body: `${config.issueContent}\n<!-- repolinter-action-workflow-number:${config.runNumber} -->\n`
        })
        .reply(200, {number: 7})
      const res = await createOrUpdateIssue(client, config)

      expect(res).toBe(7)

      findIssueScope.done()
      updateIssueScope.done()
    })

    test('creates a new issue and a label under our username and close the existing one if options.forceCreateIssue is set', async () => {
      const findIssueScope = nock('https://api.github.com')
        .get(`/repos/${config.owner}/${config.repo}/issues`)
        .query(atLeastObject({creator: 'my-user'}))
        .reply(200, [{number: 7, state: 'open'}])
      const closeIssueScope = nock('https://api.github.com')
        .patch(
          `/repos/${config.owner}/${config.repo}/issues/7`,
          atLeastObject({
            state: 'closed'
          })
        )
        .reply(200, {number: 7})
      const getLabelScope = nock('https://api.github.com')
        .get(`/repos/${config.owner}/${config.repo}/labels/${config.labelName}`)
        .reply(404)
      const createLabelScope = nock('https://api.github.com')
        .post(
          `/repos/${config.owner}/${config.repo}/labels`,
          atLeastObject({
            name: config.labelName,
            color: config.labelColor
          })
        )
        .reply(201, {})
      const createIssueScope = nock('https://api.github.com')
        .post(
          `/repos/${config.owner}/${config.repo}/issues`,
          atLeastObject({
            title: config.issueName,
            body: `${config.issueContent}\n<!-- repolinter-action-workflow-number:${config.runNumber} -->\n`,
            labels: [config.labelName]
          })
        )
        .reply(201, {number: 8})

      const res = await createOrUpdateIssue(
        client,
        Object.assign({}, config, {forceCreateIssue: true})
      )

      expect(res).toBe(8)

      findIssueScope.done()
      closeIssueScope.done()
      createLabelScope.done()
      getLabelScope.done()
      createIssueScope.done()
    })

    test('creates a new issue and a label under our username and if the most recent one is closed', async () => {
      const findIssueScope = nock('https://api.github.com')
        .get(`/repos/${config.owner}/${config.repo}/issues`)
        .query(atLeastObject({creator: 'my-user'}))
        .reply(200, [{number: 7, state: 'closed'}])
      const getLabelScope = nock('https://api.github.com')
        .get(`/repos/${config.owner}/${config.repo}/labels/${config.labelName}`)
        .reply(404)
      const createLabelScope = nock('https://api.github.com')
        .post(
          `/repos/${config.owner}/${config.repo}/labels`,
          atLeastObject({
            name: config.labelName,
            color: config.labelColor
          })
        )
        .reply(201, {})
      const createIssueScope = nock('https://api.github.com')
        .post(
          `/repos/${config.owner}/${config.repo}/issues`,
          atLeastObject({
            title: config.issueName,
            body: `${config.issueContent}\n<!-- repolinter-action-workflow-number:${config.runNumber} -->\n`,
            labels: [config.labelName]
          })
        )
        .reply(201, {number: 8})

      const res = await createOrUpdateIssue(
        client,
        Object.assign({}, config, {forceCreateIssue: true})
      )

      expect(res).toBe(8)

      findIssueScope.done()
      createLabelScope.done()
      getLabelScope.done()
      createIssueScope.done()
    })

    test('creates a new issue and a label under our username if a workflow-number is not present in the body', async () => {
      const findIssueScope = nock('https://api.github.com')
        .get(`/repos/${config.owner}/${config.repo}/issues`)
        .query(atLeastObject({creator: 'my-user'}))
        .reply(200, [{number: 7, state: 'closed', body: 'my-issue-body'}])
      const getLabelScope = nock('https://api.github.com')
        .get(`/repos/${config.owner}/${config.repo}/labels/${config.labelName}`)
        .reply(404)
      const createLabelScope = nock('https://api.github.com')
        .post(
          `/repos/${config.owner}/${config.repo}/labels`,
          atLeastObject({
            name: config.labelName,
            color: config.labelColor
          })
        )
        .reply(201, {})
      const createIssueScope = nock('https://api.github.com')
        .post(
          `/repos/${config.owner}/${config.repo}/issues`,
          atLeastObject({
            title: config.issueName,
            body: `${config.issueContent}\n<!-- repolinter-action-workflow-number:${config.runNumber} -->\n`,
            labels: [config.labelName]
          })
        )
        .reply(201, {number: 8})

      const res = await createOrUpdateIssue(
        client,
        Object.assign({}, config, {forceCreateIssue: true})
      )

      expect(res).toBe(8)

      findIssueScope.done()
      createLabelScope.done()
      getLabelScope.done()
      createIssueScope.done()
    })

    test("doesn't do anything if options.shouldClose is set and there is no issue", async () => {
      const findIssueScope = nock('https://api.github.com')
        .get(`/repos/${config.owner}/${config.repo}/issues`)
        .query(atLeastObject({creator: 'my-user'}))
        .reply(200, [])

      const res = await createOrUpdateIssue(
        client,
        Object.assign({}, config, {shouldClose: true})
      )

      expect(res).toBe(null)

      findIssueScope.done()
    })

    test("doesn't do anything if options.shouldClose is set and the issue is closed", async () => {
      const findIssueScope = nock('https://api.github.com')
        .get(`/repos/${config.owner}/${config.repo}/issues`)
        .query(atLeastObject({creator: 'my-user'}))
        .reply(200, [{number: 7, state: 'closed'}])

      const res = await createOrUpdateIssue(
        client,
        Object.assign({}, config, {shouldClose: true})
      )

      expect(res).toBe(null)

      findIssueScope.done()
    })

    test('closes the issue if config.shouldClose is set', async () => {
      const findIssueScope = nock('https://api.github.com')
        .get(`/repos/${config.owner}/${config.repo}/issues`)
        .query(atLeastObject({creator: 'my-user'}))
        .reply(200, [{number: 7, state: 'open'}])
      const closeIssueScope = nock('https://api.github.com')
        .patch(
          `/repos/${config.owner}/${config.repo}/issues/7`,
          atLeastObject({
            state: 'closed'
          })
        )
        .reply(200, {number: 7})

      const res = await createOrUpdateIssue(
        client,
        Object.assign({}, config, {shouldClose: true})
      )

      expect(res).toBe(7)

      findIssueScope.done()
      closeIssueScope.done()
    })

    test("doesn't do anything if the workflow number in the issue is larger than the current workflow number and the issue is open", async () => {
      const findIssueScope = nock('https://api.github.com')
        .get(`/repos/${config.owner}/${config.repo}/issues`)
        .query(atLeastObject({creator: 'my-user'}))
        .reply(200, [
          {
            number: 7,
            body: 'my issue body\n<!-- repolinter-action-workflow-number:11 -->\n`',
            state: 'open'
          }
        ])

      const res = await createOrUpdateIssue(client, config)

      expect(res).toBe(null)

      findIssueScope.done()
    })

    test("doesn't do anything if the workflow number in the issue is larger than the current workflow number and the issue is closed", async () => {
      const findIssueScope = nock('https://api.github.com')
        .get(`/repos/${config.owner}/${config.repo}/issues`)
        .query(atLeastObject({creator: 'my-user'}))
        .reply(200, [
          {
            number: 7,
            body: 'my issue body\n<!-- repolinter-action-workflow-number:11 -->\n`',
            state: 'closed'
          }
        ])

      const res = await createOrUpdateIssue(client, config)

      expect(res).toBe(null)

      findIssueScope.done()
    })

    test('throws an error if forceCreateIssue and shouldClose are set', async () => {
      await expect(
        createOrUpdateIssue(
          client,
          Object.assign({}, config, {forceCreateIssue: true, shouldClose: true})
        )
      ).rejects.toThrowError()
    })
  })
})
