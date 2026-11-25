import { useCallback, useEffect, useState } from 'react'
import { PageHead } from '../components/layout/PageHead'
import { Card, MaMan, Trong } from '../components/ui/Ui'
import { FormE4, FormE5 } from '../components/phieu/FormPhieu'
import { docNhap, layPhieuMoiNhat, type LoaiPhieu, type PhieuDaNop } from '../data/phieu'
import { useAuth } from '../lib/auth'
import { layGoiYCuaToi, type GoiYChoEm } from '../components/goiy/api'
import { TheGoiYChoEm } from '../components/goiy/TheGoiYChoEm'
import { BellRing } from 'lucide-react'

const TEN: Record<LoaiPhieu, string> = { E4: 'Phiếu E4 — Chế tạo và thử tải', E5: 'Phiếu E5 — Cải tiến' }

export function ManA_ViecCuaEm() {
  const { user } = useAuth()
  const nguoi = user?.id ?? ''
  const [phieu, setPhieu] = useState<PhieuDaNop[] | null>(null)
  const [loi, setLoi] = useState('')
  const [goiY, setGoiY] = useState<GoiYChoEm[]>([])
  const [mo, setMo] = useState<LoaiPhieu | null>(null)
  const tai = useCallback(() => { layPhieuMoiNhat().then(setPhieu).catch((e: Error) => { setLoi(e.message); setPhieu([]) }) }, [])
  useEffect(tai, [tai])
  const taiGoiY = useCallback(() => { layGoiYCuaToi().then(setGoiY).catch(() => undefined) }, [])
  useEffect(taiGoiY, [taiGoiY, phieu])
  // Thầy cô trả lời trong lúc em đang mở màn: hỏi lại máy chủ mỗi 20 giây khi tab đang hiện.
  useEffect(() => {
    const id = window.setInterval(() => { if (document.visibilityState === 'visible') taiGoiY() }, 20_000)
    return () => window.clearInterval(id)
  }, [taiGoiY])

  const e4 = phieu?.find((p) => p.loai === 'E4') ?? null
  const e5 = phieu?.find((p) => p.loai === 'E5') ?? null
  const xong = () => { setMo(null); tai() }
  const lamLai = (loai: LoaiPhieu) => {
    setMo(loai)
    window.requestAnimationFrame(() => document.getElementById(`phieu-${loai}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }
  const dangLam = goiY.filter((g) => g.buoc !== 'DA_LAM_LAI')
  const daXong = goiY.filter((g) => g.buoc === 'DA_LAM_LAI')
  const moiTraLoi = goiY.filter((g) => g.buoc === 'GV_DA_TRA_LOI').length

  const the = (loai: LoaiPhieu, cu: PhieuDaNop | null, khoa: boolean) => {
    const nhap = docNhap(nguoi, loai) !== null
    return (
      <div key={loai} id={`phieu-${loai}`} className="scroll-mt-20"><Card title={TEN[loai]} tone={cu ? 'mint' : undefined}>
        {mo === loai && dangLam.some((g) => g.loai_phieu === loai) && (
          <aside aria-label="Gợi ý cần nhớ khi làm lại" className="mb-3 rounded-xl bg-amber-50 px-3.5 py-3 ring-1 ring-amber-200">
            <p className="mb-1 text-[12px] font-bold uppercase tracking-wide text-amber-800">Thầy cô gợi ý</p>
            <ul className="list-disc space-y-1 pl-5 text-[14.5px] font-medium leading-snug text-ink">
              {dangLam.filter((g) => g.loai_phieu === loai).map((g) => <li key={g.id}>{g.noi_dung}</li>)}
            </ul>
          </aside>
        )}
        {mo === loai ? (
          loai === 'E4'
            ? <FormE4 nguoi={nguoi} cu={cu} onXong={xong} onDong={() => setMo(null)} />
            : e4 && <FormE5 nguoi={nguoi} e4={e4} cu={cu} onXong={xong} onDong={() => setMo(null)} />
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[13.5px] text-ink-soft">
              {khoa ? 'Em cần nộp phiếu E4 trước.' : cu ? `Đã nộp lúc ${new Date(cu.thoi_diem).toLocaleString('vi-VN')}.` : 'Chưa nộp.'}
              {nhap && !khoa && ' Có bản nháp chưa nộp.'}
            </p>
            {!khoa && (
              <button type="button" onClick={() => setMo(loai)} className="min-h-12 rounded-xl bg-brand-600 px-5 text-[14.5px] font-bold text-white">
                {nhap ? 'Tiếp tục bản nháp' : cu ? 'Nộp lại' : 'Bắt đầu'}
              </button>
            )}
          </div>
        )}
      </Card></div>
    )
  }

  const khoiGoiY = (
    <section aria-label="Bước tiếp theo của em" data-khoi="buoc-tiep-theo" className="space-y-3">
      <h2 className="flex items-center gap-2 text-[15px] font-bold text-ink">
        Bước tiếp theo của em
        {dangLam.length > 0 && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[12px] font-bold text-amber-800">{dangLam.length} gợi ý</span>}
      </h2>
      {goiY.length === 0 && <Card><Trong>Chưa có gợi ý mới. Khi em nộp phiếu, thầy cô sẽ gửi gợi ý tại đây.</Trong></Card>}
      {dangLam.map((g) => <TheGoiYChoEm key={g.id} g={g} onDoi={taiGoiY} onLamLai={lamLai} />)}
      {daXong.length > 0 && <div className="space-y-2">{daXong.map((g) => <TheGoiYChoEm key={g.id} g={g} onDoi={taiGoiY} onLamLai={lamLai} />)}</div>}
    </section>
  )

  return (
    <>
      <PageHead crumbs={['Học tập', 'Việc của em']} title={<><MaMan ma="A" />Việc của em</>} sub="Thiết kế cầu giấy chịu lực" />
      {loi && <p role="alert" className="mb-3 text-sm text-amber-800">{loi}</p>}
      {moiTraLoi > 0 && (
        <p role="status" className="mb-4 flex items-center gap-2.5 rounded-2xl bg-brand-600 px-4 py-3 text-[14.5px] font-semibold text-white shadow-sm">
          <BellRing size={19} className="shrink-0" />Thầy cô vừa trả lời {moiTraLoi > 1 ? `${moiTraLoi} câu hỏi` : 'câu hỏi'} của em.
        </p>
      )}
      <div className="space-y-5">
        {dangLam.length > 0 && khoiGoiY}
        {phieu === null ? <Trong>Đang tải…</Trong> : <>{the('E4', e4, false)}{the('E5', e5, !e4)}</>}
        {dangLam.length === 0 && khoiGoiY}
      </div>
    </>
  )
}
