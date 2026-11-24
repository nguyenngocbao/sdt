import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  Bell, BookOpen, ChevronDown, FileText, ListChecks, LogOut, Menu, PanelLeftClose,
  PanelLeftOpen, Search, ShieldCheck, Users, X, type LucideIcon,
} from 'lucide-react'
import { useApp, MAN_HINH_THEO_VAI_TRO, type ManHinh } from '../../lib/store'
import { LogoMark } from '../art/Art'
import { Avatar, Chip, Toast } from '../ui/Ui'
import type { VaiTro } from '../../types'
import { useAuth } from '../../lib/auth'

interface MucNav { nhan: string; icon: LucideIcon; man: ManHinh }

const NAV: MucNav[] = [
  { nhan: 'Việc của em', icon: BookOpen, man: 'A' },
  { nhan: 'Bài đã nộp', icon: FileText, man: 'B' },
  { nhan: 'Lớp tôi', icon: Users, man: 'C' },
  { nhan: 'Duyệt gợi ý', icon: ShieldCheck, man: 'D' },
  { nhan: 'Chấm', icon: ListChecks, man: 'E' },
]

const TEN_VAI_TRO: Record<VaiTro, string> = { HOC_SINH: 'Học sinh', GIAO_VIEN: 'Giáo viên', QUAN_TRI: 'Quản trị viên' }

function useDong(ref: React.RefObject<HTMLElement | null>, mo: boolean, dong: () => void) {
  useEffect(() => {
    if (!mo) return
    const f = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) dong() }
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') dong() }
    document.addEventListener('mousedown', f); document.addEventListener('keydown', k)
    return () => { document.removeEventListener('mousedown', f); document.removeEventListener('keydown', k) }
  }, [ref, mo, dong])
}

