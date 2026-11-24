/* M4 — giáo viên duyệt gợi ý. goi_y là append-only: quyết định ghi vào phan_hoi_gv,
 * trạng thái hiệu lực = phản hồi mới nhất, nếu chưa có thì lấy goi_y.trang_thai (CHO, hoặc GUI của N4.1). */

/** Mỗi gợi ý kèm phản hồi mới nhất của giáo viên; không UPDATE goi_y. */
export const GOI_Y_HIEU_LUC = `
  SELECT g.*, h.lop_id, COALESCE(f.quyet_dinh, g.trang_thai) AS tt_hieu_luc,
         f.noi_dung_sua, f.ly_do_bo, COALESCE(f.thoi_diem, g.thoi_diem) AS thoi_diem_quyet
  FROM goi_y g
  JOIN hoc_sinh h ON h.ma = g.ma_hs
  LEFT JOIN LATERAL (SELECT * FROM phan_hoi_gv WHERE goi_y_id = g.id ORDER BY id DESC LIMIT 1) f ON true`

const QUYET_DINH = ['GUI', 'SUA', 'TU_NOI', 'BO']
const NGUONG_BO = 0.5

const dongSoLieu = (canCu) => String(canCu ?? '').split(/\n+/).map((x) => x.trim()).filter(Boolean)

function phamViLop(user, thamSo) {
  if (user.vai_tro === 'QUAN_TRI') return ''
  thamSo.push(user.lop_id)
  return ` AND lop_id = $${thamSo.length}`
}

/** Câu hiển thị cho học sinh: câu đã sửa nếu giáo viên sửa, ngược lại câu hệ thống. */
export const cauGuiHocSinh = (g) => (g.tt_hieu_luc === 'SUA' && g.noi_dung_sua ? g.noi_dung_sua : g.noi_dung)

export async function hangCho(pool, user) {
  const tham = []
  const lop = phamViLop(user, tham)
  const { rows } = await pool.query(
    `SELECT id, ma_hs, phieu_id, nhanh, can_cu, noi_dung, thoi_diem FROM (${GOI_Y_HIEU_LUC}) x
     WHERE tt_hieu_luc = 'CHO'${lop} ORDER BY thoi_diem, id`, tham)
  return {
    so_cho: rows.length,
    the: rows.map((r) => ({ id: r.id, ma_hs: r.ma_hs, phieu_id: r.phieu_id, nhanh: r.nhanh, thoi_diem: r.thoi_diem, he_thong_thay: dongSoLieu(r.can_cu), de_xuat: r.noi_dung })),
  }
}

export async function thongKeNhanh(pool, user) {
  const tham = []
  const lop = phamViLop(user, tham)
  const { rows } = await pool.query(
    `SELECT nhanh,
            count(DISTINCT ma_hs) FILTER (WHERE tt_hieu_luc = 'CHO')::int AS em_cho,
            count(*) FILTER (WHERE tt_hieu_luc = 'CHO')::int AS cho,
            count(*) FILTER (WHERE tt_hieu_luc = 'GUI')::int AS gui,
            count(*) FILTER (WHERE tt_hieu_luc = 'SUA')::int AS sua,
            count(*) FILTER (WHERE tt_hieu_luc = 'TU_NOI')::int AS tu_noi,
            count(*) FILTER (WHERE tt_hieu_luc = 'BO')::int AS bo
     FROM (${GOI_Y_HIEU_LUC}) x WHERE true${lop} GROUP BY nhanh ORDER BY nhanh`, tham)
  const nhanh = rows.map((r) => {
    const daQuyet = r.gui + r.sua + r.tu_noi + r.bo
    // Chỉ tính các gợi ý giáo viên đã quyết định; thẻ còn chờ chưa được tính.
    const tyLeBo = daQuyet ? r.bo / daQuyet : 0
    return { ...r, da_quyet: daQuyet, ty_le_bo: Math.round(tyLeBo * 1000) / 10, canh_bao_bo_nhieu: daQuyet > 0 && tyLeBo > NGUONG_BO }
  })
  return { nhanh }
}

function tomTatBaiLam(phieu, lanThu, canCu) {
  const dong = dongSoLieu(canCu)
  const nn = phieu.noi_dung?.nguyen_nhan_han_che
  if (nn) dong.push(`Nguyên nhân em viết: ${nn}`)
  for (const l of lanThu) {
    dong.push(`Lần ${l.lan}: tải ${l.tai_g ?? '—'} g, giữ ${l.giu_giay ?? '—'} giây, ${l.vi_tri ?? '—'}, biến dạng ${l.bien_dang ?? '—'}`)
  }
  return dong.join('\n')
}

