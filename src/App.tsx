import { lazy, Suspense, useEffect, type ComponentType } from 'react'
import { useApp, type ManHinh } from './lib/store'
import { Shell } from './components/layout/Shell'
import { useAuth, type NguoiDungDangNhap } from './lib/auth'
import { DangNhap } from './screens/DangNhap'
import type { VaiTro } from './types'

// Mỗi màn hình là một khối tải riêng → trang đầu nhẹ hơn, mở màn khác mới tải phần của nó.
const tai = <K extends string>(nap: () => Promise<Record<K, ComponentType>>, ten: K) =>
  lazy(async () => ({ default: (await nap())[ten] }))

const MAN_HINH: Record<ManHinh, ComponentType> = {
  A: tai(() => import('./screens/ManA_ViecCuaEm'), 'ManA_ViecCuaEm'),
  B: tai(() => import('./screens/ManB_BaiDaNop'), 'ManB_BaiDaNop'),
  C: tai(() => import('./screens/ManC_LopToi'), 'ManC_LopToi'),
  D: tai(() => import('./screens/ManD_DuyetGoiY'), 'ManD_DuyetGoiY'),
  E: tai(() => import('./screens/ManE_Cham'), 'ManE_Cham'),
}

const DUONG_DAN_DANG_NHAP: Record<VaiTro, string> = {
  HOC_SINH: '/dang-nhap/hoc-sinh',
  GIAO_VIEN: '/dang-nhap/giao-vien',
  QUAN_TRI: '/dang-nhap/quan-tri',
}

function roleFromPath(path: string): VaiTro {
  if (path.includes('hoc-sinh')) return 'HOC_SINH'
  if (path.includes('quan-tri')) return 'QUAN_TRI'
  return 'GIAO_VIEN'
}

function UngDungDaDangNhap({ user }: { user: NguoiDungDangNhap }) {
  const { s, d } = useApp()
  const ManHinhHienTai = MAN_HINH[s.man_hinh]

  // Chỉ đồng bộ vai trò; tầng fetch tài nguyên được triển khai ở M1.
  useEffect(() => {
    d({ kieu: 'DOI_VAI_TRO', vai_tro: user.vai_tro })
    window.history.replaceState({}, '', DUONG_DAN_DANG_NHAP[user.vai_tro].replace('/dang-nhap', ''))
  }, [user.id, user.vai_tro, d])

  useEffect(() => { window.scrollTo({ top: 0 }) }, [s.man_hinh, s.vai_tro])
  return (
    <Shell>
      <Suspense fallback={<div className="py-24 text-center text-sm text-ink-soft" role="status">Đang tải màn hình…</div>}>
        <div key={s.man_hinh}><ManHinhHienTai /></div>
      </Suspense>
    </Shell>
  )
}

export default function App() {
  const { user, dang_tai } = useAuth()
  if (dang_tai) return <div className="grid min-h-screen place-items-center bg-slate-50 text-sm font-semibold text-ink-soft">Đang kiểm tra phiên đăng nhập…</div>
  if (!user) return <DangNhap vaiTro={roleFromPath(window.location.pathname)} />
  return <UngDungDaDangNhap key={user.id} user={user} />
}
