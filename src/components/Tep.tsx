import { useState } from 'react'
import { FileText, Play } from 'lucide-react'
import type { TepDinhKem } from '../types'
import { AnhCau } from './art/Art'
import { Tabs } from './ui/Ui'

export const phanLoaiTep = (tep: TepDinhKem[]) => ({
  anh: tep.filter((t) => t.loai === 'anh'),
  video: tep.filter((t) => t.loai === 'video'),
  tai_lieu: tep.filter((t) => t.loai === 'tai_lieu'),
})

/** Ô xem trước một tệp: ảnh/video vẽ bằng SVG, tài liệu hiện biểu tượng + tên tệp. */
export function XemTruocTep({ t, chon, onClick, cao = 'h-[70px]' }: { t: TepDinhKem; chon?: boolean; onClick?: () => void; cao?: string }) {
  const khung = `relative overflow-hidden rounded-lg text-left ring-1 transition ${chon ? 'ring-2 ring-brand-500' : 'ring-line hover:ring-brand-300'}`
  if (t.loai === 'tai_lieu') {
    const pdf = t.ten.toLowerCase().endsWith('.pdf')
    return (
      <button onClick={onClick} className={`${khung} flex ${cao} flex-col items-center justify-center gap-1 bg-slate-50 px-2`}>
        <FileText size={24} className={pdf ? 'text-rose-500' : 'text-sky-600'} />
        <span className="w-full truncate text-center text-[10.5px] font-medium text-ink">{t.ten}</span>
        <span className="text-[10px] text-ink-mute">{t.dung_luong}</span>
      </button>
    )
  }
  const video = t.loai === 'video'
  return (
    <button onClick={onClick} className={`${khung} block ${cao}`} title={t.ten}>
      <AnhCau kieu={t.kieu ?? (video ? 'truss' : 'plank')} tone={video ? 'dark' : (t.tone ?? 'light')} className="h-full w-full" />
      {video && <span className="absolute inset-0 flex items-center justify-center"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white"><Play size={13} fill="currentColor" /></span></span>}
    </button>
  )
}

/** Thư viện tệp có 3 tab (Hình ảnh / Video / Tài liệu) — dùng ở S14 (thu nhỏ). */
export function KhoTepNho({ tep }: { tep: TepDinhKem[] }) {
  const p = phanLoaiTep(tep)
  const [tab, setTab] = useState<'anh' | 'video' | 'tai_lieu'>(p.anh.length ? 'anh' : p.video.length ? 'video' : 'tai_lieu')
  const ds = p[tab]
  return (
    <div>
      <Tabs value={tab} onChange={setTab} tabs={[
        { id: 'anh', nhan: `Hình ảnh (${p.anh.length})` }, { id: 'video', nhan: `Video (${p.video.length})` }, { id: 'tai_lieu', nhan: `Tài liệu (${p.tai_lieu.length})` },
      ]} />
      <div className="mt-3 grid grid-cols-3 gap-2.5">
        {ds.slice(0, 3).map((t) => (
          <div key={t.ten}>
            <XemTruocTep t={t} cao="h-[84px]" />
            <div className="mt-1 truncate text-[11px] font-medium text-ink" title={t.ten}>{t.ten}</div>
            <div className="text-[10.5px] text-ink-mute">{t.dung_luong}</div>
          </div>
        ))}
        {ds.length === 0 && <p className="col-span-3 rounded-lg bg-slate-50 py-6 text-center text-[12px] text-ink-mute">Không có tệp loại này.</p>}
      </div>
    </div>
  )
}
