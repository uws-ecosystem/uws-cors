// https://github.com/elysiajs/elysia-cors/blob/main/test/max-age.test.ts
import { strictEqual } from 'node:assert'
import { afterEach, describe, it } from 'node:test'
import { App, type TemplatedApp } from 'uWebSockets.js'

import { cors } from '../src/index'
import { port, preflight } from './utils'

let app: TemplatedApp

describe('Max Age', () => {
  afterEach(() => {
    app.close()
  })

  it('Set maxage', (_, done) => {
    app = cors(App(), {
      maxAge: 5
    })
      .listen(port, async (listenSocket) => {
        if (!listenSocket) throw new Error('Failed to listen')
        const res = await preflight('/')
        strictEqual(res.headers['access-control-max-age'], '5')
        done()
      })
  })

  it('Skip maxage if falsey', (_, done) => {
    app = cors(App(), {
      maxAge: 0
    })
      .listen(port, async (listenSocket) => {
        if (!listenSocket) throw new Error('Failed to listen')
        const res = await preflight('/')
        strictEqual(res.headers['access-control-max-age'], undefined)
        done()
      })
  })
})
