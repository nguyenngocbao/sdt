/**
 * Kiểu dữ liệu phản chiếu requirements/SCHEMA-du-lieu.md.
 * Giữ đúng tên trường để khi thay seed bằng DB thật, UI không phải sửa.
 */

/** 4 trạng thái chất lượng minh chứng — SDT.docx mục 11, KHBD mục A.3 */
export type TrangThaiChatLuong = 'KHONG_CO_CO_HOI' | 'THIEU_MINH_CHUNG' | 'CAN_XEM_XET' | 'HOP_LE'
/** Bối cảnh hỗ trợ — KHBD MC05 */
export type TinhDocLap = 'DOC_LAP' | 'CO_HO_TRO' | 'KHONG_RO'
export type DoTinCay = 'THAP' | 'TRUNG_BINH' | 'CAO'
export type LoaiChuThe = 'CA_NHAN' | 'NHOM'
export type VaiTro = 'HOC_SINH' | 'GIAO_VIEN' | 'QUAN_TRI'
export type MucHoTro = 'NHE' | 'SAU'
export type MaHD = 'HĐ1' | 'HĐ2' | 'HĐ3' | 'HĐ4' | 'HĐ5'

/**
 * Trạng thái một hoạt động của học sinh (1 ký tự, dùng cho bảng theo dõi lớp):
 * x xong · d đang làm · - chưa bắt đầu · t thiếu minh chứng · v cần xem xét · c chờ giáo viên
 */
export type KyHieuTienDo = 'x' | 'd' | '-' | 't' | 'v' | 'c'

export interface HocSinh {
  id: string            // mã nghiên cứu, vd 'HS0812'
  ho_ten: string        // chỉ hiển thị cho GV; không vào dữ liệu phân tích
  lop: string
  nhom_id: string
  email: string
  tien_do: string       // 5 ký tự KyHieuTienDo, theo HĐ1..HĐ5
  co_ho_so: boolean     // demo có hồ sơ chi tiết (đồ thị dữ liệu đầy đủ)
}

export interface Nhom { id: string; ten: string; thanh_vien: string[]; truong_nhom_id: string }

export interface NhiemVu {
  id: string
  hoat_dong_pha: string           // 'HĐ2 – Pha 2.3'
  ten: string
  mo_ta: string
  chi_bao_co_hoi: string[]        // chỉ báo mà nhiệm vụ này thực sự tạo cơ hội
  da_mo: boolean
}

export interface TepDinhKem {
  ten: string
  loai: 'anh' | 'video' | 'tai_lieu'
  dung_luong: string
  mo_ta?: string
  kieu?: 'truss' | 'arch' | 'box' | 'plank'
  tone?: 'light' | 'dark' | 'wood'
}

export interface MinhChung {
  id: string
  ma_minh_chung: string
  phien_ban: number
  minh_chung_cha_id: string | null    // con cá nhân trỏ về cha nhóm
  loai_chu_the: LoaiChuThe
  hoc_sinh_id: string | null
  nhom_id: string | null
  nhiem_vu_id: string
  loai_minh_chung: string             // 'E1'..'E5' | 'P0' | 'P1'
  noi_dung: Record<string, unknown>
  tep: TepDinhKem[]
  nguoi_tao_id: string
  nhap_ho: boolean
  thoi_diem: string
  trang_thai: TrangThaiChatLuong
  ly_do_trang_thai: string | null
  boi_canh_ho_tro: TinhDocLap
  ho_tro_id: string | null
  minh_chung_truoc_id: string | null
}

export interface DanhGia {
  id: string
  hoc_sinh_id: string
  chi_bao: string
  muc: 1 | 2 | 3 | 4
  rubric_id: string
  nguoi_danh_gia_id: string           // LUÔN là GV — AI không bao giờ ghi vào đây
  ly_do: string
  thoi_diem: string
  minh_chung_ids: string[]
  danh_gia_truoc_id: string | null
}

export interface TrangThaiSDT {
  id: string
  hoc_sinh_id: string
  chi_bao: string
  muc: 1 | 2 | 3 | 4 | null           // NULL khi chưa đủ căn cứ
  trang_thai_chat_luong: TrangThaiChatLuong
  tinh_doc_lap: TinhDocLap
  do_tin_cay: DoTinCay
  danh_gia_id: string | null
  hoat_dong_pha: string
  ly_do: string
  trang_thai_truoc_id: string | null
  hanh_dong_tiep_theo: string | null
  thoi_diem: string
  sau_ho_tro: boolean
}

export interface DieuKienLoaiTru {
  mo_ta: string
  da_kiem: boolean
  ket_qua: 'KHONG_AP_DUNG' | 'AP_DUNG'   // AP_DUNG = loại trừ được kích hoạt → huỷ chẩn đoán
}

export interface ChanDoan {
  id: string
  ma_mau: string                      // 'P01'
  phien_ban_catalog: string
  hoc_sinh_id: string
  gia_thuyet: string
  chi_bao_lien_quan: string[]
  trang_thai_ids: string[]
  minh_chung_ids: string[]
  do_tin_cay: DoTinCay
  dieu_kien_loai_tru: DieuKienLoaiTru[]
  thoi_diem: string
}

