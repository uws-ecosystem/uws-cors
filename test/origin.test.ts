// https://github.com/elysiajs/elysia-cors/blob/main/test/origin.test.ts
import { strictEqual } from 'node:assert'
import { afterEach, describe, it } from 'node:test'
import { App, type TemplatedApp } from 'uWebSockets.js'

import { cors } from '../src/index'
import { port, req } from './utils'

let app: TemplatedApp

describe('Origin', () => {
  afterEach(() => {
    app.close()
  })

  it('Accept string', async () => {
    app = cors(App(), {
      origin: 'saltyaom.com'
    })
      .get('/', (res) => { res.end('A') })
      .listen(port, () => { })

    const res = await req('/', {
      origin: 'https://saltyaom.com'
    })

    strictEqual(res.headers['access-control-allow-origin'], 'https://saltyaom.com')
  })

  it('Accept boolean', async () => {
    app = cors(App(), {
      origin: true
    })
      .get('/', (res) => { res.end('HI') })
      .listen(port, () => { })

    const res = await req('/')
    strictEqual(res.headers['access-control-allow-origin'], '*')
  })

  it('Accept RegExp', async () => {
    app = cors(App(), {
      origin: /\.com/g
    })
      .get('/', (res) => { res.end('HI') })
      .listen(port, () => { })

    const notAllowed = await req('/', {
      Origin: 'https://example.org'
    })
    const allowed = await req('/', {
      Origin: 'https://example.com'
    })
    strictEqual(notAllowed.headers['access-control-allow-origin'], undefined)
    strictEqual(allowed.headers['access-control-allow-origin'], 'https://example.com')
  })

  it('Accept Function', async () => {
    app = cors(App(), {
      origin: () => true
    })
      .get('/', (res) => { res.end('HI') })
      .listen(port, () => { })

    const res = await req('/', {
      Origin: 'https://example.com'
    })
    strictEqual(res.headers['access-control-allow-origin'], 'https://example.com')
  })

  it('Accept string[]', async () => {
    app = cors(App(), {
      origin: ['gehenna.sh', 'saltyaom.com']
    })
      .get('/', (res) => { res.end('A') })
      .listen(port, () => { })

    const res = await req('/', {
      origin: 'https://saltyaom.com'
    })

    strictEqual(res.headers['access-control-allow-origin'], 'https://saltyaom.com')
  })

  it('Accept Function[]', async () => {
    app = cors(App(), {
      origin: ['https://demo.app', () => false, /.com/g]
    })
      .get('/', (res) => { res.end('HI') })
      .listen(port, () => { })

    const res = await req('/', {
      Origin: 'https://example.com'
    })
    strictEqual(res.headers['access-control-allow-origin'], 'https://example.com')
  })
})
