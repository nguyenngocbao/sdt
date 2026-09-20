/**
 * Các phép TÍNH tổng hợp từ đồ thị dữ liệu: tiến độ, thống kê lớp, danh sách ca hỗ trợ…
 * Mọi số hiển thị trên bảng điều khiển đều đi qua đây — không viết cứng.
 */
import type { HocSinh, HoTro, MaHD, MinhChung, TrangThaiSDT } from '../types'
import type { DuLieu } from './trace'
import { trangThaiMoiNhat } from './trace'
import { HOAT_DONG, soNhiemVu } from '../data/khbd'
import { CHI_BAO_LOI_12 } from '../data/builders'

// ── Trạng thái tổng của một học sinh ────────────────────────────────────────
export type NhanTong = 'HOAN_THANH' | 'DANG' | 'THIEU' | 'XEM_XET' | 'CHO' | 'CHUA'

export const TEN_NHAN_TONG: Record<NhanTong, string> = {
  HOAN_THANH: 'Hoàn thành', DANG: 'Đang thực hiện', THIEU: 'Thiếu minh chứng',
  XEM_XET: 'Cần xem xét', CHO: 'Chờ quyết định', CHUA: 'Chưa bắt đầu',
}

export function nhanTong(d: DuLieu, hs: HocSinh): NhanTong {
  const k = hs.tien_do
  const tt = d.trang_thai.filter((t) => t.hoc_sinh_id === hs.id)
  const hoTro = d.ho_tro.filter((h) => h.hoc_sinh_id === hs.id)
  const thieu = k.includes('t') || hoTro.some((h) => h.trang_thai_duyet === 'BO_SUNG')
  const xem = k.includes('v') || tt.some((t) => t.trang_thai_chat_luong === 'CAN_XEM_XET')
  const cho = k.includes('c') || hoTro.some((h) => h.trang_thai_duyet === 'CHO_DUYET')
  if (thieu) return 'THIEU'
  if (xem) return 'XEM_XET'
  if (cho) return 'CHO'
  if ([...k].every((c) => c === 'x')) return 'HOAN_THANH'
  if ([...k].every((c) => c === '-')) return 'CHUA'
  return 'DANG'
}

const TRONG_SO: Record<string, number> = { x: 1, c: 1, v: 1, d: 0.5, t: 0.5, '-': 0 }
export const phanTramTienDo = (hs: HocSinh) =>
  Math.round(([...hs.tien_do].reduce((s, c) => s + (TRONG_SO[c] ?? 0), 0) / 5) * 100)

// ── Tiến độ theo hoạt động ─────────────────────────────────────────────────
export type TrangThaiHD = 'XONG' | 'DANG' | 'CHUA' | 'THIEU' | 'XEM_XET' | 'CHO'
const MAP_HD: Record<string, TrangThaiHD> = { x: 'XONG', d: 'DANG', '-': 'CHUA', t: 'THIEU', v: 'XEM_XET', c: 'CHO' }
export const TEN_TRANG_THAI_HD: Record<TrangThaiHD, string> = {
  XONG: 'Hoàn thành', DANG: 'Đang thực hiện', CHUA: 'Chưa bắt đầu',
  THIEU: 'Thiếu minh chứng', XEM_XET: 'Cần xem xét', CHO: 'Đã nộp, chờ giáo viên',
}

export interface TienDoHD { ma: MaHD; ten: string; trang_thai: TrangThaiHD; xong: number; tong: number; pct: number }

/** Tiến độ CỦA CHÍNH học sinh (không so với bạn khác) */
export function tienDoHocSinh(hs: HocSinh): TienDoHD[] {
  return HOAT_DONG.map((h, i) => {
    const k = hs.tien_do[i]
    const tong = soNhiemVu(h.ma)
    const xong = k === 'x' || k === 'c' || k === 'v' ? tong : k === 'd' ? Math.ceil(tong / 2) : k === 't' ? Math.max(tong - 1, 0) : 0
    return { ma: h.ma, ten: h.ten, trang_thai: MAP_HD[k], xong, tong, pct: Math.round((xong / tong) * 100) }
  })
}

// ── Thống kê lớp ───────────────────────────────────────────────────────────
export interface ThongKeLop {
  tong: number
  hd: { ma: MaHD; ten: string; xong: number; pct: number }[]
  thieu: HocSinh[]; xemXet: HocSinh[]; cho: HocSinh[]; tot: HocSinh[]
  tongTienDo: number
}

export function thongKeLop(d: DuLieu): ThongKeLop {
  const hs = d.hoc_sinh
  const nhan = new Map(hs.map((h) => [h.id, nhanTong(d, h)]))
  const loc = (n: NhanTong) => hs.filter((h) => nhan.get(h.id) === n)
  const hd = HOAT_DONG.map((h, i) => {
    const xong = hs.filter((s) => s.tien_do[i] === 'x').length
    return { ma: h.ma, ten: h.ten, xong, pct: Math.round((xong / hs.length) * 100) }
  })
  const daNop = hs.filter((s) => s.tien_do[0] === 'x').length
  return {
    tong: hs.length, hd,
    thieu: loc('THIEU'), xemXet: loc('XEM_XET'), cho: loc('CHO'),
    tot: hs.filter((h) => ['HOAN_THANH', 'DANG'].includes(nhan.get(h.id)!)),
    tongTienDo: Math.round((daNop / hs.length) * 100),
  }
}

