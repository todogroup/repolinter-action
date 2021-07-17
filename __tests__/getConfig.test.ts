import getConfig from '../src/getConfig'
import * as path from 'path'
import * as fs from 'fs'
import * as yaml from 'js-yaml'
import nock from 'nock'

describe('getConfig', () => {
  // disable live network connections
  nock.disableNetConnect()

  // supress github actions commands inside tests
  beforeEach(() => process.stdout.write('::stop-commands::running-tests\n'))
  afterEach(() => process.stdout.write('::running-tests::\n'))

  test('getConfig returns a config from a JSON file', async () => {
    const filepath = path.resolve(__dirname, 'testconfig.json')
    const expected = JSON.parse(
      await fs.promises.readFile(filepath, 'utf8')
    ) as Record<string, unknown>
    const res = await getConfig({configFile: filepath})

    expect(res).toMatchObject(expected)
  })

  test('getConfig returns a config from a YAML', async () => {
    const filepath = path.resolve(__dirname, 'testconfig.yaml')
    const expected = yaml.load(
      await fs.promises.readFile(filepath, 'utf8')
    ) as Record<string, unknown>
    const res = await getConfig({configFile: filepath})

    expect(res).toMatchObject(expected)
  })

  test('getConfig returns a JSON config from a URL', async () => {
    const url =
      'https://raw.githubusercontent.com/aperture-science-incorporated/.github/master/repolinter.json'
    const filepath = path.resolve(__dirname, 'testconfig.json')
    const expected = JSON.parse(
      await fs.promises.readFile(filepath, 'utf8')
    ) as Record<string, unknown>
    const scope = nock('https://raw.githubusercontent.com')
      .get('/aperture-science-incorporated/.github/master/repolinter.json')
      .replyWithFile(200, filepath)

    const res = await getConfig({configUrl: url})

    expect(res).toMatchObject(expected)

    scope.done()
  })

  test('getConfig returns a YAML config from a URL', async () => {
    const url =
      'https://raw.githubusercontent.com/aperture-science-incorporated/.github/master/repolinter.yaml'
    const filepath = path.resolve(__dirname, 'testconfig.yaml')
    const expected = yaml.load(
      await fs.promises.readFile(filepath, 'utf8')
    ) as Record<string, unknown>
    const scope = nock('https://raw.githubusercontent.com')
      .get('/aperture-science-incorporated/.github/master/repolinter.yaml')
      .replyWithFile(200, filepath)

    const res = await getConfig({configUrl: url})

    expect(res).toMatchObject(expected)

    scope.done()
  })

  test('getConfig fails with an invalid file', async () => {
    const filepath = 'notafile'

    await expect(async () =>
      getConfig({configFile: filepath})
    ).rejects.toThrowError()
  })

  test('getConfig failed with an invalid url', async () => {
    const url = 'notadomain'

    await expect(async () => getConfig({configUrl: url})).rejects.toThrowError()
  })

  test('getConfig failed with an rejecting url', async () => {
    const url = 'https://www.example.com'
    const scope = nock(url).get('/').reply(404)

    await expect(async () => getConfig({configUrl: url})).rejects.toThrowError()
    scope.done()
  })

  test('getConfig fails with an invalid json', async () => {
    const filepath = path.resolve(__dirname, 'invalidtestconfig.json')

    await expect(async () =>
      getConfig({configFile: filepath})
    ).rejects.toThrowError()
  })

  test('getConfig fails with an invalid json syntax', async () => {
    const filepath = path.resolve(__dirname, 'invalidsyntaxtestconfig.json')

    await expect(async () =>
      getConfig({configFile: filepath})
    ).rejects.toThrowError()
  })

  test('getConfig fails with an invalid yaml', async () => {
    const filepath = path.resolve(__dirname, 'invalidtestconfig.yaml')

    await expect(async () =>
      getConfig({configFile: filepath})
    ).rejects.toThrowError()
  })

  test('getConfig fails with an invalid yaml syntax', async () => {
    const filepath = path.resolve(__dirname, 'invalidsyntaxtestconfig.yaml')

    await expect(async () =>
      getConfig({configFile: filepath})
    ).rejects.toThrowError()
  })
})
