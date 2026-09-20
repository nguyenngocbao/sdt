import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Check, ClipboardList, FileSearch, Lightbulb, Timer, Upload } from 'lucide-react'
import { useApp, type TabS04 } from '../lib/store'
import { CAU_HINH } from '../data/seed'
import { CHI_BAO } from '../data/rubric'
import { TEN_NGAN } from '../data/khbd'
import { hoTroChoChinhBai, minhChungMoiNhat } from '../lib/derive'
import { nid } from '../lib/time'
import { KHAO_SAT_MAU } from '../data/builders'
import { PageHead } from '../components/layout/PageHead'
import { AnhCau, KetCauGiay, type KieuKetCau } from '../components/art/Art'
import { XemTruocTep } from '../components/Tep'
import { Card, Chip, KhoiLuuY, Ma, MaMan, Nut, ProgressBar, VungThaTep } from '../components/ui/Ui'

type Ban = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

const TAB: { id: TabS04; nhan: string; neo: string }[] = [
  { id: 'nhiem_vu', nhan: '1. Nhiệm vụ', neo: 's04-nhiem-vu' },
  { id: 'khao_sat', nhan: '2. Dữ liệu khảo sát', neo: 's04-khao-sat' },
  { id: 'phuong_an', nhan: '3. Hai phương án thiết kế', neo: 's04-phuong-an' },
  { id: 'nop', nhan: '4. Nộp minh chứng', neo: 's04-nop' },
]

