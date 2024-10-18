// https://github.com/elysiajs/elysia-cors/blob/main/src/index.ts
import type { TemplatedApp, HttpRequest, HttpResponse, RecognizedString } from 'uWebSockets.js'

type Origin = string | RegExp | ((req: HttpRequest) => boolean | void)

export type HTTPMethod = 'ACL' | 'BIND' | 'CHECKOUT' | 'CONNECT' | 'COPY' | 'DELETE' | 'GET' | 'HEAD' | 'LINK' | 'LOCK' | 'M-SEARCH' | 'MERGE' | 'MKACTIVITY' | 'MKCALENDAR' | 'MKCOL' | 'MOVE' | 'NOTIFY' | 'OPTIONS' | 'PATCH' | 'POST' | 'PROPFIND' | 'PROPPATCH' | 'PURGE' | 'PUT' | 'REBIND' | 'REPORT' | 'SEARCH' | 'SOURCE' | 'SUBSCRIBE' | 'TRACE' | 'UNBIND' | 'UNLINK' | 'UNLOCK' | 'UNSUBSCRIBE'

type HttpMethod = 'get' | 'post' | 'options' | 'del' | 'patch' | 'put' | 'head' | 'connect' | 'trace' | 'any'

const HTTP_METHODS = new Set<HttpMethod>(['get', 'post', 'options', 'del', 'patch', 'put', 'head', 'connect', 'trace', 'any'])

type MaybeArray<T> = T | T[]

interface CORSConfig {
  /**
   * @default `true`
   *
   * Assign the **Access-Control-Allow-Origin** header.
   *
   * Value can be one of the following:
   * - `string` - String of origin which will be directly assign to `Access-Control-Allow-Origin`
   *
   * - `boolean` - If set to true, `Access-Control-Allow-Origin` will be set to `*` (accept all origin)
   *
   * - `RegExp` - Pattern to use to test with request's url, will accept origin if matched.
   *
   * - `Function` - Custom logic to validate origin acceptance or not. will accept origin if `true` is returned.
   *   - Function will accepts `Context` just like `Handler`
   *
   *   ```typescript
   *   // ? Example usage
   *   app.use(cors, {
   *      origin: ({ request, headers }) => true
   *   })
   *
   *   // Type Definition
   *   type CORSOriginFn = (context: Context) => boolean | void
   *   ```
   *
   * - `Array<string | RegExp | Function>` - Will try to find truthy value of all options above. Will accept request if one is `true`.
   */
  origin?: Origin | boolean | Origin[]
  /**
   * @default `*`
   *
   * Assign **Access-Control-Allow-Methods** header.
   *
   * Value can be one of the following:
   * Accept:
   * - `undefined | null | ''` - Ignore all methods.
   *
   * - `*` - Accept all methods.
   *
   * - `HTTPMethod` - Will be directly set to **Access-Control-Allow-Methods**.
   * - Expects either a single method or a comma-delimited string (eg: 'GET, PUT, POST')
   *
   * - `HTTPMethod[]` - Allow multiple HTTP methods.
   * - eg: ['GET', 'PUT', 'POST']
   */
  methods?: boolean | undefined | null | '' | '*' | MaybeArray<HTTPMethod | (string & {})>
  /**
   * @default `*`
   *
   * Assign **Access-Control-Allow-Headers** header.
   *
   * Allow incoming request with the specified headers.
   *
   * Value can be one of the following:
   * - `string`
   *     - Expects either a single method or a comma-delimited string (eg: 'Content-Type, Authorization').
   *
   * - `string[]` - Allow multiple HTTP methods.
   *     - eg: ['Content-Type', 'Authorization']
   */
  allowedHeaders?: true | string | string[]
  /**
   * @default `*`
   *
   * Assign **Access-Control-Expose-Headers** header.
   *
   * Return the specified headers to request in CORS mode.
   *
   * Value can be one of the following:
   * - `string`
   *     - Expects either a single method or a comma-delimited string (eg: 'Content-Type, 'X-Powered-By').
   *
   * - `string[]` - Allow multiple HTTP methods.
   *     - eg: ['Content-Type', 'X-Powered-By']
   */
  exposeHeaders?: true | string | string[]
  /**
   * @default `true`
   *
   * Assign **Access-Control-Allow-Credentials** header.
   *
   * Allow incoming requests to send `credentials` header.
   *
   * - `boolean` - Available if set to `true`.
   */
  credentials?: boolean
  /**
   * @default `5`
   *
   * Assign **Access-Control-Max-Age** header.
   *
   * Allow incoming requests to send `credentials` header.
   *
   * - `number` - Duration in seconds to indicates how long the results of a preflight request can be cached.
   */
  maxAge?: number
  /**
   * @default `true`
   *
   * Add `[OPTIONS] /*` handler to handle preflight request which response with `HTTP 204` and CORS hints.
   *
   * - `boolean` - Available if set to `true`.
   */
  preflight?: boolean
}

/**
 * This function is use when headers config is true.
 * Attempts to process headers based on request headers.
 */
