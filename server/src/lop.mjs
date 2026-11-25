import { randomBytes } from 'node:crypto'

const MA_LOP_RE = /^[A-Z0-9_-]{1,20}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TOI_DA_HANG_LOAT = 200
const BANG_CHU = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'

const loi = (code, message) => ({ code, data: { message } })
const ok = (data, code = 200) => ({ code, data })

function matKhauNgau(n = 10) {
  const b = randomBytes(n)
  return Array.from(b, (x) => BANG_CHU[x % BANG_CHU.length]).join('')
}
function boDau(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D') }
function maLopTu(ten) { return boDau(ten).toUpperCase().replace(/[^A-Z0-9]+/g, '').slice(0, 12) }

/** Các lớp người dùng được thấy: quản trị = tất cả, giáo viên = lớp được gán, học sinh = lớp của mình. */
export async function cacLopCuaToi(pool, user) {
  const dem = `(SELECT count(*)::int FROM hoc_sinh h WHERE h.lop_id = l.id)`
  if (user.vai_tro === 'QUAN_TRI') return (await pool.query(`SELECT l.id, l.ten, l.nam_hoc, ${dem} AS so_hoc_sinh FROM lop_hoc l ORDER BY l.id`)).rows
  if (user.vai_tro === 'GIAO_VIEN') return (await pool.query(`SELECT l.id, l.ten, l.nam_hoc, ${dem} AS so_hoc_sinh FROM lop_hoc l JOIN giao_vien_lop g ON g.lop_id = l.id WHERE g.giao_vien_id = $1 ORDER BY l.id`, [user.id])).rows
  return (await pool.query(`SELECT l.id, l.ten, l.nam_hoc, ${dem} AS so_hoc_sinh FROM lop_hoc l WHERE l.id = $1`, [user.lop_id])).rows
}

/** Lớp đang làm việc của giáo viên: header hợp lệ → lớp mặc định nếu còn được gán → lớp đầu tiên → '' (không thấy gì). */
export function chonLopDangDay(cacLop, user, header) {
  const ids = cacLop.map((l) => l.id)
  if (header && ids.includes(header)) return header
  if (user.lop_id && ids.includes(user.lop_id)) return user.lop_id
  return ids[0] ?? ''
}

async function coQuyenLop(pool, user, lopId) {
  if (user.vai_tro === 'QUAN_TRI') return (await pool.query('SELECT 1 FROM lop_hoc WHERE id = $1', [lopId])).rowCount > 0
  return (await pool.query('SELECT 1 FROM giao_vien_lop WHERE giao_vien_id = $1 AND lop_id = $2', [user.id, lopId])).rowCount > 0
}

async function maHocSinhTiepTheo(client) {
  await client.query('SELECT pg_advisory_xact_lock(7001)')
  const { rows } = await client.query("SELECT COALESCE(max(substring(ma from 3)::int), 0) AS m FROM hoc_sinh WHERE ma ~ '^HS[0-9]+$'")
  return Number(rows[0].m)
}

/** Thêm học sinh vào lớp trong MỘT giao dịch: tất cả hoặc không em nào. Mật khẩu ban đầu chỉ trả về một lần. */
export async function themHocSinh({ pool, user, hashPassword, audit }, lopId, dsVao) {
  if (!Array.isArray(dsVao) || !dsVao.length) return loi(400, 'Chưa có học sinh nào để thêm.')
  if (dsVao.length > TOI_DA_HANG_LOAT) return loi(400, `Mỗi lần chỉ thêm tối đa ${TOI_DA_HANG_LOAT} học sinh.`)
  const loiHang = []
  const emailTrongDs = new Set()
  dsVao.forEach((x, i) => {
    const ten = String(x?.ho_ten ?? '').trim()
    if (!ten) loiHang.push({ dong: i + 1, loi: 'Thiếu họ tên.' })
    const email = x?.email ? String(x.email).trim().toLowerCase() : ''
    if (email && !EMAIL_RE.test(email)) loiHang.push({ dong: i + 1, loi: `Email “${email}” không hợp lệ.` })
    if (email && emailTrongDs.has(email)) loiHang.push({ dong: i + 1, loi: `Email “${email}” bị trùng trong danh sách.` })
    if (email) emailTrongDs.add(email)
    if (x?.mat_khau && String(x.mat_khau).length < 8) loiHang.push({ dong: i + 1, loi: 'Mật khẩu tối thiểu 8 ký tự.' })
  })
  if (loiHang.length) return { code: 400, data: { message: 'Danh sách có dòng chưa hợp lệ; chưa thêm em nào.', loi: loiHang } }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    let so = await maHocSinhTiepTheo(client)
    const tao = []
    for (const [i, x] of dsVao.entries()) {
      so += 1
      const ma = `HS${String(so).padStart(4, '0')}`
      const email = x.email ? String(x.email).trim().toLowerCase() : `${ma.toLowerCase()}@sdt.local`
      const matKhau = x.mat_khau ? String(x.mat_khau) : matKhauNgau()
      const ten = String(x.ho_ten).trim()
      const trung = await client.query('SELECT 1 FROM nguoi_dung WHERE lower(email) = $1', [email])
      if (trung.rowCount) { await client.query('ROLLBACK'); return { code: 409, data: { message: 'Danh sách có email đã được dùng; chưa thêm em nào.', loi: [{ dong: i + 1, loi: `Email “${email}” đã có tài khoản.` }] } } }
      await client.query('INSERT INTO hoc_sinh (ma, ho_ten, lop_id) VALUES ($1,$2,$3)', [ma, ten, lopId])
      await client.query('INSERT INTO nguoi_dung (id,email,mat_khau_hash,ho_ten,vai_tro,hoc_sinh_id,lop_id) VALUES ($1,$2,$3,$4,$5,$6,$7)', [ma, email, hashPassword(matKhau), ten, 'HOC_SINH', ma, lopId])
      tao.push({ ma, ho_ten: ten, email, mat_khau_ban_dau: matKhau })
    }
    await client.query('COMMIT')
    await audit(user, 'THEM_HOC_SINH', `LOP:${lopId}`, { so_luong: tao.length, ma: tao.map((t) => t.ma) })
    return ok({ da_tao: tao }, 201)
  } catch (e) {
    await client.query('ROLLBACK').catch(() => undefined)
    throw e
  } finally { client.release() }
}

