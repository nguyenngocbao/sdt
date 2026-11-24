/** Hành vi soạn sẵn theo chặng cho ghi quan sát nhanh (Màn C). Chỉ báo lấy từ rubric.ts. */
export interface HanhViSan { chi_bao: string; hanh_vi: string }

export const TEN_CHANG: Record<number, string> = {
  0: 'Chặng 0 · Khởi động',
  1: 'Chặng 1 · Yêu cầu thiết kế',
  2: 'Chặng 2 · Khảo sát kết cấu',
  3: 'Chặng 3 · Chọn phương án',
  4: 'Chặng 4 · Chế tạo, thử tải',
  5: 'Chặng 5 · Cải tiến',
  6: 'Chặng 6 · Bảo vệ',
}

export const HANH_VI_THEO_CHANG: Record<number, HanhViSan[]> = {
  0: [
    { chi_bao: 'A2.3', hanh_vi: 'Nêu yêu cầu bằng đại lượng đo được' },
    { chi_bao: 'A2.3', hanh_vi: 'Nói cách kiểm tra yêu cầu' },
    { chi_bao: 'A2.3', hanh_vi: 'Chỉ ra yêu cầu chưa kiểm được' },
  ],
  1: [
    { chi_bao: 'A2.3', hanh_vi: 'Chuyển yêu cầu thành tiêu chí đo được' },
    { chi_bao: 'A2.3', hanh_vi: 'Nêu điều kiện kiểm tiêu chí' },
    { chi_bao: 'A2.3', hanh_vi: 'Phát hiện tiêu chí chưa kiểm được' },
  ],
  2: [
    { chi_bao: 'B1.2', hanh_vi: 'Giải thích hình dạng và độ cứng' },
    { chi_bao: 'B1.2', hanh_vi: 'Viện dẫn hiện tượng vừa quan sát' },
    { chi_bao: 'B1.3', hanh_vi: 'Chỉ dòng số liệu làm căn cứ' },
    { chi_bao: 'B2.1', hanh_vi: 'Đề xuất phương án khác biệt kết cấu' },
  ],
  3: [
    { chi_bao: 'C1.2', hanh_vi: 'Nêu ưu và nhược của phương án' },
    { chi_bao: 'C1.2', hanh_vi: 'Nói rõ sự đánh đổi giữa các phương án' },
    { chi_bao: 'C1.3', hanh_vi: 'Giải thích lựa chọn bằng tiêu chí' },
  ],
  4: [
    { chi_bao: 'C3.1', hanh_vi: 'Chế tạo đúng phương án đã chọn' },
    { chi_bao: 'D1.2', hanh_vi: 'Ghi đủ tải, lần thử, vị trí hỏng' },
    { chi_bao: 'D1.2', hanh_vi: 'Giữ tải đủ 5 giây mỗi nấc' },
    { chi_bao: 'D2.3', hanh_vi: 'Chỉ vị trí hạn chế chịu tải bằng số liệu' },
  ],
  5: [
    { chi_bao: 'D3.2', hanh_vi: 'Nêu lí do sửa dựa trên bằng chứng' },
    { chi_bao: 'D3.2', hanh_vi: 'Dự đoán tác động của chỗ sửa' },
    { chi_bao: 'D3.4', hanh_vi: 'So sánh số liệu trước và sau sửa' },
  ],
  6: [
    { chi_bao: 'D4.2', hanh_vi: 'Bảo vệ quyết định bằng số liệu' },
    { chi_bao: 'D4.2', hanh_vi: 'Trả lời phản biện có căn cứ' },
    { chi_bao: 'D4.2', hanh_vi: 'Nêu giới hạn của thiết kế' },
  ],
}
