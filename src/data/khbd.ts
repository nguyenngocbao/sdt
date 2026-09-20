/**
 * Cấu trúc KHBD "Thiết kế cầu giấy chịu lực" (Công nghệ 10, lớp học đảo ngược).
 * Nguồn: requirements/KHBD.docx — hoạt động, nhiệm vụ, tiêu chí sản phẩm, học liệu.
 */
import type { MaHD, NhiemVu } from '../types'

export interface HoatDongInfo {
  ma: MaHD
  ten: string
  ten_day_du: string
  tiet: string
  minh_chung: string          // E1..E5
  chi_bao: string[]           // toàn bộ biểu hiện được tạo cơ hội (KHBD mục IX)
}

export const HOAT_DONG: HoatDongInfo[] = [
  { ma: 'HĐ1', ten: 'Xác định vấn đề', ten_day_du: 'Xác định vấn đề và yêu cầu thiết kế', tiet: 'Tiết 1', minh_chung: 'E1',
    chi_bao: ['A1.1', 'A1.2', 'A1.3', 'A2.1', 'A2.2', 'A2.3'] },
  { ma: 'HĐ2', ten: 'Nghiên cứu phương án', ten_day_du: 'Nghiên cứu kiến thức nền và đề xuất giải pháp', tiet: 'Tiết 1–2', minh_chung: 'E2',
    chi_bao: ['B1.1', 'B1.2', 'B1.3', 'B2.1', 'B2.2', 'B2.3'] },
  { ma: 'HĐ3', ten: 'Lựa chọn giải pháp', ten_day_du: 'Trình bày, thảo luận, lựa chọn và hoàn thiện giải pháp', tiet: 'Tiết 2', minh_chung: 'E3',
    chi_bao: ['C1.1', 'C1.2', 'C1.3', 'C2.1', 'C2.2', 'C2.3'] },
  { ma: 'HĐ4', ten: 'Chế tạo và thử nghiệm', ten_day_du: 'Chế tạo, thử nghiệm và đánh giá', tiet: 'Tiết 3', minh_chung: 'E4',
    chi_bao: ['C3.1', 'C3.2', 'C3.3', 'D1.1', 'D1.2', 'D1.3', 'D2.1', 'D2.2', 'D2.3'] },
  { ma: 'HĐ5', ten: 'Cải tiến và phản tư', ten_day_du: 'Chia sẻ, thảo luận, điều chỉnh và kiểm chứng lại', tiet: 'Tiết 4', minh_chung: 'E5',
    chi_bao: ['D3.1', 'D3.2', 'D3.3', 'D3.4', 'D4.1', 'D4.2', 'D4.3'] },
]

export const hdInfo = (ma: string) => HOAT_DONG.find((h) => h.ma === ma)!

/** Hoạt động chứa một chỉ báo lõi */
export const HD_CUA_CHI_BAO: Record<string, MaHD> = {
  'A2.3': 'HĐ1', 'B1.2': 'HĐ2', 'B1.3': 'HĐ2', 'B2.1': 'HĐ2', 'B2.3': 'HĐ2', 'C1.3': 'HĐ3',
  'C3.1': 'HĐ4', 'D1.2': 'HĐ4', 'D2.3': 'HĐ4', 'D3.2': 'HĐ5', 'D3.4': 'HĐ5', 'D4.2': 'HĐ5',
}

/** Tên ngắn của 12 chỉ báo lõi, dùng ở bảng tổng quan */
export const TEN_NGAN: Record<string, string> = {
  'A2.3': 'Chuyển yêu cầu thành tiêu chí đo/kiểm được',
  'B1.2': 'Giải thích quan hệ hình dạng – độ cứng – tải',
  'B1.3': 'Dùng dữ liệu khảo sát để rút hàm ý thiết kế',
  'B2.1': 'Đề xuất từ hai phương án khác biệt',
  'B2.3': 'Dự đoán ưu/nhược của từng phương án',
  'C1.3': 'Chọn phương án và giải thích có căn cứ',
  'C3.1': 'Chế tạo nguyên mẫu đúng phương án chọn',
  'D1.2': 'Ghi chép dữ liệu thử nghiệm',
  'D2.3': 'Xác định nguyên nhân hạn chế chịu tải',
  'D3.2': 'Giải thích lí do thay đổi, dự đoán ảnh hưởng',
  'D3.4': 'So sánh kết quả trước và sau cải tiến',
  'D4.2': 'Bảo vệ quyết định bằng bằng chứng',
}

