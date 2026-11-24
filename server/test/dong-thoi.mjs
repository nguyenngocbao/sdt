import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as delay } from 'node:timers/promises'
import EmbeddedPostgres from 'embedded-postgres'

// Always use a fresh local PostgreSQL cluster, never DATABASE_URL or a live API.
const labels = [
  'Đăng nhập HS0812 và HS0815, lấy hai cookie riêng',
  'Promise.all: 20 POST /api/phieu E4 (10 mỗi em)',
  'SELECT count(*) WHERE loai = E4: đúng 20',
  'SELECT count(*) theo ma_hs: mỗi em đúng 10',
  '20 noi_dung khác nhau và khớp từng phiếu đã gửi',
  'Append-only: UPDATE và DELETE không đổi dữ liệu',
  'Cách ly: HS0812 chỉ đọc được đủ 10 phiếu của mình',
]
const results = new Map()
let db, postgres, api, tempDir
let apiError
let postgresStarted = false

async function check(number, fn) {
  try {
    const detail = await fn()
    results.set(number, true)
    console.log(`PASS ${number}: ${labels[number - 1]}${detail ? ` — ${detail}` : ''}`)
  } catch (error) {
    results.set(number, false)
    console.error(`FAIL ${number}: ${labels[number - 1]} — ${error.message}`)
  }
}

async function freePort() {
  const socket = createServer()
  socket.listen(0, '127.0.0.1')
  await once(socket, 'listening')
  const { port } = socket.address()
  await new Promise((resolve, reject) => socket.close((error) => error ? reject(error) : resolve()))
  return port
}

