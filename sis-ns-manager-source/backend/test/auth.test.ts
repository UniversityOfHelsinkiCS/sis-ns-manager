import { after, before, describe, test } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import fs from 'node:fs'
import app from '../app.ts'

// Run with NODE_ENV=test: neither the dev mock user nor the production OIDC /
// Redis wiring is mounted, so requests reach the router genuinely
// unauthenticated. The server listens on a Unix socket rather than a TCP port,
// avoiding port clashes and any traffic to localhost.
const socketPath = path.join(os.tmpdir(), `sis-ns-manager-test-${process.pid}.sock`)
let server: http.Server

const request = (
  method: string,
  urlPath: string,
  { body, headers = {} }: { body?: unknown; headers?: Record<string, string> } = {},
): Promise<{ status: number; body: unknown }> =>
  new Promise((resolve, reject) => {
    const payload = body === undefined ? undefined : JSON.stringify(body)
    const req = http.request(
      {
        socketPath,
        method,
        path: urlPath,
        headers: payload ? { 'Content-Type': 'application/json', ...headers } : headers,
      },
      (res) => {
        let data = ''
        res.setEncoding('utf8')
        res.on('data', (chunk) => (data += chunk))
        res.on('end', () => {
          const isJson = res.headers['content-type']?.includes('application/json')
          resolve({ status: res.statusCode ?? 0, body: isJson ? JSON.parse(data) : data })
        })
      },
    )
    req.on('error', reject)
    req.end(payload)
  })

before(async () => {
  fs.rmSync(socketPath, { force: true })
  server = await new Promise<http.Server>((resolve) => {
    const s = app.listen(socketPath, () => resolve(s))
  })
})

after(() => {
  server.close()
  fs.rmSync(socketPath, { force: true })
})

// Bodies are valid-looking so a 401 can't be mistaken for a 400 from validation.
const protectedRoutes: { method: string; path: string; body?: unknown }[] = [
  { method: 'GET', path: '/api/user' },
  { method: 'GET', path: '/api/logout' },
  { method: 'GET', path: '/api/sis/courses' },
  { method: 'GET', path: '/api/sis/courses/abc/students' },
  { method: 'GET', path: '/api/okd/namespaces' },
  { method: 'POST', path: '/api/okd/namespaces/test-ns', body: { courseId: 'abc' } },
  { method: 'DELETE', path: '/api/okd/namespaces/test-ns' },
  { method: 'POST', path: '/api/okd/namespaces/test-ns/users', body: { studentNumbers: ['012345678'] } },
]

describe('unauthenticated requests', () => {
  for (const route of protectedRoutes) {
    test(`${route.method} ${route.path} is rejected with 401`, async () => {
      const res = await request(route.method, route.path, { body: route.body })
      assert.equal(res.status, 401)
      assert.deepEqual(res.body, { message: 'Unauthorized' })
    })
  }

  test('a forged session cookie is still rejected with 401', async () => {
    const res = await request('GET', '/api/user', {
      headers: { Cookie: 'connect.sid=s%3Aforged.signature' },
    })
    assert.equal(res.status, 401)
  })

  // Positive control: proves the harness reaches the router, so the 401s above
  // come from requireUser rather than a broken setup.
  test('GET /api/config is public', async () => {
    const res = await request('GET', '/api/config')
    assert.equal(res.status, 200)
    assert.equal(typeof (res.body as { clusterName?: unknown }).clusterName, 'string')
  })
})
