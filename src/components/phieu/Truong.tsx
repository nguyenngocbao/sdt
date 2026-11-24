import { Plus, Trash2 } from 'lucide-react'
import { BIEN_DANG, DANG_HONG, VI_TRI, lanThuTrong, type LanThu } from '../../data/phieu'

/** Ô chọn là nút lớn (cao ≥ 48px), không dùng dropdown — nhập một tay, tay có thể bẩn. */
export function NutChon({ ds, chon, onChon, nhieu, choPhepBo }: {
  ds: readonly string[]; chon: string | string[]; onChon: (v: string) => void; nhieu?: boolean; choPhepBo?: boolean
}) {
  const dang = (g: string) => (nhieu ? (chon as string[]).includes(g) : chon === g)
  return (
    <div className="flex flex-wrap gap-2" role={nhieu ? 'group' : 'radiogroup'}>
      {ds.map((g) => (
        <button
          key={g} type="button" role={nhieu ? 'checkbox' : 'radio'} aria-checked={dang(g)}
          onClick={() => onChon(choPhepBo && dang(g) ? '' : g)}
          className={`min-h-12 rounded-xl px-4 py-2 text-left text-[14px] font-semibold ring-1 transition active:scale-[0.98] ${dang(g) ? 'bg-brand-600 text-white ring-brand-600' : 'bg-white text-ink ring-slate-300'}`}
        >{g}</button>
      ))}
    </div>
  )
}

export function Nhan({ children, phu }: { children: React.ReactNode; phu?: string }) {
  return <div className="mb-1.5 mt-4 text-[13.5px] font-bold text-ink">{children}{phu && <span className="ml-1.5 font-normal text-ink-soft">{phu}</span>}</div>
}

export function SoNhap({ gia_tri, onDoi, don_vi, ten }: { gia_tri: string; onDoi: (v: string) => void; don_vi: string; ten: string }) {
  return (
    <label className="flex items-center gap-2">
      <input
        type="text" inputMode="numeric" pattern="[0-9]*" aria-label={ten} value={gia_tri}
        onChange={(e) => onDoi(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
        className="h-12 w-28 rounded-xl bg-white px-3 text-lg font-bold text-ink ring-1 ring-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-600"
      />
      <span className="text-[13px] text-ink-soft">{don_vi}</span>
    </label>
  )
}

export function OChu({ gia_tri, onDoi, ten, dong = 3 }: { gia_tri: string; onDoi: (v: string) => void; ten: string; dong?: number }) {
  return (
    <textarea
      aria-label={ten} rows={dong} value={gia_tri} onChange={(e) => onDoi(e.target.value)}
      className="w-full rounded-xl bg-white p-3 text-[15px] text-ink ring-1 ring-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-600"
    />
  )
}

/** Bảng lần thử, thêm dòng được. Dùng chung cho E4 (v1) và E5 (v2). */
export function BangLanThu({ ds, onDoi }: { ds: LanThu[]; onDoi: (ds: LanThu[]) => void }) {
  const sua = (i: number, p: Partial<LanThu>) => onDoi(ds.map((l, k) => (k === i ? { ...l, ...p } : l)))
  const xoa = (i: number) => onDoi(ds.filter((_, k) => k !== i).map((l, k) => ({ ...l, lan: k + 1 })))
  return (
    <div className="space-y-3">
      {ds.map((l, i) => (
        <fieldset key={i} className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
          <legend className="px-1 text-[13px] font-extrabold text-brand-700">Lần thử {l.lan}</legend>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <div><Nhan>Tải</Nhan><SoNhap ten={`Tải lần ${l.lan}`} gia_tri={l.tai_g} onDoi={(v) => sua(i, { tai_g: v })} don_vi="g" /></div>
            <div><Nhan>Giữ giấy</Nhan><SoNhap ten={`Giữ giấy lần ${l.lan}`} gia_tri={l.giu_giay} onDoi={(v) => sua(i, { giu_giay: v })} don_vi="giây" /></div>
          </div>
          <Nhan>Đặt tải ở</Nhan><NutChon ds={VI_TRI} chon={l.vi_tri} onChon={(v) => sua(i, { vi_tri: v })} />
          <Nhan>Biến dạng ở</Nhan><NutChon ds={BIEN_DANG} chon={l.bien_dang} onChon={(v) => sua(i, { bien_dang: v })} />
          <Nhan phu="(bỏ trống nếu chưa hỏng)">Dạng hỏng</Nhan><NutChon ds={DANG_HONG} chon={l.dang_hong} onChon={(v) => sua(i, { dang_hong: v })} choPhepBo />
          <Nhan phu="(không bắt buộc)">Ghi chú</Nhan><OChu ten={`Ghi chú lần ${l.lan}`} gia_tri={l.ghi_chu} onDoi={(v) => sua(i, { ghi_chu: v })} dong={2} />
          {ds.length > 1 && (
            <button type="button" onClick={() => xoa(i)} className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold text-rose-700">
              <Trash2 size={15} />Xoá lần này
            </button>
          )}
        </fieldset>
      ))}
      <button type="button" onClick={() => onDoi([...ds, lanThuTrong(ds.length + 1)])} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-[14px] font-bold text-brand-700 ring-1 ring-brand-600">
        <Plus size={17} />Thêm lần thử
      </button>
    </div>
  )
}

export function KhoiLoi({ loi }: { loi: string[] }) {
  if (!loi.length) return null
  return (
    <ul role="alert" className="mt-4 space-y-1 rounded-xl bg-amber-50 p-3 text-[13px] text-amber-900 ring-1 ring-amber-200">
      {loi.map((x) => <li key={x}>• {x}</li>)}
    </ul>
  )
}
