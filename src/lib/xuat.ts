/**
 * Dựng gói dữ liệu nghiên cứu THẬT từ đồ thị dữ liệu, có ẩn danh hoá.
 * Nguyên tắc F12: đi kèm thông tin mô tả (phiên bản KHBD, rubric, catalog, cấu hình), ghi ai xuất gì lúc nào.
 */
import type { DuLieu } from './trace'
import { CAU_HINH } from '../data/seed'

export interface CaiDatAnDanh { maHoaDinhDanh: boolean; loaiNhayCam: boolean; giuNhomLop: boolean; themNhieu: boolean }
export type LoaiDuLieu = 'ALL' | 'MINH_CHUNG' | 'DANH_GIA' | 'TRANG_THAI' | 'HO_TRO'
export const TEN_LOAI: Record<LoaiDuLieu, string> = { ALL: 'Tất cả', MINH_CHUNG: 'Minh chứng', DANH_GIA: 'Đánh giá', TRANG_THAI: 'Trạng thái SDT', HO_TRO: 'Hỗ trợ' }

export interface Bang { ten: string; cot: string[]; dong: (string | number | null)[][] }

const RE_EMAIL = /[\w.+-]+@[\w-]+\.[\w.]+/g
const RE_SDT = /(?:\+?84|0)\d{8,10}/g

export function taoAnDanh(dl: DuLieu, c: CaiDatAnDanh) {
  const ma = new Map(dl.hoc_sinh.map((h, i) => [h.id, `HS_${CAU_HINH.lop}_${String(i + 1).padStart(3, '0')}`]))
  const id = (x: string | null) => (x ? (c.maHoaDinhDanh ? ma.get(x) ?? x : x) : null)
  const lam = (t: string | null) => {
    if (!t) return t
    let r = t
    if (c.loaiNhayCam) r = r.replace(RE_EMAIL, '***@***').replace(RE_SDT, '***')
    if (c.maHoaDinhDanh) for (const h of dl.hoc_sinh) r = r.split(h.ho_ten).join(ma.get(h.id)!)
    return r
  }
  const lop = (x: string) => (c.giuNhomLop ? x : '—')
  const nhieu = (n: number | null) => (n === null ? null : c.themNhieu ? Math.round(n / 100) * 100 : n)
  return { ma, id, lam, lop, nhieu }
}

export function dungBang(dl: DuLieu, loai: LoaiDuLieu, c: CaiDatAnDanh, tu: string, den: string): Bang[] {
  const a = taoAnDanh(dl, c)
  const trong = (iso: string) => (!tu || iso >= tu) && (!den || iso <= den + 'T23:59:59')
  const hsLop = new Map(dl.hoc_sinh.map((h) => [h.id, h]))
  const bang: Bang[] = []

  if (loai === 'ALL' || loai === 'MINH_CHUNG') bang.push({
    ten: 'minh_chung', cot: ['ma_minh_chung', 'phien_ban', 'loai', 'chu_the', 'ma_hoc_sinh', 'ma_nhom', 'ma_lop', 'nhiem_vu', 'trang_thai_chat_luong', 'boi_canh_ho_tro', 'nhap_ho', 'so_tep', 'thoi_diem'],
    dong: dl.minh_chung.filter((m) => trong(m.thoi_diem)).map((m) => [m.ma_minh_chung, m.phien_ban, m.loai_minh_chung, m.loai_chu_the, a.id(m.hoc_sinh_id), m.nhom_id, m.hoc_sinh_id ? a.lop(hsLop.get(m.hoc_sinh_id)?.lop ?? '') : null, m.nhiem_vu_id, m.trang_thai, m.boi_canh_ho_tro, m.nhap_ho ? 1 : 0, m.tep.length, m.thoi_diem]),
  })
  if (loai === 'ALL' || loai === 'DANH_GIA') bang.push({
    ten: 'danh_gia', cot: ['ma_hoc_sinh', 'chi_bao', 'muc', 'rubric_id', 'nguoi_danh_gia', 'ly_do', 'minh_chung_ids', 'danh_gia_truoc', 'thoi_diem'],
    dong: dl.danh_gia.filter((g) => trong(g.thoi_diem)).map((g) => [a.id(g.hoc_sinh_id), g.chi_bao, g.muc, g.rubric_id, g.nguoi_danh_gia_id, a.lam(g.ly_do), g.minh_chung_ids.join('|'), g.danh_gia_truoc_id, g.thoi_diem]),
  })
  if (loai === 'ALL' || loai === 'TRANG_THAI') bang.push({
    ten: 'trang_thai_sdt', cot: ['ma_hoc_sinh', 'chi_bao', 'muc', 'trang_thai_chat_luong', 'tinh_doc_lap', 'do_tin_cay', 'danh_gia_id', 'trang_thai_truoc', 'sau_ho_tro', 'ly_do', 'thoi_diem'],
    dong: dl.trang_thai.filter((t) => trong(t.thoi_diem)).map((t) => [a.id(t.hoc_sinh_id), t.chi_bao, t.muc, t.trang_thai_chat_luong, t.tinh_doc_lap, t.do_tin_cay, t.danh_gia_id, t.trang_thai_truoc_id, t.sau_ho_tro ? 1 : 0, a.lam(t.ly_do), t.thoi_diem]),
  })
  if (loai === 'ALL' || loai === 'HO_TRO') bang.push({
    ten: 'ho_tro', cot: ['ma_hoc_sinh', 'loai', 'nguon', 'cap', 'trang_thai_duyet', 'noi_dung', 'ket_qua', 'thoi_diem'],
    dong: dl.ho_tro.filter((h) => trong(h.thoi_diem)).map((h) => [a.id(h.hoc_sinh_id), h.loai, h.nguon, h.cap, h.trang_thai_duyet, a.lam(h.noi_dung), a.lam(h.ket_qua), h.thoi_diem]),
  })
  void a.nhieu
  return bang
}

export const demBanGhi = (b: Bang[]) => b.reduce((s, x) => s + x.dong.length, 0)

export function thongTinMoTa(dl: DuLieu, c: CaiDatAnDanh, nguoi: string) {
  const ver = dl.cau_hinh.find((x) => x.hien_tai) ?? dl.cau_hinh[0]
  return {
    he_thong: 'SDT – Bản sao số học sinh (nguyên mẫu)', xuat_boi: nguoi, thoi_diem: new Date().toISOString(),
    phien_ban: { khbd: CAU_HINH.khbd_phien_ban, bang_mo_ta_muc: CAU_HINH.rubric_phien_ban, catalog_chan_doan: CAU_HINH.catalog_phien_ban, cau_hinh_bai_hoc: ver.id },
    an_danh: c,
    luu_y: 'Dữ liệu hư cấu phục vụ demo. Trạng thái SDT là giả thuyết sư phạm cập nhật theo nhịp giáo viên, không phải điểm năng lực.',
  }
}
