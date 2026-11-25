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
  tempDir = await mkdtemp(join(tmpdir(), 'sdt-trao-doi-'))
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
  api.stderr.on('data', (d) => process.env.DEBUG_API && process.stderr.write(d))
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
  const login = async (email) => {
    const { response } = await request('/api/auth/login', null, { email, mat_khau: 'Demo@123' })
    assert.equal(response.status, 200)
    return response.headers.get('set-cookie').split(';')[0]
  }
  const hs = await login('duc.tran@sdt.local'), hsKhac = await login('anh.nguyen@sdt.local'), gv = await login('giaovien@sdt.local')
  const lan = (doi = {}) => ({ lan: 1, tai_g: 600, giu_giay: 5, vi_tri: 'giữa nhịp', bien_dang: 'giữa nhịp', dang_hong: 'gãy gập', ...doi })
  const nop = async (cookie, noi_dung, thay_the_cho) => {
    const r = await request('/api/phieu', cookie, { loai: 'E4', chang: 4, noi_dung, lan_thu: [lan(), lan({ lan: 2 })], ...(thay_the_cho ? { thay_the_cho } : {}) })
    assert.equal(r.response.status, 201)
    return r.data
  }
  const guiTin = (cookie, id, payload) => request(`/api/goi-y/${id}/trao-doi`, cookie, payload)
  const cuaToi = async (cookie) => (await request('/api/goi-y/cua-toi', cookie)).data.goi_y

  // Cùng điều kiện thử, bỏ trống nguyên nhân → chỉ N4.4 (CHO). Giáo viên duyệt Gửi.
  const e4 = await nop(hs, { minh_chung_vien_dan: 1 })
  const cho = (await request('/api/gv/hang-cho', gv)).data.the.find((t) => String(t.phieu_id) === String(e4.id))
  assert.equal(cho.nhanh, 'N4.4')
  assert.equal((await guiTin(hs, cho.id, { loai: 'HIEU_ROI' })).response.status, 404, 'gợi ý còn CHO không được trao đổi')
  assert.equal((await request(`/api/gv/duyet/${cho.id}`, gv, { quyet_dinh: 'GUI' })).response.status, 200)
  let [g] = await cuaToi(hs)
  assert.equal(String(g.id), String(cho.id))
  assert.equal(g.buoc, 'CHO_EM')
  assert.equal(g.loai_phieu, 'E4')
  assert.deepEqual(g.trao_doi, [])
  assert.ok(!('can_cu' in g) && !('ly_do_bo' in g) && !('noi_dung_sua' in g))
  console.log('PASS: gợi ý đã gửi tới em ở bước CHO_EM, không lộ căn cứ hay câu gốc.')

  assert.equal((await guiTin(hs, cho.id, { loai: 'HOI', noi_dung: '   ' })).response.status, 400)
  assert.equal((await guiTin(hs, cho.id, { loai: 'TRA_LOI', noi_dung: 'x' })).response.status, 400)
  assert.equal((await guiTin(gv, cho.id, { loai: 'HOI', noi_dung: 'x' })).response.status, 400)
  assert.equal((await guiTin(hs, cho.id, { loai: 'HOI', noi_dung: 'x'.repeat(1001) })).response.status, 400)
  assert.equal((await guiTin(hsKhac, cho.id, { loai: 'HIEU_ROI' })).response.status, 404)
  assert.equal((await guiTin(null, cho.id, { loai: 'HIEU_ROI' })).response.status, 401)
  assert.equal((await guiTin(hs, 'abc', { loai: 'HIEU_ROI' })).response.status, 400)
  assert.equal((await request('/api/gv/trao-doi', hs)).response.status, 403)
  console.log('PASS: kiểm tra loại tin, độ dài, quyền theo em và theo vai trò.')

  const hoi = { loai: 'HOI', noi_dung: 'Em chưa hiểu "hỏng ở đó" là chỗ nào ạ?', ma_gui: 'hs-hoi-0001' }
  const hai = await Promise.all([guiTin(hs, cho.id, hoi), guiTin(hs, cho.id, hoi)])
  assert.deepEqual(hai.map((r) => r.response.status).sort(), [200, 201])
  assert.equal(String(hai[0].data.tin.id), String(hai[1].data.tin.id))
  assert.equal(Number((await db.query('SELECT count(*) FROM trao_doi')).rows[0].count), 1)
  console.log('PASS: gửi lại cùng ma_gui không tạo dòng trùng.')

  let lop = (await request('/api/gv/trao-doi', gv)).data
  assert.equal(lop.dem.CAN_GV, 1)
  assert.equal(lop.muc[0].buoc, 'CAN_GV')
  assert.equal(lop.muc[0].ho_ten, 'Trần Minh Đức')
  assert.equal(lop.muc[0].trao_doi[0].noi_dung, hoi.noi_dung)
  assert.equal((await guiTin(gv, cho.id, { loai: 'TRA_LOI', noi_dung: 'Em xem lại lần thử 1: cầu gãy ở đâu?' })).response.status, 201)
  ;[g] = await cuaToi(hs)
  assert.equal(g.buoc, 'GV_DA_TRA_LOI')
  assert.deepEqual(g.trao_doi.map((t) => [t.vai_tro, t.loai]), [['HOC_SINH', 'HOI'], ['GIAO_VIEN', 'TRA_LOI']])
  assert.equal((await guiTin(hs, cho.id, { loai: 'HIEU_ROI' })).response.status, 201)
  ;[g] = await cuaToi(hs)
  assert.equal(g.buoc, 'EM_HIEU')
  assert.equal((await request('/api/gv/trao-doi', gv)).data.dem.EM_HIEU, 1)
  console.log('PASS: vòng hỏi → giáo viên trả lời → em hiểu, hai phía thấy cùng trạng thái.')

  const e4Moi = await nop(hs, { minh_chung_vien_dan: 1, nguyen_nhan_han_che: 'giấy mỏng ở giữa nhịp' }, e4.id)
  const ds = await cuaToi(hs)
  g = ds.find((x) => String(x.id) === String(cho.id))
  assert.equal(g.buoc, 'DA_LAM_LAI')
  assert.ok(g.nop_lai_luc)
  lop = (await request('/api/gv/trao-doi', gv)).data
  assert.equal(lop.dem.DA_LAM_LAI, 1)
  const moi = (await db.query("SELECT id FROM goi_y WHERE phieu_id = $1 AND trang_thai = 'CHO'", [e4Moi.id])).rows
  for (const r of moi) assert.equal((await guiTin(hs, r.id, { loai: 'HIEU_ROI' })).response.status, 404)
  console.log('PASS: nộp lại phiếu cùng loại chuyển gợi ý sang DA_LAM_LAI.')

  const truoc = (await db.query('SELECT * FROM trao_doi ORDER BY id')).rows
  await db.query("UPDATE trao_doi SET noi_dung = 'đã sửa'")
  await db.query('DELETE FROM trao_doi')
  assert.deepEqual((await db.query('SELECT * FROM trao_doi ORDER BY id')).rows, truoc)
  console.log('PASS: trao_doi append-only, UPDATE/DELETE không đổi gì.')
} catch (error) {
  console.error(`FAIL trao đổi gợi ý: ${error.message}`)
  process.exitCode = 1
} finally {
  if (api && api.exitCode === null && api.pid) { const exited = once(api, 'exit'); api.kill('SIGTERM'); await exited }
  if (db) await db.end()
  if (started) await postgres.stop()
  if (tempDir) await rm(tempDir, { recursive: true, force: true })
}
