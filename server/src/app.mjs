import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { createServer } from 'node:http'
import { Pool } from 'pg'

const PORT = Number(process.env.PORT ?? 4000)
const DATABASE_URL = process.env.DATABASE_URL ?? 'postgres://sdt:sdt@localhost:5432/sdt'
const SESSION_SECRET = process.env.SESSION_SECRET ?? 'thay-doi-secret-truoc-khi-trien-khai'
const COOKIE_NAME = 'sdt_session'
const pool = new Pool({ connectionString: DATABASE_URL })

const taiKhoanMau = [
  ['GV01', 'giaovien@sdt.local', 'Demo@123', 'Nguyễn Văn An', 'GIAO_VIEN', null, '10A1'],
  ['HS0812', 'duc.tran@sdt.local', 'Demo@123', 'Trần Minh Đức', 'HOC_SINH', 'HS0812', '10A1'],
  ['HS0815', 'anh.nguyen@sdt.local', 'Demo@123', 'Hoàng Ngọc Anh', 'HOC_SINH', 'HS0815', '10A1'],
  // Tài khoản khởi đầu trống để kiểm tra tuần tự từng hoạt động.
  ['HS0847', 'baotran.lam@sdt.local', 'Demo@123', 'Lâm Bảo Trân', 'HOC_SINH', 'HS0847', '10A1'],
  ['QT01', 'quantri@sdt.local', 'Demo@123', 'Trần Thị Mai', 'QUAN_TRI', null, '10A1'],
]

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  return `scrypt$${salt}$${scryptSync(password, salt, 64).toString('hex')}`
}

function verifyPassword(password, value) {
  const [kind, salt, hash] = value.split('$')
  if (kind !== 'scrypt' || !salt || !hash) return false
  const expected = Buffer.from(hash, 'hex')
  const actual = scryptSync(password, salt, 64)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

function b64(value) { return Buffer.from(value).toString('base64url') }
function sign(payload) {
  const body = b64(JSON.stringify(payload))
  const signature = createHmac('sha256', SESSION_SECRET).update(body).digest('base64url')
  return `${body}.${signature}`
}
function readSession(request) {
  const raw = request.headers.cookie?.split(';').map((x) => x.trim()).find((x) => x.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1)
  if (!raw) return null
  const [body, signature] = raw.split('.')
  if (!body || !signature) return null
  const expected = createHmac('sha256', SESSION_SECRET).update(body).digest('base64url')
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString())
    return payload.exp > Date.now() ? payload : null
  } catch { return null }
}

function cookie(token, maxAge = 60 * 60 * 12) {
  // Chỉ bật Secure khi reverse proxy thật sự phục vụ HTTPS. Docker localhost dùng HTTP.
  return `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}${process.env.COOKIE_SECURE === 'true' ? '; Secure' : ''}`
}
function publicUser(row) {
  return { id: row.id, email: row.email, ho_ten: row.ho_ten, vai_tro: row.vai_tro, hoc_sinh_id: row.hoc_sinh_id, lop_id: row.lop_id }
}
async function body(request) {
  const chunks = []
  for await (const chunk of request) chunks.push(chunk)
  if (!chunks.length) return {}
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')) } catch { throw new Error('JSON không hợp lệ.') }
}
function json(response, code, data, headers = {}) {
  response.writeHead(code, { 'content-type': 'application/json; charset=utf-8', ...headers })
  response.end(JSON.stringify(data))
}
async function currentUser(request) {
  const session = readSession(request)
  if (!session) return null
  const { rows } = await pool.query('SELECT * FROM nguoi_dung WHERE id = $1 AND dang_hoat_dong = true', [session.sub])
  return rows[0] ?? null
}
const LOAI_PHIEU = ['P0', 'E1', 'E2', 'E3', 'E4', 'E5', 'P1']
const ID_RE = /^\d{1,18}$/