/** Nhãn rút gọn cho các thẻ hẹp */
export const TEN_RUT_GON: Record<string, string> = {
  'A2.3': 'Tiêu chí đo/kiểm được', 'B1.2': 'Giải thích quan hệ kết cấu', 'B1.3': 'Dữ liệu → hàm ý thiết kế',
  'B2.1': 'Hai phương án khác biệt', 'B2.3': 'Dự đoán ưu/nhược', 'C1.3': 'Chọn phương án có căn cứ',
  'C3.1': 'Chế tạo đúng phương án', 'D1.2': 'Ghi chép dữ liệu thử', 'D2.3': 'Nguyên nhân hạn chế tải',
  'D3.2': 'Lí do thay đổi', 'D3.4': 'So sánh trước – sau', 'D4.2': 'Bảo vệ bằng bằng chứng',
}

export interface HopPhanInfo { ma: 'A' | 'B' | 'C' | 'D'; ten: string; ngan: string; mau: string }
export const HOP_PHAN: HopPhanInfo[] = [
  { ma: 'A', ten: 'Xác định vấn đề và yêu cầu thiết kế', ngan: 'Xác định vấn đề', mau: '#2f7fd6' },
  { ma: 'B', ten: 'Nghiên cứu kiến thức và phát triển giải pháp', ngan: 'Nghiên cứu & giải pháp', mau: '#1fa383' },
  { ma: 'C', ten: 'Đánh giá, lựa chọn và hiện thực hóa giải pháp', ngan: 'Lựa chọn & chế tạo', mau: '#e5732a' },
  { ma: 'D', ten: 'Kiểm thử, đánh giá và cải tiến thiết kế', ngan: 'Kiểm thử & cải tiến', mau: '#7a5bd0' },
]

const nv = (id: string, pha: string, ten: string, mo_ta: string, chi_bao: string[], da_mo = true): NhiemVu =>
  ({ id, hoat_dong_pha: pha, ten, mo_ta, chi_bao_co_hoi: chi_bao, da_mo })

export const NHIEM_VU: NhiemVu[] = [
  nv('NV-1.1', 'HĐ1 – Pha 1.1', 'Kích hoạt vấn đề', 'Đọc tình huống, nhận diện vấn đề cần giải quyết.', ['A1.1', 'A1.3']),
  nv('NV-1.2', 'HĐ1 – Pha 1.2', 'Tiêu chí – ràng buộc', 'Phân loại tiêu chí và ràng buộc trước khi nhóm thống nhất.', ['A2.1', 'A2.2']),
  nv('NV-1.3', 'HĐ1 – Pha 1.3', 'Thao tác hoá yêu cầu', 'Chuyển ít nhất một yêu cầu thiết kế thành đại lượng đo được và cách kiểm.', ['A2.3']),
  nv('NV-2.1', 'HĐ2 – Pha 2.1', 'Khảo sát kết cấu giấy', 'Dự đoán, thử các cấu trúc giấy, ghi khối lượng chịu lực và biến dạng trong cùng điều kiện.', ['B1.1']),
  nv('NV-2.2', 'HĐ2 – Pha 2.2', 'Giải thích hiện tượng', 'Giải thích quan hệ giữa hình dạng kết cấu, độ cứng, tải và biến dạng.', ['B1.2']),
  nv('NV-2.3', 'HĐ2 – Pha 2.3', 'Dữ liệu → hàm ý thiết kế', 'Chỉ ra dữ liệu nào dẫn tới hàm ý thiết kế nào, và vì sao.', ['B1.3']),
  nv('NV-2.4', 'HĐ2 – Pha 2.4', 'Đề xuất phương án', 'Phác ít nhất hai phương án khác biệt về kết cấu, kèm dự đoán ưu/nhược.', ['B2.1', 'B2.3']),
  nv('NV-3.1', 'HĐ3 – Pha 3.1', 'Trình bày phương án', 'Trình bày phương án cá nhân trong nhóm.', ['B2.2']),
  nv('NV-3.2', 'HĐ3 – Pha 3.2', 'Ma trận quyết định', 'So sánh các phương án theo tiêu chí và ghi sự đánh đổi.', ['C1.1', 'C1.2']),
  nv('NV-3.3', 'HĐ3 – Pha 3.3', 'Chốt phương án', 'Nhóm chốt phương án; từng học sinh viết lí do riêng có viện dẫn tiêu chí.', ['C1.3']),
  nv('NV-4.2', 'HĐ4 – Pha 4.2', 'Chế tạo nguyên mẫu 1', 'Chế tạo nguyên mẫu, ghi nhật kí thay đổi và lí do.', ['C3.1', 'C3.3']),
  nv('NV-4.3', 'HĐ4 – Pha 4.3', 'Thử tải chuẩn hoá', 'Đặt tải giữa nhịp, tăng từng nấc 200 g, giữ 5 giây, ghi biến dạng và vị trí hỏng.', ['D1.2']),
  nv('NV-4.4', 'HĐ4 – Pha 4.4', 'Phân tích kết quả', 'Đối chiếu tiêu chí, xác định vị trí và nguyên nhân hạn chế chịu tải.', ['D2.3']),
  nv('NV-5.1', 'HĐ5 – Pha 5.1', 'Giả thuyết cải tiến', 'Nêu điểm cần sửa, bằng chứng, lí do và dự đoán tác động.', ['D3.2']),
  nv('NV-5.3', 'HĐ5 – Pha 5.3', 'So sánh trước – sau', 'So sánh dữ liệu phiên bản 1 và 2 trong điều kiện tương đương.', ['D3.4'], false),
  nv('NV-5.4', 'HĐ5 – Pha 5.4', 'Bảo vệ quyết định', 'Trình bày và trả lời phản biện bằng số liệu.', ['D4.2'], false),
]

