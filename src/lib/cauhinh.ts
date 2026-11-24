/** Kiểm tra tính hợp lệ của một phiên bản cấu hình bài học (S15). Đây là phép kiểm THẬT, chạy trên dữ liệu ánh xạ. */
import type { PhienBanCauHinh } from '../types'
import { HOAT_DONG, TEN_NGAN } from '../data/khbd'
import { CHI_BAO } from '../data/rubric'

const CHI_BAO_LOI_12 = Object.values(CHI_BAO).filter((cb) => cb.la_chi_bao_loi).map((cb) => cb.ma)

export const NGAN_HANG_CHI_BAO = [...new Set(HOAT_DONG.flatMap((h) => h.chi_bao))]
export const NGAN_HANG_MINH_CHUNG = ['P0', 'E1', 'E2', 'E3', 'E4', 'E5', 'P1']
export const QUY_TAC = HOAT_DONG.map((h) => `Bảng mô tả mức ${h.ma}`)

export interface VanDe { muc: 'loi' | 'canh_bao'; noi_dung: string }

export function kiemTraCauHinh(c: PhienBanCauHinh): VanDe[] {
  const v: VanDe[] = []
  const bao = new Set<string>()
  for (const r of c.anh_xa) {
    const la = r.chi_bao.filter((x) => !NGAN_HANG_CHI_BAO.includes(x))
    if (la.length) v.push({ muc: 'loi', noi_dung: `${r.hd}: chỉ báo ${la.join(', ')} không có trong ngân hàng chỉ báo.` })
    if (r.chi_bao.length === 0) v.push({ muc: 'loi', noi_dung: `${r.hd}: chưa gắn chỉ báo nào — hoạt động này không tạo cơ hội thể hiện.` })
    if (!NGAN_HANG_MINH_CHUNG.includes(r.minh_chung)) v.push({ muc: 'loi', noi_dung: `${r.hd}: chưa chọn loại minh chứng hợp lệ.` })
    r.chi_bao.forEach((x) => bao.add(x))
  }
  // CL02 — độ bao phủ cơ hội: mọi chỉ báo lõi phải có ít nhất một nhiệm vụ tạo cơ hội
  for (const cb of CHI_BAO_LOI_12) if (!bao.has(cb)) v.push({ muc: 'loi', noi_dung: `Chỉ báo lõi “${TEN_NGAN[cb]}” (${cb}) không có hoạt động nào tạo cơ hội → hệ thống sẽ luôn ghi KHÔNG CÓ CƠ HỘI (CL02).` })
  const e = c.anh_xa.map((r) => r.minh_chung)
  if (new Set(e).size < e.length) v.push({ muc: 'canh_bao', noi_dung: 'Có hai hoạt động dùng chung một loại minh chứng — cần chắc chắn không lẫn nguồn.' })
  return v
}
