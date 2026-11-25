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

// DB trống riêng + API thật: kiểm nhiều lớp, thêm học sinh, gán giáo viên, phân quyền.
let postgres, db, api, tempDir, started = false
async function freePort() {
  const socket = createServer(); socket.listen(0, '127.0.0.1'); await once(socket, 'listening')
  const { port } = socket.address()
  await new Promise((resolve, reject) => socket.close((e) => e ? reject(e) : resolve()))
  return port
}
try {
  tempDir = await mkdtemp(join(tmpdir(), 'sdt-lop-'))
  const dbPort = await freePort()
  postgres = new EmbeddedPostgres({
    databaseDir: join(tempDir, 'db'), port: dbPort, user: 'sdt_test', password: randomBytes(24).toString('hex'),
    persistent: true, createPostgresUser: false, initdbFlags: ['--locale=C', '--encoding=UTF8'],
    postgresFlags: ['-h', '127.0.0.1', '-k', tempDir], onLog: () => {}, onError: () => {},
  })
  await postgres.initialise(); await postgres.start(); started = true
  db = postgres.getPgClient('postgres', '127.0.0.1'); await db.connect()
  const dir = new URL('../db/migrations/', import.meta.url)
  const files = (await readdir(dir)).filter((f) => /^V\d+__.*\.sql$/.test(f)).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)))
  for (const f of files) await db.query(await readFile(new URL(f, dir), 'utf8'))
  const dbUrl = new URL('postgresql://127.0.0.1/postgres'); dbUrl.port = String(dbPort); dbUrl.username = db.user; dbUrl.password = db.password
  const apiPort = await freePort()
  api = spawn(process.execPath, [fileURLToPath(new URL('../src/app.mjs', import.meta.url))], {
    env: { ...process.env, PORT: String(apiPort), HOST: '127.0.0.1', DATABASE_URL: dbUrl.href, SESSION_SECRET: randomBytes(32).toString('hex'), COOKIE_SECURE: 'false' },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  api.stdout.resume(); api.stderr.resume()
  async function req(method, path, cookie, payload, extra = {}) {
    const response = await fetch(`http://127.0.0.1:${apiPort}${path}`, {
      method, headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}), ...extra },
      ...(payload === undefined ? {} : { body: JSON.stringify(payload) }), signal: AbortSignal.timeout(10_000),
    })
    return { status: response.status, headers: response.headers, data: await response.json() }
  }
  for (const end = Date.now() + 15_000; ; await delay(50)) {
    if (api.exitCode !== null) throw new Error('API không khởi động.')
    try { if ((await req('GET', '/health')).status === 200) break } catch { /* chờ seed */ }
    assert.ok(Date.now() < end, 'API chưa sẵn sàng')
  }
  const login = async (email, mat_khau = 'Demo@123') => {
    const r = await req('POST', '/api/auth/login', null, { email, mat_khau })
    return r.status === 200 ? r.headers.get('set-cookie').split(';')[0] : r.status
  }
  const gv = await login('giaovien@sdt.local'), qt = await login('quantri@sdt.local'), hs = await login('duc.tran@sdt.local')

  // 1. Giáo viên thấy lớp được gán (migration/seed); học sinh không dùng được API lớp.
  assert.deepEqual((await req('GET', '/api/lop', gv)).data.lop.map((l) => l.id), ['10A1'])
  assert.equal((await req('GET', '/api/lop', hs)).status, 403)
  assert.equal((await req('GET', '/api/lop')).status, 401)
  console.log('PASS: giáo viên thấy 10A1; học sinh 403, chưa đăng nhập 401.')

  // 2. Giáo viên tạo lớp mới → tự được gán; mã tự sinh, trùng thì thêm hậu tố.
  const l2 = await req('POST', '/api/lop', gv, { ten: 'Lớp 10A2', nam_hoc: '2025–2026' })
  assert.equal(l2.status, 201); assert.equal(l2.data.lop.id, 'LOP10A2')
  assert.equal((await req('POST', '/api/lop', gv, { ten: 'Lớp 10A2', nam_hoc: '2025–2026' })).data.lop.id, 'LOP10A2-2')
  assert.equal((await req('POST', '/api/lop', gv, { id: 'lop10a2', ten: 'x', nam_hoc: 'y' })).status, 409)
  assert.equal((await req('POST', '/api/lop', gv, { ten: '', nam_hoc: 'y' })).status, 400)
  assert.equal((await req('POST', '/api/lop', gv, { id: 'a b', ten: 'x', nam_hoc: 'y' })).status, 400)
  const me = await req('GET', '/api/auth/me', gv)
  assert.deepEqual(me.data.user.cac_lop.map((l) => l.id), ['10A1', 'LOP10A2', 'LOP10A2-2'])
  console.log('PASS: tạo lớp, mã tự sinh/trùng/hợp lệ, giáo viên tự được gán.')

  // 3. Thêm học sinh hàng loạt: dòng lỗi → không thêm em nào; hợp lệ → tạo đủ, mã nối tiếp, đăng nhập được.
  const loi = await req('POST', '/api/lop/LOP10A2/hoc-sinh', gv, { danh_sach: [{ ho_ten: 'Nguyễn Văn A' }, { ho_ten: '' }, { ho_ten: 'B', email: 'sai-email' }] })
  assert.equal(loi.status, 400); assert.equal(loi.data.loi.length, 2)
  assert.equal((await req('GET', '/api/lop/LOP10A2/hoc-sinh', gv)).data.hoc_sinh.length, 0)
  const trungEmail = await req('POST', '/api/lop/LOP10A2/hoc-sinh', gv, { danh_sach: [{ ho_ten: 'A' }, { ho_ten: 'B', email: 'duc.tran@sdt.local' }] })
  assert.equal(trungEmail.status, 409)
  assert.equal((await db.query("SELECT count(*)::int AS n FROM hoc_sinh WHERE lop_id = 'LOP10A2'")).rows[0].n, 0, 'email trùng phải rollback cả đợt')
  const them = await req('POST', '/api/lop/LOP10A2/hoc-sinh', gv, { danh_sach: [{ ho_ten: 'Phạm Thu Hà', email: 'ha.pham@sdt.local', mat_khau: 'MatKhau123' }, { ho_ten: 'Võ Quốc Bảo' }] })
  assert.equal(them.status, 201)
  assert.deepEqual(them.data.da_tao.map((x) => x.ma), ['HS0848', 'HS0849'])
  assert.equal(typeof (await login('ha.pham@sdt.local', 'MatKhau123')), 'string')
  const tuSinh = them.data.da_tao[1]
  assert.equal(tuSinh.email, 'hs0849@sdt.local')
  const hs2 = await login(tuSinh.email, tuSinh.mat_khau_ban_dau)
  assert.equal(typeof hs2, 'string')
  console.log('PASS: thêm hàng loạt có rollback toàn bộ; mã HS nối tiếp; mật khẩu tự sinh dùng được.')

  // 4. Học sinh mới nộp phiếu được (hoc_sinh có thật) và chỉ nằm trong lớp mới.
  assert.equal((await req('POST', '/api/phieu', hs2, { loai: 'E2', chang: 2, noi_dung: { du_doan_tai_g: 800, cho_doan_yeu: 'mép điểm tựa' }, lan_thu: [] })).status, 201)
  assert.equal((await req('GET', '/api/lop/10A1/hoc-sinh', gv)).data.hoc_sinh.some((h) => h.ma === 'HS0849'), false)
  console.log('PASS: học sinh mới nộp phiếu được; không lẫn sang lớp cũ.')

  // 5. Lớp làm việc theo header x-lop-id; header lớp không được gán bị bỏ qua.
  const lopMac = JSON.stringify((await req('GET', '/api/gv/lop?chang=0', gv)).data)
  const lopMoi = JSON.stringify((await req('GET', '/api/gv/lop?chang=0', gv, undefined, { 'x-lop-id': 'LOP10A2' })).data)
  assert.ok(lopMac.includes('HS0812') && !lopMac.includes('HS0849'))
  assert.ok(lopMoi.includes('HS0849') && !lopMoi.includes('HS0812'))
  assert.ok(!JSON.stringify((await req('GET', '/api/gv/lop?chang=0', gv, undefined, { 'x-lop-id': 'KHONG-CO' })).data).includes('HS0849'))
  console.log('PASS: đổi lớp bằng x-lop-id đổi dữ liệu "Lớp tôi"; header lạ bị bỏ qua.')

  // 6. Giáo viên khác không đụng được lớp; quản trị gán thì mới thấy.
  assert.equal((await req('POST', '/api/admin/nguoi-dung', qt, { id: 'GV02', email: 'gv2@sdt.local', ho_ten: 'Lê Thị Bích', vai_tro: 'GIAO_VIEN', mat_khau: 'Demo@123' })).status, 201)
  const gv2 = await login('gv2@sdt.local')
  assert.deepEqual((await req('GET', '/api/lop', gv2)).data.lop.map((l) => l.id), ['10A1'])
  assert.equal((await req('GET', '/api/lop/LOP10A2/hoc-sinh', gv2)).status, 403)
  assert.equal((await req('PATCH', '/api/hoc-sinh/HS0849', gv2, { ho_ten: 'X' })).status, 403)
  assert.equal((await req('PUT', '/api/lop/LOP10A2/giao-vien', gv, { giao_vien_ids: ['GV01', 'GV02'] })).status, 403, 'giáo viên không được gán giáo viên')
  assert.equal((await req('PUT', '/api/lop/LOP10A2/giao-vien', qt, { giao_vien_ids: ['GV01', 'GV02'] })).status, 200)
  assert.equal((await req('GET', '/api/lop/LOP10A2/hoc-sinh', gv2)).data.hoc_sinh.length, 2)
  assert.equal((await req('PUT', '/api/lop/LOP10A2/giao-vien', qt, { giao_vien_ids: ['HS0812'] })).status, 400)
  const dsGv = (await req('GET', '/api/giao-vien', qt)).data.giao_vien
  assert.deepEqual(dsGv.find((g) => g.id === 'GV02').lop, ['10A1', 'LOP10A2'])
  console.log('PASS: phân quyền theo lớp; chỉ quản trị gán giáo viên; GV02 thấy sau khi được gán.')

  // 7. Gỡ hết lớp → giáo viên không thấy dữ liệu nào (không rơi về "tất cả").
  assert.equal((await req('PUT', '/api/lop/LOP10A2/giao-vien', qt, { giao_vien_ids: ['GV01'] })).status, 200)
  assert.equal((await req('PUT', '/api/lop/10A1/giao-vien', qt, { giao_vien_ids: ['GV01'] })).status, 200)
  assert.deepEqual((await req('GET', '/api/lop', gv2)).data.lop, [])
  const trong = JSON.stringify((await req('GET', '/api/gv/lop?chang=0', gv2)).data)
  assert.ok(!trong.includes('HS0'), 'giáo viên không có lớp không được thấy học sinh nào')
  assert.equal((await req('GET', '/api/gv/hang-cho', gv2)).status, 200)
  console.log('PASS: giáo viên không còn lớp thì không thấy học sinh nào.')

  // 8. Đặt lại mật khẩu, khóa tài khoản, chuyển lớp.
  const dat = await req('PATCH', '/api/hoc-sinh/HS0849', gv, { dat_lai_mat_khau: true })
  assert.equal(dat.status, 200)
  assert.equal(await login(tuSinh.email, tuSinh.mat_khau_ban_dau), 401)
  assert.equal(typeof (await login(tuSinh.email, dat.data.mat_khau_moi)), 'string')
  assert.equal((await req('PATCH', '/api/hoc-sinh/HS0849', gv, { mat_khau: 'ngan' })).status, 400)
  assert.equal((await req('PATCH', '/api/hoc-sinh/HS0849', gv, { dang_hoat_dong: false })).status, 200)
  assert.equal(await login(tuSinh.email, dat.data.mat_khau_moi), 401)
  assert.equal((await req('GET', '/api/auth/me', hs2)).status, 401, 'phiên của tài khoản đã khóa phải vô hiệu')
  assert.equal((await req('PATCH', '/api/hoc-sinh/HS0849', gv, { lop_id: '10A1', dang_hoat_dong: true })).status, 200)
  assert.ok((await req('GET', '/api/lop/10A1/hoc-sinh', gv)).data.hoc_sinh.some((h) => h.ma === 'HS0849' && h.dang_hoat_dong))
  assert.equal((await req('PATCH', '/api/hoc-sinh/HS0849', gv, { lop_id: 'LOP10A2-2', ho_ten: 'Võ Quốc Bảo B' })).status, 200)
  assert.equal((await req('PATCH', '/api/hoc-sinh/HS0849', gv2, { lop_id: '10A1' })).status, 403)
  console.log('PASS: đặt lại mật khẩu, khóa (phiên vô hiệu), mở lại, chuyển lớp, đổi tên.')

  // 9. API tạo tài khoản của quản trị nay tạo luôn bản ghi hoc_sinh.
  assert.equal((await req('POST', '/api/admin/nguoi-dung', qt, { id: 'HS5000', email: 'hs5000@sdt.local', ho_ten: 'Em Mới', vai_tro: 'HOC_SINH', mat_khau: 'Demo@123', lop_id: 'LOP10A2' })).status, 201)
  assert.ok((await req('GET', '/api/lop/LOP10A2/hoc-sinh', gv)).data.hoc_sinh.some((h) => h.ma === 'HS5000'))
  assert.equal((await req('POST', '/api/admin/nguoi-dung', qt, { id: 'HS5001', email: 'hs5001@sdt.local', ho_ten: 'Em', vai_tro: 'HOC_SINH', mat_khau: 'Demo@123', lop_id: 'KHONG-CO' })).status, 400)
  assert.equal((await req('POST', '/api/admin/nguoi-dung', qt, { id: 'HS5000', email: 'khac@sdt.local', ho_ten: 'Em', vai_tro: 'HOC_SINH', mat_khau: 'Demo@123' })).status, 409)
  console.log('PASS: API quản trị tạo học sinh có hoc_sinh; lớp lạ 400; trùng mã 409.')

  // 10. Mọi thao tác ghi nhật ký kiểm toán.
  const acts = (await db.query("SELECT DISTINCT hanh_dong FROM nhat_ky_kiem_toan WHERE hanh_dong IN ('TAO_LOP','THEM_HOC_SINH','GAN_GIAO_VIEN','SUA_HOC_SINH')")).rows.length
  assert.equal(acts, 4)
  console.log('PASS: nhật ký kiểm toán ghi đủ 4 loại thao tác mới.')
  console.log('TẤT CẢ ĐẠT: quản lý lớp & học sinh.')
} catch (error) {
  console.error(error); process.exitCode = 1
} finally {
  api?.kill(); await db?.end().catch(() => undefined)
  if (started) await postgres.stop().catch(() => undefined)
  if (tempDir) await rm(tempDir, { recursive: true, force: true })
}