async function startApi(port, databaseUrl) {
  api = spawn(process.execPath, [fileURLToPath(new URL('../src/app.mjs', import.meta.url))], {
    env: {
      ...process.env,
      PORT: String(port),
      DATABASE_URL: databaseUrl,
      SESSION_SECRET: randomBytes(32).toString('hex'),
      COOKIE_SECURE: 'false',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  api.on('error', (error) => { apiError = error })
  // Drain output without printing cookies, secrets or connection strings.
  api.stdout.resume()
  api.stderr.resume()
  const deadline = Date.now() + 15_000
  while (Date.now() < deadline) {
    if (apiError || api.exitCode !== null) throw new Error('API không khởi động; kiểm tra dependency server/ và migration.')
    try {
      const response = await fetch(`http://127.0.0.1:${port}/health`, { signal: AbortSignal.timeout(500) })
      if (response.ok) return
    } catch { /* Wait for seed and listen. */ }
    await delay(50)
  }
  throw new Error('API chưa sẵn sàng sau 15 giây.')
}

async function main() {
  tempDir = await mkdtemp(join(tmpdir(), 'sdt-m1-'))
  const port = await freePort()
  postgres = new EmbeddedPostgres({
    databaseDir: join(tempDir, 'db'),
    port,
    user: 'sdt_test',
    password: randomBytes(24).toString('hex'),
    persistent: true,
    createPostgresUser: false,
    initdbFlags: ['--locale=C', '--encoding=UTF8'],
    postgresFlags: ['-h', '127.0.0.1', '-k', tempDir],
    onLog: () => {},
    onError: () => {},
  })
  await postgres.initialise()
  await postgres.start()
  postgresStarted = true
  db = postgres.getPgClient('postgres', '127.0.0.1')
  await db.connect()
  await db.query("SET statement_timeout = '10s'")
  const migrationsDir = new URL('../db/migrations/', import.meta.url)
  const migrationFiles = (await readdir(migrationsDir)).filter((f) => /^V\d+__.*\.sql$/.test(f))
    .sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)))
  for (const file of migrationFiles) await db.query(await readFile(new URL(file, migrationsDir), 'utf8'))
  const databaseUrl = new URL('postgresql://127.0.0.1/postgres')
  // Use the client's resolved settings so the API connects to this same cluster.
  databaseUrl.port = String(port)
  databaseUrl.username = db.user
  databaseUrl.password = db.password
  const apiPort = await freePort()
  await startApi(apiPort, databaseUrl.href)
  console.log(`PostgreSQL ${String((await db.query('SHOW server_version')).rows[0].server_version)}; DB tạm riêng; API thật.`)

  async function request(path, cookie, payload) {
    const response = await fetch(`http://127.0.0.1:${apiPort}${path}`, {
      method: payload === undefined ? 'GET' : 'POST',
      headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}) },
      ...(payload === undefined ? {} : { body: JSON.stringify(payload) }),
      signal: AbortSignal.timeout(10_000),
    })
    const data = await response.json()
    return { response, data }
  }
  const students = [
    { id: 'HS0812', email: 'duc.tran@sdt.local' },
    { id: 'HS0815', email: 'anh.nguyen@sdt.local' },
  ]
  await check(1, async () => {
    for (const student of students) {
      const { response, data } = await request('/api/auth/login', null, {
        email: student.email, mat_khau: 'Demo@123', vai_tro: 'HOC_SINH',
      })
      assert.equal(response.status, 200)
      assert.equal(data.user.hoc_sinh_id, student.id)
      student.cookie = response.headers.get('set-cookie')?.split(';')[0]
      assert.ok(student.cookie?.startsWith('sdt_session='), 'Thiếu cookie phiên')
    }
    assert.notEqual(students[0].cookie, students[1].cookie)
  })

  const submissions = Array.from({ length: 20 }, (_, i) => {
    const student = students[i % 2]
    return {
      student,
      content: { ma_hs: student.id, lan_nop: Math.floor(i / 2) + 1, ghi_chu: `${student.id}: cầu giấy, phiếu E4 số ${i + 1}` },
    }
  })
  await check(2, async () => {
    assert.equal((await db.query('SELECT count(*)::int AS n FROM phieu')).rows[0].n, 0, 'DB phải trống trước khi gửi')
    // Catch each error so Promise.all waits for ALL 20 requests before counting.
    const responses = await Promise.all(submissions.map(async (submission) => {
      try {
        const result = await request('/api/phieu', submission.student.cookie, { chang: 4, loai: 'E4', noi_dung: submission.content })
        submission.id = result.data.id
        return result.response.status
      } catch { return 'request-error' }
    }))
    assert.deepEqual(responses, Array(20).fill(201), 'Cả 20 POST phải trả HTTP 201')
    assert.equal(new Set(submissions.map((s) => s.id)).size, 20, 'Cả 20 id phải khác nhau')
  })
  await check(3, async () => {
    const { rows: [{ n }] } = await db.query("SELECT count(*)::int AS n FROM phieu WHERE loai = 'E4'")
    assert.equal(n, 20)
    return `${n} dòng`
  })
  await check(4, async () => {
    for (const { id } of students) {
      const { rows: [{ n }] } = await db.query('SELECT count(*)::int AS n FROM phieu WHERE ma_hs = $1', [id])
      assert.equal(n, 10, `${id}: phải đúng 10 phiếu`)
    }
    return 'HS0812=10; HS0815=10'
  })
  await check(5, async () => {
    const { rows: [{ n }] } = await db.query('SELECT count(DISTINCT noi_dung)::int AS n FROM phieu')
    assert.equal(n, 20)
    const { rows } = await db.query('SELECT id, ma_hs, noi_dung FROM phieu')
    assert.equal(rows.length, 20)
    for (const submission of submissions) {
      const row = rows.find((r) => r.id === submission.id)
      assert.ok(row, 'Thiếu id đã được API xác nhận')
      assert.equal(row.ma_hs, submission.student.id)
      assert.deepEqual(row.noi_dung, submission.content)
    }
  })
  await check(6, async () => {
    const snapshot = async () => (await db.query('SELECT * FROM phieu ORDER BY id')).rows
    const before = await snapshot()
    assert.equal(before.length, 20)
    // Independently roll back each probe even if a broken rule lets it mutate.
    const errors = []
    for (const [sql, params] of [
      ["UPDATE phieu SET noi_dung = '{}'", []],
      ['DELETE FROM phieu WHERE id = $1', [before[0].id]],
    ]) {
      await db.query('BEGIN')
      try {
        await db.query(sql, params)
        assert.deepEqual(await snapshot(), before, `${sql}: dữ liệu đã bị thay đổi`)
      } catch (error) { errors.push(error.message) }
      finally { await db.query('ROLLBACK') }
    }
    assert.equal(errors.length, 0, errors.join('; '))
    assert.deepEqual(await snapshot(), before)
    return 'UPDATE giữ nguyên 20 nội dung; DELETE vẫn đủ 20 dòng'
  })
  await check(7, async () => {
    const { response, data } = await request('/api/phieu/cua-toi', students[0].cookie)
    assert.equal(response.status, 200)
    assert.equal(data.phieu.length, 10, 'Không chấp nhận danh sách rỗng hoặc thiếu phiếu')
    assert.ok(data.phieu.every((row) => row.ma_hs === 'HS0812'), 'Lộ phiếu học sinh khác')
    assert.deepEqual(
      data.phieu.map((r) => r.id).sort(),
      submissions.filter((s) => s.student.id === 'HS0812').map((s) => s.id).sort(),
    )
  })
}

try {
  await main()
} catch (error) {
  // Print every unexecuted item as FAIL, never silently skip or claim PASS.
  for (let number = 1; number <= 7; number++) {
    if (!results.has(number)) await check(number, () => { throw new Error(`Không chạy được: ${error?.message ?? String(error)}`) })
  }
} finally {
  if (api && api.exitCode === null && !apiError) {
    const exited = once(api, 'exit')
    api.kill('SIGTERM')
    await exited
  }
  if (db) await db.end()
  if (postgresStarted) await postgres.stop()
  if (tempDir) await rm(tempDir, { recursive: true, force: true })
}
const passed = [...results.values()].filter(Boolean).length
console.log(`Kết quả: ${passed}/7 PASS${passed === 7 ? '' : ' — DỪNG, không đi tiếp M2.'}`)
process.exitCode = passed === 7 ? 0 : 1
