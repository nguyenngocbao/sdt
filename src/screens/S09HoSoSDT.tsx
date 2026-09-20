import { useMemo, useState } from 'react'
import { ArrowLeft, CircleAlert, CircleCheck, CircleDot, FileText, FolderKanban, Image as ImageIcon, Lightbulb, Circle, TriangleAlert, Video } from 'lucide-react'
import { useApp } from '../lib/store'
import { CAU_HINH } from '../data/seed'
import { HOP_PHAN, TEN_NGAN, TEN_RUT_GON } from '../data/khbd'
import { CHI_BAO_LOI_12 } from '../data/builders'
import { chiBaoLoiHocSinh, demChiBao, hoTroChoChinhBai, soChiBaoCoCanCu, tienDoHocSinh, TEN_TRANG_THAI_HD } from '../lib/derive'
import { ngay, gio } from '../lib/time'
import { PageHead } from '../components/layout/PageHead'
import { BangTruyVet } from '../components/BangTruyVet'
import { Avatar, Card, Chip, ChipDocLap, ChipMuc, ChipTrangThai, KhoiLuuY, LinkNho, Ma, MaMan, Nut, ProgressBar, Ring } from '../components/ui/Ui'
import type { TrangThaiSDT } from '../types'

/** Trạng thái hiển thị một chỉ báo: phân biệt rõ "chưa đủ dữ liệu" với "mức thấp". */
function ChipChiBao({ tt }: { tt: TrangThaiSDT | null }) {
  if (!tt) return <Chip tone="slate">Chưa có dữ liệu</Chip>
  if (tt.trang_thai_chat_luong === 'HOP_LE' && tt.muc === null) return <Chip tone="blue">Chờ đánh giá</Chip>
  if (tt.trang_thai_chat_luong !== 'HOP_LE') return <ChipTrangThai t={tt.trang_thai_chat_luong} />
  return <ChipDocLap t={tt.tinh_doc_lap} />
}

const IconChiBao = ({ tt }: { tt: TrangThaiSDT | null }) => {
  const p = { size: 15, className: 'shrink-0' }
  if (!tt || tt.trang_thai_chat_luong === 'KHONG_CO_CO_HOI') return <Circle {...p} className="shrink-0 text-slate-300" />
  if (tt.trang_thai_chat_luong === 'THIEU_MINH_CHUNG') return <CircleAlert {...p} className="shrink-0 text-amber-500" />
  if (tt.trang_thai_chat_luong === 'CAN_XEM_XET') return <TriangleAlert {...p} className="shrink-0 text-orange-500" />
  if (tt.muc === null) return <CircleDot {...p} className="shrink-0 text-sky-500" />
  return tt.tinh_doc_lap === 'CO_HO_TRO' ? <CircleCheck {...p} className="shrink-0 text-sky-500" /> : <CircleCheck {...p} className="shrink-0 text-emerald-500" />
}

