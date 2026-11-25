import { request } from '../lib/auth'
import { HOC_LIEU_TRUOC_LOP } from './khbd'
import { CHANG, VI_TRI, type PhieuDaNop } from './phieu'

/* Phiếu P0, E1, E2, E3, P1 khai báo bằng MẪU: một mẫu = danh sách trường.
 * Một form dùng chung (FormTheoMau) vẽ, kiểm tra, lưu nháp và nộp mọi mẫu.
 * Khoá trong noi_dung = khoá trường, để nộp lại điền sẵn được bản cũ.
 * E4, E5 vẫn dùng form riêng vì có bảng lần thử đi vào bảng lan_thu. */

export type LoaiTheoMau = 'P0' | 'E1' | 'E2' | 'E3' | 'P1'

export interface Cot { k: string; nhan: string; kieu: 'chu' | 'so' | 'chon'; ds?: readonly string[]; donVi?: string }

export type Truong =
  | { k: string; nhan: string; phu?: string; kieu: 'doan'; batBuoc?: boolean; dong?: number }
  | { k: string; nhan: string; phu?: string; kieu: 'so'; donVi: string; batBuoc?: boolean }
  | { k: string; nhan: string; phu?: string; kieu: 'chon'; ds: readonly string[]; nhieu?: boolean; batBuoc?: boolean }
  | { k: string; nhan: string; phu?: string; kieu: 'bang'; cot: Cot[]; toiThieu: number; tenDong: string }

export type Dong = Record<string, string>
export type GiaTri = string | string[] | Dong[]
export type DuLieu = Record<string, GiaTri>

export interface MauPhieu {
  loai: LoaiTheoMau
  ten: string
  /** Hoạt động và tiết theo KHBD, hiện trên thẻ phiếu. */
  hoatDong: string
  /** Một câu cho em biết phiếu này dùng để làm gì. */
  huongDan: string
  truong: Truong[]
  /** Trường suy ra thêm khi nộp (để các màn khác hiển thị), không thay khoá gốc. */
  them?: (d: DuLieu) => Record<string, unknown>
}

/** Năm kết cấu giấy, khớp hình minh hoạ KetCauGiay (phang, chuU, hop, tamgiac, gian). */
export const KET_CAU = ['tấm phẳng', 'gấp chữ U', 'cuộn hộp', 'gấp tam giác', 'giàn'] as const
const KIEU_KET_CAU: Record<string, string> = { 'tấm phẳng': 'phang', 'gấp chữ U': 'chuU', 'cuộn hộp': 'hop', 'gấp tam giác': 'tamgiac', 'giàn': 'gian' }
export const MUC_DAT = ['Tốt', 'Đạt', 'Chưa đạt'] as const

const dongs = (d: DuLieu, k: string) => (Array.isArray(d[k]) ? (d[k] as Dong[]) : [])

