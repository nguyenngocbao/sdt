import { useEffect, useMemo, useRef, useState } from 'react'
import { Book, CircleCheck, Copy, History, Lock, Pencil, Plus, Save, ShieldAlert, Target, Trash2, TriangleAlert } from 'lucide-react'
import { useApp } from '../lib/store'
import { CAU_HINH } from '../data/seed'
import { CHI_BAO } from '../data/rubric'
import { HOAT_DONG, MUC_TIEU_BAI, PHIEU_MINH_CHUNG, TEN_NGAN } from '../data/khbd'
import { CHI_BAO_LOI_12 } from '../data/builders'
import { kiemTraCauHinh, NGAN_HANG_MINH_CHUNG, QUY_TAC } from '../lib/cauhinh'
import { ngayGio } from '../lib/time'
import { PageHead } from '../components/layout/PageHead'
import { AnhCau } from '../components/art/Art'
import { Card, Chip, KhoiChan, KhoiLuuY, LinkNho, Nut } from '../components/ui/Ui'

/** S15 — Cấu hình bài học và ánh xạ. Dịch KHBD thành cấu hình phần mềm CÓ PHIÊN BẢN; không sửa âm thầm phiên bản đang chạy. */
export function S15CauHinhBaiHoc() {
  const { s, d } = useApp()
  const ds = s.du_lieu.cau_hinh
  const [id, setId] = useState(ds.find((c) => c.hien_tai)?.id ?? ds[0].id)
  const c = ds.find((x) => x.id === id) ?? ds[0]
  const [moLichSu, setMoLichSu] = useState(false)
  const [ghiChu, setGhiChu] = useState(c.ghi_chu)
  const [daKiem, setDaKiem] = useState(false)
  const van = useMemo(() => kiemTraCauHinh(c), [c])
  const loi = van.filter((x) => x.muc === 'loi')
  const sua = !c.khoa

  const doiVer = (v: string) => { setId(v); setGhiChu(ds.find((x) => x.id === v)?.ghi_chu ?? ''); setDaKiem(false) }

  // Vừa nhân bản xong thì chuyển sang bản nháp mới (luôn nằm đầu danh sách)
  const soPhienBan = useRef(ds.length)
  useEffect(() => {
    if (ds.length > soPhienBan.current) doiVer(ds[0].id)
    soPhienBan.current = ds.length
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ds.length])

  return (
    <>
      <PageHead
        crumbs={['Trang chủ', 'Quản lý bài học', 'S15 – Cấu hình bài học và ánh xạ']}
        title="S15 – Cấu hình bài học và ánh xạ"
        sub="Thiết lập mối liên kết giữa hoạt động học tập, chỉ báo, minh chứng và quy tắc đánh giá cho bài học STEM."
        right={<>
          <Nut onClick={() => d({ kieu: 'TOAST', noi_dung: 'Hướng dẫn cấu hình: mỗi chỉ báo lõi phải có ít nhất một hoạt động tạo cơ hội; phiên bản đang chạy không sửa được, chỉ nhân bản.' })}><Book size={15} /> Xem hướng dẫn</Nut>
          <Nut bien="chinh" disabled={!sua} onClick={() => d({ kieu: 'LUU_CAU_HINH', id: c.id, ghi_chu: ghiChu })}><Save size={15} /> Lưu cấu hình</Nut>
        </>}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-4">
          <Card title="Thông tin bài học" icon={<Book size={17} />}>
            <div className="grid gap-3 sm:grid-cols-[1.4fr_0.7fr_1fr]">
              <label className="text-[11.5px] font-semibold text-ink-soft">Chọn bài học <span className="text-rose-500">*</span><select className="field mt-1" defaultValue="1"><option value="1">STEM – Cầu giấy chịu lực</option></select></label>
              <label className="text-[11.5px] font-semibold text-ink-soft">Chọn lớp áp dụng<select className="field mt-1" defaultValue="1"><option value="1">{CAU_HINH.lop}</option></select></label>
              <label className="text-[11.5px] font-semibold text-ink-soft">Phiên bản cấu hình<select value={id} onChange={(e) => doiVer(e.target.value)} className="field mt-1">{ds.map((x) => <option key={x.id} value={x.id}>{x.id}{x.hien_tai ? ' (Hiện tại)' : x.khoa ? ' (đã khoá)' : ' (bản nháp)'}</option>)}</select></label>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
              <div className="flex gap-3">
                <div className="h-[92px] w-[130px] shrink-0 overflow-hidden rounded-xl ring-1 ring-line"><AnhCau kieu="truss" tone="light" className="h-full w-full" /></div>
                <div className="min-w-0"><div className="text-[14.5px] font-extrabold text-ink">HĐ2 – Nghiên cứu và phát triển phương án</div>
                  <p className="mt-0.5 text-[12px] leading-snug text-ink-soft">Học sinh nghiên cứu, đề xuất và phát triển các phương án thiết kế cầu giấy chịu lực, lựa chọn giải pháp tối ưu dựa trên tiêu chí STEM.</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">{['STEM', 'Công nghệ', 'Thiết kế kỹ thuật', 'Lớp 10'].map((t, i) => <Chip key={t} tone={(['teal', 'amber', 'green', 'blue'] as const)[i]}>{t}</Chip>)}</div></div>
              </div>
              <div className="rounded-xl bg-mint p-3.5"><div className="flex items-center gap-2 text-[13px] font-extrabold text-brand-800"><Target size={16} /> Mục tiêu bài học</div>
                <ul className="mt-1.5 space-y-1">{MUC_TIEU_BAI.map((m) => <li key={m} className="flex gap-2 text-[11.5px] leading-snug text-ink"><CircleCheck size={14} className="mt-0.5 shrink-0 text-emerald-600" />{m}</li>)}</ul></div>
            </div>
          </Card>

          <Card title="Cấu hình ánh xạ hoạt động – chỉ báo – minh chứng – quy tắc đánh giá" icon={<Pencil size={17} />}
            action={<Nut nho onClick={() => d({ kieu: 'TOAST', noi_dung: 'KHBD có đúng 5 hoạt động; bản demo không cho thêm hoạt động.' })}><Plus size={13} /> Thêm hoạt động</Nut>}>
            {c.khoa && (
              <div className="mb-3 flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12.5px] text-amber-900">
                <Lock size={17} className="shrink-0 text-amber-600" />
                <span className="min-w-0 flex-1"><strong>{c.id} đã khoá.</strong> Phiên bản đang chạy không được sửa âm thầm — muốn thay đổi, hãy nhân bản thành phiên bản mới.</span>
                <Nut nho bien="vang" onClick={() => d({ kieu: 'NHAN_BAN_CAU_HINH', id: c.id })}><Copy size={13} /> Nhân bản thành phiên bản mới</Nut>
              </div>)}
            <div className="scroll-thin overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-[12.5px]">
                <thead><tr className="border-b border-line bg-slate-50/70 text-[10.5px] font-bold uppercase tracking-wide text-ink-mute"><th className="px-2 py-2">Mã hoạt động</th><th className="px-2 py-2">Tên hoạt động</th><th className="px-2 py-2">Chỉ báo tương ứng</th><th className="px-2 py-2">Minh chứng</th><th className="px-2 py-2">Quy tắc đánh giá</th><th className="px-2 py-2 text-right">Thao tác</th></tr></thead>
                <tbody>
                  {c.anh_xa.map((r, i) => {
                    const la = r.chi_bao.filter((x) => !CHI_BAO[x] && !HOAT_DONG.some((h) => h.chi_bao.includes(x)))
                    return (
                      <tr key={r.hd} className="border-b border-slate-100 last:border-0 align-middle">
                        <td className="px-2 py-2.5 font-extrabold text-ink">{r.hd}</td><td className="px-2 py-2.5 text-ink">{r.ten}</td>
                        <td className="px-2 py-2.5">{sua
                          ? <input defaultValue={r.chi_bao.join(', ')} onBlur={(e) => d({ kieu: 'SUA_ANH_XA', id: c.id, hd: r.hd, truong: 'chi_bao', gia_tri: e.target.value })} aria-label={`Chỉ báo của ${r.hd}`} className={`field !py-1.5 ${la.length ? '!border-rose-400' : ''}`} />
                          : <span className="flex flex-wrap gap-1">{r.chi_bao.map((x) => <span key={x} className={`rounded px-1.5 py-0.5 font-mono text-[11px] ${CHI_BAO_LOI_12.includes(x) ? 'bg-brand-100 text-brand-800' : 'bg-slate-100 text-ink-soft'}`} title={TEN_NGAN[x]}>{x}</span>)}</span>}</td>
                        <td className="px-2 py-2.5">{sua ? <select value={r.minh_chung} onChange={(e) => d({ kieu: 'SUA_ANH_XA', id: c.id, hd: r.hd, truong: 'minh_chung', gia_tri: e.target.value })} aria-label={`Minh chứng của ${r.hd}`} className="field !w-20 !py-1.5">{NGAN_HANG_MINH_CHUNG.map((x) => <option key={x}>{x}</option>)}</select> : <span className="font-semibold text-ink">{r.minh_chung}</span>}</td>
                        <td className="px-2 py-2.5">{sua ? <select value={r.quy_tac} onChange={(e) => d({ kieu: 'SUA_ANH_XA', id: c.id, hd: r.hd, truong: 'quy_tac', gia_tri: e.target.value })} aria-label={`Quy tắc của ${r.hd}`} className="field !w-44 !py-1.5">{QUY_TAC.map((x) => <option key={x}>{x}</option>)}</select> : <span className="text-ink">{r.quy_tac}</span>}</td>
                        <td className="whitespace-nowrap px-2 py-2.5 text-right">
                          <button disabled={!sua} onClick={() => d({ kieu: 'TOAST', noi_dung: 'Sửa trực tiếp ngay trên bảng (ô chỉ báo, minh chứng, quy tắc).' })} className="mr-2 inline-flex items-center gap-1 text-[12px] font-semibold text-brand-700 hover:underline disabled:cursor-not-allowed disabled:text-slate-300 disabled:no-underline"><Pencil size={13} />Sửa</button>
                          <button disabled={!sua} onClick={() => d({ kieu: 'TOAST', noi_dung: `Không xoá được ${HOAT_DONG[i].ma}: KHBD có đúng 5 hoạt động.` })} className="inline-flex items-center gap-1 text-[12px] font-semibold text-rose-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-300 disabled:no-underline"><Trash2 size={13} />Xóa</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2.5">
              <Nut nho onClick={() => setDaKiem(true)}><ShieldAlert size={13} /> Kiểm tra hợp lệ</Nut>
              {sua && <Nut nho bien="phu" onClick={() => d({ kieu: 'KHOA_CAU_HINH', id: c.id })} disabled={loi.length > 0}><Lock size={13} /> Khoá phiên bản</Nut>}
              {sua && loi.length > 0 && <span className="text-[11.5px] text-orange-700">Chưa khoá được: còn {loi.length} lỗi cần sửa.</span>}
            </div>
            {daKiem && (loi.length === 0 && van.length === 0
              ? <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-[12.5px] font-semibold text-emerald-800"><CircleCheck size={17} /> Cấu hình hợp lệ: mọi chỉ báo lõi đều có hoạt động tạo cơ hội.</div>
              : <div className="mt-3 space-y-2">{van.map((x, i) => x.muc === 'loi' ? <KhoiChan key={i} tieuDe="Lỗi.">{x.noi_dung}</KhoiChan> : <div key={i} className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[12px] text-amber-900"><TriangleAlert size={16} className="mt-0.5 shrink-0" />{x.noi_dung}</div>)}</div>)}
          </Card>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <Card title="Ghi chú cấu hình" icon={<Pencil size={17} />}>
              <div className="relative"><textarea value={ghiChu} onChange={(e) => setGhiChu(e.target.value.slice(0, 500))} disabled={!sua} rows={5} placeholder="Nhập ghi chú, lưu ý hoặc hướng dẫn triển khai…" className="field leading-relaxed disabled:bg-slate-50" /><span className="absolute bottom-2 right-3 text-[11px] tabular-nums text-ink-mute">{ghiChu.length}/500</span></div>
            </Card>
            <Card title="Trạng thái cấu hình" icon={<CircleCheck size={17} />} action={loi.length === 0 ? <Chip tone="green" dot>Đã hoàn thiện</Chip> : <Chip tone="orange" dot>{loi.length} lỗi</Chip>}>
              <dl className="space-y-2 text-[12.5px]">
                {[['Phiên bản', `${c.id}${c.khoa ? ' · đã khoá' : ' · bản nháp'}`], ['Cập nhật lần cuối', ngayGio(c.thoi_diem)], ['Người cập nhật', c.nguoi], ['Áp dụng cho', `Lớp ${CAU_HINH.lop}`], ['Số hoạt động', String(c.anh_xa.length)]].map(([k, v]) => <div key={k} className="grid grid-cols-[120px_1fr] gap-2"><dt className="text-ink-soft">{k}</dt><dd className="font-medium text-ink">{v}</dd></div>)}
              </dl>
              <Nut nho className="mt-3" onClick={() => setMoLichSu(true)}><History size={13} /> Xem lịch sử phiên bản</Nut>
            </Card>
          </div>
        </div>

        <div className="min-w-0 space-y-4">
          <Card title="Ngân hàng chỉ báo" icon={<Target size={17} />} action={<LinkNho>Xem tất cả</LinkNho>} pad={false}>
            <ul className="scroll-thin max-h-[300px] divide-y divide-slate-100 overflow-y-auto px-2 pb-2">
              {CHI_BAO_LOI_12.map((x) => <li key={x} className="flex items-center gap-2.5 px-2 py-1.5 text-[12px]"><span className="w-10 shrink-0 rounded bg-brand-50 px-1.5 py-0.5 text-center font-mono text-[11px] font-bold text-brand-800">{x}</span><span className="text-ink">{TEN_NGAN[x]}</span></li>)}
              <li className="px-2 py-2 text-[11px] text-ink-mute">12 chỉ báo lõi theo dõi SDT (trong 34 biểu hiện của khung năng lực).</li>
            </ul>
          </Card>
          <Card title="Ngân hàng minh chứng" icon={<Book size={17} />} action={<LinkNho>Xem tất cả</LinkNho>} pad={false}>
            <ul className="divide-y divide-slate-100 px-2 pb-2">{PHIEU_MINH_CHUNG.map((p) => <li key={p.ma} className="flex items-center gap-2.5 px-2 py-1.5 text-[12px]"><span className="w-8 shrink-0 rounded bg-sky px-1.5 py-0.5 text-center font-mono text-[11px] font-bold text-sky-800">{p.ma}</span><span className="text-ink">{p.ten}</span></li>)}</ul>
          </Card>
          <Card title="Phiên bản rubric" icon={<History size={17} />} action={<LinkNho>Quản lý</LinkNho>} pad={false}>
            <ul className="divide-y divide-slate-100 px-2 pb-2">
              <li className="px-2 py-2 text-[12px]"><span className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-[11px] font-bold text-amber-800">{CAU_HINH.rubric_phien_ban}</span> <span className="text-ink">Bản tạm để chạy demo</span></li>
              <li className="px-2 py-2 text-[12px] text-ink-mute"><span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-bold">BMM_v0.3</span> Bản chính thức — chờ nạp</li>
            </ul>
          </Card>
        </div>
      </div>

      <KhoiLuuY className="mt-4">Mã chỉ báo, mã minh chứng và số phiên bản hiện ở đây vì đây là màn <strong>cấu hình</strong> — nơi người thiết kế dịch KHBD thành phần mềm. Ở các màn học sinh và giáo viên, các mã này bị ẩn (trừ khi bật chế độ nghiên cứu).</KhoiLuuY>

      {moLichSu && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 p-4" onClick={() => setMoLichSu(false)} role="dialog" aria-modal>
          <div className="rise w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between"><h3 className="text-[16px] font-extrabold text-ink">Lịch sử phiên bản</h3><button onClick={() => setMoLichSu(false)} className="rounded-lg px-2 py-1 text-ink-soft hover:bg-slate-100">Đóng</button></div>
            <ul className="mt-3 space-y-2">{ds.map((x) => <li key={x.id} className="flex items-center gap-3 rounded-xl border border-line p-3"><span className="font-mono text-[13px] font-bold text-ink">{x.id}</span>{x.hien_tai && <Chip tone="green">Hiện tại</Chip>}{x.khoa ? <Chip tone="slate"><Lock size={11} /> Đã khoá</Chip> : <Chip tone="amber">Bản nháp</Chip>}<span className="ml-auto text-[11.5px] text-ink-soft">{x.nguoi} · {ngayGio(x.thoi_diem)}</span></li>)}</ul>
            <p className="mt-3 text-[11.5px] text-ink-mute">Phiên bản đã khoá không sửa được; thay đổi luôn là một phiên bản mới (CL09).</p>
          </div>
        </div>
      )}
    </>
  )
}
