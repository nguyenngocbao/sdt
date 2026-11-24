import { request } from '../../lib/auth'

export type QuyetDinh = 'GUI' | 'SUA' | 'TU_NOI' | 'BO'

export interface TheGoiY {
  id: string
  ma_hs: string
  nhanh: string
  thoi_diem: string
  he_thong_thay: string[]
  de_xuat: string
}

export interface ThongKeNhanh {
  nhanh: string
  em_cho: number
  da_quyet: number
  bo: number
  ty_le_bo: number
  canh_bao_bo_nhieu: boolean
}

export interface GoiYChoEm { id: string; nhanh: string; noi_dung: string; thoi_diem: string }

export const layHangCho = (): Promise<{ so_cho: number; the: TheGoiY[] }> => request('/api/gv/hang-cho')
export const layThongKeNhanh = async (): Promise<ThongKeNhanh[]> => (await request('/api/gv/thong-ke-nhanh')).nhanh
export const duyetGoiY = (id: string, quyet_dinh: QuyetDinh, extra: { noi_dung_sua?: string; ly_do_bo?: string } = {}) =>
  request(`/api/gv/duyet/${id}`, { method: 'POST', body: JSON.stringify({ quyet_dinh, ...extra }) })
export const layGoiYCuaToi = async (): Promise<GoiYChoEm[]> => (await request('/api/goi-y/cua-toi')).goi_y