export const MAU: Record<LoaiTheoMau, MauPhieu> = {
  P0: {
    loai: 'P0', ten: 'Phiếu P0 — Tự học trước lớp', hoatDong: 'Trước tiết 1',
    huongDan: 'Làm ở nhà sau khi xem học liệu thầy cô gửi.',
    truong: [
      { k: 'da_xem', nhan: 'Em đã xem những học liệu nào?', kieu: 'chon', nhieu: true, batBuoc: true, ds: HOC_LIEU_TRUOC_LOP.map((h) => h.ten) },
      { k: 'tieu_chi_khac_rang_buoc', nhan: 'Tiêu chí và ràng buộc khác nhau thế nào?', phu: 'cho một ví dụ với cây cầu giấy', kieu: 'doan', batBuoc: true },
      { k: 'du_doan_ket_cau', nhan: 'Trước khi thử, em đoán kết cấu giấy nào chịu tải tốt nhất?', kieu: 'chon', ds: KET_CAU, batBuoc: true },
      { k: 'thac_mac', nhan: 'Điều em còn thắc mắc', phu: '(không bắt buộc)', kieu: 'doan', dong: 2 },
    ],
  },
  E1: {
    loai: 'E1', ten: 'Phiếu E1 — Yêu cầu thiết kế', hoatDong: 'HĐ1 · Tiết 1',
    huongDan: 'Xác định vấn đề, tách tiêu chí với ràng buộc, rồi biến ít nhất một yêu cầu thành thứ đo được.',
    truong: [
      { k: 'van_de', nhan: 'Vấn đề cần giải quyết là gì?', kieu: 'doan', batBuoc: true },
      { k: 'tieu_chi', nhan: 'Tiêu chí', phu: 'điều cây cầu cần đạt, mỗi dòng một ý', kieu: 'doan', batBuoc: true },
      { k: 'rang_buoc', nhan: 'Ràng buộc', phu: 'giới hạn không được vượt, mỗi dòng một ý', kieu: 'doan', batBuoc: true },
      { k: 'yeu_cau_do_kiem', nhan: 'Yêu cầu → cách đo, kiểm', phu: 'ít nhất một yêu cầu', kieu: 'bang', toiThieu: 1, tenDong: 'Yêu cầu',
        cot: [{ k: 'yeu_cau', nhan: 'Yêu cầu', kieu: 'chu' }, { k: 'dai_luong', nhan: 'Đại lượng đo', kieu: 'chu' }, { k: 'cach_do', nhan: 'Cách đo hoặc kiểm', kieu: 'chu' }] },
    ],
  },
  E2: {
    loai: 'E2', ten: 'Phiếu E2 — Khảo sát và phương án', hoatDong: 'HĐ2 · Tiết 1–2',
    huongDan: 'Thử các kết cấu giấy trong cùng điều kiện, rút ra hàm ý, phác hai phương án và dự đoán cây cầu của em.',
    truong: [
      { k: 'bang_khao_sat', nhan: 'Bảng khảo sát kết cấu giấy', phu: 'ít nhất hai mẫu', kieu: 'bang', toiThieu: 2, tenDong: 'Mẫu thử',
        cot: [{ k: 'cau_truc', nhan: 'Kết cấu', kieu: 'chon', ds: KET_CAU }, { k: 'tai_g', nhan: 'Tải', kieu: 'so', donVi: 'g' },
          { k: 'bien_dang_mm', nhan: 'Biến dạng', kieu: 'so', donVi: 'mm' }, { k: 'nhan_xet', nhan: 'Nhận xét', kieu: 'chu' }] },
      { k: 'dieu_kien_thu', nhan: 'Điều kiện thử', phu: 'giống nhau cho mọi mẫu', kieu: 'doan', batBuoc: true, dong: 2 },
      { k: 'giai_thich', nhan: 'Vì sao các kết cấu chịu tải khác nhau?', phu: 'hình dạng – độ cứng – tải – biến dạng', kieu: 'doan', batBuoc: true },
      { k: 'ham_y', nhan: 'Từ số liệu trên, em rút ra điều gì cho thiết kế cầu?', phu: 'nói rõ dựa vào mẫu thử nào', kieu: 'doan', batBuoc: true },
      { k: 'phuong_an', nhan: 'Các phương án em đề xuất', phu: 'ít nhất hai, khác nhau về kết cấu', kieu: 'bang', toiThieu: 2, tenDong: 'Phương án',
        cot: [{ k: 'ten', nhan: 'Tên phương án', kieu: 'chu' }, { k: 'cau_truc', nhan: 'Kết cấu chính', kieu: 'chon', ds: KET_CAU },
          { k: 'uu', nhan: 'Ưu điểm dự đoán', kieu: 'chu' }, { k: 'han_che', nhan: 'Hạn chế dự đoán', kieu: 'chu' }] },
      { k: 'du_doan_tai_g', nhan: 'Em dự đoán cây cầu của em chịu được bao nhiêu?', kieu: 'so', donVi: 'g', batBuoc: true },
      { k: 'cho_doan_yeu', nhan: 'Em đoán cầu sẽ yếu nhất ở chỗ nào?', kieu: 'chon', ds: VI_TRI, batBuoc: true },
    ],
    // Các màn xem lại và luật N4.2/N4.3 đọc những khoá này.
    them: (d) => ({
      bang_khao_sat: dongs(d, 'bang_khao_sat').map((r, i) => ({ id: `r${i + 1}`, ...r, kieu: KIEU_KET_CAU[r.cau_truc], tai_g: so(r.tai_g), bien_dang_mm: so(r.bien_dang_mm) })),
      phuong_an: dongs(d, 'phuong_an').map((r) => ({ ten: r.ten, cau_truc: r.cau_truc, kieu: KIEU_KET_CAU[r.cau_truc], uu: [r.uu], han_che: [r.han_che] })),
    }),
  },
  E3: {
    loai: 'E3', ten: 'Phiếu E3 — Ma trận quyết định', hoatDong: 'HĐ3 · Tiết 2',
    huongDan: 'Nhóm so hai phương án theo từng tiêu chí rồi chốt; phần lí do mỗi em tự viết.',
    truong: [
      { k: 'ma_tran', nhan: 'So sánh hai phương án theo tiêu chí', phu: 'lấy tiêu chí từ phiếu E1', kieu: 'bang', toiThieu: 3, tenDong: 'Tiêu chí',
        cot: [{ k: 'tieu_chi', nhan: 'Tiêu chí', kieu: 'chu' }, { k: 'PA1', nhan: 'Phương án 1', kieu: 'chon', ds: MUC_DAT }, { k: 'PA2', nhan: 'Phương án 2', kieu: 'chon', ds: MUC_DAT }] },
      { k: 'phuong_an_chon', nhan: 'Nhóm chọn phương án nào?', kieu: 'chon', ds: ['Phương án 1', 'Phương án 2'], batBuoc: true },
      { k: 'danh_doi', nhan: 'Nhóm chấp nhận đánh đổi điều gì?', kieu: 'doan', batBuoc: true, dong: 2 },
      { k: 'ly_do_ca_nhan', nhan: 'Lí do của riêng em', phu: 'dựa vào tiêu chí nào?', kieu: 'doan', batBuoc: true },
    ],
  },
  P1: {
    loai: 'P1', ten: 'Phiếu P1 — Phản tư và nhiệm vụ chuyển giao', hoatDong: 'Cuối tiết 4',
    huongDan: 'Nhìn lại cả chủ đề và thử áp dụng cách làm vào một sản phẩm khác.',
    truong: [
      { k: 'dieu_hoc_duoc', nhan: 'Qua chủ đề này, em học được gì về cách thiết kế một sản phẩm?', kieu: 'doan', batBuoc: true },
      { k: 'lam_khac', nhan: 'Nếu làm lại từ đầu, em sẽ làm khác điều gì? Vì sao?', kieu: 'doan', batBuoc: true },
      { k: 'chuyen_giao', nhan: 'Chọn một vật dụng khác (kệ sách, giá đỡ điện thoại…). Em sẽ áp dụng quy trình thiết kế vào đó thế nào?', kieu: 'doan', batBuoc: true },
    ],
  },
}

