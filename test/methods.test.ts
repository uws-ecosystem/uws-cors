// https://github.com/elysiajs/elysia-cors/blob/main/test/methods.test.ts
import { strictEqual } from 'node:assert'
import { afterEach, describe, it } from 'node:test'
import { App, type TemplatedApp } from 'uWebSockets.js'

import { cors } from '../src/index'
import { fetchReq, port, req } from './utils'

let app: TemplatedApp

describe('Methods', () => {
  afterEach(() => {
    app.close()
  })

  it('Accept single methods', async () => {
    const methods = ['GET']
    app = cors(App(), {
      methods
    })
      .get('/', (res) => { res.end('HI') })
      .listen(port, () => { })

    const res = await req('/')
    strictEqual(res.headers['access-control-allow-methods'], methods.join(', '))
  })

  it('Accept array', async () => {
    const methods = ['GET', 'POST']
    app = cors(App(), {
      methods
    })
      .get('/', (res) => { res.end('HI') })
      .listen(port, () => { })

    const res = await req('/')
    strictEqual(res.headers['access-control-allow-methods'], methods.join(', '))
  })

  it('Accept *', async () => {
    const methods = '*'
    app = cors(App(), {
      methods
    })
      .get('/', (res) => { res.end('HI') })
      .listen(port, () => { })

    const res = await req('/')
    strictEqual(res.headers['access-control-allow-methods'], methods)
  })

  it('Mirror request method if set to true', async () => {
    app = cors(App(), {
      methods: true
    })
      .get('/', (res) => { res.end('HI') })
      .post('/', (res) => { res.end('HI') })
      .listen(port, () => { })

    const get = await req('/')
    strictEqual(get.headers['access-control-allow-methods'], 'get')

    const post = await fetchReq('/', {
      method: 'POST',
      credentials: 'include'
    })
    strictEqual(post.headers['access-control-allow-methods'], 'post')
  })

  it('Handle mirror method on preflight options', async () => {
    app = cors(App(), {
      methods: true
    })
      .get('/', (res) => { res.end('HI') })
      .put('/', (res) => { res.end('HI') })
      .listen(port, () => { })

    const method = 'PUT'
    const get = await fetchReq('/', {
      method: 'OPTIONS',
      credentials: 'include',
      headers: {
        origin: 'http://localhost/',
        'access-control-request-method': method
      }
    })
    strictEqual(get.headers['access-control-allow-methods'], method)
  })
})