/* ── Thanh bên ──────────────────────────────────────────────────────────────── */
function ThanhBen({ thuGon, doiThuGon, dongNgacNhien }: { thuGon: boolean; doiThuGon: () => void; dongNgacNhien?: () => void }) {
  const { s, d } = useApp()
  const ds = NAV.filter((m) => MAN_HINH_THEO_VAI_TRO[s.vai_tro].includes(m.man))
  const hoatDong = (m: MucNav) => m.man === s.man_hinh

  return (
    <div className="flex h-full flex-col bg-[linear-gradient(180deg,#243e55_0%,#1f3b52_55%,#173549_100%)] text-white">
      <div className={`flex items-center gap-2.5 px-4 pb-4 pt-5 ${thuGon ? 'justify-center px-2' : ''}`}>
        <LogoMark size={thuGon ? 34 : 42} />
        {!thuGon && (
          <div className="leading-none">
            <div className="text-[26px] font-extrabold tracking-tight">SDT</div>
            <div className="mt-1 text-[8.5px] font-semibold uppercase leading-tight tracking-[0.12em] text-white/60">Vì người học<br />Vì tương lai</div>
          </div>
        )}
      </div>

      <nav className="scroll-thin flex-1 space-y-0.5 overflow-y-auto px-3 pb-3" aria-label="Điều hướng chính">
        {ds.map((m) => {
          const Icon = m.icon
          const act = hoatDong(m)
          return (
            <div key={m.nhan}>
              <button
                title={m.nhan}
                aria-current={act ? 'page' : undefined}
                onClick={() => { d({ kieu: 'DOI_MAN_HINH', man_hinh: m.man }); dongNgacNhien?.() }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13.5px] font-medium transition
                  ${thuGon ? 'justify-center px-0' : ''}
                  ${act ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-md shadow-black/20'
                    : 'text-white/85 hover:bg-white/10'}`}>
                <Icon size={18} strokeWidth={act ? 2.2 : 1.8} className="shrink-0" />
                {!thuGon && <span className="truncate">{m.nhan}</span>}
              </button>
            </div>
          )
        })}
      </nav>

      <div className="px-3 pb-4">
        {!thuGon && (
          <div className="mb-3 rounded-xl border border-white/10 bg-white/5 p-3">
            <LogoMark size={54} color="#5cc4c7" />
            <div className="mt-1.5 text-[11px] font-semibold text-white/90">STEM Education Platform</div>
            <div className="text-[10.5px] text-white/50">Vì người học · Vì tương lai</div>
            <div className="mt-1 text-[10.5px] text-white/40">Phiên bản MVP 1.0.0</div>
          </div>
        )}
        <button onClick={doiThuGon} className={`hidden w-full items-center gap-2 rounded-xl px-3 py-2 text-[12.5px] text-white/70 hover:bg-white/10 lg:flex ${thuGon ? 'justify-center px-0' : ''}`}>
          {thuGon ? <PanelLeftOpen size={17} /> : <><PanelLeftClose size={17} /> Thu gọn</>}
        </button>
      </div>
    </div>
  )
}

/* ── Hồ sơ phiên làm việc ─────────────────────────────────────────────────── */
function BangTaiKhoan({ dong }: { dong: () => void }) {
  const { s, d } = useApp()
  const { user, dang_xuat } = useAuth()
  if (!user) return null
  const duongDan = user.vai_tro === 'HOC_SINH' ? '/dang-nhap/hoc-sinh' : user.vai_tro === 'QUAN_TRI' ? '/dang-nhap/quan-tri' : '/dang-nhap/giao-vien'
  return (
    <div className="w-[320px] rounded-2xl border border-line bg-white p-4 shadow-2xl">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-ink">Tài khoản đăng nhập</h3>
        <button onClick={dong} aria-label="Đóng" className="rounded p-1 text-ink-mute hover:bg-slate-100"><X size={15} /></button>
      </div>
      <p className="mt-1 text-[11.5px] leading-relaxed text-ink-soft">{user.ho_ten} · {TEN_VAI_TRO[user.vai_tro]} · {user.email}</p>

      <label className="mt-3.5 flex cursor-pointer items-start gap-2.5 rounded-xl bg-slate-50 p-3">
        <input type="checkbox" checked={s.che_do_nghien_cuu} onChange={(e) => d({ kieu: 'BAT_CHE_DO_NGHIEN_CUU', bat: e.target.checked })} className="mt-0.5 h-4 w-4 accent-[#0e8c93]" />
        <span className="text-[12.5px] leading-snug text-ink"><strong>Chế độ nghiên cứu</strong><br />
          <span className="text-ink-soft">Hiện mã chỉ báo, mã minh chứng, mã màn hình và phiên bản cấu hình — dùng khi bảo vệ trước hội đồng.</span></span>
      </label>

      <button onClick={() => { void dang_xuat().finally(() => { window.location.assign(duongDan) }) }} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-[12.5px] font-semibold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50">
        <LogOut size={14} /> Đăng xuất
      </button>
    </div>
  )
}

/* ── Đầu trang ──────────────────────────────────────────────────────────────── */
function DauTrang({ moThanhBen }: { moThanhBen: () => void }) {
  const { s } = useApp()
  const { user } = useAuth()
  const [moDemo, setMoDemo] = useState(false)
  const [moChuong, setMoChuong] = useState(false)
  const refDemo = useRef<HTMLDivElement>(null)
  const refChuong = useRef<HTMLDivElement>(null)
  useDong(refDemo, moDemo, () => setMoDemo(false))
  useDong(refChuong, moChuong, () => setMoChuong(false))

  const laHS = user?.vai_tro === 'HOC_SINH'
  const ten = user?.ho_ten ?? ''
  const phu = laHS ? `Học sinh – Lớp ${user?.lop_id ?? ''}` : TEN_VAI_TRO[user?.vai_tro ?? s.vai_tro]

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-2.5 lg:px-6">
        <button onClick={moThanhBen} className="rounded-lg p-2 text-ink-soft hover:bg-slate-100 lg:hidden" aria-label="Mở menu"><Menu size={20} /></button>

        <div className="min-w-0 flex-1 md:flex-none md:shrink-0">
          <div className="truncate text-[17px] font-extrabold leading-tight text-ink sm:text-[20px]">Hệ thống SDT – Dạy học STEM</div>
          <div className="truncate text-[15px] font-light leading-tight text-ink sm:text-[18px]">Cầu giấy chịu lực</div>
          <div className="mt-0.5 hidden truncate text-[11px] text-ink-soft xl:block">Dữ liệu thật – Đánh giá thật – Học tập thật – Phát triển thật</div>
        </div>

        <div className="relative mx-auto hidden w-full max-w-md md:block">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-mute" />
          <input disabled placeholder="Tìm kiếm sẽ được bổ sung sau" aria-label="Tìm kiếm"
            className="w-full rounded-full border border-transparent bg-slate-100 py-2.5 pl-10 pr-4 text-[13px] text-ink outline-none transition placeholder:text-ink-mute focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100" />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-3">
          <div ref={refChuong} className="relative">
            <button onClick={() => setMoChuong((v) => !v)} className="relative rounded-full p-2 text-ink-soft hover:bg-slate-100" aria-label="Thông báo (0)">
              <Bell size={20} />
            </button>
            {moChuong && (
              <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-line bg-white shadow-2xl">
                <div className="border-b border-line px-4 py-2.5 text-[13px] font-bold text-ink">Thông báo</div>
                <p className="px-4 py-5 text-center text-[12.5px] text-ink-soft">Thông báo sẽ xuất hiện khi có dữ liệu học tập.</p>
              </div>
            )}
          </div>

          <div ref={refDemo} className="relative">
            <button onClick={() => setMoDemo((v) => !v)} className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 hover:bg-slate-100" aria-haspopup="dialog" aria-expanded={moDemo}>
              <Avatar ten={ten} size={38} tone={laHS ? 'brand' : 'navy'} />
              <span className="hidden text-left leading-tight sm:block">
                <span className="block text-[13.5px] font-bold text-ink">{ten}</span>
                <span className="block text-[11.5px] text-brand-700">{phu}</span>
              </span>
              <ChevronDown size={16} className="text-ink-mute" />
            </button>
            {moDemo && <div className="absolute right-0 top-full z-50 mt-2"><BangTaiKhoan dong={() => setMoDemo(false)} /></div>}
          </div>
        </div>
      </div>
    </header>
  )
}

export function Shell({ children }: { children: ReactNode }) {
  const [thuGon, setThuGon] = useState(false)
  const [moNgacNhien, setMoNgacNhien] = useState(false)
  return (
    <div className="flex min-h-full">
      <aside className={`sticky top-0 hidden h-screen shrink-0 transition-[width] duration-200 lg:block ${thuGon ? 'w-[72px]' : 'w-[210px]'}`}>
        <ThanhBen thuGon={thuGon} doiThuGon={() => setThuGon((v) => !v)} />
      </aside>

      {moNgacNhien && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal>
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMoNgacNhien(false)} />
          <div className="absolute inset-y-0 left-0 w-[260px] shadow-2xl"><ThanhBen thuGon={false} doiThuGon={() => {}} dongNgacNhien={() => setMoNgacNhien(false)} /></div>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 border-b border-brand-100 bg-brand-50 px-4 py-1.5 text-[11.5px] text-brand-800 lg:px-6">
          <Chip tone="teal">MVP</Chip>
          <span className="truncate">Các chức năng học tập đang được chuẩn bị. Chế độ nghiên cứu hiển thị mã màn hình.</span>
        </div>
        <DauTrang moThanhBen={() => setMoNgacNhien(true)} />
        <main className="px-4 pb-10 pt-4 lg:px-6">{children}</main>
      </div>
      <Toast />
    </div>
  )
}
