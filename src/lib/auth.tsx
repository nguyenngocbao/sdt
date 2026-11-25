import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { VaiTro } from '../types'

export interface LopTom { id: string; ten: string; nam_hoc: string; so_hoc_sinh: number }

export interface NguoiDungDangNhap {
  id: string
  email: string
  ho_ten: string
  vai_tro: VaiTro
  hoc_sinh_id: string | null
  lop_id: string
  cac_lop?: LopTom[]
}

interface AuthContextValue {
  user: NguoiDungDangNhap | null
  dang_tai: boolean
  dang_nhap: (input: { email: string; mat_khau: string; vai_tro: VaiTro }) => Promise<void>
  dang_xuat: () => Promise<void>
  /** Lớp giáo viên đang làm việc (đã đối chiếu với các lớp được gán). */
  lop_dang_chon: string
  doi_lop: (id: string) => void
  lam_moi_lop: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const KHOA_LOP = 'sdt.lop_dang_chon'
export function layLopDangChon(): string {
  try { return localStorage.getItem(KHOA_LOP) ?? '' } catch { return '' }
}
function ghiLopDangChon(id: string) { try { localStorage.setItem(KHOA_LOP, id) } catch { /* bỏ qua */ } }
/** Header báo cho máy chủ biết giáo viên đang làm việc ở lớp nào; máy chủ tự bỏ qua lớp không được gán. */
export function tieuDeLop(lop = layLopDangChon()): Record<string, string> { return lop ? { 'x-lop-id': lop } : {} }

export async function request(path: string, init?: RequestInit) {
  const response = await fetch(path, {
    credentials: 'same-origin',
    ...init,
    headers: { 'content-type': 'application/json', ...tieuDeLop(), ...(init?.headers ?? {}) },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message ?? 'Không thể kết nối máy chủ.')
  return data
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<NguoiDungDangNhap | null>(null)
  const [dang_tai, setDangTai] = useState(true)
  const [lopChon, setLopChon] = useState(layLopDangChon)

  useEffect(() => {
    request('/api/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setDangTai(false))
  }, [])

  const dang_nhap = useCallback(async (input: { email: string; mat_khau: string; vai_tro: VaiTro }) => {
    const data = await request('/api/auth/login', { method: 'POST', body: JSON.stringify(input) })
    setUser(data.user)
  }, [])
  const dang_xuat = useCallback(async () => {
    await request('/api/auth/logout', { method: 'POST' }).catch(() => undefined)
    setUser(null)
  }, [])

  const doi_lop = useCallback((id: string) => { ghiLopDangChon(id); setLopChon(id) }, [])
  const lam_moi_lop = useCallback(async () => { setUser((await request('/api/auth/me')).user) }, [])
  // Giống máy chủ: lớp đã chọn → lớp mặc định → lớp đầu tiên.
  const lop_dang_chon = useMemo(() => {
    const ids = user?.cac_lop?.map((l) => l.id) ?? []
    if (ids.includes(lopChon)) return lopChon
    return ids.includes(user?.lop_id ?? '') ? user!.lop_id : ids[0] ?? user?.lop_id ?? ''
  }, [user, lopChon])
  const value = useMemo(() => ({ user, dang_tai, dang_nhap, dang_xuat, lop_dang_chon, doi_lop, lam_moi_lop }), [user, dang_tai, dang_nhap, dang_xuat, lop_dang_chon, doi_lop, lam_moi_lop])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth phải nằm trong AuthProvider')
  return value
}