export interface GoiYAI {
  id: string
  chan_doan_id: string
  phien_ban_mau: string               // phiên bản template, KHÔNG phải mô hình sinh tự do
  ban_nhap: string
  ban_sau_chinh: string | null
  mau_chi_so: number                  // đang dùng câu hỏi thứ mấy trong danh sách mẫu
}

export type LoaiHoTro = 'PHUONG_PHAP' | 'KY_THUAT' | 'BO_SUNG' | 'TAI_LIEU' | 'GIAI_THICH' | 'LAM_RO' | 'GOI_Y_Y_TUONG'
export type UuTien = 'CAO' | 'TB' | 'THAP'

export interface HoTro {
  id: string
  chan_doan_id: string | null
  hoc_sinh_id: string
  muc_ho_tro: MucHoTro
  cap: 1 | 2 | 3                      // 1 nhắc quy trình · 2 gợi mở · 3 hướng dẫn từng bước (qua GV)
  loai: LoaiHoTro
  nguon: 'AI' | 'GV'
  noi_dung: string
  goi_y_ai_id: string | null
  trang_thai_duyet: 'CHO_DUYET' | 'DA_DUYET' | 'TU_CHOI' | 'BO_SUNG'
  uu_tien: UuTien
  nhiem_vu_id: string
  minh_chung_id: string | null        // sản phẩm minh chứng đang được xem xét
  nhiem_vu_hau_kiem_id: string | null
  ket_qua: string | null              // ghi nhận sau hỗ trợ
  thoi_diem: string
}

export interface QuyetDinhGV {
  id: string
  ho_tro_id: string | null
  chan_doan_id: string | null
  nguoi_thuc_hien_id: string
  quyet_dinh: 'DUYET' | 'SUA' | 'TU_CHOI' | 'YEU_CAU_THEM_MINH_CHUNG'
  ly_do: string                       // BẮT BUỘC — F10
  gia_tri_truoc: string | null
  gia_tri_sau: string | null
  thoi_diem: string
}

/** Quan sát trực tiếp của giáo viên — KHBD A.4 (QS01–QS08): mô tả hành vi, không gắn nhãn */
export interface QuanSat {
  id: string
  hoc_sinh_id: string | null
  nhom_id: string | null
  hoat_dong_pha: string
  chi_bao: string[]                   // tối đa 2 (QS05)
  mo_ta: string
  muc_ho_tro: 'KHONG' | 'GOI_MO' | 'CHI_DAN' | 'MANH'
  nguoi_quan_sat: string
  thoi_diem: string
}

/** Trao đổi gắn với MỘT minh chứng (không phải hộp trò chuyện tự do) */
export interface TraoDoi {
  id: string
  minh_chung_id: string
  tac_gia: string
  vai_tro: 'GV' | 'HS'
  tieu_de?: string
  noi_dung: string
  thoi_diem: string
}

export interface AnhXaHD {
  hd: MaHD
  ten: string
  chi_bao: string[]
  minh_chung: string
  quy_tac: string
}

export interface PhienBanCauHinh {
  id: string                          // 'v1.0'
  khoa: boolean                       // đã khoá → không sửa được, chỉ nhân bản
  hien_tai: boolean
  nguoi: string
  thoi_diem: string
  ghi_chu: string
  anh_xa: AnhXaHD[]
}

export interface BanGhiXuat {
  id: string
  thoi_diem: string
  nguoi: string
  pham_vi: string
  loai: string
  dinh_dang: string
  so_ban_ghi: number
  muc_dich: string
}

export interface CauHinhPhien {
  ma_phien: string
  lop: string
  ten_bai: string
  giao_vien: string
  khbd_phien_ban: string
  rubric_phien_ban: string
  catalog_phien_ban: string
  hoat_dong_dang_mo: string
  nam_hoc: string
}

/** Phiếu nộp (bảng `phieu`, append-only). Nộp lại = dòng mới có thay_the_cho trỏ về bản cũ. */
export type LoaiPhieu = 'P0' | 'E1' | 'E2' | 'E3' | 'E4' | 'E5' | 'P1'

export interface Phieu {
  id: string            // BIGSERIAL trả về dạng chuỗi
  ma_hs: string
  chang: number         // 0..6
  loai: LoaiPhieu
  noi_dung: Record<string, unknown>
  thay_the_cho: string | null
  nguoi_tao: string
  nhap_ho: boolean
  thoi_diem: string
}

export interface LanThuNop {
  lan?: number
  tai_g?: number | null
  giu_giay?: number | null
  vi_tri?: string | null
  bien_dang?: string | null
  dang_hong?: string | null
  ghi_chu?: string | null
}

export interface NopPhieuInput {
  chang: number
  loai: LoaiPhieu
  noi_dung: Record<string, unknown>
  thay_the_cho?: string | null
  lan_thu?: LanThuNop[]
  /** Chỉ GV/quản trị nhập hộ; học sinh luôn nộp cho chính mình. */
  ma_hs?: string
}
