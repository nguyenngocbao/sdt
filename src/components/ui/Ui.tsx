import { useEffect, useState, type ReactNode, type ButtonHTMLAttributes } from 'react'
import { ChevronRight, CloudUpload, Info, ShieldAlert, X } from 'lucide-react'
import { useApp } from '../../lib/store'
import { nhanDocLap, nhanTrangThai } from '../../lib/nhan'
import type { TinhDocLap, TrangThaiChatLuong } from '../../types'

/* ── Chip trạng thái ───────────────────────────────────────────────────────── */

/**
 * Chủ ý thiết kế: KHÔNG CÓ CƠ HỘI dùng màu TRUNG TÍNH, THIẾU MINH CHỨNG dùng màu hổ phách —
 * cả hai đều không dùng màu đỏ. "Chưa có căn cứ" không phải lỗi của học sinh.
 */
export function ChipTrangThai({ t, nho }: { t: TrangThaiChatLuong; nho?: boolean }) {
  const mau: Record<TrangThaiChatLuong, string> = {
    HOP_LE: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    THIEU_MINH_CHUNG: 'bg-amber-50 text-amber-800 ring-amber-200',
    CAN_XEM_XET: 'bg-orange-50 text-orange-800 ring-orange-300',
    KHONG_CO_CO_HOI: 'bg-slate-100 text-slate-600 ring-slate-300',
  }
  return <span className={`inline-flex items-center whitespace-nowrap rounded-md font-medium ring-1 ${mau[t]} ${nho ? 'px-1.5 py-0.5 text-[10.5px]' : 'px-2 py-1 text-xs'}`}>{nhanTrangThai(t)}</span>
}

export function ChipDocLap({ t, nho }: { t: TinhDocLap; nho?: boolean }) {
  const mau: Record<TinhDocLap, string> = {
    DOC_LAP: 'bg-violet-50 text-violet-800 ring-violet-200',
    CO_HO_TRO: 'bg-sky-50 text-sky-800 ring-sky-200',
    KHONG_RO: 'bg-slate-100 text-slate-500 ring-slate-300',
  }
  return <span className={`inline-flex items-center whitespace-nowrap rounded-md font-medium ring-1 ${mau[t]} ${nho ? 'px-1.5 py-0.5 text-[10.5px]' : 'px-2 py-1 text-xs'}`}>{nhanDocLap(t)}</span>
}

export function ChipMuc({ muc }: { muc: 1 | 2 | 3 | 4 | null }) {
  if (muc === null) return <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-300">chưa đánh giá</span>
  const mau = ['', 'bg-slate-500', 'bg-slate-600', 'bg-brand-600', 'bg-brand-800'][muc]
  return <span className={`inline-flex h-6 min-w-7 items-center justify-center rounded-md px-1.5 text-xs font-bold text-white ${mau}`}>M{muc}</span>
}