// ── 12 chỉ báo lõi của một học sinh ────────────────────────────────────────
export interface DongChiBao { ma: string; tt: TrangThaiSDT | null }

export const chiBaoLoiHocSinh = (d: DuLieu, hsId: string): DongChiBao[] =>
  CHI_BAO_LOI_12.map((ma) => ({ ma, tt: trangThaiMoiNhat(d, hsId, ma) }))

export interface DemChiBao { docLap: number; coHoTro: number; canXemXet: number; thieu: number; khongCoHoi: number; choDanhGia: number }

export function demChiBao(ds: DongChiBao[]): DemChiBao {
  const r: DemChiBao = { docLap: 0, coHoTro: 0, canXemXet: 0, thieu: 0, khongCoHoi: 0, choDanhGia: 0 }
  for (const { tt } of ds) {
    if (!tt) { r.khongCoHoi++; continue }
    if (tt.trang_thai_chat_luong === 'CAN_XEM_XET') r.canXemXet++
    else if (tt.trang_thai_chat_luong === 'THIEU_MINH_CHUNG') r.thieu++
    else if (tt.trang_thai_chat_luong === 'KHONG_CO_CO_HOI') r.khongCoHoi++
    else if (tt.muc === null) r.choDanhGia++
    else if (tt.tinh_doc_lap === 'CO_HO_TRO') r.coHoTro++
    else r.docLap++
  }
  return r
}

/** Chỉ báo có đủ căn cứ = đã có mức do giáo viên chốt trên minh chứng hợp lệ */
export const soChiBaoCoCanCu = (ds: DongChiBao[]) => ds.filter((x) => x.tt?.muc != null).length

// ── Ca hỗ trợ cho Cổng quyết định (S14) ────────────────────────────────────
export interface CaHoTro { ho_tro: HoTro; hoc_sinh: HocSinh; minh_chung: MinhChung | null; co_quyet_dinh: boolean }

export function danhSachCa(d: DuLieu): CaHoTro[] {
  return d.ho_tro
    .filter((h) => h.trang_thai_duyet === 'CHO_DUYET' || h.trang_thai_duyet === 'BO_SUNG' || d.quyet_dinh.some((q) => q.ho_tro_id === h.id))
    .map((ho_tro) => ({
      ho_tro,
      hoc_sinh: d.hoc_sinh.find((s) => s.id === ho_tro.hoc_sinh_id)!,
      minh_chung: ho_tro.minh_chung_id ? d.minh_chung.find((m) => m.id === ho_tro.minh_chung_id) ?? null : null,
      co_quyet_dinh: d.quyet_dinh.some((q) => q.ho_tro_id === ho_tro.id),
    }))
    .sort((a, b) => b.ho_tro.thoi_diem.localeCompare(a.ho_tro.thoi_diem))
}

/** Phiên bản mới nhất của minh chứng cá nhân theo nhiệm vụ */
export function minhChungMoiNhat(d: DuLieu, hsId: string, nhiemVuId: string): MinhChung | null {
  return d.minh_chung
    .filter((m) => m.hoc_sinh_id === hsId && m.nhiem_vu_id === nhiemVuId)
    .sort((a, b) => b.phien_ban - a.phien_ban)[0] ?? null
}

/** Chuỗi các phiên bản của một minh chứng (cũ → mới) */
export function chuoiPhienBan(d: DuLieu, m: MinhChung): MinhChung[] {
  const goc: MinhChung[] = [m]
  let cur: MinhChung | undefined = m
  while (cur?.minh_chung_truoc_id) {
    cur = d.minh_chung.find((x) => x.id === cur!.minh_chung_truoc_id)
    if (cur) goc.unshift(cur)
  }
  return goc
}

/**
 * Hỗ trợ ĐÃ được giáo viên duyệt mà học sinh chưa nộp lại minh chứng hậu kiểm.
 * Đây là thứ đứng sau thông báo "Em có gợi ý mới" và mục việc cần làm ở màn học sinh.
 */
export function hoTroChoChinhBai(d: DuLieu, hsId: string): HoTro[] {
  return d.ho_tro.filter((h) => {
    if (h.hoc_sinh_id !== hsId || h.trang_thai_duyet !== 'DA_DUYET' || !h.minh_chung_id || !h.nhiem_vu_hau_kiem_id) return false
    const goc = d.minh_chung.find((m) => m.id === h.minh_chung_id)
    if (!goc) return false
    const daNopLai = d.minh_chung.some((m) => m.hoc_sinh_id === hsId && m.nhiem_vu_id === goc.nhiem_vu_id && m.phien_ban > goc.phien_ban && m.thoi_diem > h.thoi_diem)
    return !daNopLai
  })
}
