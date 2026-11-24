import { request } from '../lib/auth'

/* Phiếu E4 (chế tạo và thử tải) và E5 (cải tiến). Trường thu bằng SỐ và Ô CHỌN để máy so sánh được. */

export const VI_TRI = ['giữa nhịp', 'lệch tâm', 'mép điểm tựa'] as const
export const BIEN_DANG = VI_TRI
export const DANG_HONG = ['võng quá', 'gãy gập', 'bung nối', 'trượt điểm tựa'] as const
export const THAY_DOI_E5 = ['hình dạng tiết diện', 'số lớp giấy', 'cách nối', 'điểm tựa', 'chiều dài nhịp', 'vật liệu gia cố'] as const

export interface LanThu {
  lan: number
  tai_g: string
  giu_giay: string
  vi_tri: string
  bien_dang: string
  dang_hong: string
  ghi_chu: string
}

export type LoaiPhieu = 'E4' | 'E5'
export const CHANG: Record<LoaiPhieu, number> = { E4: 4, E5: 5 }

export interface NhapE4 {
  lan_thu: LanThu[]
  thay_doi_so_voi_thiet_ke: string
  nguyen_nhan_han_che: string
  minh_chung_vien_dan: number | null
}

export interface NhapE5 {
  lan_thu: LanThu[]
  thay_doi: string[]
  thay_doi_chu: string
  nham_vao_nguyen_nhan: string
  du_doan_tai_moi_g: string
  giai_thich: string
}

export interface BanLuu<T> {
  du_lieu: T
  /** id phiếu cũ nếu đang nộp lại */
  thay_the_cho: string | null
}

export const lanThuTrong = (lan: number): LanThu => ({ lan, tai_g: '', giu_giay: '', vi_tri: '', bien_dang: '', dang_hong: '', ghi_chu: '' })
export const e4Trong = (): NhapE4 => ({ lan_thu: [lanThuTrong(1)], thay_doi_so_voi_thiet_ke: '', nguyen_nhan_han_che: '', minh_chung_vien_dan: null })
export const e5Trong = (): NhapE5 => ({ lan_thu: [lanThuTrong(1)], thay_doi: [], thay_doi_chu: '', nham_vao_nguyen_nhan: '', du_doan_tai_moi_g: '', giai_thich: '' })

/* ── Nháp trong localStorage ───────────────────────────────────────────────── */

const khoaNhap = (nguoi: string, loai: LoaiPhieu) => `sdt:nhap:${nguoi}:${loai}`

export function docNhap<T>(nguoi: string, loai: LoaiPhieu): BanLuu<T> | null {
  try {
    const raw = localStorage.getItem(khoaNhap(nguoi, loai))
    return raw ? (JSON.parse(raw) as BanLuu<T>) : null
  } catch { return null }
}
export function ghiNhap<T>(nguoi: string, loai: LoaiPhieu, ban: BanLuu<T>) {
  try { localStorage.setItem(khoaNhap(nguoi, loai), JSON.stringify(ban)) } catch { /* đầy bộ nhớ: bỏ qua, vẫn nhập tiếp */ }
}
export function xoaNhap(nguoi: string, loai: LoaiPhieu) {
  try { localStorage.removeItem(khoaNhap(nguoi, loai)) } catch { /* không có gì để xoá */ }
}

/* ── Số liệu ───────────────────────────────────────────────────────────────── */

const so = (v: string) => (v.trim() === '' || Number.isNaN(Number(v)) ? null : Number(v))

export interface TomTatLanThu { lan: number; tai_g: number | null; giu_giay: number | null; vi_tri: string | null; bien_dang: string | null; dang_hong: string | null }

export function tomTat(lan_thu: LanThu[]): TomTatLanThu[] {
  return lan_thu.map((l) => ({ lan: l.lan, tai_g: so(l.tai_g), giu_giay: so(l.giu_giay), vi_tri: l.vi_tri || null, bien_dang: l.bien_dang || null, dang_hong: l.dang_hong || null }))
}

export interface ChiSo { tai_max: number | null; tai_tb: number | null }
export function chiSo(ds: { tai_g: number | null }[]): ChiSo {
  const t = ds.map((l) => l.tai_g).filter((x): x is number => x !== null)
  if (!t.length) return { tai_max: null, tai_tb: null }
  return { tai_max: Math.max(...t), tai_tb: Math.round((t.reduce((a, b) => a + b, 0) / t.length) * 10) / 10 }
}

export interface ChenhLech { v1: ChiSo; v2: ChiSo; max_g: number | null; max_pct: number | null; tb_g: number | null; tb_pct: number | null }
/** Hệ thống tự tính; học sinh không phải tính. */
export function chenhLech(v1: { tai_g: number | null }[], v2: { tai_g: number | null }[]): ChenhLech {
  const a = chiSo(v1), b = chiSo(v2)
  const hieu = (x: number | null, y: number | null) => (x === null || y === null ? null : Math.round((y - x) * 10) / 10)
  const pct = (x: number | null, d: number | null) => (x === null || d === null || x === 0 ? null : Math.round((d / x) * 1000) / 10)
  const max_g = hieu(a.tai_max, b.tai_max), tb_g = hieu(a.tai_tb, b.tai_tb)
  return { v1: a, v2: b, max_g, max_pct: pct(a.tai_max, max_g), tb_g, tb_pct: pct(a.tai_tb, tb_g) }
}

/** Danh sách ô chọn cho nham_vao_nguyen_nhan: tách từ chính ô nguyen_nhan_han_che em viết ở E4. */
export function luaChonNguyenNhan(text: string): string[] {
  const phan = text.split(/[\n;.!?]+/).map((x) => x.trim()).filter((x) => x.length > 1)
  return Array.from(new Set(phan))
}