/** Chip tổng quát theo tông màu */
const TONG: Record<string, string> = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200', teal: 'bg-brand-50 text-brand-700 ring-brand-200',
  blue: 'bg-sky-50 text-sky-700 ring-sky-200', amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  orange: 'bg-orange-50 text-orange-700 ring-orange-200', rose: 'bg-rose-50 text-rose-700 ring-rose-200',
  violet: 'bg-violet-50 text-violet-700 ring-violet-200', slate: 'bg-slate-100 text-slate-600 ring-slate-200',
}
export function Chip({ tone = 'slate', children, dot, className = '' }: { tone?: keyof typeof TONG; children: ReactNode; dot?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-semibold ring-1 ${TONG[tone]} ${className}`}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}{children}
    </span>
  )
}

/** Mã kỹ thuật (F/S/E, mã minh chứng) — chỉ hiện ở chế độ nghiên cứu. */
export function Ma({ children }: { children: ReactNode }) {
  const { s } = useApp()
  if (!s.che_do_nghien_cuu) return null
  return <code className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 align-middle font-mono text-[10.5px] font-normal text-slate-500">{children}</code>
}

/** Tiền tố mã màn hình ("S04 – ") chỉ hiện ở chế độ nghiên cứu — nguyên tắc giao diện của SDT.docx */
export function MaMan({ ma }: { ma: string }) {
  const { s } = useApp()
  return s.che_do_nghien_cuu ? <>{ma} – </> : null
}

/* ── Khối cơ bản ───────────────────────────────────────────────────────────── */

export function Card({ title, sub, icon, action, children, className = '', pad = true, tone }: {
  title?: ReactNode; sub?: ReactNode; icon?: ReactNode; action?: ReactNode; children?: ReactNode
  className?: string; pad?: boolean; tone?: 'mint' | 'sky' | 'peach' | 'lavender' | 'rose' | 'sand'
}) {
  const nen = tone ? { mint: 'bg-mint', sky: 'bg-sky', peach: 'bg-peach', lavender: 'bg-lavender', rose: 'bg-rose', sand: 'bg-sand' }[tone] : ''
  return (
    <section className={`card ${nen} ${className}`}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-3 px-4 pb-1 pt-3.5">
          <div className="flex min-w-0 items-center gap-2.5">
            {icon && <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">{icon}</span>}
            <div className="min-w-0">
              <h2 className="text-[14.5px] font-bold leading-tight text-ink">{title}</h2>
              {sub && <p className="mt-0.5 text-xs text-ink-soft">{sub}</p>}
            </div>
          </div>
          {action}
        </header>
      )}
      <div className={pad ? 'px-4 pb-4 pt-2.5' : ''}>{children}</div>
    </section>
  )
}

export function LinkNho({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-0.5 whitespace-nowrap text-[12.5px] font-semibold text-brand-700 hover:text-brand-800 hover:underline">
      {children}<ChevronRight size={14} />
    </button>
  )
}

type Bien = 'chinh' | 'phu' | 'nhat' | 'nguy' | 'duyet' | 'vang' | 'xanh'
export function Nut({ children, onClick, bien = 'phu', nho, className = '', ...rest }: {
  children: ReactNode; onClick?: () => void; bien?: Bien; nho?: boolean; className?: string
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'className'>) {
  const mau: Record<Bien, string> = {
    chinh: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm disabled:bg-slate-300 disabled:shadow-none',
    phu: 'bg-white text-ink ring-1 ring-slate-300 hover:bg-slate-50 disabled:text-slate-400 disabled:hover:bg-white',
    nhat: 'text-ink-soft hover:bg-slate-100',
    nguy: 'bg-white text-rose-700 ring-1 ring-rose-300 hover:bg-rose-50 disabled:text-slate-400 disabled:ring-slate-200 disabled:hover:bg-white',
    duyet: 'bg-[#03a392] text-white hover:bg-[#028a7c] shadow-sm disabled:bg-slate-300 disabled:shadow-none',
    vang: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100 disabled:opacity-50',
    xanh: 'bg-sky-50 text-sky-800 ring-1 ring-sky-200 hover:bg-sky-100 disabled:opacity-50',
  }
  return (
    <button onClick={onClick} {...rest}
      className={`inline-flex items-center justify-center gap-1.5 rounded-[10px] font-semibold transition disabled:cursor-not-allowed ${mau[bien]} ${nho ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2 text-[13px]'} ${className}`}>
      {children}
    </button>
  )
}

export function Avatar({ ten, size = 32, tone = 'brand' }: { ten: string; size?: number; tone?: 'brand' | 'slate' | 'navy' }) {
  const ky = ten.split(' ').filter(Boolean)
  const chu = ky.length === 1 ? ky[0].slice(0, 2) : (ky[ky.length - 2]?.[0] ?? '') + ky[ky.length - 1][0]
  const nen = { brand: 'bg-brand-600 text-white', slate: 'bg-slate-200 text-slate-600', navy: 'bg-nav-800 text-white' }[tone]
  return <span style={{ width: size, height: size, fontSize: size * 0.36 }} className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold ${nen}`}>{chu.toUpperCase()}</span>
}

export function ProgressBar({ pct, tone = 'teal', cao = 6 }: { pct: number; tone?: 'teal' | 'blue' | 'green' | 'amber' | 'slate'; cao?: number }) {
  const mau = { teal: 'bg-brand-500', blue: 'bg-[#3b82d6]', green: 'bg-emerald-500', amber: 'bg-amber-400', slate: 'bg-slate-400' }[tone]
  return (
    <div className="w-full overflow-hidden rounded-full bg-slate-200/80" style={{ height: cao }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full ${mau} transition-all`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  )
}

/** Vòng tiến độ */
export function Ring({ pct, size = 96, stroke = 10, mau = '#0e8c93', children }: { pct: number; size?: number; stroke?: number; mau?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e3ebf1" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={mau} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${(Math.min(100, pct) / 100) * c} ${c}`} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-center">{children}</div>
    </div>
  )
}

/** Thanh phân đoạn (4–6 ô) */
export function SegBar({ value, total = 6, tone = 'teal' }: { value: number; total?: number; tone?: 'teal' | 'amber' | 'rose' }) {
  const mau = { teal: 'bg-brand-500', amber: 'bg-amber-400', rose: 'bg-rose-400' }[tone]
  return (
    <div className="flex gap-1">
      {Array.from({ length: total }).map((_, i) => <span key={i} className={`h-2 w-3.5 rounded-sm ${i < value ? mau : 'bg-slate-200'}`} />)}
    </div>
  )
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; nhan: ReactNode }[]; value: T; onChange: (t: T) => void }) {
  return (
    <div role="tablist" className="flex gap-1 overflow-x-auto overflow-y-hidden border-b border-line scroll-thin">
      {tabs.map((t) => (
        <button key={t.id} role="tab" aria-selected={value === t.id} onClick={() => onChange(t.id)}
          className={`-mb-px whitespace-nowrap border-b-2 px-3.5 py-2.5 text-[13px] font-semibold transition ${value === t.id ? 'border-brand-600 text-brand-700' : 'border-transparent text-ink-soft hover:text-ink'}`}>
          {t.nhan}
        </button>
      ))}
    </div>
  )
}

