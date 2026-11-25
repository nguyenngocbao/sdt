import { useEffect, useState } from 'react'
import { PageHead } from '../components/layout/PageHead'
import { Card, MaMan, Trong } from '../components/ui/Ui'
import { BangSoLieu } from '../components/phieu/BangSoLieu'
import { BangChenhLech } from '../components/phieu/ChenhLech'
import { XemTheoMau } from '../components/phieu/FormTheoMau'
import { MAU, type LoaiTheoMau } from '../data/mauPhieu'
import { chenhLech, layMoiPhieu, type PhieuDaNop, type TomTatLanThu } from '../data/phieu'

const ds = (p: PhieuDaNop) => (p.noi_dung.tom_tat_lan_thu as TomTatLanThu[]) ?? []
const gio = (p: PhieuDaNop) => new Date(p.thoi_diem).toLocaleString('vi-VN')

export function ManB_BaiDaNop() {
  const [phieu, setPhieu] = useState<PhieuDaNop[] | null>(null)
  const [loi, setLoi] = useState('')
  useEffect(() => { layMoiPhieu().then(setPhieu).catch((e: Error) => { setLoi(e.message); setPhieu([]) }) }, [])

  const cuaLoai = (l: string) => (phieu ?? []).filter((p) => p.loai === l)
  const e4 = cuaLoai('E4'), e5 = cuaLoai('E5')
  const e4Moi = e4[e4.length - 1], e5Moi = e5[e5.length - 1]

  return (
    <>
      <PageHead crumbs={['Học tập', 'Bài đã nộp']} title={<><MaMan ma="B" />Bài đã nộp</>} sub="Thiết kế cầu giấy chịu lực" />
      {loi && <p role="alert" className="mb-3 text-sm text-amber-800">{loi}</p>}
      {phieu === null ? <Trong>Đang tải…</Trong> : !phieu.length ? <Card title="Các phiếu đã nộp"><Trong>Em chưa nộp phiếu nào.</Trong></Card> : (
        <div className="space-y-4">
          {e4Moi && e5Moi && (
            <Card title="Số liệu của em: v1 so với v2"><BangChenhLech cl={chenhLech(ds(e4Moi), ds(e5Moi))} duDoan={String(e5Moi.noi_dung.du_doan_tai_moi_g ?? '')} /></Card>
          )}
          {[...phieu].reverse().filter((p) => p.loai in MAU).map((p) => {
            const cung = cuaLoai(p.loai)
            return (
              <Card key={p.id} title={`${MAU[p.loai as LoaiTheoMau].ten} — ${gio(p)}`} sub={p === cung[cung.length - 1] ? 'Bản mới nhất' : 'Bản cũ (đã được nộp lại)'}>
                <XemTheoMau mau={MAU[p.loai as LoaiTheoMau]} p={p} />
              </Card>
            )
          })}
          {[...e4, ...e5].reverse().map((p) => (
            <Card key={p.id} title={`${p.loai === 'E4' ? 'Phiếu E4 · v1' : 'Phiếu E5 · v2'} — ${gio(p)}`} sub={p === e4Moi || p === e5Moi ? 'Bản mới nhất' : 'Bản cũ (đã được nộp lại)'}>
              <BangSoLieu ds={ds(p)} />
              <dl className="mt-3 space-y-2 text-[13.5px]">
                {p.loai === 'E4' ? <>
                  <Muc t="Thay đổi so với thiết kế" v={p.noi_dung.thay_doi_so_voi_thiet_ke} />
                  <Muc t="Nguyên nhân hạn chế" v={p.noi_dung.nguyen_nhan_han_che} />
                  <Muc t="Minh chứng viện dẫn" v={p.noi_dung.minh_chung_vien_dan ? `Lần thử ${p.noi_dung.minh_chung_vien_dan}` : ''} />
                </> : <>
                  <Muc t="Thay đổi" v={[...((p.noi_dung.thay_doi as string[]) ?? []), p.noi_dung.thay_doi_chu].filter(Boolean).join('; ')} />
                  <Muc t="Nhắm vào nguyên nhân" v={p.noi_dung.nham_vao_nguyen_nhan} />
                  <Muc t="Dự đoán tải mới" v={p.noi_dung.du_doan_tai_moi_g != null ? `${p.noi_dung.du_doan_tai_moi_g} g` : ''} />
                  <Muc t="Giải thích" v={p.noi_dung.giai_thich} />
                </>}
              </dl>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}

function Muc({ t, v }: { t: string; v: unknown }) {
  if (!v) return null
  return <div><dt className="font-bold text-ink">{t}</dt><dd className="whitespace-pre-wrap text-ink-soft">{String(v)}</dd></div>
}
