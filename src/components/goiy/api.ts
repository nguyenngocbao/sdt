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

export type LoaiTin = 'HIEU_ROI' | 'CHUA_HIEU' | 'HOI' | 'TRA_LOI'
export type BuocTraoDoi = 'CHO_EM' | 'CAN_GV' | 'GV_DA_TRA_LOI' | 'EM_HIEU' | 'DA_LAM_LAI'

export interface TinTraoDoi { id: string; vai_tro: 'HOC_SINH' | 'GIAO_VIEN'; loai: LoaiTin; noi_dung: string | null; thoi_diem: string }

export interface GoiYChoEm {
  id: string
  phieu_id: string
  loai_phieu: 'E4' | 'E5'
  nhanh: string
  noi_dung: string
  thoi_diem: string
  nop_lai_luc: string | null
  trao_doi: TinTraoDoi[]
  buoc: BuocTraoDoi
}

export interface MucTraoDoiGv extends GoiYChoEm { ma_hs: string; ho_ten: string; tin_cuoi_luc: string }

export const layHangCho = (): Promise<{ so_cho: number; the: TheGoiY[] }> => request('/api/gv/hang-cho')
export const layThongKeNhanh = async (): Promise<ThongKeNhanh[]> => (await request('/api/gv/thong-ke-nhanh')).nhanh
export const duyetGoiY = (id: string, quyet_dinh: QuyetDinh, extra: { noi_dung_sua?: string; ly_do_bo?: string } = {}) =>
  request(`/api/gv/duyet/${id}`, { method: 'POST', body: JSON.stringify({ quyet_dinh, ...extra }) })
export const layGoiYCuaToi = async (): Promise<GoiYChoEm[]> => (await request('/api/goi-y/cua-toi')).goi_y

export const layTraoDoiLop = (): Promise<{ dem: Record<BuocTraoDoi, number>; muc: MucTraoDoiGv[] }> => request('/api/gv/trao-doi')

/** ma_gui sinh một lần cho mỗi lần bấm gửi; bấm lại khi mất mạng dùng lại mã cũ nên không tạo tin trùng. */
export const taoMaGui = (): string => (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`)
export const guiTraoDoi = (goiYId: string, loai: LoaiTin, noi_dung: string | undefined, ma_gui: string): Promise<{ tin: TinTraoDoi; trung: boolean }> =>
  request(`/api/goi-y/${goiYId}/trao-doi`, { method: 'POST', body: JSON.stringify({ loai, noi_dung, ma_gui }) })
