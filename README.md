# Hệ thống Bản sao số học sinh (SDT) — MVP

Dựng theo **10 màn hình thiết kế** trong `requirements/design/`, chạy trên **một vòng khép kín thật**, không phải khung rỗng.

Kịch bản trung tâm là kịch bản 7.1 của `SDT.docx`: Trần Minh Đức hiểu quan hệ kết cấu (B1.2 = M3) nhưng chưa dùng dữ liệu để rút hàm ý (B1.3 = M2) → mẫu chẩn đoán P01 → hỗ trợ nhẹ chờ giáo viên duyệt → học sinh chỉnh bài → giáo viên chấm lại → trạng thái mới ghi **CÓ HỖ TRỢ**, bản cũ giữ nguyên.

> Xem `requirements/DESIGN-doi-chieu.md` để biết chỗ nào bản dựng khác thiết kế và vì sao.

## Chạy bằng Docker (khuyến nghị)

```bash
docker compose up -d --build    # http://localhost:8080
```

Docker dựng đủ `web` (React/nginx), `api` (xác thực + phân quyền) và `postgres` (migration tại `server/db/init.sql`). Trước khi triển khai thật, đặt biến `SESSION_SECRET` dài, ngẫu nhiên và `COOKIE_SECURE=true` sau khi đã có HTTPS; không dùng giá trị mặc định.

Để xoá toàn bộ dữ liệu phát triển và dựng lại:

```bash
docker compose down -v
docker compose up -d --build
```

## Đưa lên server

1. Cài Docker Engine và Docker Compose plugin trên VPS; chép thư mục dự án lên máy chủ.
2. Tạo `.env` từ `.env.example`, thay toàn bộ secret/mật khẩu mặc định bằng giá trị dài, ngẫu nhiên; đặt `COOKIE_SECURE=true` nếu site đã có HTTPS.
3. Chạy `docker compose up -d --build`. PostgreSQL chỉ ở mạng Docker nội bộ; không mở cổng DB ra Internet.
4. Đặt nginx/Caddy của server làm reverse proxy HTTPS tới `http://127.0.0.1:8080`, rồi trỏ domain vào VPS.

Dữ liệu bền trong volume `postgres_data`: rebuild `web`/`api` không làm mất dữ liệu. Backup trước mỗi lần nâng cấp lớn:

```bash
docker compose exec -T postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > backup-sdt.sql
```

## Ba cổng đăng nhập

| Vai trò | Đường dẫn | Tài khoản mẫu | Mật khẩu |
|---|---|---|---|
| Học sinh | `/dang-nhap/hoc-sinh` | `duc.tran@sdt.local` | `Demo@123` |
| Học sinh mới (chưa làm hoạt động) | `/dang-nhap/hoc-sinh` | `baotran.lam@sdt.local` | `Demo@123` |
| Giáo viên | `/dang-nhap/giao-vien` | `giaovien@sdt.local` | `Demo@123` |
| Quản trị | `/dang-nhap/quan-tri` | `quantri@sdt.local` | `Demo@123` |

Các tài khoản được khởi tạo idempotent khi API chạy lần đầu; mật khẩu được băm `scrypt` trong PostgreSQL.

## Chạy phát triển

```bash
npm install && npm run dev      # http://localhost:3000
```

Khi phát triển, chạy `docker compose up -d postgres api` để khởi động API/database; Vite tự chuyển tiếp `/api` sang `localhost:4000`. Sau đó chạy `npm run dev` và mở `http://localhost:3000/dang-nhap/hoc-sinh` (hoặc `/giao-vien`, `/quan-tri`). Cách này không đụng vào bản demo cũ ở cổng 8080.

## Phân quyền theo tài khoản

| Vai trò | Màn hình |
|---|---|
| **Giáo viên** (mặc định) | S10 Bảng điều khiển · S14 Cổng quyết định · S12 Minh chứng + Rubric · S09 Hồ sơ · S06 HĐ4 · S08 Hỗ trợ · S04 |
| **Học sinh** | S02 Trang chủ · S04 HĐ2 · S06 HĐ4 · S08 Hỗ trợ · S09 Hồ sơ của tôi |
| **Quản trị** | S15 Cấu hình bài học · S16 Quản trị dữ liệu · S10 |

Vai trò được xác định bởi tài khoản đăng nhập, không thể đổi trong giao diện. Menu người dùng chỉ còn chế độ nghiên cứu và đăng xuất. Dữ liệu nghiệp vụ của lớp được đồng bộ về PostgreSQL; học sinh chỉ được cập nhật minh chứng, yêu cầu hỗ trợ và trao đổi của chính mình.

## Đường đi demo (≈ 4 phút)

