/* Hội thoại quanh gợi ý: học sinh phản hồi, giáo viên trả lời, hệ thống biết em đã làm lại chưa.
 * trao_doi là append-only. Trạng thái của mỗi gợi ý được tính lại từ dữ liệu, không lưu riêng. */
import { GOI_Y_HIEU_LUC, cauGuiHocSinh } from './duyet-goi-y.mjs'

const LOAI_HS = ['HIEU_ROI', 'CHUA_HIEU', 'HOI']
const CAN_CAU = ['HOI', 'TRA_LOI']
const DAI_TOI_DA = 1000
const MA_GUI_RE = /^[\w-]{8,64}$/

/** Thứ tự ưu tiên khi giáo viên xem: việc cần mình làm lên trước. */
export const THU_TU_BUOC = ['CAN_GV', 'CHO_EM', 'GV_DA_TRA_LOI', 'EM_HIEU', 'DA_LAM_LAI']

/**
 * CHO_EM: gợi ý đã tới em, em chưa phản hồi.
 * CAN_GV: tin cuối là em chưa hiểu hoặc em hỏi → giáo viên cần trả lời.
 * GV_DA_TRA_LOI: giáo viên đã trả lời, chờ em.
 * EM_HIEU: em bấm "Em hiểu rồi", chưa nộp lại.
 * DA_LAM_LAI: em đã nộp lại phiếu cùng loại sau khi nhận gợi ý.
 */
export function tinhBuoc(tin, nopLaiLuc) {
  if (nopLaiLuc) return 'DA_LAM_LAI'
  const cuoi = tin[tin.length - 1]
  if (!cuoi) return 'CHO_EM'
  if (cuoi.vai_tro === 'GIAO_VIEN') return 'GV_DA_TRA_LOI'
  return cuoi.loai === 'HIEU_ROI' ? 'EM_HIEU' : 'CAN_GV'
}

const DA_TOI_EM = `
  SELECT x.*, c.loai AS loai_phieu, hs.ho_ten,
         (SELECT min(n.thoi_diem) FROM phieu n
           WHERE n.ma_hs = x.ma_hs AND n.loai = c.loai AND n.id > x.phieu_id
             AND n.nhap_ho = false AND n.thoi_diem >= x.thoi_diem_quyet) AS nop_lai_luc
  FROM (${GOI_Y_HIEU_LUC}) x
  JOIN phieu c ON c.id = x.phieu_id
  JOIN hoc_sinh hs ON hs.ma = x.ma_hs
  WHERE x.tt_hieu_luc IN ('GUI','SUA')`

async function napTin(pool, ids) {
  const theoGoiY = new Map(ids.map((id) => [String(id), []]))
  if (!ids.length) return theoGoiY
  const { rows } = await pool.query(
    'SELECT id, goi_y_id, vai_tro, loai, noi_dung, thoi_diem FROM trao_doi WHERE goi_y_id = ANY($1::bigint[]) ORDER BY id', [ids])
  for (const r of rows) theoGoiY.get(String(r.goi_y_id))?.push({ id: r.id, vai_tro: r.vai_tro, loai: r.loai, noi_dung: r.noi_dung, thoi_diem: r.thoi_diem })
  return theoGoiY
}

function dinhDang(g, tin) {
  return {
    id: g.id, ma_hs: g.ma_hs, phieu_id: g.phieu_id, loai_phieu: g.loai_phieu, nhanh: g.nhanh,
    trang_thai: g.tt_hieu_luc, noi_dung: cauGuiHocSinh(g), thoi_diem: g.thoi_diem_quyet,
    nop_lai_luc: g.nop_lai_luc, trao_doi: tin, buoc: tinhBuoc(tin, g.nop_lai_luc),
  }
}

/** Gợi ý của chính em kèm hội thoại. Không đưa căn cứ, câu gốc hay lý do của giáo viên. */
export async function hoiThoaiCuaHocSinh(pool, maHs) {
  const { rows } = await pool.query(`${DA_TOI_EM} AND x.ma_hs = $1 ORDER BY x.thoi_diem_quyet, x.id`, [maHs])
  const tin = await napTin(pool, rows.map((r) => r.id))
  return rows.map((g) => dinhDang(g, tin.get(String(g.id))))
}

