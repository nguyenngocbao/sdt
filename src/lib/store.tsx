import { createContext, useCallback, useContext, useEffect, useState, type ReactNode, type Dispatch } from 'react'
import type { NopPhieuInput, Phieu, VaiTro } from '../types'
import { request } from './auth'

export type ManHinh = 'A' | 'B' | 'C' | 'D' | 'E'

export const MAN_HINH_THEO_VAI_TRO: Record<VaiTro, readonly ManHinh[]> = {
  HOC_SINH: ['A', 'B'],
  GIAO_VIEN: ['C', 'D', 'E'],
  QUAN_TRI: ['A', 'B', 'C', 'D', 'E'],
}
export const MAN_HINH_MAC_DINH: Record<VaiTro, ManHinh> = { HOC_SINH: 'A', GIAO_VIEN: 'C', QUAN_TRI: 'C' }

/** Store chỉ giữ trạng thái giao diện. Dữ liệu học tập fetch theo từng tài nguyên (xem phía dưới), không hydrate cả lớp. */
export interface TrangThaiUng {
  vai_tro: VaiTro
  man_hinh: ManHinh
  che_do_nghien_cuu: boolean
  toast: { id: number; noi_dung: string } | null
}

export type HanhDong =
  | { kieu: 'DOI_VAI_TRO'; vai_tro: VaiTro }
  | { kieu: 'DOI_MAN_HINH'; man_hinh: ManHinh }
  | { kieu: 'BAT_CHE_DO_NGHIEN_CUU'; bat: boolean }
  | { kieu: 'TOAST'; noi_dung: string }

const Ctx = createContext<{ s: TrangThaiUng; d: Dispatch<HanhDong> } | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<TrangThaiUng>({
    vai_tro: 'GIAO_VIEN', man_hinh: 'C', che_do_nghien_cuu: false, toast: null,
  })
  const d = useCallback((a: HanhDong) => {
    setS((s) => {
      switch (a.kieu) {
        case 'DOI_VAI_TRO':
          return { ...s, vai_tro: a.vai_tro, man_hinh: MAN_HINH_MAC_DINH[a.vai_tro], toast: null }
        case 'DOI_MAN_HINH':
          return MAN_HINH_THEO_VAI_TRO[s.vai_tro].includes(a.man_hinh) ? { ...s, man_hinh: a.man_hinh } : s
        case 'BAT_CHE_DO_NGHIEN_CUU':
          return { ...s, che_do_nghien_cuu: a.bat }
        case 'TOAST':
          return { ...s, toast: { id: (s.toast?.id ?? 0) + 1, noi_dung: a.noi_dung } }
      }
    })
  }, [])
  return <Ctx.Provider value={{ s, d }}>{children}</Ctx.Provider>
}

export function useApp() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp phải nằm trong AppProvider')
  return v
}

/** Nộp phiếu = INSERT một dòng mới; không đọc-sửa-ghi nên hai em nộp cùng lúc không đè nhau. */
export function nopPhieu(input: NopPhieuInput): Promise<{ id: string; thoi_diem: string }> {
  return request('/api/phieu', { method: 'POST', body: JSON.stringify(input) })
}

export async function layLichSuPhieu(id: string): Promise<Phieu[]> {
  return (await request(`/api/phieu/${encodeURIComponent(id)}/lich-su`)).lich_su
}

/** Phiếu của chính học sinh đang đăng nhập; `moiNhat` chỉ lấy bản nộp mới nhất mỗi loại. */
export function usePhieuCuaToi(moiNhat = false) {
  const [phieu, setPhieu] = useState<Phieu[]>([])
  const [dang_tai, setDangTai] = useState(true)
  const [loi, setLoi] = useState<string | null>(null)
  const tai_lai = useCallback(async () => {
    setDangTai(true)
    try {
      setPhieu((await request(`/api/phieu/cua-toi${moiNhat ? '?moi_nhat=true' : ''}`)).phieu)
      setLoi(null)
    } catch (e) {
      setLoi(e instanceof Error ? e.message : 'Không tải được phiếu.')
    } finally { setDangTai(false) }
  }, [moiNhat])
  useEffect(() => { void tai_lai() }, [tai_lai])
  return { phieu, dang_tai, loi, tai_lai }
}
