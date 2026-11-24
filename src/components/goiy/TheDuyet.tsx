import { useState } from 'react'
import { Chip, Nut } from '../ui/Ui'
import { duyetGoiY, type TheGoiY } from './api'

type Che = 'xem' | 'sua' | 'bo'

/** Thẻ hai phần: hệ thống thấy (số liệu thật) và đề xuất gửi cho em. Giáo viên bấm một trong bốn nút. */
export function TheDuyet({ the, onXong }: { the: TheGoiY; onXong: () => void }) {
  const [che, setChe] = useState<Che>('xem')
  const [sua, setSua] = useState(the.de_xuat)
  const [lyDo, setLyDo] = useState('')
  const [bao, setBao] = useState(false)
  const [loi, setLoi] = useState('')

  const gui = async (kieu: 'GUI' | 'SUA' | 'TU_NOI' | 'BO', extra = {}) => {
    setBao(true); setLoi('')
    try { await duyetGoiY(the.id, kieu, extra); onXong() } catch (e) { setLoi((e as Error).message); setBao(false) }
  }
  const nutCao = 'min-h-11 flex-1 basis-[calc(50%-0.25rem)] sm:basis-0'

  return (
    <article className="card space-y-3 p-4" aria-label={`Gợi ý cho ${the.ma_hs}`}>
      <header className="flex flex-wrap items-center gap-2 text-[12.5px] text-ink-soft">
        <strong className="text-[14px] text-ink">{the.ma_hs}</strong>
        <Chip tone="teal">Nhánh {the.nhanh}</Chip>
        <time dateTime={the.thoi_diem}>{new Date(the.thoi_diem).toLocaleString('vi-VN')}</time>
      </header>

      <section aria-label="Hệ thống thấy">
        <h3 className="mb-1 text-[11.5px] font-bold uppercase tracking-wide text-ink-soft">Hệ thống thấy</h3>
        <ul className="list-disc space-y-0.5 pl-5 text-[13.5px] text-ink">
          {the.he_thong_thay.map((d, i) => <li key={i}>{d}</li>)}
        </ul>
      </section>

      <section aria-label="Đề xuất gửi cho em" className="rounded-xl border border-brand-200 bg-brand-50/50 p-3">
        <h3 className="mb-1 text-[11.5px] font-bold uppercase tracking-wide text-brand-700">Đề xuất gửi cho em</h3>
        {che === 'sua'
          ? <textarea value={sua} onChange={(e) => setSua(e.target.value)} rows={4} aria-label="Sửa câu gửi cho em"
              className="w-full rounded-lg border border-slate-300 p-2 text-[16px] leading-snug" />
          : <p className="text-[17px] font-semibold leading-snug text-ink">{the.de_xuat}</p>}
      </section>

      {che === 'bo' && (
        <div>
          <label className="mb-1 block text-[12.5px] font-semibold text-ink" htmlFor={`ly-do-${the.id}`}>Lý do bỏ (bắt buộc)</label>
          <textarea id={`ly-do-${the.id}`} value={lyDo} onChange={(e) => setLyDo(e.target.value)} rows={2}
            className="w-full rounded-lg border border-slate-300 p-2 text-[16px]" placeholder="Nhánh này bắt sai vì…" />
        </div>
      )}

      {loi && <p role="alert" className="text-[13px] text-rose-700">{loi}</p>}

      <div className="flex flex-wrap gap-2">
        {che === 'xem' && <>
          <Nut bien="duyet" className={nutCao} disabled={bao} onClick={() => gui('GUI')}>Gửi</Nut>
          <Nut bien="xanh" className={nutCao} disabled={bao} onClick={() => setChe('sua')}>Sửa rồi gửi</Nut>
          <Nut bien="phu" className={nutCao} disabled={bao} onClick={() => gui('TU_NOI')}>Tôi tự nói</Nut>
          <Nut bien="nguy" className={nutCao} disabled={bao} onClick={() => setChe('bo')}>Bỏ</Nut>
        </>}
        {che === 'sua' && <>
          <Nut bien="duyet" className={nutCao} disabled={bao || !sua.trim()} onClick={() => gui('SUA', { noi_dung_sua: sua })}>Gửi câu đã sửa</Nut>
          <Nut bien="nhat" className={nutCao} disabled={bao} onClick={() => { setChe('xem'); setSua(the.de_xuat) }}>Quay lại</Nut>
        </>}
        {che === 'bo' && <>
          <Nut bien="nguy" className={nutCao} disabled={bao || !lyDo.trim()} onClick={() => gui('BO', { ly_do_bo: lyDo })}>Xác nhận bỏ</Nut>
          <Nut bien="nhat" className={nutCao} disabled={bao} onClick={() => setChe('xem')}>Quay lại</Nut>
        </>}
      </div>
    </article>
  )
}