export function dieuKienV1(l: TomTatLanThu[]): string {
  const dk = l.filter((x) => x.tai_g !== null)
  if (!dk.length) return ''
  const t = dk.reduce((m, x) => ((x.tai_g ?? 0) > (m.tai_g ?? 0) ? x : m))
  return `lần ${t.lan}: tải ${t.vi_tri ?? '—'}${t.giu_giay !== null ? `, giữ ${t.giu_giay} giây` : ''}${t.tai_g !== null ? `, ${t.tai_g} g` : ''}`
}

/* ── Kiểm tra trước khi nộp ────────────────────────────────────────────────── */

function loiLanThu(ds: LanThu[]): string[] {
  const loi: string[] = []
  if (!ds.length) loi.push('Cần ít nhất một lần thử.')
  ds.forEach((l) => {
    const t = `Lần ${l.lan}`
    if (so(l.tai_g) === null || (so(l.tai_g) ?? 0) < 0) loi.push(`${t}: nhập tải (g).`)
    if (so(l.giu_giay) === null || (so(l.giu_giay) ?? 0) < 0) loi.push(`${t}: nhập số giây giữ.`)
    if (!l.vi_tri) loi.push(`${t}: chọn vị trí đặt tải.`)
    if (!l.bien_dang) loi.push(`${t}: chọn chỗ biến dạng.`)
  })
  return loi
}
export function loiE4(d: NhapE4): string[] {
  const loi = loiLanThu(d.lan_thu)
  if (!d.thay_doi_so_voi_thiet_ke.trim()) loi.push('Viết điều em đã thay đổi so với thiết kế.')
  if (!d.nguyen_nhan_han_che.trim()) loi.push('Viết nguyên nhân hạn chế.')
  if (d.minh_chung_vien_dan === null) loi.push('Chọn lần thử làm minh chứng.')
  return loi
}
export function loiE5(d: NhapE5): string[] {
  const loi = loiLanThu(d.lan_thu)
  if (!d.thay_doi.length && !d.thay_doi_chu.trim()) loi.push('Chọn hoặc viết điều em thay đổi.')
  if (!d.nham_vao_nguyen_nhan) loi.push('Chọn nguyên nhân em nhắm vào.')
  if (so(d.du_doan_tai_moi_g) === null) loi.push('Nhập dự đoán tải mới (g).')
  if (!d.giai_thich.trim()) loi.push('Viết phần giải thích.')
  return loi
}

/* ── API ───────────────────────────────────────────────────────────────────── */

export interface PhieuDaNop {
  id: string
  loai: string
  chang: number
  noi_dung: Record<string, unknown>
  thay_the_cho: string | null
  thoi_diem: string
}

export async function layPhieuMoiNhat(): Promise<PhieuDaNop[]> {
  return (await request('/api/phieu/cua-toi?moi_nhat=true')).phieu
}
export async function layMoiPhieu(): Promise<PhieuDaNop[]> {
  return (await request('/api/phieu/cua-toi')).phieu
}

function dongLanThu(l: LanThu) {
  return { lan: l.lan, tai_g: so(l.tai_g), giu_giay: so(l.giu_giay), vi_tri: l.vi_tri || null, bien_dang: l.bien_dang || null, dang_hong: l.dang_hong || null, ghi_chu: l.ghi_chu.trim() || null }
}

/** lan_thu đi vào bảng lan_thu; noi_dung chỉ giữ bản tóm tắt để hiển thị lại. */
export async function nopE4(d: NhapE4, thay_the_cho: string | null) {
  return request('/api/phieu', {
    method: 'POST',
    body: JSON.stringify({
      loai: 'E4', chang: CHANG.E4, thay_the_cho,
      noi_dung: {
        phien_ban: 'v1', thay_doi_so_voi_thiet_ke: d.thay_doi_so_voi_thiet_ke.trim(), nguyen_nhan_han_che: d.nguyen_nhan_han_che.trim(),
        minh_chung_vien_dan: d.minh_chung_vien_dan, tom_tat_lan_thu: tomTat(d.lan_thu),
      },
      lan_thu: d.lan_thu.map(dongLanThu),
    }),
  })
}

export async function nopE5(d: NhapE5, e4: PhieuDaNop, v1: TomTatLanThu[], thay_the_cho: string | null) {
  const cl = chenhLech(v1, tomTat(d.lan_thu))
  return request('/api/phieu', {
    method: 'POST',
    body: JSON.stringify({
      loai: 'E5', chang: CHANG.E5, thay_the_cho,
      noi_dung: {
        phien_ban: 'v2', e4_phieu_id: e4.id, thay_doi: d.thay_doi, thay_doi_chu: d.thay_doi_chu.trim(),
        nham_vao_nguyen_nhan: d.nham_vao_nguyen_nhan, du_doan_tai_moi_g: so(d.du_doan_tai_moi_g), giai_thich: d.giai_thich.trim(),
        tom_tat_lan_thu: tomTat(d.lan_thu), chenh_lech: cl,
      },
      lan_thu: d.lan_thu.map(dongLanThu),
    }),
  })
}

/** Dựng lại lần thử từ bản tóm tắt trong noi_dung (nộp lại / xem lại). */
export function tuTomTat(ds: unknown): LanThu[] {
  if (!Array.isArray(ds)) return [lanThuTrong(1)]
  const x = (v: unknown) => (v === null || v === undefined ? '' : String(v))
  return ds.map((r: Record<string, unknown>, i) => ({ lan: Number(r.lan ?? i + 1), tai_g: x(r.tai_g), giu_giay: x(r.giu_giay), vi_tri: x(r.vi_tri), bien_dang: x(r.bien_dang), dang_hong: x(r.dang_hong), ghi_chu: '' }))
}
