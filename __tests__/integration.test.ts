import * as cp from 'child_process'
import * as path from 'path'
import * as process from 'process'
import {ActionInputs} from '../src/inputs'

async function execAsync(
  command: string,
  opts: cp.ExecOptions
): Promise<{out: string; err: string; code: number}> {
  return new Promise((resolve, reject) => {
    cp.exec(command, opts, (err, outstd, errstd) =>
      err !== null && err.code === undefined
        ? reject(err)
        : resolve({
            out: outstd,
            err: errstd,
            code: err !== null ? (err.code as number) : 0
          })
    )
  })
}

async function runAction(
  env: NodeJS.ProcessEnv
): Promise<{out: string; err: string; code: number}> {
  const ip = path.join(__dirname, '..', 'dist', 'index.js')
  return execAsync(`node ${ip}`, {env})
}

function getInputName(input: string): string {
  return `INPUT_${input.replace(/ /g, '_').toUpperCase()}`
}

function getBaseEnv(): NodeJS.ProcessEnv {
  const ret: NodeJS.ProcessEnv = {}
  ret[getInputName(ActionInputs.DIRECTORY)] = '.'
  ret[getInputName(ActionInputs.REPO)] = 'todogroup/repolinter-action'
  ret[getInputName(ActionInputs.OUTPUT_TYPE)] = 'exit-code'
  ret[getInputName(ActionInputs.OUTPUT_NAME)] = 'Open Source Policy Issues'
  ret[getInputName(ActionInputs.LABEL_NAME)] = 'repolinter'
  ret[getInputName(ActionInputs.LABEL_COLOR)] = 'fbca04'
  ret[getInputName(ActionInputs.USERNAME)] = 'github-actions'
  ret['GITHUB_RUN_NUMBER'] = '1'
  ret['GITHUB_ACTION'] = 'true'
  return ret
}

describe('integration', () => {
  jest.setTimeout(30000)

  test('runs a failing test config', async () => {
    const baseEnv = getBaseEnv()
    baseEnv[getInputName(ActionInputs.CONFIG_FILE)] = path.resolve(
      __dirname,
      'testconfig.json'
    )

    const {out, code} = await runAction(Object.assign({}, process.env, baseEnv))

    expect(code).not.toEqual(0)
    // TODO: outputs
    expect(out).toContain('testconfig.json')
    expect(out).not.toContain('undefined')
  })

  test('runs a URL config', async () => {
    const baseEnv = getBaseEnv()
    baseEnv[getInputName(ActionInputs.CONFIG_URL)] =
      'http://test/repolinter.json'

    const {out, code} = await runAction(Object.assign({}, process.env, baseEnv))

    expect(code).not.toEqual(0)
    expect(out).toContain('http://test/repolinter.json')
    expect(out).not.toContain('undefined')
  })

  test('runs the default config', async () => {
    const baseEnv = getBaseEnv()
    const {out, code} = await runAction(Object.assign({}, process.env, baseEnv))

    expect(code).not.toEqual(0)
    expect(out).toContain('default')
    expect(out).not.toContain('undefined')
  })

  test('runs a passing config', async () => {
    const baseEnv = getBaseEnv()
    baseEnv[getInputName(ActionInputs.CONFIG_FILE)] = path.resolve(
      __dirname,
      'passingtestconfig.json'
    )

    const {out, code} = await runAction(Object.assign({}, process.env, baseEnv))

    expect(code).toEqual(0)
    expect(out).toContain('passingtestconfig.json')
    expect(out).not.toContain('undefined')
  })

  test('runs a config in a custom directory', async () => {
    const baseEnv = getBaseEnv()
    baseEnv[getInputName(ActionInputs.DIRECTORY)] = './__tests__/testfolder'
    baseEnv[getInputName(ActionInputs.CONFIG_FILE)] =
      './__tests__/testfolder/nestedtestconfig.json'

    const {out, code} = await runAction(Object.assign({}, process.env, baseEnv))

    expect(code).toEqual(0)
    expect(out).toContain('nestedtestconfig.json')
    expect(out).not.toContain('undefined')
  })
})