export function Nhan({ children }: { children: ReactNode }) {
  return <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-ink-mute">{children}</div>
}

/** Khối hiển thị khi hệ thống TỪ CHỐI làm gì đó — nhắc nguyên tắc liên quan. */
export function KhoiChan({ children, tieuDe = 'Hệ thống chặn thao tác này.' }: { children: ReactNode; tieuDe?: string }) {
  return (
    <div className="flex gap-2.5 rounded-xl border border-orange-200 bg-orange-50 px-3.5 py-3 text-[12.5px] leading-relaxed text-orange-900">
      <ShieldAlert size={17} className="mt-0.5 shrink-0 text-orange-600" />
      <div><span className="font-bold">{tieuDe} </span>{children}</div>
    </div>
  )
}

export function KhoiLuuY({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex gap-2.5 rounded-xl border border-brand-100 bg-brand-50/60 px-3.5 py-3 text-[12.5px] leading-relaxed text-ink-soft ${className}`}>
      <Info size={16} className="mt-0.5 shrink-0 text-brand-600" />
      <div>{children}</div>
    </div>
  )
}

/** Vùng thả tệp — chỉ ghi nhận tên tệp (bản demo không tải lên máy chủ). */
export function VungThaTep({ hoTro, onChon, nho }: { hoTro: string; onChon: (ten: string[]) => void; nho?: boolean }) {
  const [keo, setKeo] = useState(false)
  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setKeo(true) }} onDragLeave={() => setKeo(false)}
      onDrop={(e) => { e.preventDefault(); setKeo(false); onChon([...e.dataTransfer.files].map((f) => f.name)) }}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed text-center transition ${keo ? 'border-brand-500 bg-brand-50' : 'border-slate-300 bg-slate-50/50 hover:border-brand-400 hover:bg-brand-50/40'} ${nho ? 'px-3 py-4' : 'px-4 py-6'}`}>
      <CloudUpload size={nho ? 24 : 30} className="text-brand-600" />
      <span className="mt-1.5 text-[13px] text-ink">Kéo thả tệp vào đây hoặc <span className="font-semibold text-brand-700 underline">chọn tệp</span></span>
      <span className="mt-0.5 text-[11px] text-ink-mute">{hoTro}</span>
      <input type="file" multiple className="sr-only" onChange={(e) => onChon([...(e.target.files ?? [])].map((f) => f.name))} />
    </label>
  )
}

/** Thông báo ngắn ở góc dưới — xác nhận thao tác đã ghi vào hệ thống. */
export function Toast() {
  const { s } = useApp()
  const [hien, setHien] = useState<{ id: number; noi_dung: string } | null>(null)
  useEffect(() => {
    if (!s.toast) return
    setHien(s.toast)
    const t = setTimeout(() => setHien(null), 5200)
    return () => clearTimeout(t)
  }, [s.toast])
  if (!hien) return null
  return (
    <div role="status" className="rise fixed bottom-5 left-1/2 z-[80] flex max-w-md -translate-x-1/2 items-start gap-3 rounded-xl bg-nav-900 px-4 py-3 text-[13px] leading-relaxed text-white shadow-2xl ring-1 ring-white/10">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500 text-[11px]">✓</span>
      <span>{hien.noi_dung}</span>
      <button onClick={() => setHien(null)} aria-label="Đóng" className="ml-1 rounded p-0.5 text-white/60 hover:text-white"><X size={14} /></button>
    </div>
  )
}

export function Trong({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-4 py-6 text-center text-[13px] text-ink-soft">{children}</p>
}

/** Biểu đồ vành khuyên nhiều đoạn */
export function Donut({ parts, size = 130, stroke = 22, giua, phu }: { parts: { v: number; mau: string }[]; size?: number; stroke?: number; giua?: ReactNode; phu?: ReactNode }) {
  const tong = parts.reduce((s, p) => s + p.v, 0) || 1
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  let acc = 0
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef2f6" strokeWidth={stroke} />
        {parts.map((p, i) => {
          const len = (p.v / tong) * c
          const el = <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={p.mau} strokeWidth={stroke} strokeDasharray={`${Math.max(0, len - 1.5)} ${c}`} strokeDashoffset={-acc} />
          acc += len
          return el
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-tight"><div className="text-[19px] font-extrabold tabular-nums text-ink">{giua}</div><div className="text-[10.5px] text-ink-soft">{phu}</div></div>
    </div>
  )
}

/** Công tắc bật/tắt */
export function CongTac({ bat, onChange, nhan }: { bat: boolean; onChange: (b: boolean) => void; nhan: string }) {
  return (
    <button role="switch" aria-checked={bat} aria-label={nhan} onClick={() => onChange(!bat)} className={`relative h-6 w-11 shrink-0 rounded-full transition ${bat ? 'bg-brand-600' : 'bg-slate-300'}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${bat ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  )
}