const getHeadersKeys = (req: HttpRequest): string => {
  const keys: string[] = []

  // eslint-disable-next-line unicorn/no-array-for-each
  req.forEach((key) => {
    keys.push(key)
  })

  return keys.join(', ')
}

const processOrigin = (origin: Origin, req: HttpRequest, from: string): boolean => {
  if (Array.isArray(origin))
    return origin.some((o) => processOrigin(o, req, from))

  switch (typeof origin) {
    case 'string': {
      if (!origin.includes('://')) return from.includes(origin)

      return origin === from
    }
    case 'function': {
      return origin(req) === true
    }
    case 'object': {
      if (origin instanceof RegExp) return origin.test(from)
    }
  }

  return false
}

export const cors = (app: TemplatedApp, {
  origin = true,
  methods = true,
  allowedHeaders = true,
  exposeHeaders = true,
  credentials = true,
  maxAge = 5,
  preflight = true
}: CORSConfig = {}) => {
  if (Array.isArray(allowedHeaders))
    allowedHeaders = allowedHeaders.join(', ')

  if (Array.isArray(exposeHeaders)) exposeHeaders = exposeHeaders.join(', ')

  const origins = typeof origin === 'boolean'
    ? undefined
    : (Array.isArray(origin) ? origin : [origin])

  const anyOrigin = origins?.some((o) => o === '*')

  const handleOrigin = (res: HttpResponse, req: HttpRequest) => {
    // origin === `true` means any origin
    if (origin === true) {
      res.writeHeader('vary', '*')
      res.writeHeader('access-control-allow-origin', req.getHeader('origin') || '*')
      return
    }

    if (anyOrigin) {
      res.writeHeader('vary', '*')
      res.writeHeader('access-control-allow-origin', '*')
      return
    }

    if (!origins?.length) return

    const headers: string[] = []

    if (origins.length > 0) {
      const from = req.getHeader('origin') ?? ''
      for (const origin of origins) {
        const value = processOrigin(origin!, req, from)
        if (value === true) {
          res.writeHeader('vary', origin ? 'Origin' : '*')
          res.writeHeader('access-control-allow-origin', from || '*')
          return
        }

        // value can be string (truthy value) but not `true`
        if (value) headers.push(value)
      }
    }

    res.writeHeader('vary', 'Origin')
    if (headers.length > 0)
      res.writeHeader('access-control-allow-origin', headers.join(', '))
  }

  const handleMethod = (res: HttpResponse, method?: string | null): void => {
    if (!method) return

    if (methods === true) {
      res.writeHeader('access-control-allow-methods', method ?? '*')
      return
    }

    if (methods === false || !methods?.length) return

    if (methods === '*') {
      res.writeHeader('access-control-allow-methods', '*')
      return
    }

    if (!Array.isArray(methods)) {
      res.writeHeader('access-control-allow-methods', methods)
      return
    }

    res.writeHeader('access-control-allow-methods', methods.join(', '))
  }

  const defaultHeaders: Record<string, string> = {}

  if (typeof exposeHeaders === 'string')
    defaultHeaders['access-control-expose-headers'] = exposeHeaders

  if (typeof allowedHeaders === 'string')
    defaultHeaders['access-control-allow-headers'] = allowedHeaders

  if (credentials === true)
    defaultHeaders['access-control-allow-credentials'] = 'true'

  if (preflight) {
    const handleOption = (res: HttpResponse, req: HttpRequest) => {
      handleOrigin(res, req)
      handleMethod(res, req.getHeader('access-control-request-method'))

      if (allowedHeaders === true || exposeHeaders === true) {
        if (allowedHeaders === true)
          res.writeHeader('access-control-allow-headers', req.getHeader('access-control-request-headers'))

        if (exposeHeaders === true)
          res.writeHeader('access-control-expose-headers', getHeadersKeys(req))
      }

      if (maxAge)
        res.writeHeader('access-control-max-age', maxAge.toString())

      res.writeStatus('204').end()
    }

    app
      .options('/', handleOption)
      .options('/*', handleOption)
  }

  // app.onRequest implementation to handle CORS headers on all HTTP methods
  for (const httpMethod of HTTP_METHODS) {
    const originalBindMethod = app[httpMethod as HttpMethod].bind(app)

    app[httpMethod as HttpMethod] = (
      pattern: RecognizedString,
      handler: (res: HttpResponse, req: HttpRequest) => void | Promise<void>
    ): TemplatedApp => {
      return originalBindMethod(pattern, (res, req) => {
        for (const key in defaultHeaders) {
          res.writeHeader(key, defaultHeaders[key])
        }
        handleOrigin(res, req)
        handleMethod(res, req.getMethod())

        if (allowedHeaders === true || exposeHeaders === true) {
          const headers = getHeadersKeys(req)

          if (allowedHeaders === true)
            res.writeHeader('access-control-allow-headers', headers)

          if (exposeHeaders === true)
            res.writeHeader('access-control-expose-headers', headers)
        }
        handler(res, req)
      })
    }
  }

  return app
}
