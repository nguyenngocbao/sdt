import { useCallback, useEffect, useState } from 'react'
import { PageHead } from '../components/layout/PageHead'
import { Card, Chip, MaMan, Trong } from '../components/ui/Ui'
import { TheDuyet } from '../components/goiy/TheDuyet'
import { layHangCho, layThongKeNhanh, type TheGoiY, type ThongKeNhanh } from '../components/goiy/api'

export function ManD_DuyetGoiY() {
  const [the, setThe] = useState<TheGoiY[] | null>(null)
  const [thongKe, setThongKe] = useState<ThongKeNhanh[]>([])
  const [loi, setLoi] = useState('')
  const tai = useCallback(() => {
    Promise.all([layHangCho(), layThongKeNhanh()])
      .then(([h, t]) => { setThe(h.the); setThongKe(t); setLoi('') })
      .catch((e: Error) => { setLoi(e.message); setThe((cu) => cu ?? []) })
  }, [])
  useEffect(tai, [tai])

  const dangCho = thongKe.filter((t) => t.em_cho > 0).sort((a, b) => b.em_cho - a.em_cho)
  const canhBao = thongKe.filter((t) => t.canh_bao_bo_nhieu)

  return (
    <>
      <PageHead crumbs={['Lớp học', 'Duyệt gợi ý']} title={<><MaMan ma="D" />Duyệt gợi ý</>} sub="Thiết kế cầu giấy chịu lực" />
      {loi && <p role="alert" className="mb-3 text-sm text-amber-800">{loi}</p>}
      <div className="space-y-4">
        <Card title={the ? `${the.length} thẻ còn chờ` : 'Đang tải…'}>
          {dangCho.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="Thống kê theo nhánh">
              {dangCho.map((t) => <li key={t.nhanh}><Chip tone="teal">{t.nhanh} — {t.em_cho} em</Chip></li>)}
            </ul>
          )}
          {dangCho.length > 0 && <p className="mt-2 text-[12.5px] text-ink-soft">Nhánh có nhiều em: cân nhắc nói chung cho cả lớp bằng nút Tôi tự nói.</p>}
          {canhBao.map((t) => (
            <p key={t.nhanh} role="status" className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-[13px] text-amber-900 ring-1 ring-amber-200">
              Nhánh {t.nhanh} đã bị bỏ {t.bo}/{t.da_quyet} thẻ ({t.ty_le_bo}%). Nên xem lại luật của nhánh này.
            </p>
          ))}
        </Card>
        {the?.length === 0 && <Trong>Không còn thẻ nào chờ duyệt.</Trong>}
        {the?.map((x) => <TheDuyet key={x.id} the={x} onXong={tai} />)}
      </div>
    </>
  )
}
