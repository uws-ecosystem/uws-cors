// https://github.com/elysiajs/elysia-cors/blob/main/test/utils.ts
import type { IncomingMessage } from 'node:http'

export const port = 8080

type ResponseType = {
  status?: Response['status']
  headers: IncomingMessage['headers']
}

export const req = async (path: string, headers?: HeadersInit, additionalOptions: HeadersInit = {}): Promise<ResponseType> => {
  return fetch(`http://localhost:${port}${path}`, { headers, ...additionalOptions }).then((res) => ({
    headers: Object.fromEntries(res.headers.entries())
  }))
}

export const preflight = async (path: string, headers?: HeadersInit): Promise<ResponseType> => {
  return fetch(`http://localhost:${port}${path}`, { method: 'OPTIONS', headers }).then((res) => ({
    status: res.status,
    headers: Object.fromEntries(res.headers.entries())
  }))
}
