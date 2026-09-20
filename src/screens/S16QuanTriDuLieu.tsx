import { useMemo, useState } from 'react'
import { Calendar, CircleCheck, Database, Download, FileSpreadsheet, Search, ShieldCheck, Users } from 'lucide-react'
import { useApp } from '../lib/store'
import { CAU_HINH } from '../data/seed'
import { ngayGio, thuNgay, nid, bayGio } from '../lib/time'
import { taoCSV, taiVe } from '../lib/csv'
import { dungBang, demBanGhi, taoAnDanh, thongTinMoTa, TEN_LOAI, type CaiDatAnDanh, type LoaiDuLieu } from '../lib/xuat'
import { PageHead } from '../components/layout/PageHead'
import { Card, Chip, CongTac, Donut, KhoiLuuY, LinkNho, Nut } from '../components/ui/Ui'

/** S16 — Quản trị dữ liệu và xuất nghiên cứu. Xuất THẬT, có ẩn danh hoá và ghi nhật ký. */
export function S16QuanTriDuLieu() {
  const { s, d } = useApp()
  const dl = s.du_lieu
  const [loai, setLoai] = useState<LoaiDuLieu>('ALL')
  const [tu, setTu] = useState('2024-10-01')
  const [den, setDen] = useState('2024-10-30')
  const [ap, setAp] = useState({ loai: 'ALL' as LoaiDuLieu, tu: '2024-10-01', den: '2024-10-30' })
  const [c, setC] = useState<CaiDatAnDanh>({ maHoaDinhDanh: true, loaiNhayCam: true, giuNhomLop: true, themNhieu: false })
  const [dinhDang, setDinhDang] = useState<'csv' | 'goi'>('csv')

  const bang = useMemo(() => dungBang(dl, ap.loai, c, ap.tu, ap.den), [dl, ap, c])
  const soXuat = demBanGhi(bang)

  // tổng quan — TÍNH từ dữ liệu, không viết cứng
  const co = [
    { ten: 'Minh chứng', v: dl.minh_chung.length, mau: '#3fb0b3' },
    { ten: 'Đánh giá & trạng thái', v: dl.danh_gia.length + dl.trang_thai.length, mau: '#3b82d6' },
    { ten: 'Hỗ trợ & quyết định', v: dl.ho_tro.length + dl.quyet_dinh.length, mau: '#7a5bd0' },
    { ten: 'Chẩn đoán & gợi ý mẫu', v: dl.chan_doan.length + dl.goi_y_ai.length, mau: '#e5732a' },
    { ten: 'Quan sát & trao đổi', v: dl.quan_sat.length + dl.trao_doi.length, mau: '#9aa9b8' },
  ]
  const tongBanGhi = co.reduce((x, y) => x + y.v, 0)
  const kb = Math.round(JSON.stringify(dl).length / 1024)

  // xem trước ẩn danh trên một học sinh mẫu
  const mau = dl.hoc_sinh.find((h) => h.id === 'HS0812')!
  const a = taoAnDanh(dl, c)
  const mcMau = dl.minh_chung.find((m) => m.hoc_sinh_id === mau.id && m.tep.length)
  const nx = dl.danh_gia.find((g) => g.hoc_sinh_id === mau.id && g.chi_bao === 'B1.3')
  const xemTruoc = [
    ['Họ tên', mau.ho_ten, c.maHoaDinhDanh ? a.ma.get(mau.id)! : mau.ho_ten],
    ['Email', mau.email, c.loaiNhayCam ? '***@***.com' : mau.email],
    ['Lớp', mau.lop, a.lop(mau.lop)],
    ['Bài nộp', mcMau?.tep[0]?.ten ?? '—', mcMau?.tep[0]?.ten ?? '—'],
    ['Nhận xét GV', (nx ? `${mau.ho_ten}: ${nx.ly_do}` : '—').slice(0, 42) + '…', (nx ? a.lam(`${mau.ho_ten}: ${nx.ly_do}`)! : '—').slice(0, 42) + '…'],
  ]

  const tenTep = `SDT_${CAU_HINH.lop}_${ap.tu.replace(/-/g, '')}-${ap.den.replace(/-/g, '')}.${dinhDang === 'csv' ? 'csv' : 'json'}`
  const xuat = () => {
    if (soXuat === 0) { d({ kieu: 'TOAST', noi_dung: 'Không có bản ghi nào trong phạm vi đã chọn — không xuất.' }); return }
    if (dinhDang === 'csv') {
      const t = bang.map((b) => `# bảng: ${b.ten}\r\n${taoCSV(b.cot, b.dong).replace('﻿', '')}`).join('\r\n\r\n')
      taiVe(tenTep, '﻿' + t)
    } else {
      taiVe(tenTep, JSON.stringify({ thong_tin_mo_ta: thongTinMoTa(dl, c, 'Nguyễn Văn An'), bang: Object.fromEntries(bang.map((b) => [b.ten, { cot: b.cot, dong: b.dong }])) }, null, 2), 'application/json')
    }
    d({ kieu: 'GHI_XUAT', ban_ghi: { id: nid('XK'), thoi_diem: bayGio(), nguoi: 'Nguyễn Văn An', pham_vi: CAU_HINH.lop, loai: TEN_LOAI[ap.loai], dinh_dang: dinhDang === 'csv' ? 'CSV' : 'Gói nghiên cứu (JSON)', so_ban_ghi: soXuat, muc_dich: 'Nghiên cứu' } })
    d({ kieu: 'TOAST', noi_dung: `Đã xuất ${soXuat} bản ghi ra ${tenTep} và ghi vào nhật ký xuất dữ liệu.` })
  }

  const Tog = ({ k, ten, mota }: { k: keyof CaiDatAnDanh; ten: string; mota: string }) => (
    <div className="flex items-start gap-3"><CongTac bat={c[k]} onChange={(b) => setC({ ...c, [k]: b })} nhan={ten} /><div><div className="text-[13px] font-bold text-ink">{ten}</div><div className="text-[11.5px] leading-snug text-ink-soft">{mota}</div></div></div>
  )

  return (
    <>
      <PageHead crumbs={['Quản trị', 'Quản trị dữ liệu', 'S16']} title="S16 – Quản trị dữ liệu và xuất nghiên cứu" sub="Quản lý dữ liệu học tập, đảm bảo an toàn – minh bạch – phục vụ nghiên cứu và cải tiến giảng dạy."
        right={<div className="flex items-center gap-2.5 text-right"><Calendar size={17} className="text-ink-mute" /><div className="text-[12px] leading-tight text-ink-soft"><div className="font-semibold capitalize text-ink">{thuNgay()}</div><div>Năm học {CAU_HINH.nam_hoc}</div></div></div>} />

      <Card title="Bộ lọc dữ liệu" icon={<Search size={17} />}>
        <div className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-[0.6fr_0.8fr_1.6fr_0.9fr_0.9fr_auto]">
          <label className="text-[11.5px] font-semibold text-ink-soft">Lớp<select className="field mt-1" defaultValue="1"><option value="1">{CAU_HINH.lop}</option></select></label>
          <label className="text-[11.5px] font-semibold text-ink-soft">Phiên học<select className="field mt-1" defaultValue="1"><option value="1">Tất cả phiên học</option></select></label>
          <div className="text-[11.5px] font-semibold text-ink-soft">Khoảng thời gian<div className="mt-1 flex items-center gap-2"><input type="date" value={tu} onChange={(e) => setTu(e.target.value)} className="field" aria-label="Từ ngày" /><span>→</span><input type="date" value={den} onChange={(e) => setDen(e.target.value)} className="field" aria-label="Đến ngày" /></div></div>
          <label className="text-[11.5px] font-semibold text-ink-soft">Phiên bản KHBD<select className="field mt-1" defaultValue="1"><option value="1">Tất cả phiên bản</option></select></label>
          <label className="text-[11.5px] font-semibold text-ink-soft">Loại dữ liệu<select value={loai} onChange={(e) => setLoai(e.target.value as LoaiDuLieu)} className="field mt-1">{(Object.keys(TEN_LOAI) as LoaiDuLieu[]).map((k) => <option key={k} value={k}>{TEN_LOAI[k]}</option>)}</select></label>
          <div className="flex items-center gap-3"><button onClick={() => { setLoai('ALL'); setTu('2024-10-01'); setDen('2024-10-30'); setAp({ loai: 'ALL', tu: '2024-10-01', den: '2024-10-30' }) }} className="whitespace-nowrap text-[12.5px] font-semibold text-brand-700 underline">Đặt lại bộ lọc</button><Nut bien="chinh" onClick={() => setAp({ loai, tu, den })}><Search size={14} /> Áp dụng bộ lọc</Nut></div>
        </div>
      </Card>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_1fr_0.85fr]">
        <Card title="Tổng quan dữ liệu" icon={<Database size={17} />} action={<span className="text-[11.5px] text-ink-mute">Cập nhật: {ngayGio(bayGio())}</span>}>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[[Users, `${dl.hoc_sinh.length}`, 'Học sinh', '1 lớp được chọn'], [FileSpreadsheet, '1', 'Phiên học', 'Từ 01/10 – 30/10'], [Database, tongBanGhi.toLocaleString('vi-VN'), 'Bản ghi dữ liệu', 'Bao gồm tất cả loại'], [Database, `${kb} KB`, 'Dung lượng', 'Trong bộ nhớ demo']].map(([Ic, so, ten, ph], i) => {
              const I = Ic as typeof Users
              return <div key={i} className="rounded-xl bg-slate-50 p-3"><I size={20} className="text-brand-600" /><div className="mt-1.5 text-[22px] font-extrabold leading-none tabular-nums text-ink">{so as string}</div><div className="mt-1 text-[12px] font-semibold text-ink">{ten as string}</div><div className="text-[10.5px] text-ink-mute">{ph as string}</div></div>
            })}
          </div>
        </Card>

        <Card title="Cơ cấu dữ liệu">
          <div className="flex items-center gap-4"><Donut parts={co.map((x) => ({ v: x.v, mau: x.mau }))} size={128} stroke={22} giua={tongBanGhi} phu="bản ghi" />
            <ul className="space-y-1.5 text-[12px]">{co.map((x) => <li key={x.ten} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: x.mau }} /><span className="text-ink">{x.ten}</span><span className="ml-auto pl-3 tabular-nums text-ink-soft">{Math.round((x.v / tongBanGhi) * 100)}%</span></li>)}</ul></div>
        </Card>

        <Card title="Trạng thái hệ thống" icon={<CircleCheck size={17} />}>
          <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-3"><CircleCheck size={28} className="text-emerald-600" /><div><div className="text-[16px] font-extrabold text-emerald-700">Bình thường</div><div className="text-[11.5px] text-emerald-800/80">Dữ liệu đã mã hóa định danh khi xuất.</div></div></div>
          <dl className="mt-3 space-y-1.5 text-[12px]">{[['Nơi lưu trữ', 'Bộ nhớ trình duyệt (demo)'], ['Bản sao lưu', 'Không có — chỉ là bản demo'], ['Lịch sử', 'Chỉ thêm, không ghi đè']].map(([k, v]) => <div key={k} className="grid grid-cols-[92px_1fr] gap-2"><dt className="text-ink-soft">{k}</dt><dd className="font-medium text-ink">{v}</dd></div>)}</dl>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <Card title="Thiết lập ẩn danh hóa dữ liệu" icon={<ShieldCheck size={17} />} sub="Bảo vệ thông tin cá nhân của học sinh khi xuất dữ liệu phục vụ nghiên cứu.">
          <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
            <div className="space-y-3.5">
              <Tog k="maHoaDinhDanh" ten="Mã hóa định danh học sinh" mota="Thay họ tên bằng mã định danh (VD: HS_10A1_001), cả trong phần văn bản tự do." />
              <Tog k="loaiNhayCam" ten="Loại bỏ thông tin nhạy cảm" mota="Ẩn email, số điện thoại và thông tin cá nhân khác." />
              <Tog k="giuNhomLop" ten="Giữ nguyên phân nhóm lớp" mota="Giữ thông tin lớp, nhóm để phục vụ phân tích." />
              <Tog k="themNhieu" ten="Thêm nhiễu dữ liệu (tùy chọn)" mota="Làm tròn giá trị định lượng (tải trọng) tới 100 g để tăng bảo mật." />
            </div>
            <div><div className="mb-1.5 text-[12.5px] font-bold text-ink">Xem trước kết quả ẩn danh</div>
              <table className="w-full text-left text-[11.5px]"><thead><tr className="border-b border-line text-[10px] font-bold uppercase tracking-wide text-ink-mute"><th className="py-1.5">Trường dữ liệu</th><th className="py-1.5">Trước ẩn danh</th><th className="py-1.5">Sau ẩn danh</th></tr></thead>
                <tbody>{xemTruoc.map(([k, t, sau]) => <tr key={k} className="border-b border-slate-100 last:border-0 align-top"><td className="py-1.5 pr-2 font-medium text-ink">{k}</td><td className="py-1.5 pr-2 text-ink-soft">{t}</td><td className={`py-1.5 font-medium ${sau !== t ? 'text-brand-700' : 'text-ink-soft'}`}>{sau}</td></tr>)}</tbody></table>
              <div className="mt-2 flex gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-[11px] leading-snug text-emerald-800"><CircleCheck size={15} className="mt-0.5 shrink-0" /> Dữ liệu sau khi ẩn danh vẫn giữ nguyên giá trị sư phạm và có thể dùng cho nghiên cứu.</div></div>
          </div>
        </Card>

        <Card title="Xuất dữ liệu" icon={<Download size={17} />} sub="Chọn định dạng. Dữ liệu được xử lí theo thiết lập ẩn danh ở bên trái.">
          <div className="space-y-2">
            {([['csv', 'Xuất CSV', 'Dễ mở, phù hợp phân tích nhanh (mỗi bảng một khối)'], ['goi', 'Xuất gói nghiên cứu (JSON)', 'Kèm thông tin mô tả: phiên bản KHBD, rubric, catalog, thiết lập ẩn danh']] as const).map(([k, t, m]) => (
              <label key={k} className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 ${dinhDang === k ? 'border-brand-400 bg-brand-50/50' : 'border-line'}`}><input type="radio" name="dd" checked={dinhDang === k} onChange={() => setDinhDang(k)} className="mt-0.5 h-4 w-4 accent-[#0e8c93]" /><span><span className="block text-[13px] font-bold text-ink">{t}</span><span className="text-[11.5px] text-ink-soft">{m}</span></span></label>))}
            <label className="flex cursor-not-allowed items-start gap-2.5 rounded-xl border border-line p-3 opacity-50"><input type="radio" disabled className="mt-0.5 h-4 w-4" /><span><span className="block text-[13px] font-bold text-ink">Xuất Excel / ZIP</span><span className="text-[11.5px] text-ink-soft">Chưa có trong bản demo</span></span></label>
          </div>
          <Nut bien="chinh" className="mt-3 w-full !py-2.5" onClick={xuat}><Download size={15} /> Xuất dữ liệu</Nut>
          <div className="mt-3 rounded-xl bg-slate-50 p-3 text-[11.5px]"><div className="mb-1 font-bold text-ink">Thông tin tệp xuất</div>
            {[['Tên tệp dự kiến', tenTep], ['Số bản ghi', soXuat.toLocaleString('vi-VN')], ['Gồm các bảng', bang.map((b) => b.ten).join(', ') || '—']].map(([k, v]) => <div key={k} className="grid grid-cols-[104px_1fr] gap-2 py-0.5"><span className="text-ink-soft">{k}</span><span className="break-all font-medium text-ink">{v}</span></div>)}</div>
        </Card>
      </div>

      <Card title="Nhật ký xuất dữ liệu (Audit Log)" icon={<ShieldCheck size={17} />} className="mt-4" action={<LinkNho>Xem tất cả</LinkNho>} pad={false}>
        <div className="scroll-thin overflow-x-auto px-4 pb-3">
          <table className="w-full min-w-[720px] text-left text-[12.5px]"><thead><tr className="border-b border-line text-[10.5px] font-bold uppercase tracking-wide text-ink-mute"><th className="py-2">Thời gian</th><th className="px-2 py-2">Người thực hiện</th><th className="px-2 py-2">Lớp/Phạm vi</th><th className="px-2 py-2">Loại dữ liệu</th><th className="px-2 py-2">Định dạng</th><th className="px-2 py-2 text-right">Số bản ghi</th><th className="px-2 py-2">Mục đích</th><th className="px-2 py-2">Trạng thái</th></tr></thead>
            <tbody>{dl.nhat_ky_xuat.slice(0, 6).map((x) => <tr key={x.id} className="border-b border-slate-100 last:border-0"><td className="whitespace-nowrap py-2 text-ink-soft">{ngayGio(x.thoi_diem)}</td><td className="px-2 py-2 font-medium text-ink">{x.nguoi}</td><td className="px-2 py-2">{x.pham_vi}</td><td className="px-2 py-2">{x.loai}</td><td className="px-2 py-2">{x.dinh_dang}</td><td className="px-2 py-2 text-right tabular-nums">{x.so_ban_ghi.toLocaleString('vi-VN')}</td><td className="px-2 py-2">{x.muc_dich}</td><td className="px-2 py-2"><Chip tone="green" dot>Thành công</Chip></td></tr>)}</tbody></table>
        </div>
      </Card>

      <Card title="Tuân thủ và bảo mật dữ liệu" icon={<ShieldCheck size={17} />} className="mt-4 !border-rose-100 !bg-rose-50/40">
        <ul className="grid gap-2 sm:grid-cols-2 text-[12.5px] text-ink">{['Tất cả dữ liệu cá nhân được mã hóa định danh trước khi xuất.', 'Mọi thao tác xuất dữ liệu đều được ghi lại trong nhật ký (Audit Log).', 'Dữ liệu chỉ dùng cho mục đích giáo dục, nghiên cứu và cải tiến giảng dạy.', 'Chỉ thu dữ liệu cần cho câu hỏi nghiên cứu; không thu dữ liệu nhạy cảm không cần thiết (CL08).'].map((t) => <li key={t} className="flex gap-2"><CircleCheck size={16} className="mt-0.5 shrink-0 text-emerald-600" />{t}</li>)}</ul>
      </Card>

      <KhoiLuuY className="mt-4">Nút “Xuất dữ liệu” tạo tệp <strong>thật</strong> từ dữ liệu demo, áp dụng đúng các thiết lập ẩn danh đang bật, và ghi thêm một dòng vào nhật ký ở trên.</KhoiLuuY>
    </>
  )
}
