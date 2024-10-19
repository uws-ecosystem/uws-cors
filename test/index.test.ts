// https://github.com/elysiajs/elysia-cors/blob/main/test/index.test.ts
import { strictEqual } from 'node:assert'
import { afterEach, describe, it } from 'node:test'
import { App, type TemplatedApp } from 'uWebSockets.js'

import { cors } from '../src/index'
import { port, req } from './utils'

let app: TemplatedApp

describe('CORS', () => {
  afterEach(() => {
    app.close()
  })

  it('Accept all CORS by default', (_, done) => {
    app = cors(App())
      .get('/', (res) => { res.end('HI') })
      .listen(port, async (listenSocket) => {
        if (!listenSocket) throw new Error('Failed to listen')
        const res = await req('/', {
          origin: 'https://saltyaom.com'
        })
        strictEqual(res.headers['access-control-allow-origin'], 'https://saltyaom.com')
        strictEqual(res.headers['access-control-allow-methods'], 'get')
        strictEqual(res.headers['access-control-allow-headers'], 'host, connection, origin, accept, accept-language, sec-fetch-mode, user-agent, accept-encoding')
        strictEqual(res.headers['access-control-expose-headers'], 'host, connection, origin, accept, accept-language, sec-fetch-mode, user-agent, accept-encoding')
        strictEqual(res.headers['access-control-allow-credentials'], 'true')
        done()
      })
  })
})
