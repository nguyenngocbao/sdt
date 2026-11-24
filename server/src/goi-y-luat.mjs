import { reNhanh } from './re-nhanh.mjs'

/** Gọi trong transaction. Khóa phiếu để endpoint nội bộ chạy lại không nhân đôi. */
export async function taoGoiYLuat(client, phieuId) {
  const { rows: [phieu] } = await client.query('SELECT * FROM phieu WHERE id = $1 FOR UPDATE', [phieuId])
  if (!phieu || !['E4', 'E5'].includes(phieu.loai)) return []
  const daCo = await client.query("SELECT * FROM goi_y WHERE phieu_id = $1 AND nguon = 'LUAT' ORDER BY id", [phieuId])
  if (daCo.rowCount) return daCo.rows
  const { rows: lanThu } = await client.query('SELECT * FROM lan_thu WHERE phieu_id = $1 ORDER BY lan, id', [phieuId])
  const { rows: truoc } = await client.query(
    `SELECT p.*, COALESCE((SELECT jsonb_agg(to_jsonb(l) ORDER BY l.lan, l.id)
       FROM lan_thu l WHERE l.phieu_id = p.id), '[]'::jsonb) AS lan_thu
     FROM phieu p WHERE p.ma_hs = $1 AND p.id < $2 AND p.loai IN ('E2', 'E4')
     ORDER BY p.id DESC`, [phieu.ma_hs, phieuId],
  )
  const goiY = []
  for (const nhanh of reNhanh(phieu, lanThu, truoc)) {
    const { rows: [row] } = await client.query(
      `INSERT INTO goi_y (ma_hs, phieu_id, nhanh, can_cu, noi_dung, nguon, trang_thai)
       VALUES ($1,$2,$3,$4,$5,'LUAT',$6) RETURNING *`,
      [phieu.ma_hs, phieuId, nhanh.ma_nhanh, nhanh.can_cu, nhanh.cau_mau, nhanh.ma_nhanh === 'N4.1' ? 'GUI' : 'CHO'],
    )
    goiY.push(row)
  }
  return goiY
}