/* ── Dữ liệu form ──────────────────────────────────────────────────────────── */

const so = (v: unknown) => (typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v)) ? Number(v) : null)
const dongTrong = (cot: Cot[]): Dong => Object.fromEntries(cot.map((c) => [c.k, '']))

export function duLieuTrong(m: MauPhieu): DuLieu {
  return Object.fromEntries(m.truong.map((t) => [t.k,
    t.kieu === 'bang' ? Array.from({ length: t.toiThieu }, () => dongTrong(t.cot)) : t.kieu === 'chon' && t.nhieu ? [] : '']))
}

/** Đọc lại bản đã nộp để nộp lại: mảng một phần tử (uu, han_che) và số được đổi về chữ. */
export function tuPhieu(m: MauPhieu, p: PhieuDaNop): DuLieu {
  const n = p.noi_dung
  const chu = (v: unknown) => (v === null || v === undefined ? '' : Array.isArray(v) ? v.join('; ') : String(v))
  return Object.fromEntries(m.truong.map((t) => {
    const v = n[t.k]
    if (t.kieu === 'bang') {
      const ds = Array.isArray(v) ? (v as Record<string, unknown>[]) : []
      return [t.k, ds.length ? ds.map((r) => Object.fromEntries(t.cot.map((c) => [c.k, chu(r[c.k])]))) : duLieuTrong(m)[t.k]]
    }
    if (t.kieu === 'chon' && t.nhieu) return [t.k, Array.isArray(v) ? v.map(String) : []]
    return [t.k, chu(v)]
  }))
}

export function kiemTra(m: MauPhieu, d: DuLieu): string[] {
  const loi: string[] = []
  for (const t of m.truong) {
    const v = d[t.k]
    if (t.kieu === 'bang') {
      const du = (v as Dong[]).filter((r) => t.cot.every((c) => (c.kieu === 'so' ? so(r[c.k]) !== null : (r[c.k] ?? '').trim() !== '')))
      const doDang = (v as Dong[]).filter((r) => !du.includes(r) && t.cot.some((c) => (r[c.k] ?? '').trim() !== ''))
      if (du.length < t.toiThieu) loi.push(`${t.nhan}: cần ít nhất ${t.toiThieu} dòng điền đủ các cột.`)
      else if (doDang.length) loi.push(`${t.nhan}: còn ${doDang.length} dòng điền dở; điền nốt hoặc xoá dòng đó.`)
    } else if ('batBuoc' in t && t.batBuoc) {
      const rong = Array.isArray(v) ? v.length === 0 : t.kieu === 'so' ? so(v) === null : !String(v ?? '').trim()
      if (rong) loi.push(`${t.nhan}: ${t.kieu === 'chon' ? 'hãy chọn' : 'hãy điền'}.`)
    }
  }
  return loi
}

/** noi_dung gửi lên: khoá gốc của từng trường (số đổi thành số, dòng trống bỏ đi) + trường suy ra. */
export function raNoiDung(m: MauPhieu, d: DuLieu): Record<string, unknown> {
  const goc: Record<string, unknown> = {}
  for (const t of m.truong) {
    const v = d[t.k]
    if (t.kieu === 'bang') {
      goc[t.k] = (v as Dong[]).filter((r) => t.cot.some((c) => (r[c.k] ?? '').trim() !== ''))
        .map((r) => Object.fromEntries(t.cot.map((c) => [c.k, c.kieu === 'so' ? so(r[c.k]) : (r[c.k] ?? '').trim()])))
    } else if (t.kieu === 'so') goc[t.k] = so(v)
    else goc[t.k] = Array.isArray(v) ? v : String(v ?? '').trim()
  }
  return { ...goc, ...(m.them?.(goc as DuLieu) ?? {}) }
}

export async function nopTheoMau(m: MauPhieu, d: DuLieu, thay_the_cho: string | null) {
  return request('/api/phieu', {
    method: 'POST',
    body: JSON.stringify({ loai: m.loai, chang: CHANG[m.loai], thay_the_cho, noi_dung: raNoiDung(m, d) }),
  })
}
