/**
 * Catalog mẫu chẩn đoán — phản chiếu requements/CATALOG-chan-doan.md
 * F07 chỉ được sinh giả thuyết từ các mẫu khai báo ở đây.
 */

export const CATALOG_PHIEN_BAN = 'CD_v0.1'

export interface MauChanDoan {
  ma: string
  ten: string
  dieu_kien: string
  gia_thuyet: string
  chi_bao: string[]
  minh_chung_toi_thieu: string
  loai_tru: string[]
  muc_ho_tro: 'NHE' | 'SAU'
  /** Danh sách câu hỏi mẫu — hệ thống chỉ chọn trong đây, KHÔNG sinh tự do */
  mau_cau_hoi: string[]
  hau_kiem: string
}

export const CATALOG: MauChanDoan[] = [
  {
    ma: 'P01',
    ten: 'Hiểu quan hệ nhưng chưa chuyển dữ liệu thành quyết định',
    dieu_kien: 'B1.2 ≥M3 và B1.3 ≤M2',
    gia_thuyet:
      'Học sinh giải thích được quan hệ hình dạng – độ cứng – tải – biến dạng, nhưng chưa dùng kết quả khảo sát của chính mình để rút ra hàm ý thiết kế. Điểm nghẽn nằm ở bước dữ liệu → quyết định, không nằm ở kiến thức nền.',
    chi_bao: ['B1.2', 'B1.3'],
    minh_chung_toi_thieu: 'E2 có bảng khảo sát và ô hàm ý đã điền',
    loai_tru: [
      'Dữ liệu khảo sát E2 bị gắn cờ "không so sánh được" → điểm nghẽn ở chất lượng dữ liệu, không ở học sinh',
      'B1.2 được chấm từ giải thích của nhóm, không có phần cá nhân',
      'Pha 2.3 chưa được mở → chưa có cơ hội thể hiện B1.3',
    ],
    muc_ho_tro: 'NHE',
    mau_cau_hoi: [
      'Trong số liệu em vừa thu, kết quả nào giúp em quyết định cách bố trí giấy?',
      'Em đã chọn dòng dữ liệu nào làm căn cứ cho hàm ý của mình, và vì sao lại là dòng đó?',
      'Nếu bạn hỏi "số liệu nào cho em biết điều đó?", em sẽ chỉ vào đâu trong bảng khảo sát?',
    ],
    hau_kiem: 'Học sinh chỉnh phương án ở HĐ2 → tạo E2 phiên bản mới → chấm lại B1.3',
  },
  {
    ma: 'P02',
    ten: 'Thu dữ liệu tốt nhưng chưa dùng bằng chứng xác định nguyên nhân',
    dieu_kien: 'D1.2 ≥M3 và D2.3 ≤M2',
    gia_thuyet:
      'Học sinh ghi chép thử nghiệm đầy đủ nhưng giải thích nguyên nhân hạn chế chịu tải còn chung chung, chưa liên hệ số liệu và vị trí hỏng với đặc điểm kết cấu.',
    chi_bao: ['D1.2', 'D2.3'],
    minh_chung_toi_thieu: 'E4 có ít nhất một lần thử hợp lệ, có vị trí/dạng hỏng',
    loai_tru: [
      'Cầu không tự đứng (TC05) → không có cơ hội quan sát dạng hỏng thật',
      'Sai quy trình thử TC06 → dữ liệu gắn cờ "không so sánh được"',
      'Vi phạm ràng buộc TC02/TC03 → kết quả thử không dùng để kết luận',
    ],
    muc_ho_tro: 'NHE',
    mau_cau_hoi: [
      'Vị trí biến dạng đầu tiên nằm ở đâu so với chỗ đặt tải?',
      'Thanh hoặc mối nối nào biến dạng trước khi cầu mất ổn định?',
      'Số liệu tải và vị trí hỏng em đã ghi cho biết điều gì về nguyên nhân?',
    ],
    hau_kiem: 'E5 pha 5.1: học sinh nêu nguyên nhân kèm bằng chứng viện dẫn',
  },
  {
    ma: 'P03',
    ten: 'Tiêu chí chưa thao tác hoá được, lan xuống quyết định',
    dieu_kien: 'A2.3 ≤M2 và C1.3 ≤M2',
    gia_thuyet:
      'Học sinh chưa chuyển được yêu cầu thành tiêu chí đo/kiểm từ HĐ1; hệ quả là ở HĐ3 không có thước đo để so sánh phương án. Can thiệp phải quay về A2.3, không phải C1.3.',
    chi_bao: ['A2.3', 'C1.3'],
    minh_chung_toi_thieu: 'E1 phần "yêu cầu → cách đo/kiểm" cá nhân; E3 lí do cá nhân',
    loai_tru: [
      'E1 dùng tiêu chí do nhóm thống nhất, không có phần cá nhân',
      'C1.3 đang ở THIẾU MINH CHỨNG → xử lý thiếu dữ liệu trước',
      'Học sinh không tham gia quyết định nhóm (ghi nhận quan sát QS02)',
    ],
    muc_ho_tro: 'NHE',
    mau_cau_hoi: [
      'Nếu hai bạn cùng nói cầu "chắc", làm sao biết cầu nào chắc hơn?',
      'Em sẽ đo đại lượng nào để kiểm tra yêu cầu "ổn định"?',
    ],
    hau_kiem: 'Bổ sung ít nhất một tiêu chí đo được vào E1, dùng lại ở E3',
  },
  {
    ma: 'P04',
    ten: 'Nhiều phương án nhưng khác biệt hình thức',
    dieu_kien: 'B2.1 ≤M2 và số bản phác trong E2 ≥ 2',
    gia_thuyet:
      'Học sinh nộp đủ số lượng phương án nhưng các phương án không khác nhau có ý nghĩa về kết cấu hoặc phân bố vật liệu — là biến thể hình thức của cùng một ý tưởng.',
    chi_bao: ['B2.1'],
    minh_chung_toi_thieu: 'E2 có ít nhất hai bản phác kèm chú thích kết cấu',
    loai_tru: [
      'B2.2 ≤M2 → điểm nghẽn là khả năng thể hiện ý tưởng, không phải sinh ý tưởng',
      'Bản phác nộp thiếu chú thích → THIẾU MINH CHỨNG',
      'Phương án thứ hai do nhóm/GV gợi ý thay vì của cá nhân',
    ],
    muc_ho_tro: 'NHE',
    mau_cau_hoi: [
      'Hai phương án của em khác nhau ở chỗ nào về cách giấy chịu lực?',
      'Nếu chỉ được thử một phương án, điều gì ở phương án thứ hai làm em muốn thử nó?',
    ],
    hau_kiem: 'E2 phiên bản mới có ít nhất hai phương án khác biệt về kết cấu',
  },
  {
    ma: 'P05',
    ten: 'So sánh được nhưng quyết định cảm tính',
    dieu_kien: '(C1.1 ≥M3 hoặc C1.2 ≥M3) và C1.3 ≤M2',
    gia_thuyet:
      'Học sinh lập được ma trận so sánh và nhận ra đánh đổi, nhưng khi chốt phương án lại không viện dẫn kết quả so sánh đó.',
    chi_bao: ['C1.3'],
    minh_chung_toi_thieu: 'E3 ma trận nhóm + lí do cá nhân',
    loai_tru: [
      'Nhóm bỏ phiếu và học sinh không có quyền quyết → ngoại lệ vai trò, không phải năng lực',
      'Lí do cá nhân còn trống → THIẾU MINH CHỨNG',
    ],
    muc_ho_tro: 'NHE',
    mau_cau_hoi: [
      'Trong bảng so sánh của nhóm, dòng nào làm em nghiêng về phương án này?',
      'Tiêu chí nào trong ma trận quan trọng nhất với em khi chọn, và vì sao?',
    ],
    hau_kiem: 'Học sinh viết lại lí do có viện dẫn tiêu chí hoặc dòng dữ liệu cụ thể',
  },
  {
    ma: 'P10',
    ten: 'Phụ thuộc hỗ trợ kéo dài',
    dieu_kien: '≥3 chỉ báo lõi ở CÓ HỖ TRỢ và 0 chỉ báo ở ĐỘC LẬP, đã qua HĐ3',
    gia_thuyet:
      'Mức hỗ trợ đang cao hơn mức cần thiết, hoặc chưa có cơ chế giảm dần. Đây là chẩn đoán về hệ thống hỗ trợ, không phải về học sinh.',
    chi_bao: [],
    minh_chung_toi_thieu: 'Lịch sử hỗ trợ ≥3 bản ghi có mức và mã hỗ trợ',
    loai_tru: [
      'Chưa có nhiệm vụ kiểm độc lập nào được giao → thiếu cơ hội, không phải phụ thuộc',
      'Mới ở HĐ1–HĐ2 (quá sớm để kết luận)',
      'Học sinh có điều kiện tiếp cận đặc biệt đã ghi ngoại lệ (LĐN06)',
    ],
    muc_ho_tro: 'NHE',
    mau_cau_hoi: ['(Không hỗ trợ thêm — giao nhiệm vụ tương đương không hỗ trợ)'],
    hau_kiem: 'P1 hoặc nhiệm vụ tương đương, tắt gợi ý AI',
  },
]

export const layMau = (ma: string) => CATALOG.find((m) => m.ma === ma)