/** Số nhiệm vụ trong mỗi hoạt động — dùng để hiển thị "x/y nhiệm vụ" */
export const soNhiemVu = (hd: MaHD) => NHIEM_VU.filter((n) => n.hoat_dong_pha.startsWith(hd)).length

/** Bộ tiêu chí thành công của SẢN PHẨM — KHBD A.2 (khác với đánh giá năng lực) */
export interface TieuChiSP { ma: string; ten: string; yeu_cau: string; bat_buoc: boolean }
export const TIEU_CHI_SP: TieuChiSP[] = [
  { ma: 'TC01', ten: 'Nhịp cầu', yeu_cau: 'Nhịp 30 cm giữa hai điểm tựa (±0,5 cm)', bat_buoc: true },
  { ma: 'TC02', ten: 'Điểm tựa', yeu_cau: 'Không có trụ bổ sung giữa nhịp', bat_buoc: true },
  { ma: 'TC03', ten: 'Vật liệu', yeu_cau: 'Tối đa 05 tờ A4 80 gsm và 50 cm băng dính', bat_buoc: true },
  { ma: 'TC05', ten: 'Tự đứng', yeu_cau: 'Tự giữ hình dạng 10 giây trước khi đặt tải', bat_buoc: true },
  { ma: 'TC06', ten: 'Quy trình thử tải', yeu_cau: 'Nấc 200 g, giữ 5 giây, điều kiện giống nhau', bat_buoc: true },
  { ma: 'TC07', ten: 'Mốc tải thăm dò', yeu_cau: '600 g giữ ổn định 5 giây (tham số tổ chức)', bat_buoc: false },
  { ma: 'TC11', ten: 'An toàn', yeu_cau: 'Vùng thử được kiểm soát, tải rơi không gây chấn thương', bat_buoc: true },
]

export const HOC_LIEU_TRUOC_LOP = [
  { ten: 'Quy trình thiết kế kĩ thuật; tiêu chí và ràng buộc', thoi_luong: '6 phút' },
  { ten: 'Hình dạng kết cấu giấy – độ cứng – tải – biến dạng', thoi_luong: '7 phút' },
  { ten: 'Thế nào là dữ liệu thử nghiệm dùng để so sánh được', thoi_luong: '5 phút' },
]

export const MUC_TIEU_BAI = [
  'Trình bày được nguyên tắc và quy trình thiết kế kĩ thuật.',
  'Phân tích được các yếu tố ảnh hưởng trong quá trình thiết kế.',
  'Thiết kế được sản phẩm đơn giản: cầu giấy chịu lực.',
]

export const PHIEU_MINH_CHUNG = [
  { ma: 'P0', ten: 'Phiếu tự học trước lớp' },
  { ma: 'E1', ten: 'Phiếu yêu cầu thiết kế' },
  { ma: 'E2', ten: 'Phiếu khảo sát và phương án' },
  { ma: 'E3', ten: 'Ma trận quyết định' },
  { ma: 'E4', ten: 'Nhật kí chế tạo / thử tải' },
  { ma: 'E5', ten: 'Cải tiến và phản tư' },
  { ma: 'P1', ten: 'Phản tư và nhiệm vụ chuyển giao' },
]