/** Trả { code, data }. Ghi phan_hoi_gv (+ vi_du_mau) trong một transaction, khóa dòng gợi ý. */
export async function duyet(pool, user, goiYId, input) {
  const quyetDinh = String(input.quyet_dinh ?? '')
  if (!QUYET_DINH.includes(quyetDinh)) return { code: 400, data: { message: 'Quyết định không hợp lệ.' } }
  const sua = typeof input.noi_dung_sua === 'string' ? input.noi_dung_sua.trim() : ''
  const lyDo = typeof input.ly_do_bo === 'string' ? input.ly_do_bo.trim() : ''
  if (quyetDinh === 'SUA' && !sua) return { code: 400, data: { message: 'Hãy nhập câu đã sửa trước khi gửi.' } }
  if (quyetDinh === 'SUA' && sua.length > 2000) return { code: 400, data: { message: 'Câu đã sửa quá dài.' } }
  if (quyetDinh === 'BO' && !lyDo) return { code: 400, data: { message: 'Bắt buộc nhập lý do bỏ.' } }
  if (lyDo.length > 2000) return { code: 400, data: { message: 'Lý do quá dài.' } }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const khoa = await client.query('SELECT id, ma_hs FROM goi_y WHERE id = $1 FOR UPDATE', [goiYId])
    const coQuyen = khoa.rowCount && (user.vai_tro === 'QUAN_TRI'
      || (await client.query('SELECT 1 FROM hoc_sinh WHERE ma = $1 AND lop_id = $2', [khoa.rows[0].ma_hs, user.lop_id])).rowCount)
    if (!coQuyen) { await client.query('ROLLBACK'); return { code: 404, data: { message: 'Không tìm thấy gợi ý.' } } }
    const { rows: [g] } = await client.query(`SELECT * FROM (${GOI_Y_HIEU_LUC}) x WHERE id = $1`, [goiYId])
    if (g.tt_hieu_luc !== 'CHO') { await client.query('ROLLBACK'); return { code: 409, data: { message: 'Gợi ý này đã được xử lý.' } } }

    const { rows: [ph] } = await client.query(
      `INSERT INTO phan_hoi_gv (goi_y_id, quyet_dinh, noi_dung_sua, ly_do_bo, gv) VALUES ($1,$2,$3,$4,$5) RETURNING id, thoi_diem`,
      [goiYId, quyetDinh, quyetDinh === 'SUA' ? sua : null, quyetDinh === 'BO' ? lyDo : null, user.id])

    if (quyetDinh === 'GUI' || quyetDinh === 'SUA') {
      // Mẫu cho lần sau. Câu cũ vẫn nằm nguyên trong goi_y để so với câu đã sửa.
      const { rows: [phieu] } = await client.query('SELECT * FROM phieu WHERE id = $1', [g.phieu_id])
      const { rows: lanThu } = await client.query('SELECT * FROM lan_thu WHERE phieu_id = $1 ORDER BY lan, id', [g.phieu_id])
      await client.query(
        'INSERT INTO vi_du_mau (nhanh, bai_lam_tom_tat, cau_hoi_duyet, goi_y_id) VALUES ($1,$2,$3,$4)',
        [g.nhanh, tomTatBaiLam(phieu, lanThu, g.can_cu), quyetDinh === 'SUA' ? sua : g.noi_dung, goiYId])
    }
    await client.query('COMMIT')
    return { code: 200, data: { goi_y_id: g.id, quyet_dinh: quyetDinh, phan_hoi_id: ph.id, thoi_diem: ph.thoi_diem } }
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined)
    throw error
  } finally { client.release() }
}

/** Gợi ý đã tới học sinh (GUI hoặc SUA) của chính em đó. */
export async function goiYCuaHocSinh(pool, maHs) {
  const { rows } = await pool.query(
    `SELECT * FROM (${GOI_Y_HIEU_LUC}) x WHERE ma_hs = $1 AND tt_hieu_luc IN ('GUI','SUA') ORDER BY thoi_diem_quyet, id`, [maHs])
  // Không đưa can_cu, câu cũ hay lý do của giáo viên cho học sinh.
  return rows.map((g) => ({
    id: g.id, ma_hs: g.ma_hs, phieu_id: g.phieu_id, nhanh: g.nhanh, trang_thai: g.tt_hieu_luc,
    noi_dung: cauGuiHocSinh(g), thoi_diem: g.thoi_diem_quyet,
  }))
}

/** Học sinh nộp lại: ghi khoảng thời gian từ lúc nhận gợi ý tới lúc nộp lại, mỗi gợi ý một lần. */
export async function ghiSuKienNopLai(client, maHs, loai, phieuMoiId) {
  await client.query(
    `INSERT INTO su_kien (ma_hs, loai, chi_tiet)
     SELECT g.ma_hs, 'NOP_LAI_SAU_GOI_Y',
            jsonb_build_object('goi_y_id', g.id, 'nhanh', g.nhanh, 'phieu_id', $3::bigint, 'loai_phieu', $2::text,
                               'giay_tu_luc_nhan', round(extract(epoch FROM (n.thoi_diem - g.thoi_diem_quyet))::numeric, 1))
     FROM (${GOI_Y_HIEU_LUC}) g
     JOIN phieu c ON c.id = g.phieu_id AND c.loai = $2
     JOIN phieu n ON n.id = $3
     WHERE g.ma_hs = $1 AND g.tt_hieu_luc IN ('GUI','SUA') AND g.thoi_diem_quyet <= n.thoi_diem
       AND NOT EXISTS (SELECT 1 FROM su_kien s WHERE s.ma_hs = g.ma_hs AND s.loai = 'NOP_LAI_SAU_GOI_Y'
                       AND s.chi_tiet->>'goi_y_id' = g.id::text)`,
    [maHs, loai, phieuMoiId])
}
