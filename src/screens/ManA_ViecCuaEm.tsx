import { useCallback, useEffect, useState } from 'react'
import { PageHead } from '../components/layout/PageHead'
import { Card, MaMan, Trong } from '../components/ui/Ui'
import { FormE4, FormE5 } from '../components/phieu/FormPhieu'
import { docNhap, layPhieuMoiNhat, type LoaiPhieu, type PhieuDaNop } from '../data/phieu'
import { useAuth } from '../lib/auth'
import { layGoiYCuaToi, type GoiYChoEm } from '../components/goiy/api'

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
  useEffect(() => { layGoiYCuaToi().then(setGoiY).catch(() => setGoiY([])) }, [phieu])

  const e4 = phieu?.find((p) => p.loai === 'E4') ?? null
  const e5 = phieu?.find((p) => p.loai === 'E5') ?? null
  const xong = () => { setMo(null); tai() }

  const the = (loai: LoaiPhieu, cu: PhieuDaNop | null, khoa: boolean) => {
    const nhap = docNhap(nguoi, loai) !== null
    return (
      <Card key={loai} title={TEN[loai]} tone={cu ? 'mint' : undefined}>
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
      </Card>
    )
  }

  return (
    <>
      <PageHead crumbs={['Học tập', 'Việc của em']} title={<><MaMan ma="A" />Việc của em</>} sub="Thiết kế cầu giấy chịu lực" />
      {loi && <p role="alert" className="mb-3 text-sm text-amber-800">{loi}</p>}
      <div className="space-y-4">
        {phieu === null ? <Trong>Đang tải…</Trong> : <>{the('E4', e4, false)}{the('E5', e5, !e4)}</>}
        <section aria-label="Bước tiếp theo của em" data-khoi="buoc-tiep-theo">
          <Card title="Bước tiếp theo của em">
            {goiY.length === 0
              ? <Trong>Chưa có gợi ý mới.</Trong>
              : <ul className="space-y-3">{goiY.map((g) => <li key={g.id} className="rounded-xl bg-mint px-4 py-3 text-[16px] font-semibold leading-snug text-ink">{g.noi_dung}</li>)}</ul>}
          </Card>
        </section>
      </div>
    </>
  )
}
