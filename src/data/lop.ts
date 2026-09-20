/**
 * Danh sách lớp 10A1 (32 học sinh) — hư cấu.
 * `tien_do` là 5 ký tự theo HĐ1..HĐ5 (xem KyHieuTienDo trong types.ts).
 * Số liệu tổng hợp của lớp được TÍNH từ đây, không viết cứng.
 */
import type { HocSinh, Nhom } from '../types'

const boDau = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase()

const email = (ten: string) => {
  const p = boDau(ten).split(' ')
  return `${p[p.length - 1]}.${p[0]}@gmail.com`
}

/** [id, họ tên, nhóm, tiến độ, có hồ sơ chi tiết] */
type Dong = [string, string, string, string, boolean]

const DAU: Dong[] = [
  ['HS0812', 'Trần Minh Đức',    'N02', 'xxxxd', true],
  ['HS0815', 'Lê Hoàng Anh',     'N02', 'xxxt-', true],
  ['HS0809', 'Nguyễn Gia Hân',   'N02', 'xtxx-', true],
  ['HS0823', 'Phạm Gia Bảo',     'N02', 'xxxx-', true],
  ['HS0803', 'Nguyễn Thu Hà',    'N01', 'xxxxx', false],
  ['HS0806', 'Đỗ Thu Trang',     'N01', 'xxxc-', true],
  ['HS0807', 'Trần Nhật Minh',   'N01', 'xxxd-', false],
  ['HS0820', 'Lê Minh Khoa',     'N03', 'xxv--', true],
  ['HS0827', 'Nguyễn Văn Long',  'N03', 'xt---', false],
  ['HS0811', 'Vũ Phương Linh',   'N03', 'xxxxx', false],
]

const TIEP: [string, string][] = [
  ['Nguyễn Hải Yến', 'xxxxx'], ['Phạm Quang Huy', 'xxxx-'], ['Vũ Ngọc Ánh', 'xxxxx'], ['Đặng Tuấn Kiệt', 'xx---'],
  ['Bùi Thanh Tâm', 'xxx--'], ['Hoàng Bảo Ngọc', 'xxxxx'], ['Ngô Đức Anh', 'x----'], ['Dương Khánh Vy', 'xxxx-'],
  ['Lý Gia Huy', 'xxxxx'], ['Trịnh Mai Anh', 'd----'], ['Phan Đức Thịnh', 'xx---'], ['Đinh Thảo Nguyên', 'xxxxx'],
  ['Lương Hoàng Long', 'xx---'], ['Tạ Minh Châu', 'x----'], ['Cao Thế Vinh', 'xxxxx'], ['Mai Phương Thảo', 'xxxx-'],
  ['Hồ Gia Khiêm', 'xx---'], ['Lâm Bảo Trân', '-----'], ['Chu Anh Tú', 'xxxxx'], ['Võ Diệu Linh', 't----'],
  ['Kiều Nhật Hạ', 'xxxxx'], ['Tô Hải Đăng', 'd----'],
]

// 22 học sinh còn lại chia vào các nhóm còn chỗ: N01 và N03 mỗi nhóm 1 chỗ, N04..N08 mỗi nhóm 4 chỗ
const NHOM_CON_LAI = ['N01', 'N03', ...['N04', 'N05', 'N06', 'N07', 'N08'].flatMap((n) => [n, n, n, n])]

export const HOC_SINH: HocSinh[] = [
  ...DAU.map(([id, ho_ten, nhom_id, tien_do, co_ho_so]) => ({
    id, ho_ten, lop: '10A1', nhom_id, tien_do, co_ho_so, email: email(ho_ten),
  })),
  ...TIEP.map(([ho_ten, tien_do], i) => ({
    id: `HS08${30 + i}`,
    ho_ten, lop: '10A1', nhom_id: NHOM_CON_LAI[i], tien_do, co_ho_so: false, email: email(ho_ten),
  })),
]

export const NHOM: Nhom[] = ['N01', 'N02', 'N03', 'N04', 'N05', 'N06', 'N07', 'N08'].map((id) => {
  const tv = HOC_SINH.filter((h) => h.nhom_id === id)
  return { id, ten: `Nhóm ${Number(id.slice(1))}`, thanh_vien: tv.map((h) => h.id), truong_nhom_id: tv[0].id }
})
