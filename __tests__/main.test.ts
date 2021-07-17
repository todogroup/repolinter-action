import {ActionInputs, ActionOutputs} from '../src/inputs'
import run from '../src/main'
import * as path from 'path'
import nock from 'nock'
import * as fs from 'fs'
import {lint, jsonFormatter} from 'repolinter'

function getInputName(input: string): string {
  return `INPUT_${input.replace(/ /g, '_').toUpperCase()}`
}

function getOutputs(input: string[]): {[key: string]: string} {
  const OUTPUT_REGEX = /^::set-output\s+name=([a-z0-9\-_]+)::([^\r\n]+)$/gim
  const str = input.join('')
  const out: {[key: string]: string} = {}
  let match
  while ((match = OUTPUT_REGEX.exec(str)) !== null) {
    if (typeof match[1] === 'string' && typeof match[2] === 'string')
      out[match[1]] = match[2]
  }
  return out
}

describe('main', () => {
  let spooledStdout: string[] = []

  jest.setTimeout(30000)

  // disable live network connections
  nock.disableNetConnect()

  beforeEach(() => {
    // reset process.env
    process.env = {}
    // reset inputs
    process.env[getInputName(ActionInputs.DIRECTORY)] = '.'
    process.env[getInputName(ActionInputs.REPO)] = 'todogroup/repolinter-action'
    process.env[getInputName(ActionInputs.OUTPUT_TYPE)] = 'exit-code'
    process.env[getInputName(ActionInputs.OUTPUT_NAME)] =
      'Open Source Policy Issues'
    process.env[getInputName(ActionInputs.LABEL_NAME)] = 'repolinter'
    process.env[getInputName(ActionInputs.LABEL_COLOR)] = 'fbca04'
    process.env[getInputName(ActionInputs.USERNAME)] = 'my-user'
    process.env['GITHUB_RUN_NUMBER'] = '1'
    process.env['GITHUB_ACTION'] = 'true'
    // disable STDOUT printing for now
    spooledStdout = []
    jest.spyOn(process.stdout, 'write').mockImplementation(str => {
      if (str instanceof Uint8Array)
        spooledStdout.push(new TextDecoder('utf-8').decode(str))
      else spooledStdout.push(str)
      return true
    })
  })

  test('throws when no run number is supplied', async () => {
    delete process.env['GITHUB_RUN_NUMBER']

    await run()
    const outputs = getOutputs(spooledStdout)

    // console.debug(out)
    expect(outputs[ActionOutputs.ERRORED]).toEqual('true')
    expect(outputs[ActionOutputs.PASSED]).toEqual('false')
    expect(process.exitCode).not.toEqual(0)
  })

  test('throws when an invalid run number is supplied', async () => {
    process.env['GITHUB_RUN_NUMBER'] = 'cheese'

    await run()
    const outputs = getOutputs(spooledStdout)

    // console.debug(out)
    expect(outputs[ActionOutputs.ERRORED]).toEqual('true')
    expect(outputs[ActionOutputs.PASSED]).toEqual('false')
    expect(process.exitCode).not.toEqual(0)
  })

  test('throws when no directory is supplied', async () => {
    delete process.env[getInputName(ActionInputs.DIRECTORY)]

    await run()
    const outputs = getOutputs(spooledStdout)

    // console.debug(out)
    expect(outputs[ActionOutputs.ERRORED]).toEqual('true')
    expect(outputs[ActionOutputs.PASSED]).toEqual('false')
    expect(process.exitCode).not.toEqual(0)
  })

  test('throws when no token is supplied and output-type is not off', async () => {
    process.env[getInputName(ActionInputs.OUTPUT_TYPE)] = 'issue'

    await run()
    const outputs = getOutputs(spooledStdout)

    // console.debug(out)
    expect(outputs[ActionOutputs.ERRORED]).toEqual('true')
    expect(outputs[ActionOutputs.PASSED]).toEqual('false')
    expect(process.exitCode).not.toEqual(0)
  })

  test('throws when an invalid token is supplied and output-type is not off', async () => {
    process.env['GITHUB_TOKEN'] = '2'
    process.env[getInputName(ActionInputs.OUTPUT_TYPE)] = 'issue'

    await run()
    const outputs = getOutputs(spooledStdout)

    // console.debug(out)
    expect(outputs[ActionOutputs.ERRORED]).toEqual('true')
    expect(outputs[ActionOutputs.PASSED]).toEqual('false')
    expect(process.exitCode).not.toEqual(0)
  })

  test('throws when an invalid is supplied in TOKEN and output-type is not off', async () => {
    process.env[getInputName(ActionInputs.TOKEN)] = '2'
    process.env[getInputName(ActionInputs.OUTPUT_TYPE)] = 'issue'

    await run()
    const outputs = getOutputs(spooledStdout)

    // console.debug(out)
    expect(outputs[ActionOutputs.ERRORED]).toEqual('true')
    expect(outputs[ActionOutputs.PASSED]).toEqual('false')
    expect(process.exitCode).not.toEqual(0)
  })

  test('throws when no username is supplied', async () => {
    process.env[getInputName(ActionInputs.TOKEN)] = '2'
    process.env[getInputName(ActionInputs.OUTPUT_TYPE)] = 'issue'
    delete process.env[getInputName(ActionInputs.USERNAME)]

    await run()
    const outputs = getOutputs(spooledStdout)

    // console.debug(out)
    expect(outputs[ActionOutputs.ERRORED]).toEqual('true')
    expect(outputs[ActionOutputs.PASSED]).toEqual('false')
    expect(process.exitCode).not.toEqual(0)
  })

  test('throws when no output-type is supplied', async () => {
    delete process.env[getInputName(ActionInputs.OUTPUT_TYPE)]

    await run()
    const outputs = getOutputs(spooledStdout)

    // console.debug(out)
    expect(outputs[ActionOutputs.ERRORED]).toEqual('true')
    expect(outputs[ActionOutputs.PASSED]).toEqual('false')
    expect(process.exitCode).not.toEqual(0)
  })

  test('throws when an invalid output-type is supplied', async () => {
    process.env[getInputName(ActionInputs.OUTPUT_TYPE)] = 'string-cheese'

    await run()
    const outputs = getOutputs(spooledStdout)

    // console.debug(out)
    expect(outputs[ActionOutputs.ERRORED]).toEqual('true')
    expect(outputs[ActionOutputs.PASSED]).toEqual('false')
    expect(process.exitCode).not.toEqual(0)
  })

  test('throws when no output-name is supplied', async () => {
    delete process.env[getInputName(ActionInputs.OUTPUT_NAME)]

    await run()
    const outputs = getOutputs(spooledStdout)

    // console.debug(out)
    expect(outputs[ActionOutputs.ERRORED]).toEqual('true')
    expect(outputs[ActionOutputs.PASSED]).toEqual('false')
    expect(process.exitCode).not.toEqual(0)
  })

  test('throws when no repository is supplied', async () => {
    delete process.env[getInputName(ActionInputs.REPO)]

    await run()
    const outputs = getOutputs(spooledStdout)

    // console.debug(out)
    expect(outputs[ActionOutputs.ERRORED]).toEqual('true')
    expect(outputs[ActionOutputs.PASSED]).toEqual('false')
    expect(process.exitCode).not.toEqual(0)
  })

  test('throws when an invalid config-url is specified', async () => {
    process.env[getInputName(ActionInputs.CONFIG_URL)] = 'notadomain'

    await run()
    const outputs = getOutputs(spooledStdout)

    // console.debug(out)
    expect(outputs[ActionOutputs.ERRORED]).toEqual('true')
    expect(outputs[ActionOutputs.PASSED]).toEqual('false')
    expect(process.exitCode).not.toEqual(0)
  })

  test('throws when no label name is specified', async () => {
    delete process.env[getInputName(ActionInputs.LABEL_NAME)]

    await run()
    const outputs = getOutputs(spooledStdout)

    // console.debug(out)
    expect(outputs[ActionOutputs.ERRORED]).toEqual('true')
    expect(outputs[ActionOutputs.PASSED]).toEqual('false')
    expect(process.exitCode).not.toEqual(0)
  })

  test('throws when an invalid label name is specified', async () => {
    process.env[getInputName(ActionInputs.LABEL_NAME)] = ''

    await run()
    const outputs = getOutputs(spooledStdout)

    // console.debug(out)
    expect(outputs[ActionOutputs.ERRORED]).toEqual('true')
    expect(outputs[ActionOutputs.PASSED]).toEqual('false')
    expect(process.exitCode).not.toEqual(0)
  })

  test('throws when no label color is specified', async () => {
    delete process.env[getInputName(ActionInputs.LABEL_COLOR)]

    await run()
    const outputs = getOutputs(spooledStdout)

    // console.debug(out)
    expect(outputs[ActionOutputs.ERRORED]).toEqual('true')
    expect(outputs[ActionOutputs.PASSED]).toEqual('false')
    expect(process.exitCode).not.toEqual(0)
  })

  test('throws when an invalid label color is specified', async () => {
    process.env[getInputName(ActionInputs.LABEL_COLOR)] = 'notacolor'

    await run()
    const outputs = getOutputs(spooledStdout)

    // console.debug(out)
    expect(outputs[ActionOutputs.ERRORED]).toEqual('true')
    expect(outputs[ActionOutputs.PASSED]).toEqual('false')
    expect(process.exitCode).not.toEqual(0)
  })

  test('throws when no repository is supplied', async () => {
    delete process.env[getInputName(ActionInputs.REPO)]

    await run()
    const outputs = getOutputs(spooledStdout)

    // console.debug(out)
    expect(outputs[ActionOutputs.ERRORED]).toEqual('true')
    expect(outputs[ActionOutputs.PASSED]).toEqual('false')
    expect(process.exitCode).not.toEqual(0)
  })

  test('runs a failing file config', async () => {
    const configPath = path.resolve(__dirname, 'testconfig.json')
    process.env[getInputName(ActionInputs.CONFIG_FILE)] = configPath

    const expected = JSON.parse(
      jsonFormatter.formatOutput(
        await lint(
          '.',
          undefined,
          JSON.parse(await fs.promises.readFile(configPath, 'utf8')),
          true
        ),
        true
      )
    )

    await run()
    const outputs = getOutputs(spooledStdout)

    // console.debug(out)
    expect(outputs[ActionOutputs.ERRORED]).toEqual('false')
    expect(outputs[ActionOutputs.PASSED]).toEqual('false')
    expect(JSON.parse(outputs[ActionOutputs.JSON_OUTPUT])).toMatchObject(
      expected
    )
    expect(process.exitCode).not.toEqual(0)
  })

  test('runs a failing URL config', async () => {
    const configPath = path.resolve(__dirname, 'testconfig.json')
    process.env[getInputName(ActionInputs.CONFIG_URL)] =
      'http://test/repolinter.json'

    nock('http://test').get('/repolinter.json').replyWithFile(200, configPath)

    const expected = jsonFormatter.formatOutput(
      await lint(
        '.',
        undefined,
        JSON.parse(await fs.promises.readFile(configPath, 'utf8')),
        true
      ),
      true
    )

    await run()
    const outputs = getOutputs(spooledStdout)

    // console.debug(out)
    expect(outputs[ActionOutputs.ERRORED]).toEqual('false')
    expect(outputs[ActionOutputs.PASSED]).toEqual('false')
    expect(JSON.parse(outputs[ActionOutputs.JSON_OUTPUT])).toMatchObject(
      JSON.parse(expected)
    )
    expect(process.exitCode).not.toEqual(0)
  })

  test('runs the default config', async () => {
    await run()
    const outputs = getOutputs(spooledStdout)

    expect(outputs[ActionOutputs.ERRORED]).toEqual('false')
    expect(outputs[ActionOutputs.PASSED]).toEqual('false')
    expect(process.exitCode).not.toEqual(0)
  })

  test('runs in a custom directory', async () => {
    process.env[getInputName(ActionInputs.DIRECTORY)] = './__tests__/testfolder'
    process.env[getInputName(ActionInputs.CONFIG_FILE)] =
      './__tests__/testfolder/nestedtestconfig.json'

    await run()
    const outputs = getOutputs(spooledStdout)

    expect(outputs[ActionOutputs.ERRORED]).toEqual('false')
    expect(outputs[ActionOutputs.PASSED]).toEqual('true')
    expect(process.exitCode).toEqual(0)
  })

  test('throws when given an invalid directory', async () => {
    process.env[getInputName(ActionInputs.DIRECTORY)] = 'notafolder'
    process.env[getInputName(ActionInputs.CONFIG_FILE)] =
      './__tests__/testfolder/nestedtestconfig.json'

    await run()
    const outputs = getOutputs(spooledStdout)

    expect(outputs[ActionOutputs.ERRORED]).toEqual('true')
    expect(outputs[ActionOutputs.PASSED]).toEqual('false')
    expect(process.exitCode).not.toEqual(0)
  })

  test('throws when given an file instead of a directory', async () => {
    process.env[getInputName(ActionInputs.DIRECTORY)] = 'action.yml'
    process.env[getInputName(ActionInputs.CONFIG_FILE)] =
      './__tests__/testfolder/nestedtestconfig.json'

    await run()
    const outputs = getOutputs(spooledStdout)

    expect(outputs[ActionOutputs.ERRORED]).toEqual('true')
    expect(outputs[ActionOutputs.PASSED]).toEqual('false')
    expect(process.exitCode).not.toEqual(0)
  })

  test('throws if the config is invalid', async () => {
    const configPath = path.resolve(__dirname, 'invalidtestconfig.json')
    process.env[getInputName(ActionInputs.CONFIG_FILE)] = configPath

    await run()
    const outputs = getOutputs(spooledStdout)

    // console.debug(out)
    expect(outputs[ActionOutputs.ERRORED]).toEqual('true')
    expect(outputs[ActionOutputs.PASSED]).toEqual('false')
    expect(process.exitCode).not.toEqual(0)
  })

  test('runs a passing config', async () => {
    const configPath = path.resolve(__dirname, 'passingtestconfig.json')
    process.env[getInputName(ActionInputs.CONFIG_FILE)] = configPath

    await run()
    const outputs = getOutputs(spooledStdout)

    const expected = jsonFormatter.formatOutput(
      await lint(
        '.',
        undefined,
        JSON.parse(await fs.promises.readFile(configPath, 'utf8')),
        true
      ),
      true
    )

    // console.debug(out)
    expect(outputs[ActionOutputs.ERRORED]).toEqual('false')
    expect(outputs[ActionOutputs.PASSED]).toEqual('true')
    expect(JSON.parse(outputs[ActionOutputs.JSON_OUTPUT])).toMatchObject(
      JSON.parse(expected)
    )
    expect(process.exitCode).toEqual(0)
  })

  test('exits 0 when repolinter.passes is false if issue output is enables', async () => {
    const config = {
      owner: 'todogroup',
      repo: 'repolinter-action'
    }
    // mock stolen from createOrUpdateIssue.ts
    const findIssueScope = nock('https://api.github.com')
      .get(`/repos/${config.owner}/${config.repo}/issues`)
      .query(true)
      .reply(200, [{number: 7}])
    const updateIssueScope = nock('https://api.github.com')
      .patch(`/repos/${config.owner}/${config.repo}/issues/7`)
      .reply(200, {number: 7})

    const configPath = path.resolve(__dirname, 'testconfig.json')
    process.env[getInputName(ActionInputs.CONFIG_FILE)] = configPath
    process.env[getInputName(ActionInputs.OUTPUT_TYPE)] = 'issue'
    process.env[getInputName(ActionInputs.TOKEN)] = '123315213523b53'

    const expected = jsonFormatter.formatOutput(
      await lint(
        '.',
        undefined,
        JSON.parse(await fs.promises.readFile(configPath, 'utf8')),
        true
      ),
      true
    )

    await run(true)
    const outputs = getOutputs(spooledStdout)

    expect(outputs[ActionOutputs.ERRORED]).toEqual('false')
    expect(outputs[ActionOutputs.PASSED]).toEqual('false')
    expect(outputs[ActionOutputs.JSON_OUTPUT])
    expect(JSON.parse(outputs[ActionOutputs.JSON_OUTPUT])).toMatchObject(
      JSON.parse(expected)
    )
    expect(process.exitCode).toEqual(0)

    findIssueScope.done()
    updateIssueScope.done()
  })
})
