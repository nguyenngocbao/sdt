import { useState, type ReactNode } from 'react'
import { CircleCheck, CircleHelp, Clock, Lightbulb, MessageCircle, RotateCcw, ThumbsUp } from 'lucide-react'
import { Nut } from '../ui/Ui'
import { HopSoanTin, KhungTin, TienTrinh } from './HoiThoai'
import { guiTraoDoi, taoMaGui, type GoiYChoEm, type LoaiTin } from './api'

const TEN_PHIEU = { E4: 'phiếu E4', E5: 'phiếu E5' } as const

/** Lời nhắc theo bước: học sinh luôn biết mình đang ở đâu và nên làm gì tiếp. */
const LOI_NHAC: Record<GoiYChoEm['buoc'], string> = {
  CHO_EM: 'Em đọc gợi ý rồi cho thầy cô biết em thấy thế nào nhé.',
  CAN_GV: 'Thầy cô đã nhận câu hỏi của em và sẽ trả lời ngay tại đây.',
  GV_DA_TRA_LOI: 'Thầy cô vừa trả lời em.',
  EM_HIEU: 'Em hiểu rồi thì làm lại phiếu theo gợi ý nhé.',
  DA_LAM_LAI: 'Em đã làm lại phiếu sau gợi ý này.',
}

/** Thẻ một gợi ý ở Màn A: gợi ý → em phản hồi hoặc hỏi → thầy cô trả lời → em làm lại. */
export function TheGoiYChoEm({ g, onDoi, onLamLai }: { g: GoiYChoEm; onDoi: () => void; onLamLai: (loai: GoiYChoEm['loai_phieu']) => void }) {
  const [soan, setSoan] = useState<'CHUA_HIEU' | 'HOI' | null>(null)
  const [dangGui, setDangGui] = useState(false)
  const [loi, setLoi] = useState('')
  const [moLai, setMoLai] = useState(false)
  const xong = g.buoc === 'DA_LAM_LAI'

  const gui = async (loai: LoaiTin, noiDung: string | undefined, maGui = taoMaGui()) => {
    await guiTraoDoi(g.id, loai, noiDung || undefined, maGui)
    setSoan(null); onDoi()
  }
  const bamHieu = async () => {
    setDangGui(true); setLoi('')
    try { await gui('HIEU_ROI', undefined) } catch (e) { setLoi((e as Error).message) } finally { setDangGui(false) }
  }

  if (xong && !moLai) {
    return (
      <article className="flex flex-wrap items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-200" aria-label={`Gợi ý đã làm xong cho ${TEN_PHIEU[g.loai_phieu]}`}>
        <CircleCheck size={22} className="shrink-0 text-emerald-600" />
        <p className="min-w-0 flex-1 text-[14px] text-emerald-900">
          <span className="font-semibold">Đã làm lại {TEN_PHIEU[g.loai_phieu]}</span>
          {g.nop_lai_luc && <> lúc {new Date(g.nop_lai_luc).toLocaleString('vi-VN')}</>}
          <span className="mt-0.5 block truncate text-emerald-800/80">“{g.noi_dung}”</span>
        </p>
        <button type="button" onClick={() => setMoLai(true)} className="text-[13px] font-semibold text-emerald-800 underline">Xem lại</button>
      </article>
    )
  }

  const moiTraLoi = g.buoc === 'GV_DA_TRA_LOI'
  return (
    <article className={`card space-y-3.5 p-4 ${moiTraLoi ? 'ring-2 ring-brand-400' : ''}`} aria-label={`Gợi ý cho ${TEN_PHIEU[g.loai_phieu]}`}>
      <header className="space-y-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700"><Lightbulb size={19} /></span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-bold leading-tight text-ink">Gợi ý cho {TEN_PHIEU[g.loai_phieu]} của em</h3>
            <p className={`mt-0.5 text-[12.5px] ${moiTraLoi ? 'font-semibold text-brand-700' : 'text-ink-soft'}`}>{LOI_NHAC[g.buoc]}</p>
          </div>
          {xong && <button type="button" onClick={() => setMoLai(false)} className="text-[12.5px] font-semibold text-ink-soft underline">Thu gọn</button>}
        </div>
        <TienTrinh buoc={g.buoc} nhan={['Gợi ý', 'Phản hồi', 'Làm lại']} />
      </header>

      <KhungTin goiY={g.noi_dung} goiYLuc={g.thoi_diem} tin={g.trao_doi} toi="HOC_SINH" tenKia="Thầy cô" />

      {!xong && (
        <div className="space-y-2.5 border-t border-line pt-3">
          {soan ? (
            <HopSoanTin
              tuDong
              batBuoc={soan === 'HOI'}
              goiY={soan === 'HOI' ? 'Em muốn hỏi thầy cô điều gì?' : 'Em chưa hiểu chỗ nào? (có thể để trống)'}
              nhanNut={soan === 'HOI' ? 'Gửi câu hỏi' : 'Gửi cho thầy cô'}
              onGui={(noiDung, maGui) => gui(soan, noiDung, maGui)}
              onHuy={() => setSoan(null)}
            />
          ) : (
            <>
              {g.buoc !== 'CAN_GV' && g.buoc !== 'EM_HIEU' && (
                <div className="grid grid-cols-3 gap-2" role="group" aria-label="Em thấy gợi ý thế nào?">
                  <NutPhanHoi icon={<ThumbsUp size={20} />} nhan="Em hiểu rồi" mau="bg-emerald-50 text-emerald-800 ring-emerald-200 hover:bg-emerald-100" disabled={dangGui} onClick={bamHieu} />
                  <NutPhanHoi icon={<CircleHelp size={20} />} nhan="Em chưa hiểu" mau="bg-amber-50 text-amber-800 ring-amber-200 hover:bg-amber-100" disabled={dangGui} onClick={() => setSoan('CHUA_HIEU')} />
                  <NutPhanHoi icon={<MessageCircle size={20} />} nhan="Em muốn hỏi" mau="bg-sky-50 text-sky-800 ring-sky-200 hover:bg-sky-100" disabled={dangGui} onClick={() => setSoan('HOI')} />
                </div>
              )}
              {g.buoc === 'CAN_GV' && (
                <p className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-[13.5px] text-ink-soft">
                  <Clock size={16} className="shrink-0" />Đang chờ thầy cô trả lời.
                  <button type="button" onClick={() => setSoan('HOI')} className="ml-auto font-semibold text-brand-700 underline">Hỏi thêm</button>
                </p>
              )}
              {g.buoc === 'EM_HIEU' && (
                <p className="text-right"><button type="button" onClick={() => setSoan('HOI')} className="text-[13px] font-semibold text-brand-700 underline">Em vẫn muốn hỏi thêm</button></p>
              )}
              {loi && <p role="alert" className="text-[13px] text-rose-700">{loi}</p>}
              <Nut bien={g.buoc === 'EM_HIEU' ? 'chinh' : 'phu'} className="min-h-12 w-full text-[14.5px]" onClick={() => onLamLai(g.loai_phieu)}>
                <RotateCcw size={17} />Làm lại {TEN_PHIEU[g.loai_phieu]} theo gợi ý
              </Nut>
            </>
          )}
        </div>
      )}
    </article>
  )
}

function NutPhanHoi({ icon, nhan, mau, disabled, onClick }: { icon: ReactNode; nhan: string; mau: string; disabled?: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className={`flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-xl px-2 text-[13px] font-bold ring-1 transition disabled:opacity-50 ${mau}`}>
      {icon}{nhan}
    </button>
  )
}
