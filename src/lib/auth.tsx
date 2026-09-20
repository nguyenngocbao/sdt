import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { VaiTro } from '../types'

export interface NguoiDungDangNhap {
  id: string
  email: string
  ho_ten: string
  vai_tro: VaiTro
  hoc_sinh_id: string | null
  lop_id: string
}

interface AuthContextValue {
  user: NguoiDungDangNhap | null
  dang_tai: boolean
  dang_nhap: (input: { email: string; mat_khau: string; vai_tro: VaiTro }) => Promise<void>
  dang_xuat: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function request(path: string, init?: RequestInit) {
  const response = await fetch(path, {
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message ?? 'Không thể kết nối máy chủ.')
  return data
}

export async function layTrangThaiLop(lopId: string) {
  return request(`/api/lop/${encodeURIComponent(lopId)}/trang-thai`)
}

export async function luuTrangThaiLop(lopId: string, data: unknown) {
  return request(`/api/lop/${encodeURIComponent(lopId)}/trang-thai`, { method: 'PUT', body: JSON.stringify({ data }) })
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<NguoiDungDangNhap | null>(null)
  const [dang_tai, setDangTai] = useState(true)

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

  const value = useMemo(() => ({ user, dang_tai, dang_nhap, dang_xuat }), [user, dang_tai, dang_nhap, dang_xuat])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth phải nằm trong AuthProvider')
  return value
}
