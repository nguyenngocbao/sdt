/**
 * Truy vết HAI CHIỀU — hiện thực tiêu chí "sống còn" của SDT.docx mục 10.
 *
 * Các hàm này đi thật trên đồ thị dữ liệu. Không màn hình nào được viết cứng
 * kết quả truy vết; nếu liên kết trong dữ liệu sai, UI phải hiện ra là sai.
 */
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

/** Một mắt xích trong chuỗi truy ngược */
export interface MatXichNguoc {
  trang_thai: TrangThaiSDT
  danh_gia: DanhGia | null
  minh_chung: MinhChung[]
  minh_chung_cha: MinhChung[]
  nhiem_vu: NhiemVu[]
  ho_tro: HoTro | null
  lich_su: TrangThaiSDT[]
}

/**
 * TRUY NGƯỢC: trạng thái → đánh giá → minh chứng → nhiệm vụ → bối cảnh hỗ trợ.
 * Đây là thứ đứng sau nút "Vì sao?" ở S09 và cột nguồn ở S11.
 */
export function truyNguoc(d: DuLieu, trangThaiId: string): MatXichNguoc | null {
  const trang_thai = d.trang_thai.find((t) => t.id === trangThaiId)
  if (!trang_thai) return null

  const danh_gia = trang_thai.danh_gia_id
    ? d.danh_gia.find((g) => g.id === trang_thai.danh_gia_id) ?? null
    : null

  const minh_chung = danh_gia
    ? danh_gia.minh_chung_ids
        .map((id) => d.minh_chung.find((m) => m.id === id))
        .filter((m): m is MinhChung => !!m)
    : []

  const minh_chung_cha = minh_chung
    .map((m) => (m.minh_chung_cha_id ? d.minh_chung.find((x) => x.id === m.minh_chung_cha_id) : null))
    .filter((m): m is MinhChung => !!m)

  const nhiem_vu = [...new Set([...minh_chung, ...minh_chung_cha].map((m) => m.nhiem_vu_id))]
    .map((id) => d.nhiem_vu.find((n) => n.id === id))
    .filter((n): n is NhiemVu => !!n)

  const ho_tro_id = minh_chung.find((m) => m.ho_tro_id)?.ho_tro_id ?? null
  const ho_tro = ho_tro_id ? d.ho_tro.find((h) => h.id === ho_tro_id) ?? null : null

  return { trang_thai, danh_gia, minh_chung, minh_chung_cha, nhiem_vu, ho_tro, lich_su: lichSu(d, trangThaiId) }
}

/** Lịch sử append-only: đi ngược chuỗi trang_thai_truoc_id */
export function lichSu(d: DuLieu, trangThaiId: string): TrangThaiSDT[] {
  const ket_qua: TrangThaiSDT[] = []
  let hien_tai = d.trang_thai.find((t) => t.id === trangThaiId)
  const da_tham = new Set<string>()
  while (hien_tai && !da_tham.has(hien_tai.id)) {
    da_tham.add(hien_tai.id)
    ket_qua.push(hien_tai)
    hien_tai = hien_tai.trang_thai_truoc_id
      ? d.trang_thai.find((t) => t.id === hien_tai!.trang_thai_truoc_id)
      : undefined
  }
  return ket_qua
}

export interface MatXichXuoi {
  chan_doan: ChanDoan
  goi_y_ai: GoiYAI | null
  ho_tro: HoTro | null
  quyet_dinh: QuyetDinhGV | null
  minh_chung_hau_kiem: MinhChung[]
  trang_thai_sau: TrangThaiSDT[]
}

/**
 * TRUY XUÔI: trạng thái → chẩn đoán → gợi ý AI → hỗ trợ → quyết định GV → minh chứng mới.
 */
