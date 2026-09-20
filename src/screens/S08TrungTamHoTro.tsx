import { useMemo, useState } from 'react'
import { BookOpen, CalendarDays, CircleCheck, Lightbulb, MessageCircleQuestion, RefreshCw, Send, ShieldCheck, Sparkles, Sprout, ThumbsUp, Users, FileText, Pencil, Bot } from 'lucide-react'
import { useApp } from '../lib/store'
import { layMau } from '../data/catalog'
import { CHI_BAO } from '../data/rubric'
import { TEN_NGAN } from '../data/khbd'
import { hoTroChoChinhBai, tienDoHocSinh, minhChungMoiNhat } from '../lib/derive'
import { nid, ngayGio, ngay, gio } from '../lib/time'
import { nhanDocLap, nhanTinCay } from '../lib/trace'
import { PageHead } from '../components/layout/PageHead'
import { AnhCau } from '../components/art/Art'
import { Card, Chip, ChipMuc, KhoiLuuY, LinkNho, Ma, MaMan, Nhan, Nut, ProgressBar, SegBar } from '../components/ui/Ui'
import type { LoaiHoTro } from '../types'

const LOAI: Record<LoaiHoTro, { t: string; tone: 'violet' | 'blue' | 'teal' | 'amber' | 'orange' | 'slate' }> = {
  PHUONG_PHAP: { t: 'Hỗ trợ phương pháp', tone: 'violet' }, GOI_Y_Y_TUONG: { t: 'Gợi ý ý tưởng', tone: 'violet' }, TAI_LIEU: { t: 'Gợi ý tài liệu', tone: 'slate' },
  LAM_RO: { t: 'Làm rõ yêu cầu', tone: 'blue' }, GIAI_THICH: { t: 'Giải thích kiến thức', tone: 'teal' }, BO_SUNG: { t: 'Yêu cầu thêm dữ liệu', tone: 'amber' }, KY_THUAT: { t: 'Hỗ trợ kỹ thuật', tone: 'orange' },
}
const CAP_TEN = { 1: 'Nhắc nhở quy trình', 2: 'Gợi ý định hướng', 3: 'Hướng dẫn từng bước (qua giáo viên)' } as const

