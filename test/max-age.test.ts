// https://github.com/elysiajs/elysia-cors/blob/main/test/max-age.test.ts
import { strictEqual } from 'node:assert'
import { afterEach, describe, it } from 'node:test'
import { App, type TemplatedApp } from 'uWebSockets.js'

import { cors } from '../src/index'
import { preflight } from './utils'

let app: TemplatedApp

describe('Max Age', () => {
  afterEach(() => {
    app.close()
  })

  it('Set maxage', async () => {
    app = cors(App(), {
      maxAge: 5
    })

    const res = await preflight('/')
    strictEqual(res.headers['access-control-max-age'], '5')
  })

  it('Skip maxage if falsey', async () => {
    app = cors(App(), {
      maxAge: 0
    })

    const res = await preflight('/')
    strictEqual(res.headers['access-control-max-age'], undefined)
  })
})
