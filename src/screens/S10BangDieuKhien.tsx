import { useMemo, useState } from 'react'
import { CalendarDays, Circle, CircleAlert, CircleCheck, CircleDot, Clock, Download, FileChartColumn, Megaphone, Play, Search, TriangleAlert, ListChecks, UserRound } from 'lucide-react'
import { useApp } from '../lib/store'
import { CAU_HINH } from '../data/seed'
import { thongKeLop, nhanTong, phanTramTienDo, TEN_NHAN_TONG, danhSachCa, type NhanTong } from '../lib/derive'
import { truocDay, thuNgay } from '../lib/time'
import { taoCSV, taiVe } from '../lib/csv'
import { PageHead } from '../components/layout/PageHead'
import { AnhCau } from '../components/art/Art'
import { Card, Chip, LinkNho, Ma, MaMan, Nut, ProgressBar } from '../components/ui/Ui'
import type { HocSinh, KyHieuTienDo } from '../types'

const TONE_NHAN: Record<NhanTong, 'green' | 'blue' | 'amber' | 'orange' | 'slate'> = {
  HOAN_THANH: 'green', DANG: 'blue', THIEU: 'amber', XEM_XET: 'orange', CHO: 'blue', CHUA: 'slate',
}

/** Ô trạng thái một hoạt động. Thiếu minh chứng dùng màu hổ phách, KHÔNG dùng dấu ✗ đỏ. */
function OHD({ k }: { k: KyHieuTienDo }) {
  const p = { size: 19, strokeWidth: 2.2 }
  if (k === 'x') return <CircleCheck {...p} className="text-emerald-500" aria-label="Hoàn thành" />
  if (k === 'd') return <CircleDot {...p} className="text-brand-500" aria-label="Đang thực hiện" />
  if (k === 'c') return <Clock {...p} className="text-sky-500" aria-label="Đã nộp, chờ giáo viên" />
  if (k === 'v') return <TriangleAlert {...p} className="text-orange-500" aria-label="Cần xem xét" />
  if (k === 't') return <CircleAlert {...p} className="text-amber-500" aria-label="Thiếu minh chứng" />
  return <Circle {...p} className="text-slate-300" aria-label="Chưa bắt đầu" />
}

function ghiChu(k: string, n: NhanTong): string {
  const hd = (c: string) => [...k].map((x, i) => (x === c ? `HĐ${i + 1}` : null)).filter(Boolean).join(', ')
  if (n === 'THIEU') return `Thiếu ${hd('t') || 'minh chứng'}`
  if (n === 'XEM_XET') return hd('v') ? `Cần xem xét ${hd('v')}` : 'Cần bổ sung dữ liệu cá nhân'
  if (n === 'CHO') return 'Chờ giáo viên duyệt'
  if (n === 'CHUA') return 'Chưa bắt đầu'
  return '–'
}

