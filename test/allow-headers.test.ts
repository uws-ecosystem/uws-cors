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

  it('Accept single header', async () => {
    app = cors(App(), {
      allowedHeaders: 'Content-Type'
    })
      .get('/', (res) => { res.end('HI') })
      .listen(port, () => { })

    const res = await req('/')
    strictEqual(res.headers['access-control-allow-headers'], 'Content-Type')
  })

  it('Accept array', async () => {
    app = cors(App(), {
      allowedHeaders: ['Content-Type', 'X-Imaginary-Value']
    })
      .get('/', (res) => { res.end('HI') })
      .listen(port, () => { })

    const res = await req('/')
    strictEqual(res.headers['access-control-allow-headers'], 'Content-Type, X-Imaginary-Value')
  })
})