/** S04 — HĐ2, Pha 2.3: dữ liệu → hàm ý thiết kế. Chỗ sinh ra E2 và chỗ học sinh quay lại sau khi nhận hỗ trợ. */
export function S04HoatDong2() {
  const { s, d } = useApp()
  const dl = s.du_lieu
  const laHS = s.vai_tro === 'HOC_SINH'
  const hsId = laHS ? s.hoc_sinh_hien_tai : (s.ho_so_dang_mo && dl.hoc_sinh.find((h) => h.id === s.ho_so_dang_mo)?.co_ho_so ? s.ho_so_dang_mo : 'HS0812')
  const hs = dl.hoc_sinh.find((h) => h.id === hsId)!
  const mc = minhChungMoiNhat(dl, hsId, 'NV-2.3')
  const cha = mc?.minh_chung_cha_id ? dl.minh_chung.find((m) => m.id === mc.minh_chung_cha_id) : null
  const nd = (mc?.noi_dung ?? {}) as Ban
  const khaoSatNhom = ((cha?.noi_dung ?? {}) as Ban).bang_khao_sat as Ban[] | undefined
  // Dữ liệu thực hành giúp học sinh mới có thể hoàn thành form trước khi nhóm nộp bảng chung.
  const khaoSat = khaoSatNhom ?? KHAO_SAT_MAU
  const choChinh = hoTroChoChinhBai(dl, hsId)
  const hoTro = choChinh[0]
  const nv = dl.nhiem_vu.find((n) => n.id === 'NV-2.3')!

  const [chon, setChon] = useState<string[]>((nd.dong_du_lieu_vien_dan as string[] | undefined) ?? [])
  const [hamY, setHamY] = useState<string>((nd.ham_y as string) ?? '')
  const [duDoan, setDuDoan] = useState<string>((nd.du_doan as string) ?? '')
  const [tepMoi, setTepMoi] = useState<string[]>([])
  const phuongAnDaLuu = (nd.phuong_an as Ban[] | undefined) ?? []
  const [tenPA1, setTenPA1] = useState(String(phuongAnDaLuu[0]?.ten ?? ''))
  const [moTaPA1, setMoTaPA1] = useState(String((phuongAnDaLuu[0]?.dac_diem as string[] | undefined)?.join('; ') ?? ''))
  const [tenPA2, setTenPA2] = useState(String(phuongAnDaLuu[1]?.ten ?? ''))
  const [moTaPA2, setMoTaPA2] = useState(String((phuongAnDaLuu[1]?.dac_diem as string[] | undefined)?.join('; ') ?? ''))
  const phuongAnNhap = [
    tenPA1.trim() && { ten: tenPA1.trim(), kieu: 'truss', dac_diem: moTaPA1.split(';').map((x) => x.trim()).filter(Boolean), uu: [], han_che: [] },
    tenPA2.trim() && { ten: tenPA2.trim(), kieu: 'arch', dac_diem: moTaPA2.split(';').map((x) => x.trim()).filter(Boolean), uu: [], han_che: [] },
  ].filter(Boolean) as Ban[]
  const daSua = mc ? (hamY.trim() !== ((nd.ham_y as string) ?? '').trim() || duDoan.trim() !== ((nd.du_doan as string) ?? '').trim() || JSON.stringify(chon) !== JSON.stringify(nd.dong_du_lieu_vien_dan ?? []) || JSON.stringify(phuongAnNhap) !== JSON.stringify(phuongAnDaLuu)) : true
  const nopDuoc = laHS && daSua && hamY.trim().length >= 10 && duDoan.trim().length >= 10 && phuongAnNhap.length >= 2

  useEffect(() => {
    setChon((nd.dong_du_lieu_vien_dan as string[] | undefined) ?? [])
    setHamY((nd.ham_y as string) ?? '')
    setDuDoan((nd.du_doan as string) ?? '')
    setTenPA1(String(phuongAnDaLuu[0]?.ten ?? ''))
    setMoTaPA1(String((phuongAnDaLuu[0]?.dac_diem as string[] | undefined)?.join('; ') ?? ''))
    setTenPA2(String(phuongAnDaLuu[1]?.ten ?? ''))
    setMoTaPA2(String((phuongAnDaLuu[1]?.dac_diem as string[] | undefined)?.join('; ') ?? ''))
    setTepMoi([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mc?.id])

  // cuộn tới mục khi chọn tab / đi từ màn khác tới
  const refs = useRef<Record<string, HTMLElement | null>>({})
  useEffect(() => {
    const neo = TAB.find((t) => t.id === s.tab_s04)?.neo
    if (neo && s.tab_s04 !== 'nhiem_vu') setTimeout(() => refs.current[neo]?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
  }, [s.tab_s04])

  const chonTab = (t: (typeof TAB)[number]) => {
    d({ kieu: 'DOI_MAN_HINH', man_hinh: 'S04', tab: t.id })
    refs.current[t.neo]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const doiChon = (id: string) => laHS && setChon((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]))
  const phuongAn = (nd.phuong_an as Ban[] | undefined) ?? []
  const soNop = dl.hoc_sinh.filter((h) => h.tien_do[1] === 'x').length

  const nop = () => {
    const tep = tepMoi.map((ten) => ({ ten, loai: ten.toLowerCase().endsWith('.pdf') ? 'tai_lieu' as const : 'anh' as const, dung_luong: 'Tệp đã nộp' }))
    if (mc) {
      d({ kieu: 'HS_NOP_LAI', id: nid('E2'), minh_chung_id: mc.id, ham_y: hamY.trim(), dong_vien_dan: chon, du_doan: duDoan.trim(), phuong_an: phuongAnNhap, tep })
    } else {
      d({ kieu: 'HS_NOP_MOI', id: nid('E2'), hoc_sinh_id: hsId, nhom_id: hs.nhom_id, ham_y: hamY.trim(), dong_vien_dan: chon, du_doan: duDoan.trim(), phuong_an: phuongAnNhap, tep })
    }
  }

  const moTa = useMemo(() => (mc ? String(nd.mo_ta_hs ?? '') : ''), [mc, nd.mo_ta_hs])
  const Neo = ({ id, children, className = '' }: { id: string; children: React.ReactNode; className?: string }) => <div id={id} ref={(el) => { refs.current[id] = el }} className={`scroll-mt-40 ${className}`}>{children}</div>

  return (
    <>
      <PageHead
        crumbs={['Bài học', <span key="a"><MaMan ma="S04" />Cầu giấy chịu lực</span>, 'HĐ2 – Nghiên cứu phương án']}
        title={<><MaMan ma="S04" />HĐ2: Nghiên cứu và phát triển phương án</>}
        right={<>
          <div className="text-[12px] text-ink-soft"><div className="text-[11px]">Thời gian hoạt động</div><div className="font-semibold text-ink">10/10/2024 – 24/10/2024</div></div>
          <div className="flex items-center gap-2.5 rounded-xl bg-rose-50 px-4 py-2.5 text-[13px] font-bold text-rose-600"><Timer size={19} /> Còn 5 ngày</div>
          {!laHS && <Nut onClick={() => d({ kieu: 'DOI_MAN_HINH', man_hinh: 'S10' })}><ArrowLeft size={15} /> Quay lại</Nut>}
        </>}
      />

      {!laHS && <div className="mb-3 flex flex-wrap items-center gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-[12.5px] text-sky-900">Bạn đang xem bài của <strong>{hs.ho_ten}</strong> ở chế độ chỉ đọc.
        <Nut nho onClick={() => d({ kieu: 'DOI_MAN_HINH', man_hinh: 'S12', hoc_sinh: hsId })}>Đánh giá minh chứng này</Nut></div>}

      {hoTro && laHS && (
        <div className="mb-3 rounded-2xl border border-sky-200 bg-sky-50 p-4">
          <div className="text-[11px] font-bold uppercase tracking-wide text-sky-700">Gợi ý từ giáo viên</div>
          <p className="mt-1 text-[15px] font-semibold leading-relaxed text-sky-950">“{hoTro.noi_dung}”</p>
          <p className="mt-1.5 text-[11.5px] text-sky-800/80">Gợi ý là câu hỏi để em tự nghĩ tiếp, không phải đáp án. Sau khi em chỉnh, giáo viên sẽ xem lại.</p>
        </div>
      )}

      <div className="sticky top-[88px] z-20 -mx-1 mb-4 rounded-xl border border-line bg-white/95 px-2 shadow-sm backdrop-blur">
        <div role="tablist" className="flex gap-1 overflow-x-auto overflow-y-hidden scroll-thin">
          {TAB.map((t) => (
            <button key={t.id} role="tab" aria-selected={s.tab_s04 === t.id} onClick={() => chonTab(t)}
              className={`-mb-px whitespace-nowrap border-b-[3px] px-4 py-3 text-[13px] font-bold transition ${s.tab_s04 === t.id ? 'border-brand-600 text-brand-700' : 'border-transparent text-ink-soft hover:text-ink'}`}>{t.nhan}</button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="min-w-0 space-y-4">
          <Neo id="s04-nhiem-vu">
            <Card title="Nhiệm vụ học tập" icon={<ClipboardList size={17} />}>
              <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
                <div className="flex gap-3 rounded-xl bg-sky p-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-sky-700"><FileSearch size={22} /></span>
                  <div><h3 className="text-[15px] font-extrabold text-sky-900">HĐ2 – Nghiên cứu và phát triển phương án</h3>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-ink">Dựa trên kết quả khảo sát vật liệu và các cấu trúc giấy, em hãy đề xuất và phát triển ít nhất hai phương án thiết kế cầu giấy chịu lực, sau đó lựa chọn phương án khả thi hơn để tiếp tục hoàn thiện ở HĐ3.</p></div></div>
                <div><h3 className="text-[13.5px] font-extrabold text-ink">Yêu cầu nhiệm vụ</h3>
                  <ol className="mt-1.5 list-decimal space-y-1 pl-5 text-[12.5px] leading-snug text-ink">
                    <li>Phân tích dữ liệu khảo sát, rút ra hàm ý thiết kế.</li><li>Đề xuất ít nhất hai phương án thiết kế cầu giấy.</li>
                    <li>Dự đoán ưu điểm và hạn chế của từng phương án.</li><li>Nộp minh chứng (ảnh/bản phác) và viết phản ánh.</li></ol></div>
              </div>
            </Card>
          </Neo>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
            <Neo id="s04-khao-sat">
              <Card title="2. Dữ liệu khảo sát: Thử cấu trúc giấy" icon={<FileSearch size={17} />} sub={laHS ? 'Bấm vào một dòng để chọn làm căn cứ cho hàm ý của em' : undefined}>
                {!khaoSatNhom && <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-[11.5px] leading-snug text-amber-900">Nhóm chưa nộp dữ liệu chung. Hệ thống đang hiển thị <strong>bộ dữ liệu thực hành</strong> để em có thể điền và kiểm tra form; giáo viên sẽ thấy rõ nó chưa có minh chứng nhóm đi kèm.</p>}
                <div className="scroll-thin overflow-x-auto">
                  <table className="w-full min-w-[500px] text-left text-[12px]">
                    <thead><tr className="border-b border-line bg-slate-50/70 text-[10.5px] font-bold uppercase tracking-wide text-ink-mute">
                      <th className="w-7 px-1.5 py-2">STT</th><th className="px-1.5 py-2">Cấu trúc / cách gấp</th><th className="px-1.5 py-2">Hình minh họa</th><th className="px-1.5 py-2 text-right">Khối lượng chịu lực (g)</th><th className="px-1.5 py-2 text-right">Biến dạng (mm)</th><th className="px-1.5 py-2">Nhận xét</th><th className="w-14 px-1.5 py-2 text-center">Căn cứ</th>
                    </tr></thead>
                    <tbody>
                      {(khaoSat ?? []).map((r, i) => {
                        const c = chon.includes(r.id)
                        return (
                          <tr key={r.id} onClick={() => doiChon(r.id)} className={`border-b border-slate-100 last:border-0 ${laHS ? 'cursor-pointer' : ''} ${c ? 'bg-brand-50' : laHS ? 'hover:bg-slate-50' : ''}`}>
                            <td className="px-1.5 py-2 text-ink-mute">{i + 1}</td><td className="px-1.5 py-2 font-medium text-ink">{r.cau_truc}</td>
                            <td className="px-1.5 py-1"><KetCauGiay kieu={r.kieu as KieuKetCau} className="h-8 w-14" /></td>
                            <td className={`px-1.5 py-2 text-right tabular-nums ${i === 4 ? 'font-extrabold text-ink' : ''}`}>{r.tai_g}</td><td className="px-1.5 py-2 text-right tabular-nums">{r.bien_dang_mm}</td><td className="px-1.5 py-2 text-ink-soft">{r.nhan_xet}</td>
                            <td className="px-1.5 py-2 text-center"><span className={`inline-flex h-5 w-5 items-center justify-center rounded-md border ${c ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 bg-white'}`}>{c && <Check size={13} strokeWidth={3} />}</span></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                {(cha?.noi_dung as Ban | undefined)?.dieu_kien_thu && <p className="mt-2 text-[11px] text-ink-mute">Điều kiện thử: {(cha!.noi_dung as Ban).dieu_kien_thu}</p>}
              </Card>
            </Neo>

            <Card title="3. Dữ liệu → hàm ý thiết kế" icon={<Lightbulb size={17} />} tone="mint" className="!border-brand-100">
              <p className="text-[12px] leading-snug text-ink-soft">Dữ liệu nào dẫn tới hàm ý nào, và vì sao?</p>
              <div className="mt-2 flex min-h-[26px] flex-wrap gap-1.5">
                {chon.length === 0
                  ? <span className="rounded-md bg-amber-100 px-2 py-1 text-[11.5px] font-medium text-amber-800">Em chưa chọn dòng dữ liệu nào làm căn cứ — hàm ý nên dựa trên kết quả em đã đo.</span>
                  : chon.map((id) => { const r = khaoSat?.find((x) => x.id === id); return <span key={id} className="rounded-md bg-white px-2 py-1 text-[11.5px] font-semibold text-brand-800 ring-1 ring-brand-200">{r?.cau_truc} · {r?.tai_g} g · {r?.bien_dang_mm} mm</span> })}
              </div>
              <textarea value={hamY} onChange={(e) => setHamY(e.target.value)} disabled={!laHS} rows={5} placeholder="Ví dụ: Từ dòng … em thấy nên … vì …" aria-label="Hàm ý thiết kế" className="field mt-2.5 !bg-white leading-relaxed disabled:bg-slate-50" />
              {mc && <div className="mt-3 flex gap-2.5 rounded-xl bg-white p-3 ring-1 ring-brand-100">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white"><Check size={14} strokeWidth={3} /></span>
                <div><div className="text-[12.5px] font-extrabold text-ink">Hàm ý đã nộp (phiên bản {mc.phien_ban})</div><p className="mt-0.5 text-[12px] leading-snug text-ink-soft">{(nd.ham_y as string) || 'Chưa có nội dung.'}</p></div></div>}
            </Card>
          </div>

          <Neo id="s04-phuong-an">
            <Card title="4. Hai phương án thiết kế" icon={<ClipboardList size={17} />} sub="Phương án do chính em đề xuất (theo phiếu đã nộp)">
              {laHS && (
                <div className="mb-4 grid gap-3 rounded-2xl border border-brand-100 bg-brand-50/50 p-3.5 lg:grid-cols-2">
                  <div className="space-y-2"><div className="text-[12px] font-extrabold text-brand-900">Phương án 1</div><input value={tenPA1} onChange={(e) => setTenPA1(e.target.value)} className="field !bg-white" placeholder="Tên phương án, ví dụ: Cầu giàn tam giác" aria-label="Tên phương án 1" /><textarea value={moTaPA1} onChange={(e) => setMoTaPA1(e.target.value)} rows={3} className="field !bg-white text-[12px]" placeholder="Đặc điểm, ngăn cách bằng dấu chấm phẩy" aria-label="Đặc điểm phương án 1" /></div>
                  <div className="space-y-2"><div className="text-[12px] font-extrabold text-brand-900">Phương án 2</div><input value={tenPA2} onChange={(e) => setTenPA2(e.target.value)} className="field !bg-white" placeholder="Tên phương án khác về cách chịu lực" aria-label="Tên phương án 2" /><textarea value={moTaPA2} onChange={(e) => setMoTaPA2(e.target.value)} rows={3} className="field !bg-white text-[12px]" placeholder="Đặc điểm, ngăn cách bằng dấu chấm phẩy" aria-label="Đặc điểm phương án 2" /></div>
                  <p className="lg:col-span-2 text-[11px] text-brand-900/75">Hãy mô tả hai phương án khác nhau về kết cấu hoặc cách chịu lực. Có thể sửa trước khi nộp; mỗi lần nộp sau đó tạo phiên bản mới.</p>
                </div>
              )}
              {phuongAn.length === 0 ? <p className="rounded-xl bg-amber-50 px-4 py-6 text-center text-[12.5px] text-amber-800">Em chưa phác phương án nào. Hãy nộp ít nhất hai phương án khác nhau về cách chịu lực.</p> : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {phuongAn.map((p, i) => (
                    <div key={i} className="overflow-hidden rounded-2xl border border-line">
                      <div className="border-b border-line bg-slate-50/70 px-3.5 py-2 text-[13.5px] font-extrabold text-ink">{p.ten}</div>
                      <div className="grid gap-3 p-3 sm:grid-cols-[150px_1fr]">
                        <div className="h-28 overflow-hidden rounded-xl ring-1 ring-line"><AnhCau kieu={p.kieu} tone="light" className="h-full w-full" /></div>
                        <div><div className="text-[11px] font-bold text-ink">Đặc điểm chính</div><ul className="mt-0.5 list-disc space-y-0.5 pl-4 text-[11.5px] leading-snug text-ink-soft">{(p.dac_diem as string[] | undefined)?.map((x) => <li key={x}>{x}</li>)}</ul></div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 px-3 pb-3">
                        <div className="rounded-xl bg-emerald-50 p-2.5"><div className="text-[11.5px] font-extrabold text-emerald-800">Ưu điểm</div><ul className="mt-1 space-y-1 text-[11.5px] leading-snug text-emerald-900">{(p.uu as string[] | undefined)?.map((x) => <li key={x} className="flex gap-1.5"><Check size={13} className="mt-0.5 shrink-0 text-emerald-600" />{x}</li>)}</ul></div>
                        <div className="rounded-xl bg-rose-50 p-2.5"><div className="text-[11.5px] font-extrabold text-rose-800">Hạn chế</div><ul className="mt-1 space-y-1 text-[11.5px] leading-snug text-rose-900">{(p.han_che as string[] | undefined)?.map((x) => <li key={x} className="flex gap-1.5"><span className="mt-0.5 shrink-0 text-rose-500">–</span>{x}</li>)}</ul></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </Neo>
        </div>

        <div className="min-w-0 space-y-4">
          <Card title="Thông tin chung" icon={<ClipboardList size={17} />}>
            <dl className="space-y-2 text-[12.5px]">
              {[['Chủ đề', 'Cầu giấy chịu lực'], ['Lớp học', hs.lop], ['Giáo viên', CAU_HINH.giao_vien], ['Thời gian', '10/10/2024 – 24/10/2024']].map(([k, v]) => <div key={k} className="grid grid-cols-[86px_1fr] gap-2"><dt className="text-ink-soft">{k}</dt><dd className="font-medium text-ink">{v}</dd></div>)}
              <div className="grid grid-cols-[86px_1fr] items-center gap-2"><dt className="text-ink-soft">Trạng thái</dt><dd><Chip tone="green" dot>Đang thực hiện</Chip></dd></div>
              {!laHS && <div className="grid grid-cols-[86px_1fr] items-center gap-2"><dt className="text-ink-soft">Học sinh nộp</dt><dd><div className="flex items-center gap-2 font-medium text-ink">{soNop}/{dl.hoc_sinh.length} ({Math.round((soNop / dl.hoc_sinh.length) * 100)}%)</div><div className="mt-1"><ProgressBar pct={(soNop / dl.hoc_sinh.length) * 100} tone="green" /></div></dd></div>}
              <div className="grid grid-cols-[86px_1fr] gap-2"><dt className="text-ink-soft">Hạn nộp</dt><dd className="font-medium text-ink">24/10/2024, 23:59</dd></div>
            </dl>
          </Card>

          <Card title="Tiêu chí đánh giá (tham khảo)" icon={<ClipboardList size={17} />} sub="Những điều em cần thể hiện trong hoạt động này">
            <table className="w-full text-left text-[12px]"><tbody>
              {['B1.2', 'B1.3', 'B2.1', 'B2.3'].map((c) => (
                <tr key={c} className="border-b border-slate-100 last:border-0"><td className="py-2 pr-2 font-medium text-ink">{TEN_NGAN[c]}<Ma>{c}</Ma></td></tr>
              ))}
            </tbody></table>
            <p className="mt-2 text-[11px] leading-snug text-ink-mute">Giáo viên đối chiếu bài làm với bảng mô tả mức {CHI_BAO['B1.3'] ? 'M1–M4' : ''} của từng tiêu chí. Không có điểm số hay tỉ trọng.</p>
          </Card>

          <Neo id="s04-nop">
            <Card title="5. Nộp minh chứng" icon={<Upload size={17} />}>
              {laHS ? <VungThaTep hoTro="Hỗ trợ: ảnh (JPG, PNG), PDF (≤ 10 MB) — bản demo chỉ ghi tên tệp" onChon={(ten) => setTepMoi((v) => [...v, ...ten])} nho /> : null}
              <div className="mt-3 grid grid-cols-3 gap-2">
                {(mc?.tep ?? []).filter((t) => t.loai === 'anh').slice(0, 2).map((t) => <div key={t.ten}><XemTruocTep t={t} cao="h-[62px]" /><div className="mt-0.5 truncate text-[10px] text-ink-mute">{t.ten}</div></div>)}
                {tepMoi.map((t) => <div key={t} className="flex h-[62px] items-center justify-center rounded-lg bg-brand-50 px-1 text-center text-[10px] font-medium leading-tight text-brand-800 ring-1 ring-brand-200">{t}</div>)}
              </div>
              {(mc?.tep.length ?? 0) === 0 && tepMoi.length === 0 && <p className="mt-2 text-[12px] text-amber-800">Chưa có tệp nào được nộp.</p>}
              {moTa && <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-[11.5px] italic leading-relaxed text-ink-soft">“{moTa}”</p>}
            </Card>
          </Neo>
        </div>
      </div>

      <Card title="6. Phản ánh và lựa chọn phương án" icon={<Lightbulb size={17} />} className="mt-4">
        <p className="text-[12.5px] text-ink-soft">Em hãy giải thích vì sao một trong hai phương án có thể chịu lực tốt hơn? <span className="text-ink-mute">(dựa trên dữ liệu và hiểu biết của em)</span></p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="relative flex-1">
            <textarea value={duDoan} onChange={(e) => setDuDoan(e.target.value.slice(0, 1000))} disabled={!laHS} rows={3} aria-label="Phản ánh và lựa chọn phương án" className="field leading-relaxed disabled:bg-slate-50" />
            <span className="absolute bottom-2 right-3 text-[11px] tabular-nums text-ink-mute">{duDoan.length}/1000</span>
          </div>
          {laHS && <Nut bien="chinh" disabled={!nopDuoc} onClick={nop} className="shrink-0 !px-6 !py-3">Lưu và tiếp tục →</Nut>}
        </div>
        {laHS && !nopDuoc && <p className="mt-2 text-[11.5px] text-ink-mute">Điền hàm ý (ít nhất 10 ký tự), hai phương án và phần phản ánh (ít nhất 10 ký tự) để nộp. Các trường có thể sửa trước khi lưu.</p>}
      </Card>

      <KhoiLuuY className="mt-4">
        Mỗi lần nộp tạo một <strong>phiên bản mới</strong>, không ghi đè bản cũ (hiện là phiên bản {mc?.phien_ban ?? '—'}). Nếu bài làm xuất hiện sau khi em nhận gợi ý, hệ thống ghi rõ bối cảnh <strong>CÓ HỖ TRỢ</strong> — không phải để trừ điểm em, mà để giáo viên biết cần tạo cơ hội khác nhằm xác nhận em làm được một cách độc lập. <Ma>{nv.id}</Ma>
      </KhoiLuuY>
    </>
  )
}
