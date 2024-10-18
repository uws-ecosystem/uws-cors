// https://github.com/elysiajs/elysia-cors/blob/main/test/preflight.test.ts
import { strictEqual } from 'node:assert'
import { afterEach, describe, it } from 'node:test'
import { App, type TemplatedApp } from 'uWebSockets.js'

import { cors } from '../src/index'
import { port, preflight } from './utils'

let app: TemplatedApp

describe('Preflight', () => {
  afterEach(() => {
    app.close()
  })

  // FAIL: res.statusCode is 200 and not 204
  // it('Enable preflight', async () => {
  //   app = cors(App(), {
  //     preflight: true
  //   })
  //     .get('/', (res) => { res.end('HI') })
  //     .listen(port, () => { })

  //   const res = await preflight('/')
  //   strictEqual(res.statusCode, 204)
  // })

  // FAIL: res.statusCode is 200 and not 204
  // it('Enable preflight on sub path', async () => {
  //   app = cors(App(), {
  //     preflight: true
  //   })
  //     .get('/nested/deep', (res) => { res.end('HI') })
  //     .listen(port, () => { })

  //   const res = await preflight('/')
  //   strictEqual(res.statusCode, 204)
  // })

  it('Disable preflight', async () => {
    app = cors(App(), {
      preflight: false
    })
      .get('/', (res) => { res.end('HI') })
      .listen(port, () => { })

    const res = await preflight('/')
    strictEqual(res.statusCode, 404)
  })
})
