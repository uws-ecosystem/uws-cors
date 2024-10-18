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

  it('Allow credential', async () => {
    app = cors(App(), {
      credentials: true
    })
      .get('/', (res) => { res.end('HI') })
      .listen(port, () => { })

    const res = await req('/')
    strictEqual(res.headers['access-control-allow-credentials'], 'true')
  })

  it('Disallow credential', async () => {
    app = cors(App(), {
      credentials: false
    })
      .get('/', (res) => { res.end('HI') })
      .listen(port, () => { })

    const res = await req('/')
    strictEqual(res.headers['access-control-allow-credentials'], undefined)
  })
})
