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
function canAccess(user, lopId) { return user && (user.vai_tro === 'QUAN_TRI' || user.lop_id === lopId) }
function same(a, b) { return JSON.stringify(a) === JSON.stringify(b) }
function onlyStudentChanges(before, after, user) {
  if (!before) return false
  const protectedKeys = ['nhom', 'nhiem_vu', 'danh_gia', 'trang_thai', 'chan_doan', 'goi_y_ai', 'quyet_dinh', 'quan_sat', 'cau_hinh', 'nhat_ky_xuat', 'ghi_chu_gv']
  if (protectedKeys.some((key) => !same(before[key], after[key]))) return false
  const oldStudents = new Map((before.hoc_sinh ?? []).map((x) => [x.id, x]))
  if ((after.hoc_sinh ?? []).some((student) => {
    const old = oldStudents.get(student.id)
    if (!old) return true
    if (student.id !== user.hoc_sinh_id) return !same(old, student)
    const { tien_do: oldProgress, ...oldRest } = old
    const { tien_do: newProgress, ...newRest } = student
    return !same(oldRest, newRest) || typeof newProgress !== 'string' || newProgress.length !== oldProgress.length
  })) return false
  const oldEvidence = new Map((before.minh_chung ?? []).map((x) => [x.id, x]))
  if ((after.minh_chung ?? []).some((x) => oldEvidence.has(x.id) ? !same(oldEvidence.get(x.id), x) : x.hoc_sinh_id !== user.hoc_sinh_id)) return false
  const oldSupport = new Map((before.ho_tro ?? []).map((x) => [x.id, x]))
  if ((after.ho_tro ?? []).some((x) => oldSupport.has(x.id) ? !same(oldSupport.get(x.id), x) : x.hoc_sinh_id !== user.hoc_sinh_id)) return false
  const evidenceIds = new Set((after.minh_chung ?? []).filter((x) => x.hoc_sinh_id === user.hoc_sinh_id).map((x) => x.id))
  const oldMessages = new Map((before.trao_doi ?? []).map((x) => [x.id, x]))
  return !(after.trao_doi ?? []).some((x) => oldMessages.has(x.id) ? !same(oldMessages.get(x.id), x) : x.vai_tro !== 'HS' || !evidenceIds.has(x.minh_chung_id))
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
    const stateMatch = url.pathname.match(/^\/api\/lop\/([^/]+)\/trang-thai$/)
    if (stateMatch) {
      const lopId = decodeURIComponent(stateMatch[1])
      const user = await currentUser(request)
      if (!canAccess(user, lopId)) return json(response, 403, { message: 'Bạn không có quyền truy cập lớp này.' })
      if (request.method === 'GET') {
        const { rows } = await pool.query('SELECT du_lieu, phien_ban, updated_at FROM trang_thai_lop WHERE lop_id = $1', [lopId])
        return json(response, 200, { data: rows[0]?.du_lieu ?? null, version: rows[0]?.phien_ban ?? 0, updated_at: rows[0]?.updated_at ?? null })
      }
      if (request.method === 'PUT') {
        const input = await body(request)
        if (!input.data || typeof input.data !== 'object') return json(response, 400, { message: 'Thiếu dữ liệu lớp.' })
        const existing = await pool.query('SELECT du_lieu FROM trang_thai_lop WHERE lop_id = $1', [lopId])
        if (user.vai_tro === 'HOC_SINH' && !onlyStudentChanges(existing.rows[0]?.du_lieu, input.data, user)) return json(response, 403, { message: 'Học sinh chỉ được cập nhật minh chứng, yêu cầu hỗ trợ và trao đổi của chính mình.' })
        await pool.query(
          `INSERT INTO trang_thai_lop (lop_id, du_lieu, phien_ban, cap_nhat_boi) VALUES ($1,$2,1,$3)
           ON CONFLICT (lop_id) DO UPDATE SET du_lieu = EXCLUDED.du_lieu, phien_ban = trang_thai_lop.phien_ban + 1, cap_nhat_boi = EXCLUDED.cap_nhat_boi, updated_at = now()`,
          [lopId, input.data, user.id],
        )
        await audit(user, 'CAP_NHAT_DU_LIEU', `LOP:${lopId}`)
        return json(response, 200, { ok: true })
      }
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
