import { ArrowRight, BookOpen, ChartColumn, CircleCheck, CloudUpload, FolderOpen, Headset, Quote, Target, Users, Circle, CircleDot } from 'lucide-react'
import { useApp } from '../lib/store'
import { CAU_HINH } from '../data/seed'
import { HOAT_DONG } from '../data/khbd'
import { chiBaoLoiHocSinh, hoTroChoChinhBai, soChiBaoCoCanCu, tienDoHocSinh, TEN_TRANG_THAI_HD } from '../lib/derive'
import { truocDay } from '../lib/time'
import { HeroBridge } from '../components/art/Art'
import { Avatar, Card, Chip, LinkNho, Nut, ProgressBar, Ring } from '../components/ui/Ui'

const Diem = ({ xong, dang }: { xong?: boolean; dang?: boolean }) =>
  xong ? <CircleCheck size={18} className="shrink-0 text-emerald-500" /> : dang ? <CircleDot size={18} className="shrink-0 text-orange-400" /> : <Circle size={18} className="shrink-0 text-slate-300" />

/** S02 — Trang chủ học sinh. Ba vùng Trước – Trong – Sau lớp; chỉ hiện tiến độ của CHÍNH học sinh. */
export function S02TrangChuHS() {
  const { s, d } = useApp()
  const dl = s.du_lieu
  const hs = dl.hoc_sinh.find((h) => h.id === s.hoc_sinh_hien_tai)!
  const td = tienDoHocSinh(hs)
  const soHDXong = td.filter((t) => t.trang_thai === 'XONG').length
  const cb = chiBaoLoiHocSinh(dl, hs.id)
  const coCanCu = soChiBaoCoCanCu(cb)
  const choChinh = hoTroChoChinhBai(dl, hs.id)
  const dangLam = td.find((t) => t.trang_thai === 'DANG') ?? td.find((t) => t.trang_thai === 'CHUA')
  const phanHoi = dl.trao_doi
    .filter((t) => t.vai_tro === 'GV' && dl.minh_chung.some((m) => m.id === t.minh_chung_id && m.hoc_sinh_id === hs.id))
    .sort((a, b) => b.thoi_diem.localeCompare(a.thoi_diem)).slice(0, 3)

  const viec: { ten: string; gio: string; nhan: string; tone: 'green' | 'orange' | 'blue' | 'teal'; xong?: boolean; han?: string; dich?: () => void }[] = [
    { ten: 'Xem video HĐ2 – Nghiên cứu phương án', gio: '08:30', nhan: 'Hoàn thành', tone: 'green', xong: true },
    td[0].trang_thai === 'CHUA'
      ? { ten: 'Bắt đầu HĐ1 – Xác định vấn đề', gio: 'Hôm nay', nhan: 'Chưa bắt đầu', tone: 'blue', dich: () => d({ kieu: 'DOI_MAN_HINH', man_hinh: 'S01' }) }
      : choChinh.length
      ? { ten: 'Chỉnh hàm ý thiết kế theo gợi ý của giáo viên', gio: 'Hôm nay', nhan: 'Cần nộp', tone: 'orange', han: '!', dich: () => d({ kieu: 'DOI_MAN_HINH', man_hinh: 'S04', tab: 'khao_sat' }) }
      : { ten: 'Hoàn thành phiếu nghiên cứu (ít nhất 2 phương án)', gio: 'Hôm nay', nhan: 'Đang chờ', tone: 'blue', dich: () => d({ kieu: 'DOI_MAN_HINH', man_hinh: 'S04', tab: 'phuong_an' }) },
    { ten: 'Tham gia thảo luận nhóm trên diễn đàn', gio: 'Hôm nay', nhan: 'Đang chờ', tone: 'blue' },
    { ten: 'Xem nhận xét của giáo viên ở HĐ1', gio: 'Hôm nay', nhan: 'Cần xem', tone: 'teal', dich: () => d({ kieu: 'TOAST', noi_dung: 'Nhận xét được liệt kê ở khung “Phản hồi mới từ giáo viên” bên cạnh.' }) },
  ]

  const tienDoTone = ['green', 'blue', 'blue', 'blue', 'blue'] as const

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 space-y-4">
        <div className="relative overflow-hidden rounded-2xl bg-[#d8f0ef]">
          <HeroBridge className="absolute inset-y-0 right-0 h-full w-[62%]" />
          <div className="absolute inset-y-0 left-0 w-[52%] bg-gradient-to-r from-[#d8f0ef] via-[#d8f0ef]/95 to-transparent" />
          <div className="relative flex min-h-[124px] items-center justify-between gap-4 px-6 py-5">
            <h1 className="max-w-[420px] text-[22px] font-extrabold leading-snug tracking-tight text-brand-800 sm:text-[25px]">Biến ý tưởng thành công trình qua trải nghiệm và dữ liệu thật!</h1>
            <p className="hidden -rotate-6 text-right font-serif text-[19px] italic leading-tight text-brand-700 lg:block">Học để kiến tạo,<br />kiến tạo để tương lai</p>
          </div>
        </div>

        <Card title={`Tiến độ học tập – Cầu giấy chịu lực (Lớp ${CAU_HINH.lop})`} action={<LinkNho onClick={() => d({ kieu: 'DOI_MAN_HINH', man_hinh: 'S09' })}>Xem chi tiết</LinkNho>}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {td.map((t, i) => (
              <div key={t.ma} className="rounded-xl border border-line bg-slate-50/60 p-3">
                <div className="text-[13px] font-extrabold text-ink">{t.ma}</div>
                <div className="min-h-[32px] text-[11.5px] leading-tight text-ink-soft">{t.ten}</div>
                <div className="mt-2 flex items-baseline justify-between text-[13px] font-extrabold tabular-nums text-ink">{t.xong}/{t.tong}<span className="text-[11.5px] font-medium text-ink-soft">{t.pct}%</span></div>
                <div className="mt-1"><ProgressBar pct={t.pct} tone={tienDoTone[i]} /></div>
                <div className="mt-1.5 text-[10.5px] text-ink-mute">{TEN_TRANG_THAI_HD[t.trang_thai]}</div>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid gap-3 md:grid-cols-3">
          {[
            { tone: 'mint' as const, Ic: BookOpen, mau: 'text-brand-700 bg-white/70', ten: 'Trước lớp', sub: 'Tự học – Tìm hiểu – Chuẩn bị', ds: [['Xem 3 học liệu ngắn', true], ['Trả lời câu hỏi chẩn đoán', true], ['Ghi điều đã hiểu – chưa chắc', true]] as [string, boolean][], link: 'Vào học liệu', lc: 'text-brand-700', on: () => d({ kieu: 'TOAST', noi_dung: 'Học liệu trước lớp (S02b) chưa có trong bản demo — bản đặc tả nằm ở SPEC-hop-nhat.md.' }) },
            { tone: 'sky' as const, Ic: Users, mau: 'text-sky-700 bg-white/70', ten: 'Trong lớp', sub: 'Thảo luận – Thực hành – Hợp tác', ds: [['Tham gia thảo luận nhóm', td[0].trang_thai !== 'CHUA'], ['Thực hiện nhiệm vụ trên lớp', td[1].trang_thai === 'XONG'], ['Ghi chép kết quả thí nghiệm', td[3].trang_thai === 'XONG']] as [string, boolean][], link: 'Xem nhiệm vụ', lc: 'text-sky-700', on: () => d({ kieu: 'DOI_MAN_HINH', man_hinh: 'S04' }) },
            { tone: 'peach' as const, Ic: ChartColumn, mau: 'text-orange-600 bg-white/70', ten: 'Sau lớp', sub: 'Hoàn thiện – Nộp bài – Phản hồi', ds: [['Nộp minh chứng', td[4].trang_thai === 'XONG'], ['Xem nhận xét của giáo viên', false], ['Cải tiến và rút kinh nghiệm', false]] as [string, boolean][], link: 'Xem hướng dẫn', lc: 'text-orange-600', on: () => d({ kieu: 'DOI_MAN_HINH', man_hinh: 'S08' }) },
          ].map(({ tone, Ic, mau, ten, sub, ds, link, lc, on }) => (
            <Card key={ten} tone={tone} pad={false} className="!border-transparent">
              <div className="flex items-center gap-3 px-4 pt-3.5"><span className={`flex h-11 w-11 items-center justify-center rounded-xl ${mau}`}><Ic size={22} /></span><div><div className="text-[16px] font-extrabold text-ink">{ten}</div><div className="text-[11.5px] text-ink-soft">{sub}</div></div></div>
              <ul className="space-y-2 px-4 py-3">{ds.map(([t, x]) => <li key={t} className="flex items-center gap-2 text-[12.5px] text-ink"><Diem xong={x} dang={!x && ten === 'Sau lớp' && t === 'Nộp minh chứng' && td[4].trang_thai === 'DANG'} />{t}</li>)}</ul>
              <div className="px-4 pb-3.5"><button onClick={on} className={`inline-flex items-center gap-1 text-[12.5px] font-bold ${lc} hover:underline`}>{link} <ArrowRight size={14} /></button></div>
            </Card>
          ))}
        </div>

        <div>
          <h2 className="mb-2 text-[15px] font-extrabold text-ink">Truy cập nhanh</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { t: 'Nghiên cứu phương án', m: 'Xem nhiệm vụ, tài liệu và thảo luận ý tưởng', Ic: BookOpen, tone: 'bg-sky text-sky-700', on: () => d({ kieu: 'DOI_MAN_HINH', man_hinh: 'S04' }) },
              { t: 'Nộp minh chứng', m: 'Tải lên bài làm, hình ảnh, video, báo cáo…', Ic: CloudUpload, tone: 'bg-mint text-emerald-700', on: () => d({ kieu: 'DOI_MAN_HINH', man_hinh: 'S04', tab: 'nop' }) },
              { t: 'Hồ sơ SDT của tôi', m: 'Tiến độ, kết quả, nhận xét và sản phẩm', Ic: FolderOpen, tone: 'bg-lavender text-violet-700', on: () => d({ kieu: 'DOI_MAN_HINH', man_hinh: 'S09' }) },
              { t: 'Trung tâm hỗ trợ', m: 'Hỏi đáp, tài liệu hướng dẫn và liên hệ giáo viên', Ic: Headset, tone: 'bg-peach text-orange-600', on: () => d({ kieu: 'DOI_MAN_HINH', man_hinh: 'S08' }) },
            ].map(({ t, m, Ic, tone, on }) => (
              <button key={t} onClick={on} className={`group flex flex-col items-center rounded-2xl border border-transparent p-4 text-center transition hover:-translate-y-0.5 hover:shadow-md ${tone.split(' ')[0]}`}>
                <Ic size={30} className={tone.split(' ')[1]} />
                <span className="mt-1.5 text-[13.5px] font-extrabold text-ink">{t}</span>
                <span className="mt-0.5 text-[11px] leading-snug text-ink-soft">{m}</span>
                <ArrowRight size={16} className={`mt-2 ${tone.split(' ')[1]} transition group-hover:translate-x-0.5`} />
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card title={`Việc cần làm hôm nay (${viec.length})`} action={<LinkNho>Xem tất cả</LinkNho>} pad={false}>
            <ul className="divide-y divide-slate-100 px-4 pb-2">
              {viec.map((v) => (
                <li key={v.ten} className="flex items-center gap-3 py-2.5">
                  <span className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border ${v.xong ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300'}`}>{v.xong && <span className="text-[11px] leading-none">✓</span>}</span>
                  <button onClick={v.dich} disabled={!v.dich} className={`min-w-0 flex-1 text-left text-[12.5px] leading-snug ${v.xong ? 'text-ink-mute line-through' : 'text-ink'} ${v.dich ? 'hover:text-brand-700' : ''}`}>{v.ten}</button>
                  <span className={`shrink-0 text-[11px] ${v.han ? 'font-semibold text-orange-600' : 'text-ink-mute'}`}>{v.han && '⏰ '}{v.gio}</span>
                  <Chip tone={v.tone}>{v.nhan}</Chip>
                </li>
              ))}
            </ul>
          </Card>

          <Card title={`Phản hồi mới từ giáo viên (${phanHoi.length})`} action={<LinkNho>Xem tất cả</LinkNho>} pad={false}>
            <ul className="divide-y divide-slate-100 px-4 pb-2">
              {phanHoi.map((p) => (
                <li key={p.id} className="flex gap-3 py-2.5">
                  <Avatar ten="GV" size={34} tone="slate" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2"><span className="text-[12.5px] font-bold text-ink">{p.tac_gia}</span><span className="shrink-0 text-[11px] text-ink-mute">{truocDay(p.thoi_diem)}</span></div>
                    <div className="text-[12px] font-semibold text-ink">{p.tieu_de}</div>
                    <p className="line-clamp-2 text-[11.5px] leading-snug text-ink-soft">{p.noi_dung}</p>
                  </div>
                </li>
              ))}
              {phanHoi.length === 0 && <li className="py-6 text-center text-[12.5px] text-ink-soft">Chưa có phản hồi mới.</li>}
            </ul>
          </Card>
        </div>
      </div>

      {/* Cột phải */}
      <div className="min-w-0 space-y-4">
        <Card title="Trạng thái SDT hiện tại" action={<LinkNho onClick={() => d({ kieu: 'DOI_MAN_HINH', man_hinh: 'S09' })}>Chi tiết</LinkNho>}>
          <div className="flex items-center gap-4">
            <Ring pct={(coCanCu / 12) * 100} size={104} stroke={11}>
              <div className="leading-none"><div className="text-[24px] font-extrabold tabular-nums text-ink">{coCanCu}/12</div><div className="mt-0.5 text-[10px] font-semibold text-ink-soft">chỉ báo lõi</div></div>
            </Ring>
            <div className="min-w-0">
              <div className="text-[15px] font-extrabold text-brand-700">Đã có căn cứ cho {coCanCu} chỉ báo</div>
              <p className="mt-1 text-[12px] leading-snug text-ink-soft">Mỗi minh chứng em nộp giúp hồ sơ rõ ràng hơn. Chỉ báo chưa có mức là do <strong>chưa đủ dữ liệu</strong>, không phải mức thấp.</p>
              <div className="mt-1.5 text-[12px] font-semibold text-ink">Hoàn thành {soHDXong}/5 hoạt động</div>
            </div>
          </div>
          <ul className="mt-4 space-y-2.5 border-t border-line pt-3.5">
            {td.map((t) => (
              <li key={t.ma} className="flex items-center gap-2.5 text-[12.5px]">
                <span className={`flex h-[17px] w-[17px] items-center justify-center rounded-full ring-2 ${t.trang_thai === 'XONG' ? 'bg-emerald-500 ring-emerald-500' : t.trang_thai === 'DANG' ? 'bg-brand-500 ring-brand-500' : 'bg-white ring-slate-300'}`}>{t.trang_thai === 'XONG' && <span className="text-[10px] leading-none text-white">✓</span>}{t.trang_thai === 'DANG' && <span className="h-1.5 w-1.5 rounded-full bg-white" />}</span>
                <span className="flex-1 text-ink">{t.ma} – {HOAT_DONG.find((h) => h.ma === t.ma)?.ten}</span>
                <span className={`text-[11.5px] font-semibold ${t.trang_thai === 'XONG' ? 'text-emerald-600' : t.trang_thai === 'DANG' ? 'text-sky-600' : 'text-ink-mute'}`}>{TEN_TRANG_THAI_HD[t.trang_thai].replace('Đã nộp, chờ giáo viên', 'Chờ GV')}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card tone="mint" className="!border-brand-100" pad={false}>
          <div className="flex items-center gap-3 px-4 pt-3.5"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-brand-700"><Target size={24} /></span><h2 className="text-[15px] font-extrabold text-ink">Hành động tiếp theo được gợi ý</h2></div>
          <div className="m-3.5 rounded-xl bg-white p-3.5 shadow-sm">
            <div className="flex items-start justify-between gap-2"><h3 className="text-[14px] font-extrabold text-ink">{choChinh.length ? 'Quay lại HĐ2 – chỉnh hàm ý thiết kế' : `Tiếp tục ${dangLam?.ma ?? 'HĐ2'} – ${dangLam?.ten ?? 'Nghiên cứu phương án'}`}</h3><ArrowRight size={16} className="mt-0.5 shrink-0 text-ink-mute" /></div>
            <p className="mt-1 text-[12px] leading-snug text-ink-soft">{choChinh.length ? `Giáo viên đã gửi một gợi ý: “${choChinh[0].noi_dung}”` : 'Hoàn thành phiếu nghiên cứu và nộp ít nhất 2 phương án thiết kế cầu giấy.'}</p>
            <Nut bien="chinh" className="mt-3 w-full !py-2.5" onClick={() => d({ kieu: 'DOI_MAN_HINH', man_hinh: td[0].trang_thai === 'CHUA' ? 'S01' : 'S04', tab: choChinh.length ? 'khao_sat' : 'nhiem_vu' })}>Bắt đầu ngay</Nut>
            <button onClick={() => d({ kieu: 'DOI_MAN_HINH', man_hinh: 'S08' })} className="mt-2 block w-full text-center text-[12px] font-semibold text-ink-soft hover:text-brand-700 hover:underline">Xem hướng dẫn chi tiết</button>
          </div>
        </Card>

        <Card className="!bg-slate-50/70">
          <Quote size={26} className="text-slate-300" />
          <p className="mt-1 font-serif text-[16px] italic leading-relaxed text-ink">Không có ý tưởng nào là quá nhỏ để tạo nên sự thay đổi lớn.</p>
          <div className="mt-3 h-px w-14 bg-brand-500" />
          <div className="mt-3 text-[10.5px] font-bold uppercase tracking-widest text-ink-mute">SDT – STEM Education Platform</div>
        </Card>
      </div>
    </div>
  )
}
