/**
 * Bộ dựng hồ sơ cho các học sinh mẫu.
 * Mỗi hồ sơ sinh ra: minh chứng E1–E5 (cá nhân + cha nhóm), đánh giá M1–M4 do GV chốt,
 * và trạng thái SDT — tất cả liên kết id với nhau để truy vết chạy thật.
 */
import type {
  DanhGia, DoTinCay, MinhChung, TepDinhKem, TinhDocLap, TrangThaiChatLuong, TrangThaiSDT,
} from '../types'
import { CHI_BAO, RUBRIC_PHIEN_BAN } from './rubric'
import { HD_CUA_CHI_BAO } from './khbd'

export const T = (ngay: number, gio: string) => `2024-10-${String(ngay).padStart(2, '0')}T${gio}:00+07:00`

export const CHI_BAO_LOI_12 = ['A2.3', 'B1.2', 'B1.3', 'B2.1', 'B2.3', 'C1.3', 'C3.1', 'D1.2', 'D2.3', 'D3.2', 'D3.4', 'D4.2']
const HD_IDX: Record<string, number> = { 'HĐ1': 0, 'HĐ2': 1, 'HĐ3': 2, 'HĐ4': 3, 'HĐ5': 4 }
const MC_CUA: Record<string, string> = {
  'A2.3': 'E1', 'B1.2': 'E2', 'B1.3': 'E2', 'B2.1': 'E2', 'B2.3': 'E2', 'C1.3': 'E3',
  'C3.1': 'E4', 'D1.2': 'E4', 'D2.3': 'E4', 'D3.2': 'E5', 'D3.4': 'E5', 'D4.2': 'E5',
}
const NV_CUA: Record<string, string> = { E1: 'NV-1.3', E2: 'NV-2.3', E3: 'NV-3.3', E4: 'NV-4.4', E5: 'NV-5.1' }
const HD_CUA_MC: Record<string, number> = { E1: 0, E2: 1, E3: 2, E4: 3, E5: 4 }
/** Thời điểm nộp và thời điểm giáo viên đối chiếu, theo từng loại phiếu */
const NOP: Record<string, string> = { E1: T(10, '08:50'), E2: T(12, '14:32'), E3: T(13, '09:48'), E4: T(14, '10:20'), E5: T(15, '08:40') }
const CHAM: Record<string, string> = { E1: T(10, '11:05'), E2: T(15, '10:05'), E3: T(15, '11:20'), E4: T(15, '13:40'), E5: T(15, '15:10') }

export interface GhiDe {
  m?: 1 | 2 | 3 | 4 | null
  q?: TrangThaiChatLuong
  dl?: TinhDocLap
  tc?: DoTinCay
  ly?: string
  tiep?: string | null
  ht?: string | null           // id hỗ trợ → tính là sau hỗ trợ
}

export interface TuyChonHoSo {
  tienDo: string
  ghi?: Record<string, GhiDe>
  /** ghi đè nội dung/thuộc tính của minh chứng cá nhân theo loại phiếu */
  mc?: Record<string, Partial<MinhChung>>
}

const NOI_DUNG_MAC_DINH: Record<string, Record<string, unknown>> = {
  E1: { yeu_cau_do_kiem: [
    { yeu_cau: 'Cầu phải chắc', dai_luong: 'Tải lớn nhất giữ được 5 giây', cach_do: 'Tăng tải từng nấc 200 g đến khi mất ổn định' },
    { yeu_cau: 'Cầu không võng nhiều', dai_luong: 'Độ võng giữa nhịp (mm)', cach_do: 'Đo bằng thước tại mốc tải 400 g' },
  ] },
  E2: {
    mo_ta_hs: 'Nhóm em đã khảo sát năm cấu trúc giấy và chọn hai phương án để so sánh.',
    giai_thich: 'Gấp giấy làm mặt cắt cao lên nên khó uốn cong hơn; ở nhóm em tờ phẳng võng nhiều còn tờ gấp gần như không võng.',
    ham_y: 'Từ dòng "Dạng giàn 520 g, biến dạng 2,4 mm", em thấy nên dùng cấu trúc giàn tam giác để tăng độ cứng mà không tốn thêm giấy.',
    dong_du_lieu_vien_dan: ['r5'],
    du_doan: 'Phương án giàn tam giác sẽ chịu lực tốt hơn vì số liệu khảo sát cho thấy giàn có biến dạng nhỏ nhất.',
    phuong_an: [
      { ten: 'Phương án 1: Cầu giàn tam giác', kieu: 'truss', dac_diem: ['Cấu trúc tam giác lặp lại', 'Chiều cao 4 cm, dài 30 cm'], uu: ['Chịu lực tốt', 'Ổn định, ít biến dạng'], han_che: ['Tốn thời gian gấp', 'Nhiều vật liệu hơn'] },
      { ten: 'Phương án 2: Cầu vòm cong', kieu: 'arch', dac_diem: ['Cấu trúc vòm cong', 'Vòm cao 5 cm, dài 30 cm'], uu: ['Tiết kiệm vật liệu', 'Thẩm mỹ cao'], han_che: ['Khó đảm bảo độ chính xác', 'Khả năng chịu lực thấp hơn'] },
    ],
  },
  E3: { ly_do_ca_nhan: 'Em chọn phương án 1 vì trong ma trận, tiêu chí "độ võng" và "số mối dán" đều nghiêng về giàn tam giác; số liệu khảo sát cũng cho thấy dạng giàn chịu 520 g mà chỉ võng 2,4 mm.' },
  E4: { phan_tich: 'Cầu gãy ở thanh trên giữa nhịp khi tải 1200 g. Mối nối đã nứt từ nấc 1000 g, nên em cho rằng mối nối thanh trên là điểm yếu nhất.' },
  E5: { gia_thuyet: 'Gia cố mối nối thanh trên bằng một lớp băng dính, dự đoán tải tối đa ổn định tăng khoảng 200 g.' },
}

