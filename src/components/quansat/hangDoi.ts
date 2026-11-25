/** Hàng đợi quan sát trong localStorage: ghi lạc quan, gửi lại khi có mạng. */
export interface QuanSatCho {
  ma_hs: string
  chi_bao: string
  hanh_vi: string
  co_ho_tro: 'DOC_LAP' | 'CO_HO_TRO'
  /** Thời điểm chạm, gửi kèm để server khử trùng khi gửi lại. */
  thoi_diem: string
  /** Lớp lúc chạm: đổi lớp trước khi gửi bù thì vẫn gửi đúng lớp cũ. */
  lop?: string
}

import { layLopDangChon, tieuDeLop } from '../../lib/auth'

const KHOA = 'sdt.quan_sat.hang_doi'

export function docHangDoi(): QuanSatCho[] {
  try { return JSON.parse(localStorage.getItem(KHOA) ?? '[]') } catch { return [] }
}
const ghi = (ds: QuanSatCho[]) => { try { localStorage.setItem(KHOA, JSON.stringify(ds)) } catch { /* đầy bộ nhớ: giữ trong RAM */ } }

export function themVaoHangDoi(q: QuanSatCho) { ghi([...docHangDoi(), { ...q, lop: q.lop ?? layLopDangChon() }]) }

let dangGui = false
/** Gửi tuần tự từ đầu hàng. Lỗi mạng/5xx/401: dừng, giữ lại. 4xx khác: bỏ (không bao giờ thành công). Trả số còn lại. */
export async function guiHangDoi(): Promise<number> {
  if (dangGui) return docHangDoi().length
  dangGui = true
  try {
    for (;;) {
      const q = docHangDoi()[0]
      if (!q) return 0
      let res: Response
      try {
        const { lop, ...than } = q
        res = await fetch('/api/gv/quan-sat', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json', ...tieuDeLop(lop ?? layLopDangChon()) }, body: JSON.stringify(than) })
      } catch { return docHangDoi().length }
      if (res.status >= 500 || res.status === 401) return docHangDoi().length
      // Bỏ đúng phần tử vừa gửi (hàng đợi có thể đã có thêm phần tử mới ở cuối).
      ghi(docHangDoi().slice(1))
    }
  } finally { dangGui = false }
}
