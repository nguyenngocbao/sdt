# Kiểm thử đồng thời M1

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
