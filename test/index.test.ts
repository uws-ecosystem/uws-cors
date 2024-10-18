// https://github.com/elysiajs/elysia-cors/blob/main/test/index.test.ts
import { strictEqual } from 'node:assert'
import { afterEach, beforeEach, describe, it } from 'node:test'
import { App, type TemplatedApp } from 'uWebSockets.js'

import { cors } from '../src/index'
import { port, req } from './utils'

let app: TemplatedApp

describe('CORS', () => {
  beforeEach(() => {
    app = cors(App())
  })

  afterEach(() => {
    app.close()
  })

  it('Accept all CORS by default', async () => {
    app.get('/', (res) => { res.end('HI') })
      .listen(port, () => { })
    const res = await req('/', {
      origin: 'https://saltyaom.com'
    })
    strictEqual(res.headers['access-control-allow-origin'], 'https://saltyaom.com')
    strictEqual(res.headers['access-control-allow-methods'], 'get')
    strictEqual(res.headers['access-control-allow-headers'], 'origin, host, connection')
    strictEqual(res.headers['access-control-expose-headers'], 'origin, host, connection')
    strictEqual(res.headers['access-control-allow-credentials'], 'true')
  })
})