| # | Vai trò | Thao tác | Điều cần chỉ ra |
|---|---|---|---|
| 1 | GV | **Bảng điều khiển** | 32 học sinh; số liệu tổng hợp *tính từ dữ liệu*. "Thiếu minh chứng" dùng màu hổ phách, không đỏ; lọc/tìm/xuất CSV chạy thật. |
| 2 | GV | **Cổng quyết định** → ca Trần Minh Đức | Chẩn đoán kèm **điều kiện loại trừ đã kiểm**; câu hỏi lấy từ danh sách mẫu cố định. Các nút quyết định **khoá cho tới khi ghi lí do**. Không có "duyệt tất cả". |
| 3 | GV | Ghi lí do → **Duyệt** | Lưu quyết định + giá trị trước–sau. |
| 4 | HS | Đổi vai trò → **Học sinh** | Trang chủ hiện gợi ý mới và việc cần làm. Gợi ý là *câu hỏi*, không phải đáp án. |
| 5 | HS | **Bắt đầu ngay** → chọn dòng dữ liệu làm căn cứ → viết hàm ý → **Lưu và tiếp tục** | Tạo **phiên bản 2**; bản 1 không bị ghi đè. |
| 6 | GV | **Đánh giá** → chọn M3 → ghi lí do → **Hoàn thành đánh giá** | Hệ thống ghi **CÓ HỖ TRỢ**, không tự nâng thành ĐỘC LẬP. Không có điểm trung bình. |
| 7 | GV | **Học sinh** → **Vì sao?** ở chỉ báo B1.3 | Truy ngược: nhiệm vụ → minh chứng nhóm/cá nhân → người chấm → mô tả mức. Truy xuôi: chẩn đoán → hỗ trợ → quyết định. Lịch sử giữ cả `M2·ĐỘC LẬP` và `M3·CÓ HỖ TRỢ`. |
| 8 | GV | **Đánh giá** → chọn *Lê Minh Khoa*, hoạt động **HĐ3** | Hệ thống **chặn chấm**: chỉ có sản phẩm nhóm, thiếu phần cá nhân (MC02, CL05). |
| 9 | GV | **Đánh giá** → *Nguyễn Gia Hân*, **HĐ2** | Chặn chấm vì **thiếu minh chứng** — không gán M1. Có nút yêu cầu bổ sung. |
| 10 | GV | **Minh chứng** (S06) | Sản phẩm đạt 6/7 tiêu chí — *TC03 vượt băng dính* được đánh dấu vi phạm ràng buộc và **không quy thành năng lực thấp**. |
| 11 | QT | **Quản lý bài học** → nhân bản → sửa → **Kiểm tra hợp lệ** | Bỏ chỉ báo C1.3 khỏi HĐ3 → hệ thống báo *KHÔNG CÓ CƠ HỘI* (CL02) và không cho khoá. Phiên bản đang chạy không sửa được. |
| 12 | QT | **Minh chứng & dữ liệu** → **Xuất dữ liệu** | Tệp CSV/JSON **thật**, đúng thiết lập ẩn danh; thêm một dòng vào nhật ký xuất. |

## Kiến trúc

```
src/
  types.ts                 kiểu dữ liệu — phản chiếu requirements/SCHEMA-du-lieu.md
  data/
    khbd.ts                cấu trúc KHBD: 5 HĐ, nhiệm vụ, tiêu chí sản phẩm TC01–TC11
    rubric.ts              ⚠ bảng mô tả mức BẢN TẠM (BMM_v0.0-demo)
    catalog.ts             catalog mẫu chẩn đoán (CD_v0.1) + danh sách câu hỏi mẫu
    lop.ts                 lớp 10A1, 32 học sinh
    builders.ts / seed.ts  đồ thị dữ liệu hư cấu nhưng liên kết id nhất quán
  lib/
    trace.ts               truy vết hai chiều + chốt chặn  ← lõi nghiên cứu
    derive.ts              mọi số tổng hợp đều TÍNH ở đây
    store.tsx              trạng thái ứng dụng, chỉ thêm — không ghi đè
    cauhinh.ts, xuat.ts    kiểm tra cấu hình (CL02); dựng gói xuất + ẩn danh
  components/              Shell, ui, art (SVG minh hoạ), BangTruyVet
  screens/                 S02 S04 S06 S08 S09 S10 S12 S14 S15 S16
```

**Nguyên tắc đã giữ: không giả lập cái quan trọng.** Dữ liệu là hư cấu, nhưng truy vết, chốt chặn, tiêu chí sản phẩm, kiểm tra cấu hình và xuất dữ liệu đều chạy thật trên dữ liệu đó. Nếu liên kết trong dữ liệu sai, giao diện phải hiện ra là sai.

## Giới hạn

- **Bảng mô tả mức là bản tạm.** Khi có `BMM_v0.3`, thay `src/data/rubric.ts` và đổi `RUBRIC_PHIEN_BAN`; không phải sửa giao diện.
- Dữ liệu lớp được đồng bộ vào PostgreSQL qua API. Phần UI cục bộ như màn đang mở không lưu chung giữa các tài khoản.
- Hồ sơ chi tiết chỉ có cho **6 học sinh** (tên in đậm ở bảng theo dõi lớp); 26 em còn lại chỉ có dòng tổng hợp.
- Gợi ý là **danh sách câu hỏi mẫu cố định**, không gọi mô hình sinh tự do.
- Chưa dựng S02b, S03, S05, S07, S11, S13 (chưa có thiết kế).
- Tệp minh chứng là hình SVG minh hoạ; nút tải/tải lên chỉ ghi tên tệp.
