// https://github.com/elysiajs/elysia-cors/blob/main/test/methods.test.ts
import { strictEqual } from 'node:assert'
import { afterEach, describe, it } from 'node:test'
import { App, type TemplatedApp } from 'uWebSockets.js'

import { cors } from '../src/index'
import { port, req } from './utils'

let app: TemplatedApp

describe('Methods', () => {
  afterEach(() => {
    app.close()
  })

  it('Accept single methods', (_, done) => {
    const methods = ['GET']
    app = cors(App(), {
      methods
    })
      .get('/', (res) => { res.end('HI') })
      .listen(port, async (listenSocket) => {
        if (!listenSocket) throw new Error('Failed to listen')
        const res = await req('/')
        strictEqual(res.headers['access-control-allow-methods'], methods.join(', '))
        done()
      })
  })

  it('Accept array', (_, done) => {
    const methods = ['GET', 'POST']
    app = cors(App(), {
      methods
    })
      .get('/', (res) => { res.end('HI') })
      .listen(port, async (listenSocket) => {
        if (!listenSocket) throw new Error('Failed to listen')
        const res = await req('/')
        strictEqual(res.headers['access-control-allow-methods'], methods.join(', '))
        done()
      })
  })

  it('Accept *', (_, done) => {
    const methods = '*'
    app = cors(App(), {
      methods
    })
      .get('/', (res) => { res.end('HI') })
      .listen(port, async (listenSocket) => {
        if (!listenSocket) throw new Error('Failed to listen')
        const res = await req('/')
        strictEqual(res.headers['access-control-allow-methods'], methods)
        done()
      })
  })

  it('Handle mirror method on preflight options', (_, done) => {
    app = cors(App(), {
      methods: true
    })
      .get('/', (res) => { res.end('HI') })
      .put('/', (res) => { res.end('HI') })
      .listen(port, async (listenSocket) => {
        if (!listenSocket) throw new Error('Failed to listen')
        const method = 'PUT'
        const get = await req('/', {
          origin: 'http://localhost/',
          'access-control-request-method': method
        }, {
          method: 'OPTIONS',
          credentials: 'include'
        })
        strictEqual(get.headers['access-control-allow-methods'], method)
        done()
      })
  })

  it('Mirror request method if set to true', (_, done) => {
    app = cors(App(), {
      methods: true
    })
      .get('/', (res) => { res.end('HI') })
      .post('/', (res) => { res.end('HI') })
      .listen(port, async (listenSocket) => {
        if (!listenSocket) throw new Error('Failed to listen')
        const get = await req('/')
        strictEqual(get.headers['access-control-allow-methods'], 'get')
        const post = await req('/', {}, {
          method: 'POST',
          credentials: 'include'
        })
        strictEqual(post.headers['access-control-allow-methods'], 'post')
        done()
      })
  })
})