/** Mọi gợi ý đã tới học sinh trong lớp của giáo viên, kèm hội thoại và đếm theo bước. */
export async function hoiThoaiCuaLop(pool, user) {
  const tham = []
  let lop = ''
  if (user.vai_tro !== 'QUAN_TRI') { tham.push(user.lop_id); lop = ` AND x.lop_id = $1` }
  const { rows } = await pool.query(`${DA_TOI_EM}${lop} ORDER BY x.thoi_diem_quyet, x.id`, tham)
  const tin = await napTin(pool, rows.map((r) => r.id))
  const muc = rows.map((g) => {
    const ds = tin.get(String(g.id))
    return { ...dinhDang(g, ds), ho_ten: g.ho_ten, tin_cuoi_luc: ds[ds.length - 1]?.thoi_diem ?? g.thoi_diem_quyet }
  })
  muc.sort((a, b) => THU_TU_BUOC.indexOf(a.buoc) - THU_TU_BUOC.indexOf(b.buoc) || new Date(a.tin_cuoi_luc) - new Date(b.tin_cuoi_luc))
  const dem = Object.fromEntries(THU_TU_BUOC.map((b) => [b, muc.filter((m) => m.buoc === b).length]))
  return { dem, muc }
}

/** Trả { code, data }. Học sinh: HIEU_ROI / CHUA_HIEU / HOI. Giáo viên, quản trị: TRA_LOI. */
export async function guiTraoDoi(pool, user, goiYId, input) {
  const laHs = user.vai_tro === 'HOC_SINH'
  const loai = String(input.loai ?? '')
  const noiDung = typeof input.noi_dung === 'string' ? input.noi_dung.trim() : ''
  const maGui = typeof input.ma_gui === 'string' && MA_GUI_RE.test(input.ma_gui) ? input.ma_gui : null
  if (!(laHs ? LOAI_HS : ['TRA_LOI']).includes(loai)) return { code: 400, data: { message: 'Loại tin nhắn không hợp lệ.' } }
  if (CAN_CAU.includes(loai) && !noiDung) return { code: 400, data: { message: 'Hãy viết nội dung trước khi gửi.' } }
  if (noiDung.length > DAI_TOI_DA) return { code: 400, data: { message: `Tin nhắn dài quá ${DAI_TOI_DA} ký tự.` } }

  const { rows: [g] } = await pool.query(`SELECT * FROM (${GOI_Y_HIEU_LUC}) x WHERE id = $1`, [goiYId])
  const coQuyen = g && (laHs ? g.ma_hs === user.hoc_sinh_id : user.vai_tro === 'QUAN_TRI' || g.lop_id === user.lop_id)
  if (!coQuyen || !['GUI', 'SUA'].includes(g.tt_hieu_luc)) return { code: 404, data: { message: 'Không tìm thấy gợi ý.' } }

  try {
    const { rows: [moi] } = await pool.query(
      `INSERT INTO trao_doi (goi_y_id, nguoi_gui, vai_tro, loai, noi_dung, ma_gui) VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, goi_y_id, vai_tro, loai, noi_dung, thoi_diem`,
      [goiYId, user.id, laHs ? 'HOC_SINH' : 'GIAO_VIEN', loai, noiDung || null, maGui])
    return { code: 201, data: { tin: moi, trung: false } }
  } catch (error) {
    // ON CONFLICT không dùng được trên bảng có RULE, nên bắt lỗi trùng khóa ma_gui.
    if (error.code !== '23505' || !maGui) throw error
  }
  // Máy khách gửi lại cùng ma_gui (mất phản hồi, bấm hai lần): trả bản đã ghi, không tạo dòng mới.
  const { rows: [cu] } = await pool.query(
    'SELECT id, goi_y_id, vai_tro, loai, noi_dung, thoi_diem FROM trao_doi WHERE nguoi_gui = $1 AND ma_gui = $2', [user.id, maGui])
  if (String(cu.goi_y_id) !== String(goiYId)) return { code: 409, data: { message: 'Mã gửi đã dùng cho gợi ý khác.' } }
  return { code: 200, data: { tin: cu, trung: true } }
}