export function truyXuoi(d: DuLieu, trangThaiId: string): MatXichXuoi[] {
  // Chẩn đoán gắn với bản ghi trạng thái nào trong CHUỖI LỊCH SỬ cũng được tính:
  // khi có bản ghi mới sau hỗ trợ, chuỗi hành động trước đó vẫn phải truy ra được.
  const idsTrongChuoi = new Set(lichSu(d, trangThaiId).map((t) => t.id))
  return d.chan_doan
    .filter((c) => c.trang_thai_ids.some((id) => idsTrongChuoi.has(id)))
    .map((chan_doan) => {
      const ho_tro = d.ho_tro.find((h) => h.chan_doan_id === chan_doan.id) ?? null
      const goi_y_ai = ho_tro?.goi_y_ai_id
        ? d.goi_y_ai.find((a) => a.id === ho_tro.goi_y_ai_id) ?? null
        : null
      const quyet_dinh = ho_tro ? d.quyet_dinh.find((q) => q.ho_tro_id === ho_tro.id) ?? null : null
      const minh_chung_hau_kiem = ho_tro ? d.minh_chung.filter((m) => m.ho_tro_id === ho_tro.id) : []
      const trang_thai_sau = d.trang_thai.filter(
        (t) => t.sau_ho_tro && t.hoc_sinh_id === chan_doan.hoc_sinh_id &&
               chan_doan.chi_bao_lien_quan.includes(t.chi_bao),
      )
      return { chan_doan, goi_y_ai, ho_tro, quyet_dinh, minh_chung_hau_kiem, trang_thai_sau }
    })
}

/** Trạng thái mới nhất của một chỉ báo với một học sinh */
export function trangThaiMoiNhat(d: DuLieu, hocSinhId: string, chiBao: string): TrangThaiSDT | null {
  const ds = d.trang_thai
    .filter((t) => t.hoc_sinh_id === hocSinhId && t.chi_bao === chiBao)
    .sort((a, b) => b.thoi_diem.localeCompare(a.thoi_diem))
  return ds[0] ?? null
}

/**
 * CHỐT CHẶN G2 — không chấm chỉ báo cá nhân từ minh chứng nhóm thiếu phần cá nhân.
 * Trả về lí do chặn, hoặc null nếu được phép chấm.
 */
export function lyDoChanCham(d: DuLieu, minhChungIds: string[], hocSinhId: string): string | null {
  const ds = minhChungIds
    .map((id) => d.minh_chung.find((m) => m.id === id))
    .filter((m): m is MinhChung => !!m)

  if (ds.length === 0) return 'Chưa có minh chứng nào được liên kết.'

  const khong_hop_le = ds.find((m) => m.trang_thai !== 'HOP_LE')
  if (khong_hop_le) {
    return `Minh chứng ${khong_hop_le.ma_minh_chung} đang ở trạng thái ${nhanTrangThai(khong_hop_le.trang_thai)}. ${khong_hop_le.ly_do_trang_thai ?? ''}`
  }

  // Nếu chỉ có minh chứng NHÓM, phải tồn tại con cá nhân của chính học sinh này
  const co_ca_nhan = ds.some((m) => m.loai_chu_the === 'CA_NHAN' && m.hoc_sinh_id === hocSinhId)
  if (!co_ca_nhan) {
    return 'Chỉ có minh chứng của nhóm, chưa có phần quy được cho cá nhân (MC02, CL05).'
  }

  const khong_ro_ho_tro = ds.find((m) => m.boi_canh_ho_tro === 'KHONG_RO')
  if (khong_ro_ho_tro) {
    return `Chưa rõ bối cảnh hỗ trợ của ${khong_ro_ho_tro.ma_minh_chung} (MC05).`
  }

  return null
}

// ── Nhãn hiển thị ─────────────────────────────────────────────────────────
export const nhanTrangThai = (t: string) =>
  ({
    KHONG_CO_CO_HOI: 'KHÔNG CÓ CƠ HỘI',
    THIEU_MINH_CHUNG: 'THIẾU MINH CHỨNG',
    CAN_XEM_XET: 'CẦN XEM XÉT',
    HOP_LE: 'HỢP LỆ',
  }[t] ?? t)

export const nhanDocLap = (t: string) =>
  ({ DOC_LAP: 'ĐỘC LẬP', CO_HO_TRO: 'CÓ HỖ TRỢ', KHONG_RO: 'CHƯA RÕ' }[t] ?? t)

export const nhanTinCay = (t: string) =>
  ({ THAP: 'Thấp', TRUNG_BINH: 'Trung bình', CAO: 'Cao' }[t] ?? t)

