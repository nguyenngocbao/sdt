import { useCallback, useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { docNhap, ghiNhap, xoaNhap, type BanLuu, type PhieuDaNop } from '../../data/phieu'
import { duLieuTrong, kiemTra, nopTheoMau, tuPhieu, type Cot, type Dong, type DuLieu, type MauPhieu, type Truong } from '../../data/mauPhieu'
import { KhoiLoi, Nhan, NutChon, OChu, SoNhap } from './Truong'
import { Nut } from './FormPhieu'

/** Form dùng chung cho P0, E1, E2, E3, P1. Nháp tự lưu trên máy sau mỗi thay đổi. */
export function FormTheoMau({ mau, nguoi, cu, onXong, onDong }: {
  mau: MauPhieu; nguoi: string; cu: PhieuDaNop | null; onXong: () => void; onDong: () => void
}) {
  const [ban, setBan] = useState<BanLuu<DuLieu>>(() => {
    const nhap = docNhap<DuLieu>(nguoi, mau.loai)
    if (nhap) return nhap
    return cu ? { du_lieu: tuPhieu(mau, cu), thay_the_cho: cu.id } : { du_lieu: duLieuTrong(mau), thay_the_cho: null }
  })
  useEffect(() => { ghiNhap(nguoi, mau.loai, ban) }, [nguoi, mau.loai, ban])
  const doi = useCallback((k: string, v: DuLieu[string]) => setBan((b) => ({ ...b, du_lieu: { ...b.du_lieu, [k]: v } })), [])
  const [loi, setLoi] = useState<string[]>([])
  const [dangNop, setDangNop] = useState(false)

  const nop = async () => {
    const l = kiemTra(mau, ban.du_lieu); setLoi(l)
    if (l.length) return
    setDangNop(true)
    try { await nopTheoMau(mau, ban.du_lieu, ban.thay_the_cho); xoaNhap(nguoi, mau.loai); onXong() }
    catch (e) { setLoi([(e as Error).message]); setDangNop(false) }
  }

  return (
    <div>
      <p className="text-[13px] text-ink-soft">{mau.huongDan} Tự lưu nháp trên máy này{ban.thay_the_cho && ' · đang nộp lại, bản cũ vẫn được giữ'}.</p>
      {mau.truong.map((t) => <OTruong key={t.k} t={t} v={ban.du_lieu[t.k]} onDoi={(v) => doi(t.k, v)} />)}
      <KhoiLoi loi={loi} />
      <Nut onNop={nop} onDong={onDong} dangNop={dangNop} />
    </div>
  )
}

function OTruong({ t, v, onDoi }: { t: Truong; v: DuLieu[string]; onDoi: (v: DuLieu[string]) => void }) {
  const nhan = <Nhan phu={t.phu}>{t.nhan}</Nhan>
  if (t.kieu === 'doan') return <>{nhan}<OChu ten={t.nhan} gia_tri={String(v ?? '')} onDoi={onDoi} dong={t.dong ?? 3} /></>
  if (t.kieu === 'so') return <>{nhan}<SoNhap ten={t.nhan} gia_tri={String(v ?? '')} onDoi={onDoi} don_vi={t.donVi} /></>
  if (t.kieu === 'chon') {
    if (t.nhieu) {
      const ds = (v as string[]) ?? []
      return <>{nhan}<NutChon nhieu ds={t.ds} chon={ds} onChon={(g) => onDoi(ds.includes(g) ? ds.filter((x) => x !== g) : [...ds, g])} /></>
    }
    return <>{nhan}<NutChon ds={t.ds} chon={String(v ?? '')} onChon={onDoi} choPhepBo /></>
  }
  return <>{nhan}<BangDong ten={t.tenDong} cot={t.cot} toiThieu={t.toiThieu} ds={(v as Dong[]) ?? []} onDoi={onDoi} /></>
}

/** Mỗi dòng của bảng là một khối dọc: dễ nhập trên điện thoại hơn một bảng nhiều cột. */
function BangDong({ ten, cot, toiThieu, ds, onDoi }: { ten: string; cot: Cot[]; toiThieu: number; ds: Dong[]; onDoi: (ds: Dong[]) => void }) {
  const sua = (i: number, k: string, gt: string) => onDoi(ds.map((r, j) => (j === i ? { ...r, [k]: gt } : r)))
  return (
    <div className="space-y-3">
      {ds.map((r, i) => (
        <fieldset key={i} className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
          <legend className="px-1 text-[13px] font-extrabold text-brand-700">{ten} {i + 1}</legend>
          {cot.map((c) => (
            <div key={c.k}>
              <Nhan>{c.nhan}</Nhan>
              {c.kieu === 'chon'
                ? <NutChon ds={c.ds ?? []} chon={r[c.k] ?? ''} onChon={(g) => sua(i, c.k, g)} choPhepBo />
                : c.kieu === 'so'
                  ? <SoNhap ten={`${c.nhan} ${ten.toLowerCase()} ${i + 1}`} gia_tri={r[c.k] ?? ''} onDoi={(g) => sua(i, c.k, g)} don_vi={c.donVi ?? ''} />
                  : <input aria-label={`${c.nhan} ${ten.toLowerCase()} ${i + 1}`} value={r[c.k] ?? ''} onChange={(e) => sua(i, c.k, e.target.value)}
                      className="h-12 w-full rounded-xl bg-white px-3 text-[15px] text-ink ring-1 ring-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-600" />}
            </div>
          ))}
          {ds.length > toiThieu && (
            <button type="button" onClick={() => onDoi(ds.filter((_, j) => j !== i))} className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold text-rose-700">
              <Trash2 size={15} />Xoá dòng này
            </button>
          )}
        </fieldset>
      ))}
      <button type="button" onClick={() => onDoi([...ds, Object.fromEntries(cot.map((c) => [c.k, '']))])}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-[14px] font-bold text-brand-700 ring-1 ring-brand-600">
        <Plus size={17} />Thêm {ten.toLowerCase()}
      </button>
    </div>
  )
}

/** Xem lại một phiếu theo mẫu (Màn B): nhãn câu hỏi + câu trả lời, bảng thành danh sách dòng. */
export function XemTheoMau({ mau, p }: { mau: MauPhieu; p: PhieuDaNop }) {
  const n = p.noi_dung
  const chu = (v: unknown) => (v === null || v === undefined ? '' : Array.isArray(v) ? v.join('; ') : String(v))
  return (
    <dl className="space-y-3 text-[13.5px]">
      {mau.truong.map((t) => {
        const v = n[t.k]
        if (t.kieu === 'bang') {
          const ds = Array.isArray(v) ? (v as Record<string, unknown>[]) : []
          if (!ds.length) return null
          return (
            <div key={t.k}><dt className="font-bold text-ink">{t.nhan}</dt>
              <dd><ol className="mt-1 space-y-1">{ds.map((r, i) => (
                <li key={i} className="rounded-lg bg-slate-50 px-3 py-2 text-ink-soft">
                  <span className="font-semibold text-ink">{t.tenDong} {i + 1}: </span>
                  {t.cot.map((c) => `${c.nhan}: ${chu(r[c.k])}${c.donVi && r[c.k] != null ? ` ${c.donVi}` : ''}`).join(' · ')}
                </li>))}</ol></dd>
            </div>
          )
        }
        const gt = chu(v)
        if (!gt) return null
        return <div key={t.k}><dt className="font-bold text-ink">{t.nhan}</dt><dd className="whitespace-pre-wrap text-ink-soft">{gt}{t.kieu === 'so' ? ` ${t.donVi}` : ''}</dd></div>
      })}
    </dl>
  )
}
