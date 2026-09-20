import { lazy, Suspense, useEffect, useRef, useState, type ComponentType } from 'react'
import { useApp, type ManHinh } from './lib/store'
import { Shell } from './components/layout/Shell'
import { layTrangThaiLop, luuTrangThaiLop, useAuth, type NguoiDungDangNhap } from './lib/auth'
import { DangNhap } from './screens/DangNhap'
import type { VaiTro } from './types'

// Mỗi màn hình là một khối tải riêng → trang đầu nhẹ hơn, mở màn khác mới tải phần của nó.
const tai = <K extends string>(nap: () => Promise<Record<K, ComponentType>>, ten: K) =>
  lazy(async () => ({ default: (await nap())[ten] }))

const MAN_HINH: Record<ManHinh, ComponentType> = {
  S01: tai(() => import('./screens/S01HoatDong1'), 'S01HoatDong1'),
  S02: tai(() => import('./screens/S02TrangChuHS'), 'S02TrangChuHS'),
  S03: tai(() => import('./screens/S03HoatDong3'), 'S03HoatDong3'),
  S04: tai(() => import('./screens/S04HoatDong2'), 'S04HoatDong2'),
  S05: tai(() => import('./screens/S05HoatDong5'), 'S05HoatDong5'),
  S06: tai(() => import('./screens/S06HoatDong4'), 'S06HoatDong4'),
  S08: tai(() => import('./screens/S08TrungTamHoTro'), 'S08TrungTamHoTro'),
  S09: tai(() => import('./screens/S09HoSoSDT'), 'S09HoSoSDT'),
  S10: tai(() => import('./screens/S10BangDieuKhien'), 'S10BangDieuKhien'),
  S12: tai(() => import('./screens/S12DanhGia'), 'S12DanhGia'),
  S14: tai(() => import('./screens/S14CongQuyetDinh'), 'S14CongQuyetDinh'),
  S15: tai(() => import('./screens/S15CauHinhBaiHoc'), 'S15CauHinhBaiHoc'),
  S16: tai(() => import('./screens/S16QuanTriDuLieu'), 'S16QuanTriDuLieu'),
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
  const { s } = useApp()
  const { d } = useApp()
  const [daTaiDuLieu, setDaTaiDuLieu] = useState(false)
  const [loiDongBo, setLoiDongBo] = useState('')
  const userRef = useRef(user.id)
  const ManHinhHienTai = MAN_HINH[s.man_hinh]

  useEffect(() => {
    let conHieuLuc = true
    setDaTaiDuLieu(false)
    setLoiDongBo('')
    d({ kieu: 'DOI_VAI_TRO', vai_tro: user.vai_tro })
    if (user.hoc_sinh_id) d({ kieu: 'DOI_HOC_SINH', hoc_sinh_id: user.hoc_sinh_id })
    window.history.replaceState({}, '', DUONG_DAN_DANG_NHAP[user.vai_tro].replace('/dang-nhap', ''))
    layTrangThaiLop(user.lop_id)
      .then((result) => { if (conHieuLuc && result.data) d({ kieu: 'HYDRATE_DU_LIEU', du_lieu: result.data }) })
      .catch((error) => { if (conHieuLuc) setLoiDongBo(error instanceof Error ? error.message : 'Không thể tải dữ liệu lớp.') })
      .finally(() => { if (conHieuLuc) setDaTaiDuLieu(true) })
    return () => { conHieuLuc = false }
  }, [user.id, user.vai_tro, user.hoc_sinh_id, user.lop_id, d])

  useEffect(() => {
    if (!daTaiDuLieu || userRef.current !== user.id) return
    const timer = window.setTimeout(() => {
      luuTrangThaiLop(user.lop_id, s.du_lieu).catch((error) => setLoiDongBo(error instanceof Error ? error.message : 'Không thể lưu thay đổi.'))
    }, 700)
    return () => window.clearTimeout(timer)
  }, [s.du_lieu, daTaiDuLieu, user.id, user.lop_id])

  useEffect(() => { window.scrollTo({ top: 0 }) }, [s.man_hinh, s.vai_tro])
  return (
    <Shell>
      {loiDongBo && <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-900">{loiDongBo}</div>}
      <Suspense fallback={<div className="py-24 text-center text-sm text-ink-soft" role="status">Đang tải màn hình…</div>}>
        <div key={`${s.man_hinh}-${s.vai_tro}-${s.hoc_sinh_hien_tai}-${s.ho_so_dang_mo ?? ''}`}><ManHinhHienTai /></div>
      </Suspense>
    </Shell>
  )
}

export default function App() {
  const { user, dang_tai } = useAuth()
  if (dang_tai) return <div className="grid min-h-screen place-items-center bg-slate-50 text-sm font-semibold text-ink-soft">Đang kiểm tra phiên đăng nhập…</div>
  if (!user) return <DangNhap vaiTro={roleFromPath(window.location.pathname)} />
  return <UngDungDaDangNhap user={user} />
}