const TEP_MAC_DINH: Record<string, TepDinhKem[]> = {
  E1: [{ ten: 'Phieu_E1.pdf', loai: 'tai_lieu', dung_luong: '210 KB' }],
  E2: [{ ten: 'Phieu_E2.pdf', loai: 'tai_lieu', dung_luong: '310 KB' }],
  E3: [{ ten: 'Ly_do_chon_PA.docx', loai: 'tai_lieu', dung_luong: '120 KB' }],
  E4: [{ ten: 'Nhat_ky_thu_tai.docx', loai: 'tai_lieu', dung_luong: '420 KB' }],
  E5: [{ ten: 'Cai_tien_v2.docx', loai: 'tai_lieu', dung_luong: '260 KB' }],
}

export interface KetQuaHoSo { mc: MinhChung[]; dg: DanhGia[]; tt: TrangThaiSDT[] }

export function hoSo(hs: string, nhom: string, o: TuyChonHoSo): KetQuaHoSo {
  const mc: MinhChung[] = []
  const dg: DanhGia[] = []
  const tt: TrangThaiSDT[] = []
  const ghi = o.ghi ?? {}

  // ── minh chứng cá nhân ────────────────────────────────────────────────
  for (const e of ['E1', 'E2', 'E3', 'E4', 'E5']) {
    const k = o.tienDo[HD_CUA_MC[e]]
    if (k === '-') continue
    const ghiDe = o.mc?.[e] ?? {}
    const thieu = k === 't'
    const xem = k === 'v'
    mc.push({
      id: `${e}-${hs}-01`, ma_minh_chung: `${e}-${hs}-01`, phien_ban: 1,
      minh_chung_cha_id: e === 'E2' || e === 'E3' || e === 'E4' ? `${e}-${nhom}-01` : null,
      loai_chu_the: 'CA_NHAN', hoc_sinh_id: hs, nhom_id: null, nhiem_vu_id: NV_CUA[e], loai_minh_chung: e,
      noi_dung: thieu ? {} : NOI_DUNG_MAC_DINH[e], tep: thieu ? [] : TEP_MAC_DINH[e],
      nguoi_tao_id: hs, nhap_ho: false, thoi_diem: NOP[e],
      trang_thai: thieu ? 'THIEU_MINH_CHUNG' : xem ? 'CAN_XEM_XET' : 'HOP_LE',
      ly_do_trang_thai: thieu ? 'Các trường bắt buộc của phiếu còn trống.' : xem ? 'Chỉ có sản phẩm nhóm; phần lí do cá nhân còn trống nên chưa quy được cho cá nhân (MC02, CL05).' : null,
      boi_canh_ho_tro: thieu || xem ? 'KHONG_RO' : 'DOC_LAP', ho_tro_id: null, minh_chung_truoc_id: null,
      ...ghiDe,
    })
  }

  // ── đánh giá + trạng thái SDT theo 12 chỉ báo lõi ─────────────────────
  for (const cb of CHI_BAO_LOI_12) {
    const hd = HD_CUA_CHI_BAO[cb]
    const k = o.tienDo[HD_IDX[hd]]
    const e = MC_CUA[cb]
    const g = ghi[cb] ?? {}
    const mcId = `${e}-${hs}-01`
    const mcObj = mc.find((m) => m.id === mcId)

    let q: TrangThaiChatLuong
    let m: 1 | 2 | 3 | 4 | null
    if (g.q) q = g.q
    else if (k === 'x' || k === 'd' || k === 'c') q = mcObj ? 'HOP_LE' : 'KHONG_CO_CO_HOI'
    else if (k === 't') q = 'THIEU_MINH_CHUNG'
    else if (k === 'v') q = 'CAN_XEM_XET'
    else q = 'KHONG_CO_CO_HOI'

    if (q !== 'HOP_LE') m = null
    else if (g.m !== undefined) m = g.m
    else m = k === 'x' ? 3 : null

    const thoiDiem = CHAM[e]
    const coDanhGia = q === 'HOP_LE' && m !== null
    const idCha = mcObj?.minh_chung_cha_id
    if (coDanhGia) {
      dg.push({
        id: `DG-${hs}-${cb}`, hoc_sinh_id: hs, chi_bao: cb, muc: m!, rubric_id: RUBRIC_PHIEN_BAN,
        nguoi_danh_gia_id: 'GV01', thoi_diem: thoiDiem,
        minh_chung_ids: idCha ? [mcId, idCha] : [mcId], danh_gia_truoc_id: null,
        ly_do: g.ly ?? CHI_BAO[cb].mo_ta_muc[m!],
      })
    }
    const lyMacDinh =
      q === 'KHONG_CO_CO_HOI' ? 'Nhiệm vụ tạo cơ hội cho chỉ báo này chưa được mở hoặc chưa bắt đầu.'
      : q === 'THIEU_MINH_CHUNG' ? 'Có cơ hội thể hiện nhưng phiếu còn thiếu. Đây KHÔNG phải mức thấp — chưa đủ căn cứ để đánh giá.'
      : q === 'CAN_XEM_XET' ? 'Chỉ có sản phẩm nhóm, chưa quy được cho cá nhân. Chuyển giáo viên xem xét.'
      : coDanhGia ? CHI_BAO[cb].mo_ta_muc[m!] : 'Minh chứng hợp lệ, đang chờ giáo viên đối chiếu M1–M4.'
    const dl: TinhDocLap = g.dl ?? (q === 'HOP_LE' && m !== null ? 'DOC_LAP' : 'KHONG_RO')
    tt.push({
      id: `TT-${hs}-${cb}`, hoc_sinh_id: hs, chi_bao: cb, muc: m, trang_thai_chat_luong: q,
      tinh_doc_lap: g.ht ? 'CO_HO_TRO' : dl,
      do_tin_cay: g.tc ?? (q === 'HOP_LE' && m !== null ? 'TRUNG_BINH' : 'THAP'),
      danh_gia_id: coDanhGia ? `DG-${hs}-${cb}` : null, hoat_dong_pha: `${hd} – ${NV_CUA[e].replace('NV-', 'Pha ')}`,
      thoi_diem: thoiDiem, ly_do: g.ly ?? lyMacDinh,
      trang_thai_truoc_id: null, hanh_dong_tiep_theo: g.tiep ?? null, sau_ho_tro: !!g.ht,
    })
    if (g.ht && mcObj) { mcObj.boi_canh_ho_tro = 'CO_HO_TRO'; mcObj.ho_tro_id = g.ht }
  }
  return { mc, dg, tt }
}