/** Học sinh: chỉ ma_hs = hoc_sinh_id. Giáo viên: chỉ lop_id của mình. Quản trị: tất cả. */
async function canAccessHs(user, maHs) {
  if (!user) return false
  if (user.vai_tro === 'QUAN_TRI') return true
  if (user.vai_tro === 'HOC_SINH') return user.hoc_sinh_id === maHs
  const { rowCount } = await pool.query('SELECT 1 FROM hoc_sinh WHERE ma = $1 AND lop_id = $2', [maHs, user.lop_id])
  return rowCount > 0
}
async function audit(user, action, object, details = {}) {
  await pool.query('INSERT INTO nhat_ky_kiem_toan (nguoi_dung_id, hanh_dong, doi_tuong, chi_tiet) VALUES ($1,$2,$3,$4)', [user?.id ?? null, action, object, details])
}
async function seed() {
  await pool.query("INSERT INTO lop_hoc (id, ten, nam_hoc) VALUES ('10A1','Lớp 10A1','2025–2026') ON CONFLICT (id) DO NOTHING")
  for (const [id, email, password, name, role, studentId, classId] of taiKhoanMau) {
    const exists = await pool.query('SELECT id FROM nguoi_dung WHERE id = $1', [id])
    if (!exists.rowCount) await pool.query(
      'INSERT INTO nguoi_dung (id,email,mat_khau_hash,ho_ten,vai_tro,hoc_sinh_id,lop_id) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [id, email, hashPassword(password), name, role, studentId, classId],
    )
    if (role === 'HOC_SINH') await pool.query('INSERT INTO hoc_sinh (ma, ho_ten, lop_id) VALUES ($1,$2,$3) ON CONFLICT (ma) DO NOTHING', [studentId, name, classId])
  }
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`)
    if (request.method === 'GET' && url.pathname === '/health') return json(response, 200, { ok: true })
    if (request.method === 'POST' && url.pathname === '/api/auth/login') {
      const input = await body(request)
      const { rows } = await pool.query('SELECT * FROM nguoi_dung WHERE lower(email) = lower($1) AND dang_hoat_dong = true', [String(input.email ?? '')])
      const user = rows[0]
      if (!user || !verifyPassword(String(input.mat_khau ?? ''), user.mat_khau_hash)) return json(response, 401, { message: 'Email hoặc mật khẩu không đúng.' })
      if (input.vai_tro && input.vai_tro !== user.vai_tro) return json(response, 403, { message: 'Tài khoản này không thuộc cổng đăng nhập đã chọn.' })
      const token = sign({ sub: user.id, exp: Date.now() + 1000 * 60 * 60 * 12 })
      await audit(user, 'DANG_NHAP', 'PHIEN')
      return json(response, 200, { user: publicUser(user) }, { 'set-cookie': cookie(token) })
    }
    if (request.method === 'POST' && url.pathname === '/api/auth/logout') {
      const user = await currentUser(request)
      if (user) await audit(user, 'DANG_XUAT', 'PHIEN')
      return json(response, 200, { ok: true }, { 'set-cookie': cookie('', 0) })
    }
    if (request.method === 'GET' && url.pathname === '/api/auth/me') {
      const user = await currentUser(request)
      return user ? json(response, 200, { user: publicUser(user) }) : json(response, 401, { message: 'Chưa đăng nhập.' })
    }
    if (request.method === 'POST' && url.pathname === '/api/phieu') {
      const user = await currentUser(request)
      if (!user) return json(response, 401, { message: 'Chưa đăng nhập.' })
      const input = await body(request)
      const maHs = user.vai_tro === 'HOC_SINH' ? user.hoc_sinh_id : String(input.ma_hs ?? '')
      if (!maHs || !(await canAccessHs(user, maHs))) return json(response, 403, { message: 'Bạn không có quyền nộp phiếu cho học sinh này.' })
      const chang = Number(input.chang)
      if (!Number.isInteger(chang) || chang < 0 || chang > 6) return json(response, 400, { message: 'Chặng phải là số nguyên từ 0 đến 6.' })
      if (!LOAI_PHIEU.includes(input.loai)) return json(response, 400, { message: 'Loại phiếu không hợp lệ.' })
      if (!input.noi_dung || typeof input.noi_dung !== 'object' || Array.isArray(input.noi_dung)) return json(response, 400, { message: 'Thiếu nội dung phiếu.' })
      const lanThu = Array.isArray(input.lan_thu) ? input.lan_thu : []
      const client = await pool.connect()
      try {
        await client.query('BEGIN')
        let thayThe = null
        if (input.thay_the_cho != null) {
          if (!ID_RE.test(String(input.thay_the_cho))) { await client.query('ROLLBACK'); return json(response, 400, { message: 'thay_the_cho không hợp lệ.' }) }
          const old = await client.query('SELECT id FROM phieu WHERE id = $1 AND ma_hs = $2 AND loai = $3', [input.thay_the_cho, maHs, input.loai])
          if (!old.rowCount) { await client.query('ROLLBACK'); return json(response, 400, { message: 'Bản cũ không tồn tại hoặc không cùng học sinh và loại phiếu.' }) }
          thayThe = old.rows[0].id
        }
        const nhapHo = user.vai_tro !== 'HOC_SINH'
        const { rows } = await client.query(
          'INSERT INTO phieu (ma_hs, chang, loai, noi_dung, thay_the_cho, nguoi_tao, nhap_ho) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, thoi_diem',
          [maHs, chang, input.loai, input.noi_dung, thayThe, user.id, nhapHo],
        )
        for (const [i, l] of lanThu.entries()) {
          await client.query(
            'INSERT INTO lan_thu (phieu_id, lan, tai_g, giu_giay, vi_tri, bien_dang, dang_hong, ghi_chu) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
            [rows[0].id, l.lan ?? i + 1, l.tai_g ?? null, l.giu_giay ?? null, l.vi_tri ?? null, l.bien_dang ?? null, l.dang_hong ?? null, l.ghi_chu ?? null],
          )
        }
        await client.query('COMMIT')
        await audit(user, 'NOP_PHIEU', `PHIEU:${rows[0].id}`, { ma_hs: maHs, loai: input.loai })
        return json(response, 201, { id: rows[0].id, thoi_diem: rows[0].thoi_diem })
      } catch (error) {
        await client.query('ROLLBACK').catch(() => undefined)
        throw error
      } finally { client.release() }
    }
    if (request.method === 'GET' && url.pathname === '/api/phieu/cua-toi') {
      const user = await currentUser(request)
      if (!user) return json(response, 401, { message: 'Chưa đăng nhập.' })
      if (user.vai_tro !== 'HOC_SINH' || !user.hoc_sinh_id) return json(response, 403, { message: 'Chỉ học sinh có phiếu của chính mình.' })
      const source = url.searchParams.get('moi_nhat') === 'true' ? 'phieu_moi_nhat' : 'phieu'
      const { rows } = await pool.query(`SELECT * FROM ${source} WHERE ma_hs = $1 ORDER BY thoi_diem, id`, [user.hoc_sinh_id])
      return json(response, 200, { phieu: rows })
    }
    const historyMatch = url.pathname.match(/^\/api\/phieu\/([^/]+)\/lich-su$/)
    if (request.method === 'GET' && historyMatch) {
      const user = await currentUser(request)
      if (!user) return json(response, 401, { message: 'Chưa đăng nhập.' })
      if (!ID_RE.test(historyMatch[1])) return json(response, 400, { message: 'Mã phiếu không hợp lệ.' })
      const found = await pool.query('SELECT ma_hs FROM phieu WHERE id = $1', [historyMatch[1]])
      if (!found.rowCount || !(await canAccessHs(user, found.rows[0].ma_hs))) return json(response, 404, { message: 'Không tìm thấy phiếu.' })
      // Chuỗi thay_the_cho: đi ngược về bản gốc và xuôi tới các bản nộp lại.
      const { rows } = await pool.query(
        `WITH RECURSIVE cu AS (
           SELECT * FROM phieu WHERE id = $1
           UNION SELECT p.* FROM phieu p JOIN cu ON p.id = cu.thay_the_cho
         ), moi AS (
           SELECT * FROM phieu WHERE id = $1
           UNION SELECT p.* FROM phieu p JOIN moi ON p.thay_the_cho = moi.id
         )
         SELECT * FROM (SELECT * FROM cu UNION SELECT * FROM moi) t ORDER BY thoi_diem, id`,
        [historyMatch[1]],
      )
      return json(response, 200, { lich_su: rows })
    }
    if (url.pathname === '/api/admin/nguoi-dung') {
      const user = await currentUser(request)
      if (user?.vai_tro !== 'QUAN_TRI') return json(response, 403, { message: 'Chỉ quản trị viên được thực hiện.' })
      if (request.method === 'GET') {
        const { rows } = await pool.query('SELECT id,email,ho_ten,vai_tro,hoc_sinh_id,lop_id,dang_hoat_dong,created_at FROM nguoi_dung ORDER BY vai_tro, ho_ten')
        return json(response, 200, { users: rows })
      }
      if (request.method === 'POST') {
        const input = await body(request)
        if (!input.id || !input.email || !input.ho_ten || !input.vai_tro || !input.mat_khau) return json(response, 400, { message: 'Thiếu thông tin bắt buộc.' })
        await pool.query('INSERT INTO nguoi_dung (id,email,mat_khau_hash,ho_ten,vai_tro,hoc_sinh_id,lop_id) VALUES ($1,$2,$3,$4,$5,$6,$7)', [input.id, input.email, hashPassword(input.mat_khau), input.ho_ten, input.vai_tro, input.hoc_sinh_id ?? null, input.lop_id ?? '10A1'])
        await audit(user, 'TAO_TAI_KHOAN', `NGUOI_DUNG:${input.id}`)
        return json(response, 201, { ok: true })
      }
    }
    return json(response, 404, { message: 'Không tìm thấy API.' })
  } catch (error) {
    console.error(error)
    return json(response, 500, { message: 'Máy chủ gặp lỗi. Hãy thử lại.' })
  }
})

seed().then(() => server.listen(PORT, '0.0.0.0', () => console.log(`SDT API listening on ${PORT}`))).catch((error) => { console.error(error); process.exit(1) })
