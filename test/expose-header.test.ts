// https://github.com/elysiajs/elysia-cors/blob/main/test/expose-header.test.ts
import { strictEqual } from 'node:assert'
import { afterEach, describe, it } from 'node:test'
import { App, type TemplatedApp } from 'uWebSockets.js'

import { cors } from '../src/index'
import { port, req } from './utils'

let app: TemplatedApp

describe('Expose Headers', () => {
  afterEach(() => {
    app.close()
  })

  it('Expose single header', (_, done) => {
    app = cors(App(), {
      exposeHeaders: 'Content-Type'
    })
      .get('/', (res) => { res.end('HI') })
      .listen(port, async (listenSocket) => {
        if (!listenSocket) throw new Error('Failed to listen')
        const res = await req('/')
        strictEqual(res.headers['access-control-expose-headers'], 'Content-Type')
        done()
      })
  })

  it('Expose array', (_, done) => {
    app = cors(App(), {
      exposeHeaders: ['Content-Type', 'X-Imaginary-Value']
    })
      .get('/', (res) => { res.end('HI') })
      .listen(port, async (listenSocket) => {
        if (!listenSocket) throw new Error('Failed to listen')
        const res = await req('/')
        strictEqual(res.headers['access-control-expose-headers'], 'Content-Type, X-Imaginary-Value')
        done()
      })
  })
})