/** Bộ tiêu chí của một sản phẩm nhóm (dùng cho mọi nhóm mẫu) */
export const KHAO_SAT_MAU = [
  { id: 'r1', cau_truc: 'Tờ giấy phẳng',         kieu: 'phang',   tai_g: 80,  bien_dang_mm: 12.5, nhan_xet: 'Dễ võng, khó chịu lực' },
  { id: 'r2', cau_truc: 'Gấp hình chữ U',        kieu: 'chuU',    tai_g: 220, bien_dang_mm: 6.8,  nhan_xet: 'Cứng hơn, ổn định' },
  { id: 'r3', cau_truc: 'Gấp hình hộp (tube)',   kieu: 'hop',     tai_g: 310, bien_dang_mm: 4.2,  nhan_xet: 'Chịu lực tốt, ít biến dạng' },
  { id: 'r4', cau_truc: 'Dạng tam giác',         kieu: 'tamgiac', tai_g: 380, bien_dang_mm: 3.1,  nhan_xet: 'Rất cứng, hiệu quả cao' },
  { id: 'r5', cau_truc: 'Dạng giàn (truss)',     kieu: 'gian',    tai_g: 520, bien_dang_mm: 2.4,  nhan_xet: 'Chịu lực tốt nhất' },
]

export const MA_TRAN_MAU = [
  { tieu_chi: 'Độ võng giữa nhịp', PA1: 'Tốt',   PA2: 'Trung bình' },
  { tieu_chi: 'Số mối dán',        PA1: 'Ít',    PA2: 'Nhiều' },
  { tieu_chi: 'Lượng giấy dùng',   PA1: 'Nhiều', PA2: 'Ít' },
]

