import { useState, type FormEvent } from 'react'
import { ArrowLeft, GraduationCap, LockKeyhole, Mail, ShieldCheck, Users } from 'lucide-react'
import type { VaiTro } from '../types'
import { LogoMark } from '../components/art/Art'
import { useAuth } from '../lib/auth'

const ROLE: Record<VaiTro, { title: string; description: string; icon: typeof GraduationCap; tone: string }> = {
  HOC_SINH: { title: 'Cổng học sinh', description: 'Nộp minh chứng, theo dõi tiến độ và nhận hỗ trợ học tập.', icon: GraduationCap, tone: 'bg-brand-600' },
  GIAO_VIEN: { title: 'Cổng giáo viên', description: 'Theo dõi lớp, đánh giá minh chứng và duyệt hỗ trợ.', icon: Users, tone: 'bg-[#263f55]' },
  QUAN_TRI: { title: 'Cổng quản trị', description: 'Cấu hình bài học, quản lý dữ liệu và xuất nghiên cứu.', icon: ShieldCheck, tone: 'bg-violet-700' },
}

export function DangNhap({ vaiTro }: { vaiTro: VaiTro }) {
  const { dang_nhap } = useAuth()
  const [email, setEmail] = useState('')
  const [matKhau, setMatKhau] = useState('')
  const [loi, setLoi] = useState('')
  const [dangGui, setDangGui] = useState(false)
  const meta = ROLE[vaiTro]
  const Icon = meta.icon

  async function submit(event: FormEvent) {
    event.preventDefault()
    setLoi('')
    setDangGui(true)
    try { await dang_nhap({ email, mat_khau: matKhau, vai_tro: vaiTro }) }
    catch (error) { setLoi(error instanceof Error ? error.message : 'Không thể đăng nhập.') }
    finally { setDangGui(false) }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_15%_0%,#dff8f5_0,transparent_32%),linear-gradient(135deg,#f6fbfc_0%,#edf5f6_100%)] px-4 py-8 sm:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl overflow-hidden rounded-3xl border border-white bg-white shadow-2xl shadow-slate-900/10 lg:grid-cols-[1.03fr_.97fr]">
        <section className="flex flex-col justify-between bg-[linear-gradient(145deg,#183c52_0%,#265f73_68%,#12969b_130%)] p-8 text-white sm:p-12">
          <a href="/" className="inline-flex items-center gap-2 self-start text-sm font-semibold text-white/75 hover:text-white"><ArrowLeft size={16} /> Quay lại trang chủ</a>
          <div className="py-12">
            <div className="flex items-center gap-3"><LogoMark size={52} /><div><div className="text-3xl font-extrabold tracking-tight">SDT</div><div className="text-xs font-semibold uppercase tracking-[.16em] text-white/60">Dạy học STEM</div></div></div>
            <h1 className="mt-10 max-w-md text-3xl font-extrabold leading-tight sm:text-4xl">Dữ liệu thật. Đánh giá có căn cứ. Học tập có tiến trình.</h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/75">Hệ thống Bản sao số học sinh lưu chuỗi minh chứng, quyết định chuyên môn và bối cảnh hỗ trợ để mọi trạng thái đều giải thích được.</p>
          </div>
          <p className="text-xs text-white/55">Cầu giấy chịu lực · Năm học 2025–2026</p>
        </section>
        <section className="flex items-center p-6 sm:p-12">
          <div className="mx-auto w-full max-w-sm">
            <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${meta.tone} text-white`}><Icon size={23} /></div>
            <h2 className="text-2xl font-extrabold text-ink">{meta.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{meta.description}</p>
            <form onSubmit={submit} className="mt-8 space-y-4">
              <label className="block"><span className="mb-1.5 block text-sm font-bold text-ink">Email</span><span className="relative block"><Mail size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" /><input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ten@sdt.local" className="field w-full !py-3 !pl-10" /></span></label>
              <label className="block"><span className="mb-1.5 block text-sm font-bold text-ink">Mật khẩu</span><span className="relative block"><LockKeyhole size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" /><input required type="password" autoComplete="current-password" value={matKhau} onChange={(e) => setMatKhau(e.target.value)} placeholder="Nhập mật khẩu" className="field w-full !py-3 !pl-10" /></span></label>
              {loi && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-700">{loi}</p>}
              <button disabled={dangGui} className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 disabled:cursor-wait disabled:opacity-60">{dangGui ? 'Đang xác thực…' : 'Đăng nhập'}</button>
            </form>
            <div className="mt-7 border-t border-line pt-5"><p className="text-xs font-semibold uppercase tracking-wide text-ink-mute">Cổng khác</p><div className="mt-3 grid grid-cols-3 gap-2">{(['HOC_SINH', 'GIAO_VIEN', 'QUAN_TRI'] as const).filter((x) => x !== vaiTro).map((role) => <a key={role} href={`/dang-nhap/${role === 'HOC_SINH' ? 'hoc-sinh' : role === 'GIAO_VIEN' ? 'giao-vien' : 'quan-tri'}`} className="rounded-lg bg-slate-100 px-2 py-2 text-center text-[11px] font-bold text-ink-soft hover:bg-brand-50 hover:text-brand-700">{ROLE[role].title.replace('Cổng ', '')}</a>)}</div></div>
          </div>
        </section>
      </div>
    </main>
  )
}
