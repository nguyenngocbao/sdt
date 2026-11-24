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

// DB trống riêng, không đọc DATABASE_URL hay gọi dịch vụ đang có.
let postgres, db, api, tempDir, started = false
async function freePort() {
  const socket = createServer()
  socket.listen(0, '127.0.0.1')
  await once(socket, 'listening')
  const { port } = socket.address()
  await new Promise((resolve, reject) => socket.close((e) => e ? reject(e) : resolve()))
  return port
}

try {
  tempDir = await mkdtemp(join(tmpdir(), 'sdt-m3-'))
  const dbPort = await freePort()
  postgres = new EmbeddedPostgres({
    databaseDir: join(tempDir, 'db'), port: dbPort, user: 'sdt_test',
    password: randomBytes(24).toString('hex'), persistent: true, createPostgresUser: false,
    initdbFlags: ['--locale=C', '--encoding=UTF8'], postgresFlags: ['-h', '127.0.0.1', '-k', tempDir],
    onLog: () => {}, onError: () => {},
  })
  await postgres.initialise()
  await postgres.start()
  started = true
  db = postgres.getPgClient('postgres', '127.0.0.1')
  await db.connect()
  await db.query("SET statement_timeout = '10s'")
  const migrationsDir = new URL('../db/migrations/', import.meta.url)
  const migrationFiles = (await readdir(migrationsDir)).filter((f) => /^V\d+__.*\.sql$/.test(f))
    .sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)))
  for (const file of migrationFiles) await db.query(await readFile(new URL(file, migrationsDir), 'utf8'))
  const dbUrl = new URL('postgresql://127.0.0.1/postgres')
  dbUrl.port = String(dbPort)
  dbUrl.username = db.user
  dbUrl.password = db.password
  const apiPort = await freePort()
  api = spawn(process.execPath, [fileURLToPath(new URL('../src/app.mjs', import.meta.url))], {
    env: { ...process.env, PORT: String(apiPort), HOST: '127.0.0.1', DATABASE_URL: dbUrl.href, SESSION_SECRET: randomBytes(32).toString('hex'), COOKIE_SECURE: 'false' },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let apiError
  api.on('error', (error) => { apiError = error })
  api.stdout.resume()
  api.stderr.resume()
  async function request(path, cookie, payload) {
    const response = await fetch(`http://127.0.0.1:${apiPort}${path}`, {
      method: payload === undefined ? 'GET' : 'POST',
      headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}) },
      ...(payload === undefined ? {} : { body: JSON.stringify(payload) }), signal: AbortSignal.timeout(10_000),
    })
    return { response, data: await response.json() }
  }
  const deadline = Date.now() + 15_000
  let ready = false
  while (Date.now() < deadline) {
    if (apiError || api.exitCode !== null) throw new Error('API không khởi động.')
    try { if ((await request('/health')).response.ok) { ready = true; break } } catch { /* chờ seed */ }
    await delay(50)
  }
  assert.ok(ready, 'API chưa sẵn sàng')
  const cookies = []
  for (const email of ['duc.tran@sdt.local', 'anh.nguyen@sdt.local', 'giaovien@sdt.local']) {
    const { response } = await request('/api/auth/login', null, { email, mat_khau: 'Demo@123' })
    assert.equal(response.status, 200)
    cookies.push(response.headers.get('set-cookie').split(';')[0])
  }
  const [hs, hsKhac, gv] = cookies
  const post = async (cookie, loai, noi_dung, lan_thu = []) => {
    const r = await request('/api/phieu', cookie, { loai, chang: Number(loai.slice(1)), noi_dung, lan_thu })
    assert.equal(r.response.status, 201)
    return r.data
  }
  await post(hs, 'E2', { du_doan_tai_g: 800, cho_doan_yeu: 'mép điểm tựa' })
  const lan = (doi = {}) => ({ lan: 1, tai_g: 600, giu_giay: 5, vi_tri: 'giữa nhịp', bien_dang: 'mép điểm tựa', dang_hong: 'gãy gập', ...doi })
  const e4 = await post(hs, 'E4', { nguyen_nhan_han_che: 'giấy mỏng', minh_chung_vien_dan: 1 }, [lan(), lan({ lan: 2, tai_g: 550, vi_tri: 'lệch tâm' }), lan({ lan: 3, tai_g: 500, vi_tri: 'mép điểm tựa' })])
  assert.deepEqual(e4.goi_y.map((g) => [g.nhanh, g.trang_thai]), [['N4.1', 'GUI']])
  const stored = (await db.query('SELECT * FROM goi_y WHERE phieu_id = $1 ORDER BY id', [e4.id])).rows
  assert.deepEqual(stored.map((g) => [g.nhanh, g.nguon, g.trang_thai]), [['N4.1', 'LUAT', 'GUI'], ['N4.2', 'LUAT', 'CHO']])
  assert.ok(stored[1].can_cu.includes('800') && stored[1].can_cu.includes('600'))
  console.log('PASS API: E4 tự sinh N4.1 GUI, N4.2 CHO với căn cứ 800/600 trong DB.')

  const cuaToi = await request('/api/goi-y/cua-toi', hs)
  assert.equal(cuaToi.response.status, 200)
  assert.deepEqual(cuaToi.data.goi_y.map((g) => g.id), [stored[0].id])
  const other = await post(hsKhac, 'E4', { nguyen_nhan_han_che: 'giấy mỏng', minh_chung_vien_dan: 1 }, [lan(), lan({ lan: 2, giu_giay: 10 })])
  const cuaKhac = await request('/api/goi-y/cua-toi', hsKhac)
  assert.equal(cuaKhac.data.goi_y.length, 1)
  assert.equal(cuaKhac.data.goi_y[0].phieu_id, other.id)
  assert.deepEqual((await request('/api/goi-y/cua-toi', hs)).data.goi_y.map((g) => g.id), [stored[0].id])
  assert.equal((await request('/api/goi-y/cua-toi')).response.status, 401)
  assert.equal((await request('/api/goi-y/cua-toi', gv)).response.status, 403)
  console.log('PASS API: chỉ GUI của chính em; không lộ CHO hoặc dữ liệu em khác.')

  assert.equal((await request('/api/noi-bo/re-nhanh', null, { phieu_id: e4.id })).response.status, 401)
  assert.equal((await request('/api/noi-bo/re-nhanh', hs, { phieu_id: e4.id })).response.status, 403)
  assert.equal((await request('/api/noi-bo/re-nhanh', gv, { phieu_id: 'abc' })).response.status, 400)
  assert.equal((await request('/api/noi-bo/re-nhanh', gv, { phieu_id: '999999' })).response.status, 404)
  const repeated = await Promise.all(Array.from({ length: 4 }, () => request('/api/noi-bo/re-nhanh', gv, { phieu_id: e4.id })))
  assert.ok(repeated.every((r) => r.response.status === 200))
  assert.deepEqual((await db.query('SELECT * FROM goi_y WHERE phieu_id = $1 ORDER BY id', [e4.id])).rows, stored)
  await db.query("INSERT INTO lop_hoc (id,ten,nam_hoc) VALUES ('KHAC','Khác','2026')")
  await db.query("INSERT INTO hoc_sinh (ma,ho_ten,lop_id) VALUES ('KHAC','Em khác','KHAC')")
  const alien = (await db.query("INSERT INTO phieu (ma_hs,chang,loai,noi_dung,nguoi_tao) VALUES ('KHAC',4,'E4','{}','QT01') RETURNING id")).rows[0]
  assert.equal((await request('/api/noi-bo/re-nhanh', gv, { phieu_id: alien.id })).response.status, 404)
  console.log('PASS API nội bộ: phân quyền lớp và gọi đồng thời không nhân đôi gợi ý.')

  const e5 = await post(hs, 'E5', { e4_phieu_id: e4.id, nham_vao_nguyen_nhan: 'giấy mỏng' }, [lan({ tai_g: 400, giu_giay: 8 })])
  assert.deepEqual(e5.goi_y, [])
  const n5 = (await db.query('SELECT nhanh, trang_thai FROM goi_y WHERE phieu_id = $1 ORDER BY id', [e5.id])).rows
  assert.deepEqual(n5, [{ nhanh: 'N5.3', trang_thai: 'CHO' }, { nhanh: 'N5.4', trang_thai: 'CHO' }])
  const before = (await db.query('SELECT (SELECT count(*) FROM phieu) AS phieu, (SELECT count(*) FROM goi_y) AS goi_y')).rows[0]
  const invalid = await request('/api/phieu', hs, { loai: 'E4', chang: 4, noi_dung: {}, lan_thu: [lan({ tai_g: 'không phải số' })] })
  assert.equal(invalid.response.status, 500)
  assert.deepEqual((await db.query('SELECT (SELECT count(*) FROM phieu) AS phieu, (SELECT count(*) FROM goi_y) AS goi_y')).rows[0], before)
  console.log('PASS API: E5 so E4 thật; lỗi ghi lần thử rollback cả phiếu và gợi ý.')
} catch (error) {
  console.error(`FAIL tích hợp M3: ${error.message}`)
  process.exitCode = 1
} finally {
  if (api && api.exitCode === null && api.pid) { const exited = once(api, 'exit'); api.kill('SIGTERM'); await exited }
  if (db) await db.end()
  if (started) await postgres.stop()
  if (tempDir) await rm(tempDir, { recursive: true, force: true })
}
