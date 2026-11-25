import { useState, type ReactNode } from 'react'
import { Check, Send, ThumbsUp } from 'lucide-react'
import { Nut } from '../ui/Ui'
import { taoMaGui, type BuocTraoDoi, type TinTraoDoi } from './api'

const gio = (t: string) => new Date(t).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })

/* ── Tiến trình ba bước: Nhận gợi ý → Phản hồi → Làm lại ─────────────────── */

const SO_BUOC_XONG: Record<BuocTraoDoi, number> = { CHO_EM: 1, CAN_GV: 2, GV_DA_TRA_LOI: 2, EM_HIEU: 2, DA_LAM_LAI: 3 }

export function TienTrinh({ buoc, nhan = ['Nhận gợi ý', 'Phản hồi', 'Làm lại'] }: { buoc: BuocTraoDoi; nhan?: [string, string, string] }) {
  const xong = SO_BUOC_XONG[buoc]
  return (
    <ol className="flex items-center gap-1.5" aria-label={`Đã xong ${xong} trên 3 bước`}>
      {nhan.map((n, i) => {
        const da = i < xong
        const dangLam = i === xong
        return (
          <li key={n} className="flex min-w-0 flex-1 items-center gap-1.5">
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${da ? 'bg-brand-600 text-white' : dangLam ? 'bg-white text-brand-700 ring-2 ring-brand-500' : 'bg-slate-200 text-slate-500'}`}>
              {da ? <Check size={13} strokeWidth={3} /> : i + 1}
            </span>
            <span className={`truncate text-[12px] font-semibold ${da || dangLam ? 'text-ink' : 'text-ink-mute'}`}>{n}</span>
            {i < 2 && <span className={`h-0.5 min-w-3 flex-1 rounded ${i < xong - 1 ? 'bg-brand-500' : 'bg-slate-200'}`} />}
          </li>
        )
      })}
    </ol>
  )
}

/* ── Khung hội thoại ──────────────────────────────────────────────────────── */

/**
 * Tin đầu tiên luôn là gợi ý (do thầy cô gửi). `toi` quyết định tin nào nằm bên phải.
 * `tenKia` là tên hiện cho phía bên kia: "Thầy cô" với học sinh, tên em với giáo viên.
 */
export function KhungTin({ goiY, goiYLuc, tin, toi, tenKia }: {
  goiY: string; goiYLuc: string; tin: TinTraoDoi[]; toi: 'HOC_SINH' | 'GIAO_VIEN'; tenKia: string
}) {
  const ten = (vaiTro: TinTraoDoi['vai_tro']) => vaiTro === toi ? 'Bạn' : vaiTro === 'GIAO_VIEN' ? 'Thầy cô' : tenKia
  return (
    <ul className="space-y-2.5" aria-label="Trao đổi về gợi ý">
      <Bong ben={toi === 'GIAO_VIEN' ? 'phai' : 'trai'} ten={toi === 'GIAO_VIEN' ? 'Gợi ý bạn đã gửi' : 'Thầy cô gợi ý'} luc={goiYLuc} noiBat>
        {goiY}
      </Bong>
      {tin.map((t) => (
        <Bong key={t.id} ben={t.vai_tro === toi ? 'phai' : 'trai'} ten={ten(t.vai_tro)} luc={t.thoi_diem}>
          {t.loai === 'HIEU_ROI' && <span className="inline-flex items-center gap-1.5 font-semibold"><ThumbsUp size={15} />Em hiểu rồi</span>}
          {t.loai === 'CHUA_HIEU' && <span className="block font-semibold">Em chưa hiểu</span>}
          {t.noi_dung && <span className="block whitespace-pre-wrap">{t.noi_dung}</span>}
        </Bong>
      ))}
    </ul>
  )
}

function Bong({ ben, ten, luc, noiBat, children }: { ben: 'trai' | 'phai'; ten: string; luc: string; noiBat?: boolean; children: ReactNode }) {
  const mau = noiBat
    ? 'bg-mint text-ink ring-1 ring-brand-200 text-[16.5px] font-semibold'
    : ben === 'phai' ? 'bg-brand-600 text-white text-[15px]' : 'bg-white text-ink ring-1 ring-slate-200 text-[15px]'
  return (
    <li className={`flex flex-col ${ben === 'phai' ? 'items-end' : 'items-start'}`}>
      <span className="mb-0.5 px-1 text-[11.5px] font-semibold text-ink-soft">{ten} · <time dateTime={luc}>{gio(luc)}</time></span>
      <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 leading-snug ${ben === 'phai' ? 'rounded-br-md' : 'rounded-bl-md'} ${mau}`}>{children}</div>
    </li>
  )
}

/* ── Ô soạn tin ───────────────────────────────────────────────────────────── */

/**
 * Giữ nguyên ma_gui cho tới khi gửi thành công: nếu mất mạng và bấm gửi lại,
 * máy chủ nhận ra bản cũ và không ghi thêm dòng.
 */
export function HopSoanTin({ onGui, goiY, batBuoc = true, nhanNut = 'Gửi', mau, onHuy, tuDong }: {
  onGui: (noiDung: string, maGui: string) => Promise<void>
  goiY: string
  batBuoc?: boolean
  nhanNut?: string
  mau?: string[]
  onHuy?: () => void
  tuDong?: boolean
}) {
  const [chu, setChu] = useState('')
  const [maGui, setMaGui] = useState(taoMaGui)
  const [dangGui, setDangGui] = useState(false)
  const [loi, setLoi] = useState('')
  const gui = async () => {
    setDangGui(true); setLoi('')
    try {
      await onGui(chu.trim(), maGui)
      setChu(''); setMaGui(taoMaGui())
    } catch (e) { setLoi((e as Error).message) } finally { setDangGui(false) }
  }
  return (
    <div className="space-y-2">
      {mau && mau.length > 0 && (
        <div className="flex flex-wrap gap-1.5" aria-label="Câu trả lời nhanh">
          {mau.map((m) => (
            <button key={m} type="button" onClick={() => setChu(m)}
              className="rounded-full bg-slate-100 px-3 py-1.5 text-left text-[12.5px] font-medium text-ink-soft ring-1 ring-slate-200 hover:bg-slate-200">
              {m}
            </button>
          ))}
        </div>
      )}
      <textarea value={chu} onChange={(e) => setChu(e.target.value)} rows={2} maxLength={1000} placeholder={goiY} autoFocus={tuDong}
        aria-label={goiY} className="w-full rounded-xl border border-slate-300 p-3 text-[16px] leading-snug focus:border-brand-500 focus:outline-none" />
      {loi && <p role="alert" className="text-[13px] text-rose-700">{loi} Bấm gửi lại để thử lần nữa.</p>}
      <div className="flex gap-2">
        <Nut bien="chinh" className="min-h-11 flex-1" disabled={dangGui || (batBuoc && !chu.trim())} onClick={gui}>
          <Send size={16} />{dangGui ? 'Đang gửi…' : nhanNut}
        </Nut>
        {onHuy && <Nut bien="nhat" className="min-h-11" disabled={dangGui} onClick={onHuy}>Thôi</Nut>}
      </div>
    </div>
  )
}