/** S08 — Trung tâm hỗ trợ. Hỗ trợ gắn với NHIỆM VỤ, không phải hộp trò chuyện tự do. */
export function S08TrungTamHoTro() {
  const { s, d } = useApp()
  const dl = s.du_lieu
  const laHS = s.vai_tro === 'HOC_SINH'
  const cast = dl.hoc_sinh.filter((h) => h.co_ho_so)
  const hsId = laHS ? s.hoc_sinh_hien_tai : (s.ho_so_dang_mo && cast.some((h) => h.id === s.ho_so_dang_mo) ? s.ho_so_dang_mo : 'HS0812')
  const hs = dl.hoc_sinh.find((h) => h.id === hsId)!
  const nhom = dl.nhom.find((n) => n.id === hs.nhom_id)
  const nv = dl.nhiem_vu.find((n) => n.id === 'NV-2.3')!
  const mc = minhChungMoiNhat(dl, hsId, 'NV-2.3')
  const [loc, setLoc] = useState<'ALL' | LoaiHoTro>('ALL')
  const [suaGhiChu, setSuaGhiChu] = useState(false)
  const [ghiChu, setGhiChu] = useState(dl.ghi_chu_gv[hsId] ?? '')
  const [hoi, setHoi] = useState('')
  const [moHoi, setMoHoi] = useState(false)

  // bản ghi hỗ trợ đang "sống" (chờ duyệt, hoặc đã duyệt chờ học sinh chỉnh)
  const dangCho = dl.ho_tro.filter((h) => h.hoc_sinh_id === hsId && h.chan_doan_id && (h.trang_thai_duyet === 'CHO_DUYET' || hoTroChoChinhBai(dl, hsId).some((x) => x.id === h.id)))[0] ?? null
  const cd = dangCho ? dl.chan_doan.find((c) => c.id === dangCho.chan_doan_id) : null
  const ai = dangCho?.goi_y_ai_id ? dl.goi_y_ai.find((a) => a.id === dangCho.goi_y_ai_id) : null
  const mau = cd ? layMau(cd.ma_mau) : null
  const daDuyet = dangCho?.trang_thai_duyet === 'DA_DUYET'
  const cauHoi = ai?.ban_sau_chinh ?? ai?.ban_nhap ?? dangCho?.noi_dung

  const lichSu = useMemo(() => dl.ho_tro
    .filter((h) => h.hoc_sinh_id === hsId && (loc === 'ALL' || h.loai === loc) && (!laHS || h.trang_thai_duyet !== 'CHO_DUYET'))
    .sort((a, b) => b.thoi_diem.localeCompare(a.thoi_diem)), [dl.ho_tro, hsId, loc, laHS])

  const bieuHien = cd ? cd.trang_thai_ids.map((id) => dl.trang_thai.find((t) => t.id === id)).filter((t) => !!t).map((t) => ({ cb: t!.chi_bao, muc: t!.muc, ly: t!.ly_do })) : []
  const hd2 = tienDoHocSinh(hs)[1]
  const xoay = () => ai && d({ kieu: 'DOI_CAU_HOI_MAU', goi_y_id: ai.id })

  const xinThem = () => {
    const ds = mau?.mau_cau_hoi ?? []
    const noi = ds.length ? ds[(lichSu.filter((h) => h.nguon === 'AI' && h.cap === 1).length + 1) % ds.length] : 'Em hãy đọc lại yêu cầu nhiệm vụ và kiểm tra từng ý xem em đã trả lời đủ chưa.'
    d({ kieu: 'HS_XIN_GOI_Y', id: nid('HT'), hoc_sinh_id: hsId, noi_dung: noi, nhiem_vu_id: 'NV-2.3' })
  }
  const guiHoi = () => {
    if (!mc || !hoi.trim()) return
    d({ kieu: 'GUI_TRAO_DOI', id: nid('TD'), minh_chung_id: mc.id, noi_dung: hoi.trim() })
    d({ kieu: 'TOAST', noi_dung: 'Đã gửi câu hỏi cho giáo viên — câu hỏi gắn với bài nộp này, không phải trò chuyện tự do.' })
    setHoi(''); setMoHoi(false)
  }

  return (
    <>
      <PageHead
        crumbs={['Trang chủ', `Lớp ${hs.lop}`, 'HĐ2 – Nghiên cứu và phát triển phương án', <span key="a"><MaMan ma="S08" />Trung tâm hỗ trợ</span>]}
        title={<><MaMan ma="S08" />Trung tâm hỗ trợ</>}
        sub="Đồng hành kịp thời – Học sâu hơn – Tự tin hơn"
        right={<>
          {!laHS && <label className="text-[11px] text-ink-soft">Học sinh<select value={hsId} onChange={(e) => d({ kieu: 'DOI_MAN_HINH', man_hinh: 'S08', hoc_sinh: e.target.value })} className="field mt-0.5 !w-44 !py-1.5">{cast.map((h) => <option key={h.id} value={h.id}>{h.ho_ten}</option>)}</select></label>}
          <div className="flex items-center gap-3 rounded-2xl bg-mint px-5 py-3"><div><div className="font-serif text-[14px] italic text-brand-800">“Mỗi câu hỏi là một cơ hội để khám phá sâu hơn.”</div><div className="mt-1 text-[9.5px] font-bold uppercase tracking-widest text-brand-700/70">SDT – STEM Education Platform</div></div><Sprout size={34} className="text-emerald-600" /></div>
        </>}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card title="Ngữ cảnh nhiệm vụ hiện tại" icon={<BookOpen size={17} />} action={<LinkNho onClick={() => d({ kieu: 'DOI_MAN_HINH', man_hinh: 'S04' })}>Xem chi tiết bài học</LinkNho>}>
          <div className="text-[15px] font-extrabold text-ink">HĐ2 – Nghiên cứu và phát triển phương án</div>
          <div className="text-[12px] text-ink-soft">Lớp {hs.lop} | Cầu giấy chịu lực</div>
          <div className="mt-3 grid gap-3 sm:grid-cols-[170px_1fr]">
            <div className="h-[100px] overflow-hidden rounded-xl ring-1 ring-line"><AnhCau kieu="truss" tone="light" className="h-full w-full" /></div>
            <div className="rounded-xl bg-slate-50 p-3"><div className="text-[12.5px] font-extrabold text-ink">Nhiệm vụ học tập</div><p className="mt-0.5 text-[12px] leading-relaxed text-ink-soft">{nv.mo_ta} <span className="text-ink-mute">Đề xuất và phát triển ít nhất 2 phương án cầu giấy chịu lực, so sánh và lựa chọn phương án tối ưu.</span><Ma>{nv.id}</Ma></p></div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-line pt-3 text-[12px]">
            <div className="flex items-center gap-2"><CalendarDays size={16} className="text-ink-mute" /><div><div className="text-ink-soft">Thời hạn nộp</div><div className="font-semibold text-ink">24/10/2024</div></div></div>
            <div><div className="text-ink-soft">Trạng thái</div><Chip tone="green" dot>Đang thực hiện</Chip></div>
            <div className="flex items-center gap-2"><Users size={16} className="text-ink-mute" /><div><div className="text-ink-soft">Nhóm học sinh</div><div className="font-semibold text-ink">{nhom?.ten} ({nhom?.thanh_vien.length} học sinh)</div></div></div>
          </div>
        </Card>

        {laHS ? (
          <Card title="Gợi ý dành cho em" icon={<Lightbulb size={17} />} tone="sky" className="!border-sky-100">
            {daDuyet && cauHoi ? (
              <div className="flex gap-3 rounded-xl bg-white p-4"><Bot size={26} className="shrink-0 text-brand-700" /><div><Nhan>Câu hỏi gợi mở từ giáo viên</Nhan><p className="text-[15px] font-semibold leading-relaxed text-ink">“{cauHoi}”</p><p className="mt-2 text-[11.5px] text-ink-soft">Gợi ý là câu hỏi để em tự nghĩ tiếp, không phải đáp án. Sau khi em chỉnh bài, giáo viên sẽ xem lại.</p><Nut bien="chinh" nho className="mt-3" onClick={() => d({ kieu: 'DOI_MAN_HINH', man_hinh: 'S04', tab: 'khao_sat' })}>Quay lại nhiệm vụ để chỉnh</Nut></div></div>
            ) : (
              <div className="rounded-xl bg-white p-4 text-[13px] leading-relaxed text-ink-soft">Hiện chưa có gợi ý mới cho em. Khi giáo viên xem bài của em và thấy cần gợi ý, câu hỏi sẽ hiện ở đây. Em cũng có thể bấm <strong>“Xin thêm gợi ý”</strong> bên dưới nếu đang bí.</div>
            )}
          </Card>
        ) : (
          <Card title="Tóm tắt chẩn đoán hiện tại" icon={<ShieldCheck size={17} />} action={cd && <span className="text-[11.5px] text-ink-mute">Cập nhật lúc {gio(cd.thoi_diem)} – {ngay(cd.thoi_diem)}</span>}>
            {cd && mau && dangCho ? (
              <>
                <div className="grid gap-3 sm:grid-cols-[1fr_1.1fr]">
                  <div className="flex gap-3 rounded-xl border border-line p-3"><div className="flex h-[74px] w-[74px] shrink-0 flex-col items-center justify-center rounded-full border-[5px] border-orange-300 text-orange-600"><span className="text-[9px] font-bold">MỨC</span><span className="text-[26px] font-extrabold leading-none">{dangCho.cap}</span></div>
                    <div className="min-w-0"><Nhan>Mức độ hỗ trợ đề xuất</Nhan><div className="text-[13.5px] font-extrabold leading-tight text-orange-600">{CAP_TEN[dangCho.cap]}</div><p className="mt-1 text-[11px] leading-snug text-ink-soft">{mau.ten}. Hỗ trợ nhẹ theo chính sách; giáo viên vẫn duyệt.</p></div></div>
                  <div className="rounded-xl border border-line p-3"><Nhan>Các biểu hiện quan sát được</Nhan><ul className="space-y-1.5 text-[11.5px] leading-snug text-ink">{bieuHien.map((b) => <li key={b.cb} className="flex gap-1.5"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" /><span><strong>{TEN_NGAN[b.cb] ?? CHI_BAO[b.cb]?.ten}</strong> {b.muc && <ChipMuc muc={b.muc} />} — {b.ly}</span></li>)}</ul></div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
                  <div className="rounded-xl border border-line p-2.5"><div className="text-[11px] text-ink-soft">Tiến độ nhiệm vụ</div><div className="mt-1 flex items-center gap-2"><div className="flex-1"><ProgressBar pct={hd2.pct} tone="green" /></div><span className="text-[12px] font-bold tabular-nums">{hd2.pct}%</span></div></div>
                  <div className="rounded-xl border border-line p-2.5"><div className="text-[11px] text-ink-soft">Độ tin cậy chẩn đoán</div><div className="mt-1.5 flex items-center gap-2"><SegBar value={{ THAP: 1, TRUNG_BINH: 2, CAO: 3 }[cd.do_tin_cay]} total={3} /><span className="text-[12px] font-semibold text-ink">{nhanTinCay(cd.do_tin_cay)}</span></div></div>
                  <div className="rounded-xl border border-line p-2.5"><div className="text-[11px] text-ink-soft">Bối cảnh hỗ trợ</div><div className="mt-1 text-[12.5px] font-semibold text-ink">{mc ? nhanDocLap(mc.boi_canh_ho_tro) : '—'}</div></div>
                  <div className="rounded-xl border border-line p-2.5"><div className="text-[11px] text-ink-soft">Loại trừ đã kiểm</div><div className="mt-1 flex items-center gap-1.5 text-[12.5px] font-semibold text-ink"><CircleCheck size={15} className="text-emerald-500" />{cd.dieu_kien_loai_tru.filter((x) => x.da_kiem).length}/{cd.dieu_kien_loai_tru.length}</div></div>
                </div>
              </>
            ) : <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-[13px] text-ink-soft">Học sinh này chưa có chẩn đoán đang mở. Theo quy tắc, dữ liệu chưa hợp lệ thì hệ thống chỉ nhắc bổ sung — không suy năng lực.</p>}
          </Card>
        )}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {!laHS && (
          <Card title="Gợi ý từ mẫu" icon={<Sparkles size={17} />} tone="mint" className="!border-brand-100"
            action={ai && <button onClick={xoay} className="inline-flex items-center gap-1 text-[12px] font-bold text-brand-700 hover:underline"><RefreshCw size={13} /> Đổi câu hỏi mẫu</button>}>
            {cauHoi ? (
              <div className="flex gap-3 rounded-xl bg-white p-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white"><Bot size={22} /></span>
                <div><div className="text-[12px] font-extrabold text-brand-800">Câu hỏi gợi mở<Ma>{ai?.phien_ban_mau}</Ma></div><p className="mt-1 text-[14px] leading-relaxed text-ink">“{cauHoi}”</p>
                  <p className="mt-2 text-[11px] leading-snug text-ink-mute">Chọn từ danh sách câu hỏi cố định của mẫu {cd?.ma_mau}; không sinh tự do và không đưa lời giải thiết kế.</p></div></div>
            ) : <p className="rounded-xl bg-white px-4 py-6 text-center text-[13px] text-ink-soft">Chưa có gợi ý nào chờ xử lí.</p>}
          </Card>
        )}
        <Card title="Ghi chú của giáo viên" icon={<Pencil size={17} />} tone="rose" className="!border-rose-100"
          action={!laHS && <button onClick={() => { if (suaGhiChu) d({ kieu: 'LUU_GHI_CHU_GV', hoc_sinh_id: hsId, noi_dung: ghiChu }); setSuaGhiChu(!suaGhiChu) }} className="inline-flex items-center gap-1 text-[12px] font-bold text-rose-700 hover:underline"><Pencil size={13} /> {suaGhiChu ? 'Lưu' : 'Chỉnh sửa'}</button>}>
          <div className="flex gap-3 rounded-xl bg-white p-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600"><Users size={20} /></span>
            <div className="min-w-0 flex-1"><div className="text-[12px] font-extrabold text-rose-700">Nhận xét / Gợi ý thêm</div>
              {suaGhiChu ? <textarea value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} rows={4} className="field mt-1" /> : <p className="mt-1 text-[13px] leading-relaxed text-ink">{dl.ghi_chu_gv[hsId] || 'Chưa có ghi chú.'}</p>}</div></div>
        </Card>
      </div>

      <div className="mt-4">
        <h2 className="mb-2 text-[15px] font-extrabold text-ink">Thao tác nhanh</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {(laHS ? [
            { t: 'Tôi đã hiểu', m: 'Tiếp tục làm nhiệm vụ', Ic: ThumbsUp, tone: 'bg-brand-600 text-white', on: () => d({ kieu: 'DOI_MAN_HINH', man_hinh: 'S04' }) },
            { t: 'Xin thêm gợi ý', m: 'Nhận gợi ý nhẹ gắn với nhiệm vụ', Ic: Lightbulb, tone: 'bg-sky text-sky-800', on: xinThem },
            { t: 'Hỏi giáo viên', m: 'Gửi câu hỏi về bài nộp này', Ic: MessageCircleQuestion, tone: 'bg-lavender text-violet-800', on: () => setMoHoi(true) },
            { t: 'Xem lại tài liệu', m: 'Mở tài liệu liên quan', Ic: FileText, tone: 'bg-slate-100 text-ink', on: () => d({ kieu: 'TOAST', noi_dung: 'Học liệu trước lớp (S02b) chưa có trong bản demo.' }) },
          ] : [
            { t: 'Mở cổng quyết định', m: 'Duyệt / chỉnh / từ chối gợi ý', Ic: ShieldCheck, tone: 'bg-brand-600 text-white', on: () => d({ kieu: 'DOI_MAN_HINH', man_hinh: 'S14', ca: dangCho?.id }) },
            { t: 'Xem hồ sơ SDT', m: 'Truy vết từng chỉ báo', Ic: BookOpen, tone: 'bg-sky text-sky-800', on: () => d({ kieu: 'DOI_MAN_HINH', man_hinh: 'S09', hoc_sinh: hsId }) },
            { t: 'Ghi quan sát', m: 'Mô tả hành vi trên lớp', Ic: Pencil, tone: 'bg-lavender text-violet-800', on: () => d({ kieu: 'DOI_MAN_HINH', man_hinh: 'S06', hoc_sinh: hsId }) },
            { t: 'Xử lí trực tiếp', m: 'Không gửi gợi ý qua hệ thống', Ic: Users, tone: 'bg-slate-100 text-ink', on: () => d({ kieu: 'TOAST', noi_dung: 'Ghi nhận ở lớp: GV xử lí trực tiếp. Hãy ghi lại thành một quan sát để giữ dấu vết.' }) },
          ]).map(({ t, m, Ic, tone, on }) => (
            <button key={t} onClick={on} className={`flex items-center gap-3 rounded-2xl p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${tone}`}>
              <Ic size={26} className="shrink-0" /><span><span className="block text-[14.5px] font-extrabold leading-tight">{t}</span><span className="mt-0.5 block text-[11.5px] leading-tight opacity-80">{m}</span></span>
            </button>
          ))}
        </div>
        {moHoi && (
          <div className="card mt-3 rise p-4"><Nhan>Câu hỏi của em (gắn với bài nộp HĐ2)</Nhan>
            <textarea value={hoi} onChange={(e) => setHoi(e.target.value)} rows={3} placeholder="Em đang bí ở chỗ nào?" className="field" />
            <div className="mt-2 flex gap-2"><Nut bien="chinh" nho disabled={!hoi.trim() || !mc} onClick={guiHoi}><Send size={13} /> Gửi giáo viên</Nut><Nut bien="nhat" nho onClick={() => setMoHoi(false)}>Hủy</Nut></div></div>
        )}
      </div>

      <Card title="Lịch sử hỗ trợ" icon={<CalendarDays size={17} />} className="mt-4" pad={false}
        action={<select value={loc} onChange={(e) => setLoc(e.target.value as 'ALL' | LoaiHoTro)} aria-label="Lọc loại hỗ trợ" className="field !w-48 !py-1.5"><option value="ALL">Tất cả loại hỗ trợ</option>{(Object.keys(LOAI) as LoaiHoTro[]).map((k) => <option key={k} value={k}>{LOAI[k].t}</option>)}</select>}>
        <div className="scroll-thin overflow-x-auto px-4 pb-3">
          <table className="w-full min-w-[720px] text-left text-[12.5px]">
            <thead><tr className="border-b border-line text-[10.5px] font-bold uppercase tracking-wide text-ink-mute"><th className="py-2">Thời gian</th><th className="px-2 py-2">Người hỗ trợ</th><th className="px-2 py-2">Loại hỗ trợ</th><th className="px-2 py-2">Nội dung hỗ trợ</th><th className="px-2 py-2">Kết quả sau hỗ trợ</th></tr></thead>
            <tbody>
              {lichSu.map((h) => {
                const kq = h.ket_qua ?? (h.trang_thai_duyet === 'CHO_DUYET' ? 'Chờ giáo viên duyệt' : h.trang_thai_duyet === 'BO_SUNG' ? 'Chờ học sinh bổ sung' : h.trang_thai_duyet === 'TU_CHOI' ? 'Giáo viên đã từ chối gợi ý' : daDuyet && h.id === dangCho?.id ? 'Chờ học sinh chỉnh bài và nộp lại' : '—')
                const cho = !h.ket_qua
                return (
                  <tr key={h.id} className="border-b border-slate-100 last:border-0">
                    <td className="whitespace-nowrap py-2.5 text-ink-soft">{ngayGio(h.thoi_diem).replace(' ', '  ')}</td>
                    <td className="px-2 py-2.5 font-medium text-ink">{h.nguon === 'AI' ? 'AI (mẫu)' : 'Giáo viên'}</td>
                    <td className="px-2 py-2.5"><Chip tone={LOAI[h.loai].tone}>{LOAI[h.loai].t}</Chip></td>
                    <td className="max-w-[300px] px-2 py-2.5 text-ink">{h.noi_dung}</td>
                    <td className="px-2 py-2.5"><span className="inline-flex items-center gap-1.5 text-ink"><span className={`h-2 w-2 shrink-0 rounded-full ${cho ? 'bg-amber-400' : 'bg-emerald-500'}`} />{kq}</span></td>
                  </tr>
                )
              })}
              {lichSu.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-ink-soft">Chưa có lịch sử hỗ trợ.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <KhoiLuuY className="mt-4">Hỗ trợ ở đây luôn <strong>gắn với nhiệm vụ đang làm</strong> và để lại dấu vết: ai gợi ý, lúc nào, mức nào, học sinh phản ứng ra sao. Đây không phải hộp trò chuyện tự do, và AI không bao giờ đưa lời giải thiết kế hoàn chỉnh.</KhoiLuuY>
    </>
  )
}
