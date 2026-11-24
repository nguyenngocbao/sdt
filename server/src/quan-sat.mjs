/* M5 — ghi quan sát nhanh của giáo viên (quan_sat là append-only) và danh sách lớp cho Màn C. */
import { GOI_Y_HIEU_LUC } from './duyet-goi-y.mjs'

const CO_HO_TRO = ['DOC_LAP', 'CO_HO_TRO']
const MA_HS_RE = /^[A-Za-z0-9_-]{1,32}$/
const CHI_BAO_RE = /^[A-D][0-9]\.[0-9]$/

/**
 * Một INSERT duy nhất. thoi_diem do máy giáo viên gửi (lúc chạm ô) để hàng đợi offline giữ đúng thời điểm;
 * gửi lại cùng (ma_hs, hanh_vi, gv, thoi_diem) thì không tạo dòng thứ hai.
 */
export async function ghiQuanSat(pool, user, input) {
  const maHs = String(input.ma_hs ?? '')
  const chiBao = String(input.chi_bao ?? '')
  const hanhVi = String(input.hanh_vi ?? '').trim()
  if (!MA_HS_RE.test(maHs)) return { code: 400, data: { message: 'Mã học sinh không hợp lệ.' } }
  if (!CHI_BAO_RE.test(chiBao)) return { code: 400, data: { message: 'Chỉ báo không hợp lệ.' } }
  if (!hanhVi || hanhVi.length > 300) return { code: 400, data: { message: 'Hành vi không hợp lệ.' } }
  if (!CO_HO_TRO.includes(input.co_ho_tro)) return { code: 400, data: { message: 'Mức độc lập không hợp lệ.' } }
  let thoiDiem = null
  if (input.thoi_diem != null) {
    const t = new Date(input.thoi_diem)
    if (Number.isNaN(t.getTime()) || t.getTime() > Date.now() + 60_000) return { code: 400, data: { message: 'Thời điểm không hợp lệ.' } }
    thoiDiem = t.toISOString()
  }
  // Lọc lớp ngay trong INSERT: giáo viên chỉ ghi cho học sinh của lớp mình.
  const lop = user.vai_tro === 'QUAN_TRI' ? null : user.lop_id
  const { rows } = await pool.query(
    `INSERT INTO quan_sat (ma_hs, chi_bao, hanh_vi, co_ho_tro, gv, thoi_diem)
     SELECT h.ma, $2, $3, $4, $5, COALESCE($6::timestamptz, now()) FROM hoc_sinh h
     WHERE h.ma = $1 AND ($7::text IS NULL OR h.lop_id = $7)
       AND NOT EXISTS (SELECT 1 FROM quan_sat q WHERE $6::timestamptz IS NOT NULL AND q.ma_hs = h.ma AND q.hanh_vi = $3 AND q.gv = $5 AND q.thoi_diem = $6::timestamptz)
     RETURNING id`,
    [maHs, chiBao, hanhVi, input.co_ho_tro, user.id, thoiDiem, lop])
  if (rows.length) return { code: 201, data: { id: rows[0].id } }
  const hs = await pool.query('SELECT 1 FROM hoc_sinh WHERE ma = $1 AND ($2::text IS NULL OR lop_id = $2)', [maHs, lop])
  if (!hs.rowCount) return { code: 404, data: { message: 'Không tìm thấy học sinh trong lớp của bạn.' } }
  return { code: 200, data: { trung: true } }
}

/** Học sinh của lớp, đã nộp phiếu chặng đang chọn chưa, có gợi ý chờ duyệt không. */
export async function lopCuaGiaoVien(pool, user, chang) {
  if (!Number.isInteger(chang) || chang < 0 || chang > 6) return { code: 400, data: { message: 'Chặng phải là số nguyên từ 0 đến 6.' } }
  const lop = user.vai_tro === 'QUAN_TRI' ? null : user.lop_id
  const { rows } = await pool.query(
    `SELECT h.ma, h.ho_ten,
            EXISTS (SELECT 1 FROM phieu p WHERE p.ma_hs = h.ma AND p.chang = $1 AND NOT p.nhap_ho) AS da_nop,
            EXISTS (SELECT 1 FROM (${GOI_Y_HIEU_LUC}) g WHERE g.ma_hs = h.ma AND g.tt_hieu_luc = 'CHO') AS co_goi_y
     FROM hoc_sinh h WHERE ($2::text IS NULL OR h.lop_id = $2) ORDER BY h.ma`, [chang, lop])
  return { code: 200, data: { hoc_sinh: rows } }
}
