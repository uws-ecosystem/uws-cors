// https://github.com/elysiajs/elysia-cors/blob/main/test/allow-headers.test.ts
import { strictEqual } from 'node:assert'
import { afterEach, describe, it } from 'node:test'
import { App, type TemplatedApp } from 'uWebSockets.js'

import { cors } from '../src/index'
import { port, req } from './utils'

let app: TemplatedApp

describe('Allowed Headers', () => {
  afterEach(() => {
    app.close()
  })

  it('Accept single header', (_, done) => {
    app = cors(App(), {
      allowedHeaders: 'Content-Type'
    })
      .get('/', (res) => { res.end('HI') })
      .listen(port, async (listenSocket) => {
        if (!listenSocket) throw new Error('Failed to listen')
        const res = await req('/')
        strictEqual(res.headers['access-control-allow-headers'], 'Content-Type')
        done()
      })
  })

  it('Accept array', (_, done) => {
    app = cors(App(), {
      allowedHeaders: ['Content-Type', 'X-Imaginary-Value']
    })
      .get('/', (res) => { res.end('HI') })
      .listen(port, async (listenSocket) => {
        if (!listenSocket) throw new Error('Failed to listen')
        const res = await req('/')
        strictEqual(res.headers['access-control-allow-headers'], 'Content-Type, X-Imaginary-Value')
        done()
      })
  })
})