/** S10 — Bảng điều khiển lớp. Ưu tiên HÀNH ĐỘNG, không xếp hạng học sinh. */
export function S10BangDieuKhien() {
  const { s, d } = useApp()
  const dl = s.du_lieu
  const tk = useMemo(() => thongKeLop(dl), [dl])
  const [tim, setTim] = useState('')
  const [loc, setLoc] = useState<'ALL' | NhanTong>('ALL')
  const [trang, setTrang] = useState(1)
  const [soDong, setSoDong] = useState(10)

  const dong = useMemo(() => {
    const bo = (x: string) => x.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').toLowerCase()
    return dl.hoc_sinh
      .map((h) => ({ h, nhan: nhanTong(dl, h) }))
      .filter((x) => (loc === 'ALL' || x.nhan === loc) && (!tim || bo(x.h.ho_ten).includes(bo(tim))))
  }, [dl, tim, loc])
  const tongTrang = Math.max(1, Math.ceil(dong.length / soDong))
  const trangHT = Math.min(trang, tongTrang)
  const hien = dong.slice((trangHT - 1) * soDong, trangHT * soDong)

  const moHoSo = (h: HocSinh) => {
    if (h.co_ho_so) d({ kieu: 'DOI_MAN_HINH', man_hinh: 'S09', hoc_sinh: h.id })
    else d({ kieu: 'TOAST', noi_dung: 'Bản demo chỉ có hồ sơ chi tiết cho 6 học sinh (tên in đậm). Các học sinh còn lại chỉ có dòng tổng hợp.' })
  }

  const xuat = () => {
    taiVe('tien_do_lop_10A1.csv', taoCSV(
      ['STT', 'Mã HS', 'Họ tên', 'Lớp', 'HĐ1', 'HĐ2', 'HĐ3', 'HĐ4', 'HĐ5', 'Tiến độ (%)', 'Trạng thái'],
      dong.map(({ h, nhan }, i) => [i + 1, h.id, h.ho_ten, h.lop, ...[...h.tien_do], phanTramTienDo(h), TEN_NHAN_TONG[nhan]]),
    ))
    d({ kieu: 'TOAST', noi_dung: `Đã xuất ${dong.length} dòng ra tệp CSV.` })
  }

  const caCho = danhSachCa(dl).filter((c) => c.ho_tro.trang_thai_duyet === 'CHO_DUYET' || c.ho_tro.trang_thai_duyet === 'BO_SUNG').slice(0, 4)

  const ThongBao = ({ n, tieu, mota, tone, link, onLink }: { n: number; tieu: string; mota: string; tone: 'amber' | 'orange' | 'blue' | 'green'; link: string; onLink: () => void }) => {
    const m = {
      amber: ['bg-amber-50 border-amber-200', 'text-amber-600', 'bg-amber-100 text-amber-600'],
      orange: ['bg-orange-50 border-orange-200', 'text-orange-600', 'bg-orange-100 text-orange-600'],
      blue: ['bg-sky-50 border-sky-200', 'text-sky-700', 'bg-sky-100 text-sky-700'],
      green: ['bg-emerald-50 border-emerald-200', 'text-emerald-600', 'bg-emerald-100 text-emerald-600'],
    }[tone]
    const Ic = { amber: CircleAlert, orange: TriangleAlert, blue: Clock, green: CircleCheck }[tone]
    return (
      <div className={`rounded-2xl border p-3.5 ${m[0]}`}>
        <div className="flex items-center gap-2.5">
          <span className={`flex h-9 w-9 items-center justify-center rounded-full ${m[2]}`}><Ic size={19} /></span>
          <span className={`text-[26px] font-extrabold leading-none tabular-nums ${m[1]}`}>{n}</span>
        </div>
        <div className="mt-2 text-[13.5px] font-bold text-ink">{tieu}</div>
        <p className="mt-0.5 min-h-[34px] text-[11.5px] leading-snug text-ink-soft">{mota}</p>
        <button onClick={onLink} className={`mt-1.5 text-[12px] font-bold ${m[1]} hover:underline`}>{link} →</button>
      </div>
    )
  }

  return (
    <>
      <PageHead
        crumbs={['Lớp học', CAU_HINH.lop]}
        title={<><MaMan ma="S10" />Bảng điều khiển lớp</>}
        sub={<>STEM – Cầu giấy chịu lực <span className="mx-1 text-ink-mute">|</span> Lớp {CAU_HINH.lop}</>}
        right={<>
          <span className="hidden text-[12.5px] capitalize text-ink-soft xl:block">{thuNgay()}</span>
          <label className="text-[11px] text-ink-soft">Chọn bài học
            <select className="field mt-0.5 !w-44 !py-1.5" defaultValue="1"><option value="1">Cầu giấy chịu lực</option></select></label>
          <label className="text-[11px] text-ink-soft">Chọn lớp
            <select className="field mt-0.5 !w-24 !py-1.5" defaultValue="1"><option value="1">{CAU_HINH.lop}</option></select></label>
          <div className="flex items-center gap-2.5 rounded-xl bg-mint px-4 py-2.5 text-[13px] font-bold text-brand-800"><CalendarDays size={19} /> Năm học {CAU_HINH.nam_hoc}</div>
        </>}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-4">
          <Card title="Tiến độ thực hiện các hoạt động học tập"
            action={<div className="flex items-center gap-3 text-[12px] text-ink-soft"><span>Tổng quan: <strong className="text-ink">{tk.hd[0].xong}/{tk.tong} học sinh</strong></span><div className="hidden w-24 sm:block"><ProgressBar pct={tk.tongTienDo} tone="green" /></div><strong className="text-emerald-600">{tk.tongTienDo}%</strong></div>}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {tk.hd.map((h, i) => (
                <div key={h.ma} className="rounded-xl border border-line bg-slate-50/60 p-3">
                  <div className="text-[13px] font-extrabold text-brand-700">{h.ma}<Ma>{`E${i + 1}`}</Ma></div>
                  <div className="mt-0.5 min-h-[32px] text-[12px] leading-tight text-ink">{h.ten}</div>
                  <div className="mt-2 flex items-baseline justify-between"><span className="text-[15px] font-extrabold tabular-nums text-ink">{h.xong}/{tk.tong}</span><span className="text-[12px] text-ink-soft">{h.pct}%</span></div>
                  <div className="mt-1"><ProgressBar pct={h.pct} tone={['green', 'teal', 'blue', 'blue', 'blue'][i] as 'green'} /></div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Cảnh báo & việc cần làm" action={<LinkNho onClick={() => setLoc('THIEU')}>Xem tất cả</LinkNho>}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <ThongBao n={tk.thieu.length} tieu="Thiếu minh chứng" tone="amber" mota="Học sinh chưa nộp đủ minh chứng ở một hoặc nhiều hoạt động. Chưa phải mức thấp." link="Xem danh sách" onLink={() => { setLoc('THIEU'); setTrang(1) }} />
              <ThongBao n={tk.xemXet.length} tieu="Cần xem xét" tone="orange" mota="Minh chứng cần giáo viên kiểm tra: mâu thuẫn hoặc chưa quy được cho cá nhân." link="Xem danh sách" onLink={() => { setLoc('XEM_XET'); setTrang(1) }} />
              <ThongBao n={tk.cho.length} tieu="Chờ quyết định" tone="blue" mota="Chờ giáo viên duyệt hỗ trợ hoặc chấm lại minh chứng mới." link="Xem danh sách" onLink={() => d({ kieu: 'DOI_MAN_HINH', man_hinh: 'S14' })} />
              <ThongBao n={tk.tot.length} tieu="Đang thực hiện tốt" tone="green" mota="Học sinh đang đi đúng tiến độ, chưa có cờ cần xử lí." link="Xem chi tiết" onLink={() => { setLoc('DANG'); setTrang(1) }} />
            </div>
          </Card>

          <Card title="Tiến độ học sinh"
            action={
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative"><Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-mute" />
                  <input value={tim} onChange={(e) => { setTim(e.target.value); setTrang(1) }} placeholder="Tìm học sinh…" aria-label="Tìm học sinh" className="field !w-44 !py-1.5 !pl-8" /></div>
                <select value={loc} onChange={(e) => { setLoc(e.target.value as 'ALL' | NhanTong); setTrang(1) }} aria-label="Lọc theo trạng thái" className="field !w-44 !py-1.5">
                  <option value="ALL">Tất cả trạng thái</option>
                  {(Object.keys(TEN_NHAN_TONG) as NhanTong[]).map((k) => <option key={k} value={k}>{TEN_NHAN_TONG[k]}</option>)}
                </select>
                <Nut nho onClick={xuat}><Download size={14} /> Xuất dữ liệu</Nut>
              </div>}>
            <div className="scroll-thin -mx-1 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-[12.5px]">
                <thead>
                  <tr className="border-b border-line text-[11px] font-bold uppercase tracking-wide text-ink-mute">
                    <th className="w-9 px-1 py-2">STT</th><th className="px-1.5 py-2">Họ và tên</th><th className="px-1.5 py-2">Lớp</th>
                    {['HĐ1', 'HĐ2', 'HĐ3', 'HĐ4', 'HĐ5'].map((h) => <th key={h} className="px-1.5 py-2 text-center">{h}</th>)}
                    <th className="px-1.5 py-2">Tiến độ</th><th className="px-1.5 py-2">Trạng thái</th><th className="px-1.5 py-2">Ghi chú</th><th className="px-1.5 py-2 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {hien.map(({ h, nhan }, i) => {
                    const pct = phanTramTienDo(h)
                    return (
                      <tr key={h.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
                        <td className="px-1 py-2 text-ink-mute tabular-nums">{(trangHT - 1) * soDong + i + 1}</td>
                        <td className="whitespace-nowrap px-1.5 py-2"><span className={h.co_ho_so ? 'font-bold text-ink' : 'text-ink'}>{h.ho_ten}</span><Ma>{h.id}</Ma></td>
                        <td className="px-1.5 py-2 text-ink-soft">{h.lop}</td>
                        {[...h.tien_do].map((k, j) => <td key={j} className="px-1.5 py-2 text-center"><span className="inline-flex"><OHD k={k as KyHieuTienDo} /></span></td>)}
                        <td className="px-1.5 py-2"><div className="flex items-center gap-2"><div className="w-14"><ProgressBar pct={pct} tone={pct === 100 ? 'green' : 'teal'} cao={5} /></div><span className="text-[11.5px] tabular-nums text-ink-soft">{pct}%</span></div></td>
                        <td className="px-1.5 py-2"><Chip tone={TONE_NHAN[nhan]} dot>{TEN_NHAN_TONG[nhan]}</Chip></td>
                        <td className="max-w-[130px] truncate px-1.5 py-2 text-[11.5px] text-ink-soft" title={ghiChu(h.tien_do, nhan)}>{ghiChu(h.tien_do, nhan)}</td>
                        <td className="px-1.5 py-2 text-right"><button onClick={() => moHoSo(h)} className="text-[12.5px] font-bold text-brand-700 underline-offset-2 hover:underline">Xem</button></td>
                      </tr>
                    )
                  })}
                  {hien.length === 0 && <tr><td colSpan={12} className="py-8 text-center text-[13px] text-ink-soft">Không có học sinh nào khớp bộ lọc.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[12px] text-ink-soft">
              <span>Hiển thị {dong.length === 0 ? 0 : (trangHT - 1) * soDong + 1} – {Math.min(trangHT * soDong, dong.length)}/{dong.length} học sinh</span>
              <div className="flex items-center gap-1.5">
                <button disabled={trangHT === 1} onClick={() => setTrang(trangHT - 1)} className="rounded-lg px-2 py-1 hover:bg-slate-100 disabled:opacity-30" aria-label="Trang trước">‹</button>
                {Array.from({ length: tongTrang }).map((_, i) => (
                  <button key={i} onClick={() => setTrang(i + 1)} aria-current={trangHT === i + 1} className={`h-7 w-7 rounded-lg text-[12px] font-semibold ${trangHT === i + 1 ? 'bg-brand-600 text-white' : 'hover:bg-slate-100'}`}>{i + 1}</button>
                ))}
                <button disabled={trangHT === tongTrang} onClick={() => setTrang(trangHT + 1)} className="rounded-lg px-2 py-1 hover:bg-slate-100 disabled:opacity-30" aria-label="Trang sau">›</button>
              </div>
              <label className="flex items-center gap-2">Số dòng/trang
                <select value={soDong} onChange={(e) => { setSoDong(+e.target.value); setTrang(1) }} className="field !w-16 !py-1">{[10, 20, 32].map((n) => <option key={n}>{n}</option>)}</select></label>
            </div>
          </Card>
        </div>

        {/* Cột phải */}
        <div className="min-w-0 space-y-4">
          <Card title="Minh chứng chờ duyệt" action={<LinkNho onClick={() => d({ kieu: 'DOI_MAN_HINH', man_hinh: 'S14' })}>Xem tất cả</LinkNho>} pad={false}>
            <ul className="divide-y divide-slate-100 px-2 pb-2">
              {caCho.map((c) => {
                const tep = c.minh_chung?.tep.find((t) => t.loai === 'anh' && t.kieu)
                const laVideo = !tep && c.minh_chung?.tep[0]?.loai === 'video'
                const nv = dl.nhiem_vu.find((n) => n.id === c.ho_tro.nhiem_vu_id)
                const nhanChip = c.ho_tro.trang_thai_duyet === 'BO_SUNG' ? { t: 'Cần bổ sung', tone: 'amber' as const }
                  : c.minh_chung?.trang_thai === 'CAN_XEM_XET' ? { t: 'Cần xem xét', tone: 'orange' as const } : { t: 'Chờ duyệt', tone: 'amber' as const }
                return (
                  <li key={c.ho_tro.id}>
                    <button onClick={() => d({ kieu: 'DOI_MAN_HINH', man_hinh: 'S14', ca: c.ho_tro.id })} className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-slate-50">
                      <div className="h-[58px] w-[74px] shrink-0 overflow-hidden rounded-lg ring-1 ring-line">
                        <div className="relative h-full w-full">
                          <AnhCau kieu={tep?.kieu ?? (laVideo ? 'truss' : 'plank')} tone={laVideo ? 'dark' : (tep?.tone ?? 'light')} className="h-full w-full" />
                          {laVideo && <span className="absolute inset-0 flex items-center justify-center"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-white"><Play size={11} fill="currentColor" /></span></span>}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <span className="truncate text-[13px] font-bold text-ink">{c.hoc_sinh.ho_ten} – {c.hoc_sinh.lop}</span>
                          <Chip tone={nhanChip.tone}>{nhanChip.t}</Chip>
                        </div>
                        <div className="truncate text-[11.5px] text-ink-soft">{nv?.hoat_dong_pha.split(' – ')[0]} – {nv?.ten}</div>
                        <div className="flex items-center justify-between gap-2 text-[11px] text-ink-mute"><span className="truncate">{c.minh_chung?.tep[0]?.ten ?? 'Chưa có tệp'}</span><span className="shrink-0">{truocDay(c.ho_tro.thoi_diem)}</span></div>
                      </div>
                    </button>
                  </li>
                )
              })}
              {caCho.length === 0 && <li className="px-3 py-6 text-center text-[12.5px] text-ink-soft">Không còn minh chứng nào chờ duyệt.</li>}
            </ul>
          </Card>

          <Card title="Thao tác nhanh">
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { t: 'Đánh giá rubric', m: 'Chấm điểm theo tiêu chí', Ic: ListChecks, tone: 'bg-mint text-brand-700', on: () => d({ kieu: 'DOI_MAN_HINH', man_hinh: 'S12', hoc_sinh: 'HS0812' }) },
                { t: 'Xem hồ sơ học sinh', m: 'Tiến trình và minh chứng', Ic: UserRound, tone: 'bg-sky text-sky-700', on: () => d({ kieu: 'DOI_MAN_HINH', man_hinh: 'S09', hoc_sinh: 'HS0812' }) },
                { t: 'Báo cáo lớp', m: 'Thống kê và xuất dữ liệu', Ic: FileChartColumn, tone: 'bg-lavender text-violet-700', on: xuat },
                { t: 'Tạo thông báo', m: 'Gửi đến học sinh', Ic: Megaphone, tone: 'bg-peach text-orange-700', on: () => d({ kieu: 'TOAST', noi_dung: 'Tạo thông báo chưa có trong bản demo.' }) },
              ].map(({ t, m, Ic, tone, on }) => (
                <button key={t} onClick={on} className="flex items-start gap-2.5 rounded-xl border border-line p-3 text-left transition hover:border-brand-200 hover:shadow-sm">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone}`}><Ic size={18} /></span>
                  <span><span className="block text-[12.5px] font-bold leading-tight text-ink">{t}</span><span className="block text-[11px] leading-tight text-ink-soft">{m}</span></span>
                </button>
              ))}
            </div>
          </Card>

          <Card title={`Thông tin lớp ${CAU_HINH.lop}`} action={<LinkNho onClick={() => d({ kieu: 'TOAST', noi_dung: 'Chỉnh sửa thông tin lớp thuộc màn quản lý lớp — chưa có trong bản demo.' })}>Chỉnh sửa</LinkNho>}>
            <dl className="space-y-2 text-[12.5px]">
              {[
                ['Giáo viên chủ nhiệm', CAU_HINH.giao_vien], ['Sĩ số', `${tk.tong} học sinh`], ['Bài học', CAU_HINH.ten_bai],
                ['Thời gian thực hiện', '14/10/2024 – 22/11/2024'],
              ].map(([k, v]) => <div key={k} className="grid grid-cols-[130px_1fr] gap-2"><dt className="text-ink-soft">{k}</dt><dd className="font-medium text-ink">{v}</dd></div>)}
              <div className="grid grid-cols-[130px_1fr] items-center gap-2"><dt className="text-ink-soft">Trạng thái chung</dt><dd><Chip tone="green" dot>Đang triển khai</Chip></dd></div>
              <div className="grid grid-cols-[130px_1fr] gap-2"><dt className="text-ink-soft">Ghi chú</dt><dd className="text-ink">Khuyến khích học sinh nộp video thí nghiệm.</dd></div>
            </dl>
          </Card>
        </div>
      </div>
    </>
  )
}
