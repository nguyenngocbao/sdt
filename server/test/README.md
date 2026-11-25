# Kiểm thử backend

## Luật M3

```sh
node server/test/re-nhanh.mjs
```

Không cần dependency hoặc DB. In PASS cho 20 ca: phủ 8 nhánh luật, biên 20%,
nhiều nhánh cùng lúc, cách ly học sinh, chọn đúng E4 nguồn và không sinh nhánh.
Kiểm thêm câu hỏi/từ cấm, căn cứ thật, đầu vào đóng băng và tính tất định.
N5.2 thuộc M6 nên không có luật M3 cho nhánh này.

Kiểm thử API với PostgreSQL thật dùng cùng dependency/cách cài như M1 bên dưới:

```sh
node server/test/api-re-nhanh.mjs
```

Tạo DB tạm riêng và API chỉ nghe `127.0.0.1` (`HOST`), kiểm tự sinh N4.1 GUI,
N4.2 CHO với 800/600 trong `can_cu`, E5 so E4, phân quyền/cách ly, gọi nội bộ
đồng thời không nhân đôi và rollback khi lỗi ghi. Không gọi DB/API đang chạy.
Nếu sandbox chặn PostgreSQL, script trả 1, không coi là đã nghiệm thu tích hợp.
Màn A chưa nối hiển thị gợi ý; xem [hợp đồng và giới hạn M3](../src/README.md).

## Đồng thời M1

Kiểm thử dùng PostgreSQL 16 thật (binary cục bộ từ `embedded-postgres`), chạy
migration và API `server/src/app.mjs` thật. Mỗi lượt tạo cluster trống trong thư
mục tạm, dùng cổng ngẫu nhiên, rồi dừng tiến trình và xóa dữ liệu khi kết thúc.
Không dùng `DATABASE_URL`, API hay dữ liệu đang chạy của dự án. Không cần Docker,
không tạo user hệ thống hoặc cài global. Cần Node.js 22+ và quyền chạy binary
PostgreSQL/cổng TCP cục bộ; không chạy bằng root.

Từ gốc repo:

```sh
npm --prefix server install --package-lock=false
npm --prefix server/test ci
node server/test/dong-thoi.mjs
```

Script npm nằm trong package kiểm thử để giữ mọi file thay đổi trong
`server/test/**` theo phạm vi task:

```sh
npm --prefix server/test run test:dong-thoi
# Hoặc cd server/test rồi npm run test:dong-thoi
```

Nếu cache npm mặc định không ghi được, thêm
`--cache /private/tmp/sdt-npm-cache` vào lệnh cài đặt.

Chương trình in PASS/FAIL cho đúng 7 mục và trả exit code 1 khi có lỗi (kể cả
lỗi chuẩn bị DB/API). Mục 3 đếm toàn bộ E4 trong DB trống riêng, phải đúng 20;
mục 5 đối chiếu nội dung, người nộp và id của từng phản hồi với SQL, không chỉ
đếm. Hai phép UPDATE/DELETE được kiểm độc lập trong transaction có rollback,
so sánh toàn bộ snapshot trước/sau. Mục 7 yêu cầu đủ đúng 10 id của HS0812,
không chấp nhận danh sách rỗng. Khi có FAIL phải dừng trước M2.

Nếu sandbox chặn `initdb`/`shmget` với `Operation not permitted`, các mục chưa
chạy được sẽ in FAIL và tiến trình trả 1. Đây là thiếu bằng chứng nghiệm thu,
không phải kết luận API đã mất dữ liệu. Chạy lại trong môi trường kiểm thử có
quyền PostgreSQL cục bộ; không nới quyền hay đổi cấu hình hệ thống từ runner.

API hiện tại tự bind `0.0.0.0`; bộ kiểm thử gọi API qua `127.0.0.1` trên cổng
tạm, PostgreSQL chỉ lắng nghe loopback. Không sửa hành vi bind của API trong
task kiểm thử này.

## Trao đổi quanh gợi ý

```sh
node server/test/trao-doi.mjs
```

Cùng cách dựng DB tạm như trên (cần cài `server/test`, không chạy bằng root).
In PASS cho 6 mục: gợi ý còn CHO không được trao đổi; học sinh chỉ thấy câu đã
gửi, không thấy căn cứ hay câu gốc; kiểm tra loại tin, độ dài và quyền theo em,
theo lớp; gửi lại cùng `ma_gui` (kể cả hai request đồng thời) chỉ ghi một dòng;
vòng hỏi → giáo viên trả lời → em hiểu → nộp lại đổi đúng `buoc` ở cả hai phía;
`trao_doi` chặn UPDATE/DELETE.
