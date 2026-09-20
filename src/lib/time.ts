/**
 * Đồng hồ của bản demo.
 * Dữ liệu seed diễn ra quanh 15/10/2024 (khớp thiết kế). Bản ghi mới tạo trong
 * lúc demo tiếp nối đúng dòng thời gian đó, thay vì nhảy sang năm hiện tại.
 */
export const BAY_GIO_GOC = '2024-10-15T16:30:00+07:00'
const T0 = Date.parse(BAY_GIO_GOC)
const S0 = Date.now()

/**
 * Trả về chuỗi ISO có múi giờ +07:00 — CÙNG ĐỊNH DẠNG với dữ liệu seed, để so sánh chuỗi
 * (localeCompare) luôn đúng thứ tự thời gian. Nếu dùng toISOString() (đuôi Z) thì 09:30Z bị xếp
 * trước 10:05+07:00 dù thực tế muộn hơn.
 */
export const bayGio = () =>
  new Date(T0 + (Date.now() - S0) + 7 * 3600_000).toISOString().replace(/\.\d{3}Z$/, '+07:00')

const TZ = 'Asia/Ho_Chi_Minh'
export const gio = (iso: string) =>
  new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: TZ })
export const ngay = (iso: string) =>
  new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: TZ })
export const ngayGio = (iso: string) => `${ngay(iso)} ${gio(iso)}`
export const thuNgay = () =>
  new Date(bayGio()).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', timeZone: TZ })

/** "2 giờ trước", "1 ngày trước" — tính theo đồng hồ demo */
export function truocDay(iso: string): string {
  const d = Date.parse(bayGio()) - Date.parse(iso)
  const p = Math.max(0, Math.round(d / 60000))
  if (p < 1) return 'vừa xong'
  if (p < 60) return `${p} phút trước`
  const h = Math.round(p / 60)
  if (h < 24) return `${h} giờ trước`
  return `${Math.round(h / 24)} ngày trước`
}

let dem = 0
/** Sinh id duy nhất cho bản ghi mới (gọi ở nơi phát hành hành động, không gọi trong reducer) */
export const nid = (tien_to: string) => `${tien_to}-${Date.now().toString(36)}${(++dem).toString(36)}`
