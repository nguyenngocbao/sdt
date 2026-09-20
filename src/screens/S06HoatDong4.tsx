import { useMemo, useState } from 'react'
import { Camera, Check, CircleCheck, Pencil, Plus, X } from 'lucide-react'
import { useApp } from '../lib/store'
import { CAU_HINH } from '../data/seed'
import { HOAT_DONG, TIEU_CHI_SP } from '../data/khbd'
import { TEN_NGAN } from '../data/khbd'
import { bayGio, ngayGio, nid } from '../lib/time'
import { PageHead } from '../components/layout/PageHead'
import { AnhCau } from '../components/art/Art'
import { XemTruocTep } from '../components/Tep'
import { Avatar, Card, Chip, KhoiLuuY, Ma, MaMan, Nhan, Nut, VungThaTep } from '../components/ui/Ui'
import { FormHoatDong, FORM_HOAT_DONG } from '../components/FormHoatDong'

type Ban = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

/** Học sinh luôn dùng phiếu có thể nhập/sửa; giáo viên giữ màn quan sát và dữ liệu nhóm chi tiết. */
export function S06HoatDong4() {
  const { s } = useApp()
  return s.vai_tro === 'HOC_SINH' ? <FormHoatDong cauHinh={FORM_HOAT_DONG.HD4} /> : <S06ChiTietHĐ4 />
}

/** Tính từng tiêu chí sản phẩm từ DỮ LIỆU của nhóm — không viết cứng "5/6 đạt". */
function danhGiaTieuChi(e4: Ban | undefined) {
  const nk = (e4?.nhat_ky as Ban[] | undefined) ?? []
  const vl = (e4?.vat_lieu_dung as Ban | undefined) ?? {}
  const kt = (e4?.kiem_tra_tc as Record<string, boolean> | undefined) ?? {}
  const buoc = nk.every((r, i) => i === 0 ? r.tai_g === 200 : r.tai_g - nk[i - 1].tai_g === 200)
  const on = (e4?.tai_toi_da_on_dinh_g as number | undefined) ?? 0
  return TIEU_CHI_SP.map((tc) => {
    let dat: boolean, ly = ''
    if (tc.ma === 'TC03') { dat = (vl.giay_to ?? 0) <= 5 && (vl.bang_dinh_cm ?? 0) <= 50; if (!dat) ly = `Dùng ${vl.giay_to} tờ A4 và ${vl.bang_dinh_cm} cm băng dính (giới hạn 5 tờ, 50 cm; vượt ${(vl.bang_dinh_cm ?? 0) - 50} cm).` }
    else if (tc.ma === 'TC06') { dat = nk.length > 0 && buoc; if (!dat) ly = 'Các nấc tải không đều 200 g.' }
    else if (tc.ma === 'TC07') { dat = on >= 600; if (!dat) ly = `Tải ổn định tối đa chỉ ${on} g.` }
    else dat = kt[tc.ma] === true
    return { tc, dat, ly }
  })
}

