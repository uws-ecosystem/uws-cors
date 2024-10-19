// https://github.com/elysiajs/elysia-cors/blob/main/test/credentials.test.ts
import { strictEqual } from 'node:assert'
import { afterEach, describe, it } from 'node:test'
import { App, type TemplatedApp } from 'uWebSockets.js'

import { cors } from '../src/index'
import { port, req } from './utils'

let app: TemplatedApp

describe('Credentials', () => {
  afterEach(() => {
    app.close()
  })

  it('Allow credential', (_, done) => {
    app = cors(App(), {
      credentials: true
    })
      .get('/', (res) => { res.end('HI') })
      .listen(port, async (listenSocket) => {
        if (!listenSocket) throw new Error('Failed to listen')
        const res = await req('/')
        strictEqual(res.headers['access-control-allow-credentials'], 'true')
        done()
      })
  })

  it('Disallow credential', (_, done) => {
    app = cors(App(), {
      credentials: false
    })
      .get('/', (res) => { res.end('HI') })
      .listen(port, async (listenSocket) => {
        if (!listenSocket) throw new Error('Failed to listen')
        const res = await req('/')
        strictEqual(res.headers['access-control-allow-credentials'], undefined)
        done()
      })
  })
})