/** S09 — Hồ sơ tiến trình SDT. Học sinh xem của mình; giáo viên xem của một học sinh. */
export function S09HoSoSDT() {
  const { s, d } = useApp()
  const dl = s.du_lieu
  const laGV = s.vai_tro !== 'HOC_SINH'
  const hsId = laGV ? (s.ho_so_dang_mo ?? 'HS0812') : s.hoc_sinh_hien_tai
  const hs = dl.hoc_sinh.find((h) => h.id === hsId)!
  const [truyVet, setTruyVet] = useState<string | null>(null)
  const [cbMo, setCbMo] = useState<string | null>(null)

  const td = tienDoHocSinh(hs)
  const cb = useMemo(() => chiBaoLoiHocSinh(dl, hsId), [dl, hsId])
  const dem = demChiBao(cb)
  const choChinh = hoTroChoChinhBai(dl, hsId)
  const nhom = dl.nhom.find((n) => n.id === hs.nhom_id)

  const mcCuaHS = dl.minh_chung.filter((m) => m.hoc_sinh_id === hsId).sort((a, b) => b.thoi_diem.localeCompare(a.thoi_diem))
  const daDanhGia = (id: string) => dl.danh_gia.some((g) => g.minh_chung_ids.includes(id))
  const thieuHoacXem = cb.filter((x) => x.tt && (x.tt.trang_thai_chat_luong === 'CAN_XEM_XET' || x.tt.trang_thai_chat_luong === 'THIEU_MINH_CHUNG'))

  const viec = [
    choChinh.length ? { t: 'Chỉnh hàm ý thiết kế theo gợi ý của giáo viên', s: 'Bổ sung dòng dữ liệu làm căn cứ rồi nộp phiên bản mới.', nut: 'Xem gợi ý', han: 'Hạn: hôm nay', tone: 'rose' as const, on: () => d({ kieu: 'DOI_MAN_HINH', man_hinh: 'S04', tab: 'khao_sat' }) } : null,
    thieuHoacXem.length ? { t: 'Bổ sung minh chứng cho các chỉ báo đang chờ căn cứ', s: thieuHoacXem.map((x) => TEN_NGAN[x.ma]).slice(0, 2).join('; '), nut: 'Xem gợi ý', han: '', tone: 'orange' as const, on: () => d({ kieu: 'DOI_MAN_HINH', man_hinh: 'S08' }) } : null,
    { t: 'Chuẩn bị cho HĐ5 – Cải tiến và phản tư', s: 'Đọc lại nhật ký thử tải và nêu điểm cần cải tiến.', nut: 'Xem hướng dẫn', han: 'Dự kiến bắt đầu: 21/10/2024', tone: 'blue' as const, on: () => d({ kieu: 'DOI_MAN_HINH', man_hinh: 'S06' }) },
    { t: 'Hoàn thiện nhật ký học tập', s: 'Cập nhật những điều em đã học được sau chủ đề này.', nut: 'Viết nhật ký', han: '', tone: 'slate' as const, on: () => d({ kieu: 'TOAST', noi_dung: 'Nhật ký học tập chưa có trong bản demo.' }) },
  ].filter(Boolean) as { t: string; s: string; nut: string; han: string; tone: 'rose' | 'orange' | 'blue' | 'slate'; on: () => void }[]

  return (
    <>
      <PageHead
        crumbs={[laGV ? 'Học sinh' : 'Hồ sơ SDT của tôi', <span key="c"><MaMan ma="S09" />{laGV ? hs.ho_ten : 'Hồ sơ SDT'}</span>]}
        title={<span className="flex items-center gap-3">
          {laGV && <button onClick={() => d({ kieu: 'DOI_MAN_HINH', man_hinh: 'S10' })} aria-label="Quay lại bảng điều khiển" className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 hover:bg-brand-100"><ArrowLeft size={19} /></button>}
          {!laGV && <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white"><FolderKanban size={22} /></span>}
          <span><MaMan ma="S09" />{laGV ? `Hồ sơ SDT – ${hs.ho_ten}` : 'Hồ sơ SDT của tôi'}</span></span>}
        sub={<>Theo dõi hành trình học tập và phát triển năng lực qua chủ đề: <strong className="text-brand-700">Cầu giấy chịu lực</strong></>}
        right={<>
          {laGV && <Nut onClick={() => d({ kieu: 'DOI_MAN_HINH', man_hinh: 'S12', hoc_sinh: hsId })}>Sang màn đánh giá</Nut>}
          <label className="text-[11px] text-ink-soft">Chọn chủ đề<select className="field mt-0.5 !w-48 !py-1.5" defaultValue="1"><option value="1">Cầu giấy chịu lực</option></select></label>
          <label className="text-[11px] text-ink-soft">Chọn lớp<select className="field mt-0.5 !w-24 !py-1.5" defaultValue="1"><option value="1">{CAU_HINH.lop}</option></select></label>
        </>}
      />

      <div className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
          <Card pad={false}>
            <div className="flex items-center gap-4 p-4">
              <Avatar ten={hs.ho_ten} size={72} tone="brand" />
              <div><div className="text-[19px] font-extrabold leading-tight text-ink">{hs.ho_ten}</div><div className="text-[13px] text-ink-soft">Lớp {hs.lop}</div>
                <p className="mt-2 font-serif text-[13px] italic leading-snug text-ink-soft">“Học để tạo ra giá trị thực cho cuộc sống.”</p></div>
            </div>
            <dl className="mx-4 mb-4 space-y-2 rounded-xl bg-slate-50 p-3.5 text-[12.5px]">
              {[['Mã học sinh', hs.id], ['Lớp', hs.lop], ['Nhóm', nhom?.ten ?? '—'], ['Giáo viên phụ trách', CAU_HINH.giao_vien], ['Thời gian thực hiện', '10/10/2024 – 22/11/2024']].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[130px_1fr] gap-2"><dt className="text-ink-soft">{k}</dt><dd className="font-semibold text-ink">{v}</dd></div>))}
              <div className="grid grid-cols-[130px_1fr] items-center gap-2"><dt className="text-ink-soft">Trạng thái</dt><dd><Chip tone="green" dot>Đang thực hiện</Chip></dd></div>
            </dl>
          </Card>

          <Card title="Tiến độ 5 hoạt động học tập" action={<LinkNho onClick={() => d({ kieu: 'DOI_MAN_HINH', man_hinh: 'S04' })}>Xem chi tiết</LinkNho>}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {td.map((t) => (
                <div key={t.ma} className="rounded-xl border border-line bg-slate-50/60 p-3">
                  <div className="text-[13px] font-extrabold text-ink">{t.ma}</div>
                  <div className="min-h-[30px] text-[11.5px] leading-tight text-ink-soft">{t.ten}</div>
                  <div className="mt-2 flex items-baseline justify-between text-[13px] font-extrabold tabular-nums text-ink">{t.xong}/{t.tong}<span className="text-[11.5px] font-medium text-ink-soft">{t.pct}%</span></div>
                  <div className="mt-1"><ProgressBar pct={t.pct} tone={t.trang_thai === 'XONG' ? 'green' : 'blue'} /></div>
                  <div className={`mt-2 inline-flex rounded-md px-2 py-1 text-[10.5px] font-semibold ${t.trang_thai === 'XONG' ? 'bg-emerald-50 text-emerald-700' : t.trang_thai === 'CHUA' ? 'bg-slate-100 text-slate-500' : t.trang_thai === 'THIEU' ? 'bg-amber-50 text-amber-700' : 'bg-sky-50 text-sky-700'}`}>{TEN_TRANG_THAI_HD[t.trang_thai].replace('Đã nộp, chờ giáo viên', 'Chờ GV')}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-xl bg-brand-50/70 px-4 py-2.5 text-[12.5px] italic text-brand-800">“Mỗi minh chứng em nộp là một bước để hồ sơ của em rõ ràng và đáng tin hơn.”</div>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <Card title="Hợp phần năng lực & 12 chỉ báo lõi" action={<LinkNho onClick={() => d({ kieu: 'DOI_MAN_HINH', man_hinh: 'S12', hoc_sinh: hsId })}>Xem rubric</LinkNho>}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {HOP_PHAN.map((hp) => {
                const ds = cb.filter((x) => hp.ma === (x.ma[0] as string))
                const co = ds.filter((x) => x.tt?.muc != null).length
                return (
                  <div key={hp.ma} className="flex flex-col rounded-xl border border-line p-3">
                    <div className="flex items-start gap-2"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold text-white" style={{ background: hp.mau }}>{hp.ma}</span><span className="text-[12px] font-bold leading-tight text-ink">{hp.ngan}</span></div>
                    <div className="my-3 flex justify-center"><Ring pct={ds.length ? (co / ds.length) * 100 : 0} size={84} stroke={9} mau={hp.mau}><div className="leading-none"><div className="text-[17px] font-extrabold tabular-nums text-ink">{co}/{ds.length}</div><div className="mt-0.5 text-[9.5px] text-ink-soft">có căn cứ</div></div></Ring></div>
                    <ul className="flex-1 space-y-1.5">
                      {ds.map((x) => (
                        <li key={x.ma}><button onClick={() => x.tt && setTruyVet(x.tt.id)} className="flex w-full items-start gap-1.5 text-left text-[11.5px] leading-snug text-ink hover:text-brand-700"><IconChiBao tt={x.tt} /><span className="flex-1">{TEN_RUT_GON[x.ma]}</span>{x.tt?.muc ? <ChipMuc muc={x.tt.muc} /> : null}</button></li>
                      ))}
                    </ul>
                    <Nut nho className="mt-3 w-full" onClick={() => setCbMo((v) => (v === hp.ma ? null : hp.ma))}>{cbMo === hp.ma ? 'Thu gọn' : 'Xem chi tiết'}</Nut>
                    {cbMo === hp.ma && <p className="mt-2 text-[11px] leading-snug text-ink-soft">{hp.ten}. Bấm vào từng chỉ báo để xem “Vì sao?”.</p>}
                  </div>
                )
              })}
            </div>
          </Card>

          <Card title="Tổng quan 12 chỉ báo lõi" action={<div className="flex flex-wrap justify-end gap-x-3 gap-y-1 text-[11px] text-ink-soft">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-violet-500" />Độc lập ({dem.docLap})</span><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-sky-500" />Có hỗ trợ ({dem.coHoTro})</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-500" />Cần xem xét ({dem.canXemXet})</span><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" />Thiếu ({dem.thieu})</span></div>} pad={false}>
            <div className="scroll-thin max-h-[420px] overflow-y-auto px-4 pb-3">
              <table className="w-full text-left text-[12.5px]">
                <thead><tr className="sticky top-0 bg-white text-[10.5px] font-bold uppercase tracking-wide text-ink-mute"><th className="w-8 py-2">STT</th><th className="py-2">Chỉ báo năng lực</th><th className="py-2 pr-2">Mức</th><th className="py-2">Trạng thái</th><th className="py-2 text-right" /></tr></thead>
                <tbody>
                  {cb.map((x, i) => (
                    <tr key={x.ma} className="border-t border-slate-100">
                      <td className="py-2 tabular-nums text-ink-mute">{i + 1}</td>
                      <td className="py-2 pr-2 text-ink">{TEN_NGAN[x.ma]}<Ma>{x.ma}</Ma></td>
                      <td className="py-2 pr-2">{x.tt?.muc ? <ChipMuc muc={x.tt.muc} /> : <span className="text-ink-mute">—</span>}</td>
                      <td className="py-2"><ChipChiBao tt={x.tt} /></td>
                      <td className="py-2 text-right">{x.tt && <button onClick={() => setTruyVet(x.tt!.id)} className="whitespace-nowrap rounded-md px-2 py-0.5 text-[11.5px] font-bold text-brand-700 ring-1 ring-brand-200 hover:bg-brand-50">Vì sao?</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)_minmax(0,0.85fr)]">
          <Card title="Dòng thời gian minh chứng" action={<LinkNho>Xem tất cả</LinkNho>} pad={false}>
            <ul className="space-y-3 px-4 pb-4 pt-2">
              {mcCuaHS.slice(0, 5).map((m) => {
                const xong = daDanhGia(m.id)
                const chip = m.trang_thai === 'THIEU_MINH_CHUNG' ? { t: 'Cần bổ sung', tone: 'amber' as const } : m.trang_thai === 'CAN_XEM_XET' ? { t: 'Cần xem xét', tone: 'orange' as const } : xong ? { t: 'Đã được đánh giá', tone: 'green' as const } : { t: 'Đang chờ đánh giá', tone: 'blue' as const }
                const Ic = m.tep[0]?.loai === 'video' ? Video : m.tep[0]?.loai === 'anh' ? ImageIcon : FileText
                return (
                  <li key={m.id} className="flex gap-3">
                    <div className="w-[62px] shrink-0 pt-0.5 text-right text-[10.5px] leading-tight text-ink-mute">{ngay(m.thoi_diem)}<br />{gio(m.thoi_diem)}</div>
                    <span className="relative mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700"><Ic size={16} /></span>
                    <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><span className="text-[12.5px] font-bold leading-tight text-ink">Nộp {m.loai_minh_chung} – phiên bản {m.phien_ban}<Ma>{m.ma_minh_chung}</Ma></span><Chip tone={chip.tone}>{chip.t}</Chip></div>
                      <div className="truncate text-[11.5px] text-ink-soft">{m.tep[0] ? `Tệp: ${m.tep[0].ten}${m.tep.length > 1 ? ` (+${m.tep.length - 1})` : ''}` : m.loai_chu_the === 'NHOM' ? 'Sản phẩm nhóm' : 'Nội dung nhập trực tiếp'}</div></div>
                  </li>
                )
              })}
              {mcCuaHS.length === 0 && <li className="py-4 text-center text-[12.5px] text-ink-soft">Chưa có minh chứng nào.</li>}
            </ul>
          </Card>

          <Card title="Tôi cần làm gì tiếp theo?" icon={<CircleCheck size={17} />} pad={false}>
            <ul className="space-y-2.5 px-4 pb-4 pt-1">
              {viec.map((v, i) => (
                <li key={v.t} className="flex items-center gap-3 rounded-xl border border-line p-2.5">
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-extrabold text-white ${{ rose: 'bg-rose-500', orange: 'bg-orange-400', blue: 'bg-sky-500', slate: 'bg-slate-400' }[v.tone]}`}>{i + 1}</span>
                  <div className="min-w-0 flex-1"><div className="text-[12.5px] font-bold leading-tight text-ink">{v.t}</div><div className="mt-0.5 line-clamp-2 text-[11.5px] leading-snug text-ink-soft">{v.s}</div>{v.han && <div className={`mt-1 text-[11px] font-semibold ${v.tone === 'rose' ? 'text-rose-600' : 'text-ink-mute'}`}>{v.han}</div>}</div>
                  <Nut nho onClick={v.on}>{v.nut}</Nut>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Gợi ý dành cho tôi" icon={<Lightbulb size={17} />} pad={false}>
            <ul className="space-y-2 px-4 pb-3 pt-1">
              {[['Xem lại học liệu 2: hình dạng kết cấu – độ cứng', () => d({ kieu: 'TOAST', noi_dung: 'Học liệu trước lớp (S02b) chưa có trong bản demo.' })], ['Xem lại bảng mô tả mức để hiểu rõ yêu cầu', () => d({ kieu: 'DOI_MAN_HINH', man_hinh: laGV ? 'S12' : 'S04', tab: 'nhiem_vu' })], ['Trao đổi với giáo viên khi gặp khó khăn', () => d({ kieu: 'DOI_MAN_HINH', man_hinh: 'S08' })]].map(([t, on]) => (
                <li key={t as string}><button onClick={on as () => void} className="flex w-full items-center gap-2.5 rounded-xl border border-line px-3 py-2.5 text-left text-[12.5px] text-ink hover:border-brand-200 hover:bg-slate-50"><span className="flex-1">{t as string}</span><span className="text-ink-mute">›</span></button></li>
              ))}
            </ul>
            <div className="mx-4 mb-4 rounded-xl bg-mint p-3 text-[12px] leading-snug text-brand-800"><strong>Tiếp tục cố gắng!</strong> Mỗi bước tiến của em đều có ý nghĩa trên hành trình trở thành người học chủ động.</div>
          </Card>
        </div>

        <KhoiLuuY><strong>Chưa đủ dữ liệu</strong> và <strong>mức thấp</strong> là hai chuyện khác nhau. Trạng thái “Thiếu minh chứng” hoặc “Không có cơ hội” nghĩa là hệ thống chưa có căn cứ để kết luận — không phải kết luận rằng em chưa làm được. Tổng số chỉ báo đã có căn cứ: <strong>{soChiBaoCoCanCu(cb)}/{CHI_BAO_LOI_12.length}</strong>. Hệ thống không cộng hay xếp hạng các mức.</KhoiLuuY>
      </div>

      {truyVet && <BangTruyVet trangThaiId={truyVet} onDong={() => setTruyVet(null)} />}
    </>
  )
}
