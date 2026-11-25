import { useState } from 'react'
import { Avatar, Chip, Trong } from '../ui/Ui'
import { HopSoanTin, KhungTin, TienTrinh } from './HoiThoai'
import { guiTraoDoi, type BuocTraoDoi, type MucTraoDoiGv } from './api'

/** Thứ tự, nhãn và màu của năm trạng thái, dùng chung cho thanh tổng quan, bộ lọc và chip trên thẻ. */
export const BUOC: { id: BuocTraoDoi; nhan: string; ngan: string; tone: 'rose' | 'slate' | 'blue' | 'teal' | 'green'; nen: string }[] = [
  { id: 'CAN_GV', nhan: 'Cần thầy cô trả lời', ngan: 'Cần trả lời', tone: 'rose', nen: 'bg-rose-400' },
  { id: 'CHO_EM', nhan: 'Em chưa phản hồi', ngan: 'Chưa phản hồi', tone: 'slate', nen: 'bg-slate-300' },
  { id: 'GV_DA_TRA_LOI', nhan: 'Đã trả lời, chờ em', ngan: 'Chờ em', tone: 'blue', nen: 'bg-sky-400' },
  { id: 'EM_HIEU', nhan: 'Em đã hiểu, chưa làm lại', ngan: 'Em đã hiểu', tone: 'teal', nen: 'bg-brand-400' },
  { id: 'DA_LAM_LAI', nhan: 'Em đã làm lại', ngan: 'Đã làm lại', tone: 'green', nen: 'bg-emerald-500' },
]

const TRA_LOI_NHANH = [
  'Em xem lại bảng số liệu các lần thử của mình nhé.',
  'Em thử lại cùng một điều kiện rồi so sánh nhé.',
  'Em lên bàn giáo viên để thầy cô giải thích thêm nhé.',
]

/** Tab trao đổi ở Màn D: tổng quan cả lớp theo bước, lọc, trả lời ngay trên thẻ. */
export function TraoDoiLop({ dem, muc, onDoi }: { dem: Record<BuocTraoDoi, number>; muc: MucTraoDoiGv[]; onDoi: () => void }) {
  const [loc, setLoc] = useState<BuocTraoDoi | 'TAT_CA'>(dem.CAN_GV > 0 ? 'CAN_GV' : 'TAT_CA')
  const tong = muc.length
  const hien = loc === 'TAT_CA' ? muc : muc.filter((m) => m.buoc === loc)

  if (!tong) return <Trong>Chưa có gợi ý nào được gửi tới học sinh. Gợi ý bạn bấm Gửi ở tab Chờ duyệt sẽ hiện tại đây.</Trong>

  return (
    <div className="space-y-4">
      <section className="card space-y-3 p-4" aria-label="Tổng quan trao đổi của lớp">
        <div className="flex h-3 overflow-hidden rounded-full bg-slate-100" role="img"
          aria-label={BUOC.map((b) => `${b.nhan}: ${dem[b.id]}`).join(', ')}>
          {BUOC.map((b) => dem[b.id] > 0 && <span key={b.id} className={b.nen} style={{ width: `${(dem[b.id] / tong) * 100}%` }} />)}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-6" role="group" aria-label="Lọc theo trạng thái">
          <NutLoc chon={loc === 'TAT_CA'} onClick={() => setLoc('TAT_CA')} so={tong} nhan="Tất cả" nen="bg-ink" />
          {BUOC.map((b) => <NutLoc key={b.id} chon={loc === b.id} onClick={() => setLoc(b.id)} so={dem[b.id]} nhan={b.ngan} nen={b.nen} canhBao={b.id === 'CAN_GV' && dem[b.id] > 0} />)}
        </div>
      </section>

      {hien.length === 0 && <Trong>Không có thẻ nào ở trạng thái này.</Trong>}
      {hien.map((m) => <TheTraoDoi key={`${m.id}-${m.buoc}`} m={m} onDoi={onDoi} />)}
    </div>
  )
}

function NutLoc({ chon, onClick, so, nhan, nen, canhBao }: { chon: boolean; onClick: () => void; so: number; nhan: string; nen: string; canhBao?: boolean }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={chon}
      className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-left ring-1 transition ${chon ? 'bg-brand-50 ring-brand-400' : 'bg-white ring-slate-200 hover:bg-slate-50'}`}>
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${nen}`} />
      <span className="min-w-0 flex-1">
        <span className={`block text-[18px] font-bold leading-none ${canhBao ? 'text-rose-700' : 'text-ink'}`}>{so}</span>
        <span className="mt-0.5 block truncate text-[11.5px] font-semibold text-ink-soft">{nhan}</span>
      </span>
    </button>
  )
}

function TheTraoDoi({ m, onDoi }: { m: MucTraoDoiGv; onDoi: () => void }) {
  const b = BUOC.find((x) => x.id === m.buoc)!
  const [mo, setMo] = useState(m.buoc === 'CAN_GV')
  const traLoi = async (noiDung: string, maGui: string) => { await guiTraoDoi(m.id, 'TRA_LOI', noiDung, maGui); onDoi() }

  return (
    <article className={`card space-y-3 p-4 ${m.buoc === 'CAN_GV' ? 'ring-2 ring-rose-300' : ''}`} aria-label={`Trao đổi với ${m.ho_ten}`}>
      <header className="flex flex-wrap items-center gap-2.5">
        <Avatar ten={m.ho_ten} size={36} />
        <div className="min-w-0 flex-1">
          <h3 className="text-[14.5px] font-bold leading-tight text-ink">{m.ho_ten} <span className="font-normal text-ink-soft">· {m.ma_hs}</span></h3>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <Chip tone={b.tone} dot>{b.nhan}</Chip>
            <Chip tone="slate">Phiếu {m.loai_phieu}</Chip>
            <Chip tone="teal">Nhánh {m.nhanh}</Chip>
          </div>
        </div>
        <button type="button" onClick={() => setMo((x) => !x)} aria-expanded={mo} className="text-[12.5px] font-semibold text-brand-700 underline">
          {mo ? 'Thu gọn' : m.trao_doi.length ? `Xem ${m.trao_doi.length} tin` : 'Xem'}
        </button>
      </header>
      <TienTrinh buoc={m.buoc} nhan={['Đã gửi gợi ý', 'Em phản hồi', 'Em làm lại']} />
      {mo && <>
        <KhungTin goiY={m.noi_dung} goiYLuc={m.thoi_diem} tin={m.trao_doi} toi="GIAO_VIEN" tenKia={m.ho_ten} />
        {m.buoc === 'DA_LAM_LAI'
          ? m.nop_lai_luc && <p className="text-[13px] text-emerald-800">Em đã nộp lại phiếu {m.loai_phieu} lúc {new Date(m.nop_lai_luc).toLocaleString('vi-VN')}.</p>
          : <HopSoanTin goiY={`Trả lời ${m.ho_ten}…`} nhanNut="Gửi trả lời" mau={m.buoc === 'CAN_GV' ? TRA_LOI_NHANH : undefined} onGui={traLoi} />}
      </>}
    </article>
  )
}