export const NHAT_KY_THU_TAI_MAU = [
  { lan: 1, tai_g: 200,  vi_tri: 'Không có',            dang: 'Không có',            ghi_chu: 'Bình thường',                 loi: false },
  { lan: 2, tai_g: 400,  vi_tri: 'Không có',            dang: 'Không có',            ghi_chu: 'Bình thường',                 loi: false },
  { lan: 3, tai_g: 600,  vi_tri: 'Giữa nhịp',           dang: 'Cong nhẹ',            ghi_chu: 'Vẫn chịu được (đạt mốc 600 g)', loi: false },
  { lan: 4, tai_g: 800,  vi_tri: 'Giữa nhịp',           dang: 'Cong rõ',             ghi_chu: 'Xuất hiện biến dạng',         loi: false },
  { lan: 5, tai_g: 1000, vi_tri: 'Liên kết thanh trên', dang: 'Nứt giấy ở mối nối',  ghi_chu: 'Vẫn đứng vững',               loi: false },
  { lan: 6, tai_g: 1200, vi_tri: 'Giữa nhịp',           dang: 'Gãy thanh trên',      ghi_chu: 'Sụp đổ',                      loi: true  },
]

export function minhChungNhom(nhom: string): MinhChung[] {
  const chung = { minh_chung_cha_id: null, loai_chu_the: 'NHOM' as const, hoc_sinh_id: null, nhom_id: nhom, nhap_ho: false,
    trang_thai: 'HOP_LE' as const, ly_do_trang_thai: null, boi_canh_ho_tro: 'DOC_LAP' as const, ho_tro_id: null,
    minh_chung_truoc_id: null, phien_ban: 1 }
  return [
    { ...chung, id: `E2-${nhom}-01`, ma_minh_chung: `E2-${nhom}-01`, nhiem_vu_id: 'NV-2.1', loai_minh_chung: 'E2',
      noi_dung: { bang_khao_sat: KHAO_SAT_MAU, dieu_kien_thu: 'Nhịp 30 cm, tải đặt giữa nhịp, giữ 5 giây mỗi nấc, cùng loại giấy A4 80 gsm' },
      tep: [], nguoi_tao_id: nhom, thoi_diem: T(12, '10:30') },
    { ...chung, id: `E3-${nhom}-01`, ma_minh_chung: `E3-${nhom}-01`, nhiem_vu_id: 'NV-3.2', loai_minh_chung: 'E3',
      noi_dung: { ma_tran: MA_TRAN_MAU, phuong_an_chon: 'Phương án 1: Cầu giàn tam giác', danh_doi: 'Chấp nhận tốn giấy hơn để đổi lấy ít mối dán và độ võng nhỏ.' },
      tep: [], nguoi_tao_id: nhom, thoi_diem: T(13, '09:30') },
    { ...chung, id: `E4-${nhom}-01`, ma_minh_chung: `E4-${nhom}-01`, nhiem_vu_id: 'NV-4.3', loai_minh_chung: 'E4',
      noi_dung: {
        nhat_ky: NHAT_KY_THU_TAI_MAU, dieu_kien_thu: 'Tăng tải từng nấc 200 g, giữ 5 giây mỗi nấc, tải đặt giữa nhịp', tai_toi_da_on_dinh_g: 1000,
        // Số liệu GV/nhóm ghi khi kiểm tra sản phẩm trước thử tải — dùng để TÍNH tiêu chí sản phẩm (không viết cứng kết quả)
        vat_lieu_dung: { giay_to: 5, bang_dinh_cm: 58 },
        kiem_tra_tc: { TC01: true, TC02: true, TC05: true, TC11: true },
      },
      tep: [
        { ten: 'cau_giay_thanh_pham.jpg', loai: 'anh', dung_luong: '1.4 MB', mo_ta: 'Sản phẩm đã chế tạo', kieu: 'arch', tone: 'light' },
        { ten: 'cau_giay_mat_ben.jpg', loai: 'anh', dung_luong: '1.1 MB', mo_ta: 'Nhìn nghiêng', kieu: 'arch', tone: 'dark' },
        { ten: 'moi_noi_thanh_tren.jpg', loai: 'anh', dung_luong: '0.9 MB', mo_ta: 'Mối nối thanh trên', kieu: 'truss', tone: 'light' },
      ],
      nguoi_tao_id: nhom, thoi_diem: T(14, '10:00') },
  ]
}
