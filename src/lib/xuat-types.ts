/** Hợp đồng dữ liệu của tiện ích xuất cũ; không được nạp vào store M0. */
import type {
  BanGhiXuat, ChanDoan, DanhGia, GoiYAI, HocSinh, HoTro, MinhChung, NhiemVu, Nhom,
  PhienBanCauHinh, QuanSat, QuyetDinhGV, TraoDoi, TrangThaiSDT,
} from '../types'

export interface DuLieu {
  hoc_sinh: HocSinh[]
  nhom: Nhom[]
  nhiem_vu: NhiemVu[]
  minh_chung: MinhChung[]
  danh_gia: DanhGia[]
  trang_thai: TrangThaiSDT[]
  chan_doan: ChanDoan[]
  goi_y_ai: GoiYAI[]
  ho_tro: HoTro[]
  quyet_dinh: QuyetDinhGV[]
  quan_sat: QuanSat[]
  trao_doi: TraoDoi[]
  cau_hinh: PhienBanCauHinh[]
  nhat_ky_xuat: BanGhiXuat[]
  ghi_chu_gv: Record<string, string>
}
