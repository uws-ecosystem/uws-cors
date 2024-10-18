// https://github.com/elysiajs/elysia-cors/blob/main/test/utils.ts
import http, { type IncomingMessage } from 'node:http'

export const port = 8080

type ResponseType = {
  statusCode?: IncomingMessage['statusCode']
  headers: IncomingMessage['headers']
}

export const req = (path: string, headers?: Record<string, string | string[]>): Promise<ResponseType> => {
  return new Promise((resolve) => {
    http.get(`http://localhost:${port}${path}`, { headers }, (res) => {
      res.on('data', (_chunk) => { })
      res.on('end', () => {
        resolve({
          headers: res.headers
        })
      })
    })
  })
}

export const preflight = (path: string, headers?: Record<string, string | string[]>): Promise<ResponseType> => {
  return new Promise((resolve) => {
    http.get(`http://localhost:${port}${path}`, { method: 'options', headers }, (res) => {
      res.on('data', (_chunk) => { })
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers
        })
      })
    })
  })
}

export const fetchReq = async (path: string, init: Parameters<typeof fetch>[1]): Promise<ResponseType> => {
  const res = await fetch(`http://localhost:${port}${path}`, init)
  return {
    headers: Object.fromEntries(res.headers.entries())
  }
}
