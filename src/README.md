# Frontend sau M0

Bản demo cũ được lưu ở tag `demo-v0`. M0 thay các màn demo bằng năm màn
chờ triển khai, dùng lại `Shell`, `PageHead`, bộ UI và phong cách hiện có.

| Màn | File trong `screens/` | Vai trò |
|---|---|---|
| A — Việc của em | `ManA_ViecCuaEm.tsx` | Học sinh |
| B — Bài đã nộp | `ManB_BaiDaNop.tsx` | Học sinh |
| C — Lớp tôi | `ManC_LopToi.tsx` | Giáo viên |
| D — Duyệt gợi ý | `ManD_DuyetGoiY.tsx` | Giáo viên |
| E — Chấm | `ManE_Cham.tsx` | Giáo viên |

Quản trị viên mở được cả năm màn. Màn mặc định là A cho học sinh, C cho
giáo viên và quản trị viên. `App.tsx` nạp riêng từng màn; menu trong
`components/layout/Shell.tsx` lọc theo `MAN_HINH_THEO_VAI_TRO` ở `lib/store.tsx`.
Mã màn chỉ hiện khi bật chế độ nghiên cứu trong menu tài khoản.

`lib/store.tsx` chỉ giữ vai trò, màn đang mở, chế độ nghiên cứu và toast.
Không còn dữ liệu lớp trong RAM, dữ liệu mẫu hay thao tác hydrate/lưu toàn lớp
trong `App.tsx`. Xác thực và các cổng đăng nhập vẫn dùng `lib/auth.tsx` và
`screens/DangNhap.tsx`. Hai hàm API trạng thái lớp cũ trong `auth.tsx` được giữ
nguyên nhưng ứng dụng M0 không gọi chúng. M1 triển khai fetch theo tài nguyên;
M0 chưa nộp phiếu, duyệt gợi ý, chấm hoặc lưu dữ liệu. Tìm kiếm đang tắt.

`components/ui/Ui.tsx` giữ nguyên 22 component, chỉ chuyển import nhãn sang
`lib/nhan.ts`. `lib/xuat-types.ts` giữ hợp đồng kiểu của tiện ích xuất cũ,
không phải store hay máy truy vết. `lib/xuat.ts` lấy lớp từ học sinh đầu vào,
phiên bản rubric/catalog từ dữ liệu dùng chung; cấu hình bài học có thể trống.
`lib/cauhinh.ts` lấy chỉ báo lõi từ rubric thay vì bộ tạo dữ liệu demo.
`NoiDungPhieu`, `Tep`, `art/Art` và nội dung catalog/KHBD/rubric được giữ;
`FormHoatDong` và `BangTruyVet` bị xóa cùng các màn demo sử dụng chúng.

Các lệnh phát triển và kiểm tra là scripts trong [package.json](../package.json).
Nghiệm thu M0: lint, build, điều hướng đủ năm màn trên dev server, đối chiếu
22 export UI với tag demo, xác nhận thay đổi chỉ trong `src/` và các ref
`main`, `demo-v0` không đổi. Đăng nhập với backend thật được nghiệm thu ở M1.