/** S06 — HĐ4: chế tạo, thử nghiệm và đánh giá. Đánh giá SẢN PHẨM khác hoàn toàn với đánh giá NĂNG LỰC. */
function S06ChiTietHĐ4() {
  const { s, d } = useApp()
  const dl = s.du_lieu
  const laGV = s.vai_tro === 'GIAO_VIEN'
  const hsId = s.vai_tro === 'HOC_SINH' ? s.hoc_sinh_hien_tai : (s.ho_so_dang_mo ?? 'HS0812')
  const hs = dl.hoc_sinh.find((h) => h.id === hsId)!
  const nhom = dl.nhom.find((n) => n.id === hs.nhom_id)!
  const e4 = dl.minh_chung.find((m) => m.id === `E4-${nhom.id}-01`)
  const e3 = dl.minh_chung.find((m) => m.id === `E3-${nhom.id}-01`)
  const nd = (e4?.noi_dung ?? {}) as Ban
  const nhatKy = (nd.nhat_ky as Ban[] | undefined) ?? []
  const tepAnh = e4?.tep.filter((t) => t.loai === 'anh') ?? []
  const [idx, setIdx] = useState(0)
  const [tepMoi, setTepMoi] = useState<string[]>([])
  const tc = useMemo(() => danhGiaTieuChi(nd), [nd])
  const dat = tc.filter((x) => x.dat).length
  const chuaDat = tc.filter((x) => !x.dat)

  const pa = ((dl.minh_chung.find((m) => m.hoc_sinh_id === hsId && m.loai_minh_chung === 'E2' && !dl.minh_chung.some((x) => x.minh_chung_truoc_id === m.id))?.noi_dung ?? {}) as Ban).phuong_an as Ban[] | undefined
  const chon = pa?.[0]
  const qs = dl.quan_sat.filter((q) => (q.nhom_id === nhom.id || q.hoc_sinh_id && nhom.thanh_vien.includes(q.hoc_sinh_id)) && q.hoat_dong_pha.startsWith('HĐ4')).sort((a, b) => b.thoi_diem.localeCompare(a.thoi_diem))

  const [moiQS, setMoiQS] = useState(false)
  const [moTa, setMoTa] = useState('')
  const [cb, setCb] = useState<string[]>(['D1.2'])
  const [hoTro, setHoTro] = useState<'KHONG' | 'GOI_MO' | 'CHI_DAN' | 'MANH'>('KHONG')
  const ghiQS = () => {
    if (moTa.trim().length < 10) return
    d({ kieu: 'GHI_QUAN_SAT', quan_sat: { id: nid('QS'), hoc_sinh_id: hsId, nhom_id: null, hoat_dong_pha: 'HĐ4 – Pha 4.3', chi_bao: cb.slice(0, 2), mo_ta: moTa.trim(), muc_ho_tro: hoTro, nguoi_quan_sat: CAU_HINH.giao_vien, thoi_diem: bayGio() } })
    setMoTa(''); setMoiQS(false)
  }

  const truoc = HOAT_DONG.map((h, i) => ({ ma: h.ma, ten: h.ten, k: hs.tien_do[i] }))

  return (
    <>
      <PageHead
        crumbs={['Bài học', `Lớp ${hs.lop}`, <span key="a"><MaMan ma="S06" />HĐ4</span>]}
        title={<><MaMan ma="S06" />HĐ4: Chế tạo và thử nghiệm</>}
        sub={<>STEM – Cầu giấy chịu lực <span className="mx-1 text-ink-mute">|</span> Lớp {hs.lop}</>}
        right={
          <ol className="flex items-start gap-1 sm:gap-2" aria-label="Các hoạt động">
            {truoc.map((h, i) => {
              const xong = h.k === 'x' || h.k === 'c' || h.k === 'v'
              const chonHD = h.ma === 'HĐ4'
              return (
                <li key={h.ma} className="relative flex w-[64px] flex-col items-center text-center">
                  {i > 0 && <span className={`absolute right-1/2 top-[15px] h-0.5 w-full ${xong || chonHD ? 'bg-brand-400' : 'bg-slate-200'}`} />}
                  <span className={`relative z-10 flex h-[30px] w-[30px] items-center justify-center rounded-full text-[12px] font-extrabold ${chonHD ? 'bg-brand-600 text-white ring-4 ring-brand-100' : xong ? 'bg-brand-500 text-white' : 'bg-slate-200 text-slate-500'}`}>{xong && !chonHD ? <Check size={15} strokeWidth={3} /> : i + 1}</span>
                  <span className={`mt-1 text-[11px] font-bold ${chonHD ? 'text-brand-700' : 'text-ink'}`}>{h.ma}</span>
                  <span className="text-[10px] leading-tight text-ink-soft">{h.ten}</span>
                </li>
              )
            })}
          </ol>}
      />

      <div className="grid gap-4 xl:grid-cols-[0.85fr_1fr_1fr]">
        <Card title="Thông tin chung">
          <dl className="space-y-2 text-[12.5px]">
            {[['Nhóm học sinh', nhom.ten], ['Thành viên', nhom.thanh_vien.map((id) => dl.hoc_sinh.find((h) => h.id === id)?.ho_ten).join(', ')], ['Lớp', hs.lop], ['Giáo viên hướng dẫn', CAU_HINH.giao_vien], ['Thời gian thực hiện', '14/10/2024 – 15/10/2024']].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[104px_1fr] gap-2"><dt className="text-ink-soft">{k}</dt><dd className="font-medium leading-snug text-ink">{v}</dd></div>))}
            <div className="grid grid-cols-[104px_1fr] items-center gap-2"><dt className="text-ink-soft">Trạng thái</dt><dd><Chip tone="green" dot><CircleCheck size={13} /> Đã hoàn thành thử nghiệm</Chip></dd></div>
          </dl>
        </Card>

        <Card title="Thiết kế được chọn" action={<Chip tone="teal">{String(e3?.noi_dung && (e3.noi_dung as Ban).phuong_an_chon || 'Phương án 1').split(':')[0]}</Chip>}>
          <div className="h-[150px] overflow-hidden rounded-xl bg-slate-100 ring-1 ring-line"><AnhCau kieu={(chon?.kieu as 'truss') ?? 'truss'} tone="light" className="h-full w-full" /></div>
          <div className="mt-3 text-[12.5px] font-extrabold text-ink">Đặc điểm thiết kế</div>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-[12px] leading-snug text-ink-soft">{((chon?.dac_diem as string[] | undefined) ?? ['Xem phiếu E2 của học sinh']).map((x) => <li key={x}>{x}</li>)}</ul>
          {e3 && <p className="mt-2 text-[11.5px] text-ink-mute">Lựa chọn của nhóm: {(e3.noi_dung as Ban).phuong_an_chon}</p>}
        </Card>

        <Card title="Ảnh/Video sản phẩm thực tế">
          <div className="relative h-[150px] overflow-hidden rounded-xl ring-1 ring-line">
            <AnhCau kieu={tepAnh[idx]?.kieu ?? 'arch'} tone={tepAnh[idx]?.tone ?? 'light'} className="h-full w-full" />
            <span className="absolute right-2 top-2 rounded-full bg-emerald-100 px-2.5 py-1 text-[10.5px] font-bold text-emerald-800">Sản phẩm đã chế tạo</span>
          </div>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {tepAnh.slice(0, 3).map((t, i) => <XemTruocTep key={t.ten} t={t} chon={i === idx} onClick={() => setIdx(i)} cao="h-[52px]" />)}
            <button onClick={() => d({ kieu: 'TOAST', noi_dung: 'Bản demo không tải tệp thật.' })} className="flex h-[52px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 text-[9.5px] leading-tight text-ink-soft hover:border-brand-400"><Plus size={14} />Tải ảnh/video</button>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_1fr]">
        <Card title="Kết quả thử tải" sub={String(nd.dieu_kien_thu ?? '')}>
          <div className="scroll-thin overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-[12.5px]">
              <thead><tr className="border-b border-line bg-slate-50/70 text-[10.5px] font-bold uppercase tracking-wide text-ink-mute"><th className="px-2 py-2">Lần thử</th><th className="px-2 py-2 text-right">Tải trọng (g)</th><th className="px-2 py-2">Vị trí biến dạng</th><th className="px-2 py-2">Dạng hư hỏng</th><th className="px-2 py-2">Điều kiện thử</th><th className="px-2 py-2">Ghi chú</th></tr></thead>
              <tbody>
                {nhatKy.map((r) => (
                  <tr key={r.lan} className={`border-b border-slate-100 last:border-0 ${r.loi ? 'bg-rose-50 font-semibold text-rose-700' : ''}`}>
                    <td className="px-2 py-2 tabular-nums">{r.lan}</td><td className="px-2 py-2 text-right tabular-nums">{r.tai_g}</td><td className="px-2 py-2">{r.vi_tri}</td><td className="px-2 py-2">{r.dang}</td><td className="px-2 py-2 text-[11.5px]">Nấc 200 g, giữ 5 giây</td><td className="px-2 py-2">{r.ghi_chu}</td>
                  </tr>))}
                {nhatKy.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-ink-soft">Nhóm chưa nộp nhật kí thử tải.</td></tr>}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11.5px] text-ink-mute">Tải tối đa ổn định (giữ đủ 5 giây): <strong className="text-ink">{String(nd.tai_toi_da_on_dinh_g ?? '—')} g</strong>. Chỉ dùng để so sánh các phiên bản, <strong>không dùng làm điểm năng lực</strong>.</p>
        </Card>

        <Card title="Tiêu chí thành công của sản phẩm" sub="Tính tự động từ dữ liệu nhóm ghi nhận — khác với đánh giá năng lực">
          <table className="w-full text-left text-[12.5px]">
            <thead><tr className="border-b border-line text-[10.5px] font-bold uppercase tracking-wide text-ink-mute"><th className="px-1.5 py-2">Tiêu chí</th><th className="px-1.5 py-2">Yêu cầu</th><th className="w-12 px-1.5 py-2 text-center">Đạt</th><th className="w-14 px-1.5 py-2 text-center">Chưa đạt</th></tr></thead>
            <tbody>{tc.map(({ tc: c, dat: ok }) => (
              <tr key={c.ma} className="border-b border-slate-100 last:border-0">
                <td className="px-1.5 py-2 font-semibold text-ink">{c.ten}<Ma>{c.ma}</Ma></td><td className="px-1.5 py-2 text-[11.5px] leading-snug text-ink-soft">{c.yeu_cau}</td>
                <td className="px-1.5 py-2 text-center">{ok ? <CircleCheck size={18} className="mx-auto text-emerald-500" /> : <span className="mx-auto block h-[18px] w-[18px] rounded-full border-2 border-slate-300" />}</td>
                <td className="px-1.5 py-2 text-center">{!ok ? <X size={18} className="mx-auto rounded-full bg-amber-100 p-0.5 text-amber-700" /> : <span className="mx-auto block h-[18px] w-[18px] rounded-full border-2 border-slate-300" />}</td>
              </tr>))}</tbody>
          </table>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr_0.75fr]">
        <Card title="Ghi nhận quan sát của giáo viên" sub="Mô tả hành vi cụ thể — không gắn nhãn (KHBD A.4)" action={laGV && !moiQS ? <Nut nho onClick={() => setMoiQS(true)}><Pencil size={13} /> Ghi quan sát</Nut> : undefined}>
          {moiQS && (
            <div className="mb-3 space-y-2 rounded-xl border border-brand-200 bg-brand-50/40 p-3">
              <Nhan>Điều em quan sát thấy (hành vi, thời điểm, bối cảnh)</Nhan>
              <textarea value={moTa} onChange={(e) => setMoTa(e.target.value)} rows={3} placeholder="Ví dụ: HS chỉ vào vị trí gãy và viện dẫn lần thử 3…  (tránh: “HS hiểu tốt”)" className="field !bg-white" />
              <div className="grid grid-cols-2 gap-2">
                <label className="text-[11px] text-ink-soft">Gắn chỉ báo (tối đa 2)
                  <select multiple size={3} value={cb} onChange={(e) => setCb([...e.target.selectedOptions].map((o) => o.value).slice(0, 2))} className="field mt-0.5 !py-1">{['C3.1', 'D1.2', 'D2.3'].map((c) => <option key={c} value={c}>{TEN_NGAN[c]}</option>)}</select></label>
                <label className="text-[11px] text-ink-soft">Mức hỗ trợ đã dùng
                  <select value={hoTro} onChange={(e) => setHoTro(e.target.value as typeof hoTro)} className="field mt-0.5"><option value="KHONG">Không hỗ trợ</option><option value="GOI_MO">Gợi mở</option><option value="CHI_DAN">Chỉ dẫn bước</option><option value="MANH">Can thiệp mạnh</option></select></label>
              </div>
              <div className="flex gap-2"><Nut bien="chinh" nho disabled={moTa.trim().length < 10} onClick={ghiQS}>Lưu quan sát</Nut><Nut bien="nhat" nho onClick={() => setMoiQS(false)}>Hủy</Nut></div>
            </div>
          )}
          <ul className="space-y-3">
            {qs.map((q) => (
              <li key={q.id} className="flex gap-2.5"><Avatar ten="GV" size={32} tone="navy" />
                <div className="min-w-0 flex-1 rounded-xl bg-sky/60 px-3 py-2.5">
                  <div className="flex flex-wrap items-center gap-x-2 text-[11.5px] text-ink-soft"><strong className="text-ink">{q.nguoi_quan_sat}</strong><span>{ngayGio(q.thoi_diem)}</span><span>· {q.hoat_dong_pha}</span></div>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-ink">{q.mo_ta}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">{q.chi_bao.map((c) => <Chip key={c} tone="teal">{TEN_NGAN[c] ?? c}</Chip>)}<Chip tone="slate">Hỗ trợ: {{ KHONG: 'không', GOI_MO: 'gợi mở', CHI_DAN: 'chỉ dẫn bước', MANH: 'can thiệp mạnh' }[q.muc_ho_tro]}</Chip>{q.nhom_id && <Chip tone="violet">Quan sát nhóm</Chip>}</div>
                </div></li>))}
            {qs.length === 0 && <li className="rounded-xl bg-slate-50 px-4 py-6 text-center text-[12.5px] text-ink-soft">Chưa có quan sát nào ở HĐ4.</li>}
          </ul>
        </Card>

        <Card title="Sản phẩm đạt/chưa đạt tiêu chí nào?">
          <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3"><CircleCheck size={26} className="text-emerald-600" /><span className="text-[15px] font-extrabold text-emerald-800">Sản phẩm đạt {dat}/{tc.length} tiêu chí</span></div>
          {chuaDat.length > 0 && (
            <div className="mt-3"><div className="text-[13px] font-extrabold text-rose-700">Chưa đạt:</div>
              <ul className="mt-1 space-y-1.5 text-[12.5px] leading-snug text-ink">{chuaDat.map((x) => <li key={x.tc.ma} className="flex gap-2"><span className="text-amber-600">•</span><span><strong>{x.tc.ten}:</strong> {x.ly}</span></li>)}</ul>
              <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-[11.5px] leading-relaxed text-amber-900">Theo KHBD (TC03): vượt giới hạn vật liệu thì <strong>đánh dấu vi phạm ràng buộc, không quy thành mức năng lực thấp</strong>.</p></div>)}
          <p className="mt-3 text-[12.5px] leading-relaxed text-ink"><strong>Kết luận:</strong> Đây là đánh giá <em>sản phẩm</em>. Năng lực thiết kế của từng học sinh được đánh giá riêng ở màn “Minh chứng + Rubric”; cầu chịu tải cao hay thấp đều không tự động quyết định mức năng lực.</p>
        </Card>

        <Card title="Tải minh chứng">
          <VungThaTep hoTro="Ảnh, video, PDF — dung lượng tối đa 100 MB (bản demo chỉ ghi tên tệp)" onChon={(t) => setTepMoi((v) => [...v, ...t])} nho />
          {tepMoi.length > 0 && <ul className="mt-2 space-y-1 text-[12px] text-ink">{tepMoi.map((t) => <li key={t} className="rounded-lg bg-brand-50 px-2.5 py-1.5">{t}</li>)}</ul>}
          <div className="mt-3 flex items-center gap-2 text-[11.5px] text-ink-mute"><Camera size={14} /> Chỉ thu dữ liệu phục vụ minh chứng, theo quy định dữ liệu lớp học.</div>
        </Card>
      </div>

      <KhoiLuuY className="mt-4">Cầu gãy sớm <strong>không đồng nghĩa</strong> năng lực thấp: nếu học sinh ghi dữ liệu đúng và phân tích nguyên nhân có căn cứ, minh chứng vẫn tốt. Sai quy trình TC06 thì dữ liệu lần thử đó bị gắn cờ “không so sánh được” và không dùng để kết luận cải tiến.</KhoiLuuY>
    </>
  )
}
