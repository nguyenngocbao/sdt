import { createContext, useCallback, useContext, useState, type ReactNode, type Dispatch } from 'react'
import type { VaiTro } from '../types'

export type ManHinh = 'A' | 'B' | 'C' | 'D' | 'E'

export const MAN_HINH_THEO_VAI_TRO: Record<VaiTro, readonly ManHinh[]> = {
  HOC_SINH: ['A', 'B'],
  GIAO_VIEN: ['C', 'D', 'E'],
  QUAN_TRI: ['A', 'B', 'C', 'D', 'E'],
}
export const MAN_HINH_MAC_DINH: Record<VaiTro, ManHinh> = { HOC_SINH: 'A', GIAO_VIEN: 'C', QUAN_TRI: 'C' }

/** M0 chỉ giữ trạng thái giao diện. M1 sẽ fetch từng tài nguyên, không hydrate cả lớp. */
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
