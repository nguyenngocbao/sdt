# Luật rẽ nhánh M3

`re-nhanh.mjs` xuất `reNhanh(phieu, lanThu, phieuTruoc)`, hàm thuần trả
`[{ ma_nhanh, can_cu, cau_mau }]`. Không dùng DB, AI hay suy luận ngữ nghĩa.
`phieuTruoc` chỉ chứa phiếu trước, xếp mới nhất trước; mỗi phiếu E4 mang
`lan_thu` của nó. Hàm cũng lọc `ma_hs` để không dùng bài của em khác.

- E4: N4.1 khác vị trí đặt tải hoặc số giây giữ giữa bất kỳ hai lần;
  N4.2 tải lớn nhất lệch dự đoán **hơn** 20%; N4.3 khác chỗ/kiểu hỏng dự đoán
  ở E2; N4.4 thiếu nguyên nhân; N4.5 có nguyên nhân nhưng thiếu minh chứng.
- E5: N5.1 nhắm khác chỗ/kiểu hỏng E4; N5.3 tải lớn nhất v2 thấp hơn v1;
  N5.4 có hai lần giữa v1/v2 khác vị trí hoặc thời gian giữ.
- N5.2 và việc đọc ý nghĩa câu chữ thuộc M6. Không sinh nhánh cho P0, E1–E3, P1.

Dự đoán tải lấy từ `E4.noi_dung.du_doan_tai_g`, nếu thiếu thì từ E2 mới nhất.
Không biến số thiếu thành 0; không tính phần trăm khi dự đoán bằng 0. Tải lớn
nhất thống nhất với chỉ số ở màn nhập M2, không lấy trung bình hoặc riêng lần cuối.
`e4_phieu_id` ở E5 chọn đúng E4 nguồn; thiếu mã thì lấy E4 gần nhất, mã không
tìm được thì không tự chuyển sang bản khác. Chỉ dùng số liệu bảng `lan_thu`,
không tin bản `tom_tat_lan_thu`/`chenh_lech` do client gửi.

M2 phân biệt vị trí `bien_dang` và kiểu `dang_hong`. Với dự đoán/đích là một
trong ba vị trí của M2, luật so với `bien_dang`; các giá trị khác so đúng chữ
với `dang_hong`. Nếu đích E5 trùng một nguyên nhân trong E4 (tách theo dấu câu
như ô chọn M2), không xem đó là bằng chứng sửa sai chỗ. Không đoán tương đồng
ngữ nghĩa khi dùng từ khác nhau.

Câu mẫu dựa trên bước 23, 25, 30, 32 của kế hoạch phiên. N4.1 và N5.4 ở nguồn
là câu trần thuật: giữ cảnh báo và thêm câu hỏi để mọi gợi ý kết thúc bằng `?`.
N4.1 dùng câu ba vị trí khi có đúng ba vị trí, câu tổng quát khi chỉ khác giây
giữ hoặc có số lần khác. Số liệu/chỗ hỏng trong mẫu lấy từ bài thật. `can_cu`
giữ cả câu nguyên nhân và các dòng số liệu liên quan, kể cả từ cấm do em viết;
câu mẫu cố định không gợi giải pháp thiết kế.

`goi-y-luat.mjs` chạy trong transaction của `POST /api/phieu`: ghi phiếu, lần
thử và toàn bộ gợi ý trước khi commit. Nguồn là `LUAT`; duy nhất N4.1 là `GUI`,
còn lại là `CHO`. Phản hồi 201 thêm `goi_y` chỉ chứa các dòng `GUI`, sẵn cho
client hiển thị ngay mà không qua giáo viên.

`POST /api/noi-bo/re-nhanh` nhận `{ phieu_id }`, cần phiên giáo viên cùng lớp
hoặc quản trị. Endpoint đọc dữ liệu đã lưu, không nhận căn cứ/trạng thái từ
client. Khóa dòng phiếu trong transaction và trả lại gợi ý luật đã có để gọi
lại/đồng thời không nhân đôi. `GET /api/goi-y/cua-toi` chỉ dành học sinh, trả
`{ goi_y }` với trạng thái `GUI` và `ma_hs` của phiên đăng nhập.

**Giới hạn phạm vi:** màn A hiện chưa gọi API gợi ý hoặc đọc `goi_y` trong
phản hồi nộp phiếu. M3 chỉ được sửa backend và test; việc hiển thị N4.1 trên
màn A còn cần nối frontend trong task có quyền sửa `src/**` (M4).

Kiểm thử và yêu cầu môi trường: [server/test](../test/README.md).