/** Định tuyến /api/lop, /api/hoc-sinh, /api/giao-vien. Trả null nếu đường dẫn không thuộc nhóm này. */
export async function dinhTuyenLop(ctx, { method, path, input }) {
  const { pool, user, audit } = ctx
  const laQuanTri = user.vai_tro === 'QUAN_TRI'
  let m

  if (path === '/api/lop' && method === 'GET') return ok({ lop: await cacLopCuaToi(pool, user) })

  if (path === '/api/lop' && method === 'POST') {
    const ten = String(input.ten ?? '').trim()
    const namHoc = String(input.nam_hoc ?? '').trim()
    if (!ten || !namHoc) return loi(400, 'Cần tên lớp và năm học.')
    let id = input.id ? String(input.id).trim().toUpperCase() : maLopTu(ten)
    if (!MA_LOP_RE.test(id)) return loi(400, 'Mã lớp chỉ gồm chữ không dấu, số, gạch ngang hoặc gạch dưới (tối đa 20 ký tự).')
    if (input.id) {
      if ((await pool.query('SELECT 1 FROM lop_hoc WHERE id = $1', [id])).rowCount) return loi(409, `Mã lớp ${id} đã tồn tại.`)
    } else {
      const goc = id; let n = 1
      while ((await pool.query('SELECT 1 FROM lop_hoc WHERE id = $1', [id])).rowCount) { n += 1; id = `${goc}-${n}` }
    }
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query('INSERT INTO lop_hoc (id, ten, nam_hoc) VALUES ($1,$2,$3)', [id, ten, namHoc])
      if (user.vai_tro === 'GIAO_VIEN') await client.query('INSERT INTO giao_vien_lop (giao_vien_id, lop_id) VALUES ($1,$2)', [user.id, id])
      await client.query('COMMIT')
    } catch (e) { await client.query('ROLLBACK').catch(() => undefined); throw e } finally { client.release() }
    await audit(user, 'TAO_LOP', `LOP:${id}`, { ten, nam_hoc: namHoc })
    return ok({ lop: { id, ten, nam_hoc: namHoc, so_hoc_sinh: 0 } }, 201)
  }

  if ((m = path.match(/^\/api\/lop\/([^/]+)$/)) && method === 'PATCH') {
    const id = decodeURIComponent(m[1])
    if (!(await coQuyenLop(pool, user, id))) return loi(403, 'Bạn không phụ trách lớp này.')
    const ten = input.ten === undefined ? null : String(input.ten).trim()
    const namHoc = input.nam_hoc === undefined ? null : String(input.nam_hoc).trim()
    if (ten === '' || namHoc === '') return loi(400, 'Tên lớp và năm học không được để trống.')
    const { rows } = await pool.query('UPDATE lop_hoc SET ten = COALESCE($2, ten), nam_hoc = COALESCE($3, nam_hoc) WHERE id = $1 RETURNING id, ten, nam_hoc', [id, ten, namHoc])
    await audit(user, 'SUA_LOP', `LOP:${id}`, { ten, nam_hoc: namHoc })
    return ok({ lop: rows[0] })
  }

  if ((m = path.match(/^\/api\/lop\/([^/]+)\/hoc-sinh$/))) {
    const id = decodeURIComponent(m[1])
    if (!(await coQuyenLop(pool, user, id))) return loi(403, 'Bạn không phụ trách lớp này.')
    if (method === 'GET') {
      const { rows } = await pool.query(
        `SELECT h.ma, h.ho_ten, n.email, COALESCE(n.dang_hoat_dong, false) AS dang_hoat_dong
           FROM hoc_sinh h LEFT JOIN nguoi_dung n ON n.hoc_sinh_id = h.ma AND n.vai_tro = 'HOC_SINH'
          WHERE h.lop_id = $1 ORDER BY h.ma`, [id])
      return ok({ hoc_sinh: rows })
    }
    if (method === 'POST') return themHocSinh(ctx, id, Array.isArray(input.danh_sach) ? input.danh_sach : [input])
  }

  if ((m = path.match(/^\/api\/hoc-sinh\/([^/]+)$/)) && method === 'PATCH') {
    const ma = decodeURIComponent(m[1])
    const hs = (await pool.query('SELECT ma, lop_id FROM hoc_sinh WHERE ma = $1', [ma])).rows[0]
    if (!hs || !(await coQuyenLop(pool, user, hs.lop_id))) return loi(403, 'Bạn không phụ trách em này.')
    const lopMoi = input.lop_id === undefined ? null : String(input.lop_id)
    if (lopMoi && lopMoi !== hs.lop_id && !(await coQuyenLop(pool, user, lopMoi))) return loi(403, 'Bạn không phụ trách lớp muốn chuyển đến.')
    const ten = input.ho_ten === undefined ? null : String(input.ho_ten).trim()
    if (ten === '') return loi(400, 'Họ tên không được để trống.')
    let matKhauMoi = null
    if (input.dat_lai_mat_khau) matKhauMoi = matKhauNgau()
    else if (input.mat_khau !== undefined) {
      if (String(input.mat_khau).length < 8) return loi(400, 'Mật khẩu tối thiểu 8 ký tự.')
      matKhauMoi = String(input.mat_khau)
    }
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query('UPDATE hoc_sinh SET ho_ten = COALESCE($2, ho_ten), lop_id = COALESCE($3, lop_id) WHERE ma = $1', [ma, ten, lopMoi])
      await client.query(
        `UPDATE nguoi_dung SET ho_ten = COALESCE($2, ho_ten), lop_id = COALESCE($3, lop_id),
                dang_hoat_dong = COALESCE($4, dang_hoat_dong), mat_khau_hash = COALESCE($5, mat_khau_hash), updated_at = now()
          WHERE hoc_sinh_id = $1 AND vai_tro = 'HOC_SINH'`,
        [ma, ten, lopMoi, typeof input.dang_hoat_dong === 'boolean' ? input.dang_hoat_dong : null, matKhauMoi ? ctx.hashPassword(matKhauMoi) : null])
      await client.query('COMMIT')
    } catch (e) { await client.query('ROLLBACK').catch(() => undefined); throw e } finally { client.release() }
    await audit(user, 'SUA_HOC_SINH', `HOC_SINH:${ma}`, { chuyen_lop: lopMoi, khoa: input.dang_hoat_dong, dat_lai_mat_khau: Boolean(matKhauMoi) })
    return ok({ ok: true, ...(matKhauMoi ? { mat_khau_moi: matKhauMoi } : {}) })
  }

  if (path === '/api/giao-vien' && method === 'GET') {
    if (!laQuanTri) return loi(403, 'Chỉ quản trị viên được xem danh sách giáo viên.')
    const { rows } = await pool.query(
      `SELECT n.id, n.ho_ten, n.email, n.dang_hoat_dong,
              COALESCE(array_agg(g.lop_id ORDER BY g.lop_id) FILTER (WHERE g.lop_id IS NOT NULL), '{}') AS lop
         FROM nguoi_dung n LEFT JOIN giao_vien_lop g ON g.giao_vien_id = n.id
        WHERE n.vai_tro = 'GIAO_VIEN' GROUP BY n.id ORDER BY n.ho_ten`)
    return ok({ giao_vien: rows })
  }

  if ((m = path.match(/^\/api\/lop\/([^/]+)\/giao-vien$/)) && method === 'PUT') {
    if (!laQuanTri) return loi(403, 'Chỉ quản trị viên được gán giáo viên vào lớp.')
    const id = decodeURIComponent(m[1])
    if (!(await coQuyenLop(pool, user, id))) return loi(404, 'Không có lớp này.')
    const ids = [...new Set((Array.isArray(input.giao_vien_ids) ? input.giao_vien_ids : []).map(String))]
    const hopLe = (await pool.query("SELECT id FROM nguoi_dung WHERE id = ANY($1) AND vai_tro = 'GIAO_VIEN' AND dang_hoat_dong = true", [ids])).rows.map((r) => r.id)
    if (hopLe.length !== ids.length) return loi(400, 'Có mã không phải giáo viên đang hoạt động.')
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query('DELETE FROM giao_vien_lop WHERE lop_id = $1 AND NOT (giao_vien_id = ANY($2))', [id, ids])
      for (const gv of ids) await client.query('INSERT INTO giao_vien_lop (giao_vien_id, lop_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [gv, id])
      await client.query('COMMIT')
    } catch (e) { await client.query('ROLLBACK').catch(() => undefined); throw e } finally { client.release() }
    await audit(user, 'GAN_GIAO_VIEN', `LOP:${id}`, { giao_vien_ids: ids })
    return ok({ ok: true, giao_vien_ids: ids })
  }
  return null
}
