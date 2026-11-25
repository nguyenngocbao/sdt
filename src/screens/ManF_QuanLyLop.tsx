import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Download, KeyRound, Lock, LockOpen, Plus, UserPlus } from 'lucide-react'
import { PageHead } from '../components/layout/PageHead'
import { Card, Chip, KhoiLuuY, MaMan, Nut, Trong } from '../components/ui/Ui'
import { request, useAuth, type LopTom } from '../lib/auth'
import { taiVe, taoCSV } from '../lib/csv'

interface HocSinhLop { ma: string; ho_ten: string; email: string | null; dang_hoat_dong: boolean }
interface GiaoVienTom { id: string; ho_ten: string; email: string; dang_hoat_dong: boolean; lop: string[] }
interface TaiKhoanMoi { ma: string; ho_ten: string; email: string; mat_khau_ban_dau: string }
interface DongLoi { dong: number; loi: string }

const O = 'w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100'

function Truong({ nhan, children }: { nhan: string; children: ReactNode }) {
  return <label className="block text-[12px] font-semibold text-ink-soft"><span className="mb-1 block">{nhan}</span>{children}</label>
}

/** Mỗi dòng: "Họ tên, email" (email có thể bỏ trống). Tab, dấu phẩy hoặc chấm phẩy đều được — dán thẳng từ Excel. */
export function docDanhSach(van_ban: string): { ho_ten: string; email?: string }[] {
  return van_ban.split(/\r?\n/).map((d) => d.trim()).filter(Boolean)
    .map((d) => { const [ten, email] = d.split(/\t|;|,/).map((x) => x.trim()); return { ho_ten: ten, ...(email ? { email } : {}) } })
    .filter((x, i) => !(i === 0 && /^(họ\s*(và\s*)?tên|ho\s*ten|name)$/i.test(x.ho_ten)))
}

export function ManF_QuanLyLop() {
  const { user, lop_dang_chon, doi_lop, lam_moi_lop } = useAuth()
  const laQuanTri = user?.vai_tro === 'QUAN_TRI'
  const [lop, setLop] = useState<LopTom[] | null>(null)
  const [chon, setChon] = useState(lop_dang_chon)
  const [hs, setHs] = useState<HocSinhLop[] | null>(null)
  const [gv, setGv] = useState<GiaoVienTom[]>([])
  const [loi, setLoi] = useState('')
  const [loiDong, setLoiDong] = useState<DongLoi[]>([])
  const [bao, setBao] = useState('')
  const [moi, setMoi] = useState<TaiKhoanMoi[]>([])
  const [dangLam, setDangLam] = useState(false)
  const [moForm, setMoForm] = useState(false)
  const [tenLop, setTenLop] = useState('')
  const [namHoc, setNamHoc] = useState('2025–2026')
  const [suaTen, setSuaTen] = useState('')
  const [suaNam, setSuaNam] = useState('')
  const [hoTen, setHoTen] = useState('')
  const [email, setEmail] = useState('')
  const [dan, setDan] = useState('')

  const taiLop = useCallback(async () => { setLop((await request('/api/lop')).lop) }, [])
  const taiHs = useCallback(async (id: string) => {
    if (!id) { setHs([]); return }
    setHs((await request(`/api/lop/${encodeURIComponent(id)}/hoc-sinh`)).hoc_sinh)
  }, [])
  useEffect(() => { taiLop().catch((e: Error) => setLoi(e.message)) }, [taiLop])
  useEffect(() => { setHs(null); taiHs(chon).catch((e: Error) => { setLoi(e.message); setHs([]) }) }, [chon, taiHs])
  useEffect(() => { if (laQuanTri) request('/api/giao-vien').then((d) => setGv(d.giao_vien)).catch(() => undefined) }, [laQuanTri])

  const lopChon = lop?.find((l) => l.id === chon)
  useEffect(() => { setSuaTen(lopChon?.ten ?? ''); setSuaNam(lopChon?.nam_hoc ?? '') }, [lopChon?.id, lopChon?.ten, lopChon?.nam_hoc])

  /** Chạy một thao tác ghi: khoá nút, gom lỗi một chỗ, tải lại danh sách khi xong. */
  async function lam(viec: () => Promise<void>) {
    setDangLam(true); setLoi(''); setLoiDong([]); setBao('')
    try { await viec() } catch (e) {
      setLoi((e as Error).message)
    } finally { setDangLam(false) }
  }
  async function ghiDanhSach(ds: { ho_ten: string; email?: string }[]) {
    const r = await fetch(`/api/lop/${encodeURIComponent(chon)}/hoc-sinh`, {
      method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json', 'x-lop-id': chon }, body: JSON.stringify({ danh_sach: ds }),
    })
    const d = await r.json().catch(() => ({}))
    if (!r.ok) { setLoiDong(d.loi ?? []); throw new Error(d.message ?? 'Không thêm được học sinh.') }
    setMoi((cu) => [...d.da_tao, ...cu])
    setBao(`Đã thêm ${d.da_tao.length} học sinh. Hãy tải bảng mật khẩu ngay — mật khẩu chỉ hiện một lần.`)
    await Promise.all([taiHs(chon), taiLop(), lam_moi_lop()])
  }

  const taoLop = (e: FormEvent) => { e.preventDefault(); void lam(async () => {
    const d = await request('/api/lop', { method: 'POST', body: JSON.stringify({ ten: tenLop, nam_hoc: namHoc }) })
    await lam_moi_lop(); setTenLop(''); setMoForm(false); doi_lop(d.lop.id)
  }) }
  const luuLop = (e: FormEvent) => { e.preventDefault(); void lam(async () => {
    await request(`/api/lop/${encodeURIComponent(chon)}`, { method: 'PATCH', body: JSON.stringify({ ten: suaTen, nam_hoc: suaNam }) })
    setBao('Đã lưu thông tin lớp.'); await Promise.all([taiLop(), lam_moi_lop()])
  }) }
  const themMot = (e: FormEvent) => { e.preventDefault(); void lam(async () => { await ghiDanhSach([{ ho_ten: hoTen, ...(email.trim() ? { email: email.trim() } : {}) }]); setHoTen(''); setEmail('') }) }
  const themDan = (e: FormEvent) => { e.preventDefault(); void lam(async () => { await ghiDanhSach(docDanhSach(dan)); setDan('') }) }
  const suaEm = (ma: string, phan: Record<string, unknown>, thongBao: (d: Record<string, unknown>) => string) => lam(async () => {
    const d = await request(`/api/hoc-sinh/${encodeURIComponent(ma)}`, { method: 'PATCH', body: JSON.stringify(phan) })
    setBao(thongBao(d)); await taiHs(chon)
  })
  const ganGv = (id: string, co: boolean) => lam(async () => {
    const hienTai = gv.filter((g) => g.lop.includes(chon)).map((g) => g.id)
    const ids = co ? [...hienTai, id] : hienTai.filter((x) => x !== id)
    await request(`/api/lop/${encodeURIComponent(chon)}/giao-vien`, { method: 'PUT', body: JSON.stringify({ giao_vien_ids: ids }) })
    setGv((await request('/api/giao-vien')).giao_vien); await lam_moi_lop()
  })
  const taiBangMk = () => taiVe(`tai-khoan-moi-${chon}.csv`, taoCSV(['Mã', 'Họ tên', 'Email', 'Mật khẩu ban đầu'], moi.map((m) => [m.ma, m.ho_ten, m.email, m.mat_khau_ban_dau])))
  const dsDan = docDanhSach(dan)

  return (
    <>
      <PageHead crumbs={['Lớp học', 'Quản lý lớp']} title={<><MaMan ma="F" />Quản lý lớp và học sinh</>} sub="Tạo lớp, thêm học sinh, cấp lại mật khẩu"
        right={<Nut bien="chinh" onClick={() => setMoForm((v) => !v)}><Plus size={15} />Tạo lớp mới</Nut>} />
      {loi && <p role="alert" className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800">{loi}</p>}
      {loiDong.length > 0 && (
        <ul className="mb-3 list-disc space-y-0.5 rounded-lg bg-amber-50 py-2 pl-7 pr-3 text-[13px] text-amber-900">
          {loiDong.map((l) => <li key={`${l.dong}-${l.loi}`}>Dòng {l.dong}: {l.loi}</li>)}
        </ul>
      )}
      {bao && <p role="status" className="mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">{bao}</p>}

      {moForm && (
        <Card title="Lớp mới" sub="Bạn sẽ được gán làm giáo viên của lớp này." className="mb-4">
          <form onSubmit={taoLop} className="grid gap-3 sm:grid-cols-[1fr_200px_auto] sm:items-end">
            <Truong nhan="Tên lớp"><input className={O} value={tenLop} onChange={(e) => setTenLop(e.target.value)} placeholder="Ví dụ: Lớp 10A2" required /></Truong>
            <Truong nhan="Năm học"><input className={O} value={namHoc} onChange={(e) => setNamHoc(e.target.value)} required /></Truong>
            <Nut bien="chinh" type="submit" disabled={dangLam || !tenLop.trim()}>Tạo lớp</Nut>
          </form>
        </Card>
      )}

      <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Chọn lớp">
        {lop === null ? <Trong>Đang tải…</Trong> : lop.length === 0 ? <Trong>Bạn chưa phụ trách lớp nào. Bấm “Tạo lớp mới” để bắt đầu.</Trong> : lop.map((l) => (
          <button key={l.id} role="tab" aria-selected={l.id === chon} onClick={() => setChon(l.id)}
            className={`rounded-xl px-3.5 py-2 text-left text-[13px] font-semibold ring-1 transition ${l.id === chon ? 'bg-brand-600 text-white ring-brand-600' : 'bg-white text-ink ring-slate-300 hover:bg-slate-50'}`}>
            {l.ten}<span className={`ml-2 text-[11.5px] font-medium ${l.id === chon ? 'text-white/80' : 'text-ink-soft'}`}>{l.so_hoc_sinh} em</span>
          </button>
        ))}
      </div>

      {lopChon && (
        <div className="space-y-4">
          <Card title="Thông tin lớp" sub={`Mã lớp ${lopChon.id}`}>
            <form onSubmit={luuLop} className="grid gap-3 sm:grid-cols-[1fr_200px_auto] sm:items-end">
              <Truong nhan="Tên lớp"><input className={O} value={suaTen} onChange={(e) => setSuaTen(e.target.value)} required /></Truong>
              <Truong nhan="Năm học"><input className={O} value={suaNam} onChange={(e) => setSuaNam(e.target.value)} required /></Truong>
              <Nut type="submit" disabled={dangLam || (suaTen === lopChon.ten && suaNam === lopChon.nam_hoc)}>Lưu</Nut>
            </form>
          </Card>

          <Card title={`Học sinh (${hs?.length ?? '…'})`} pad={false}>
            {hs === null ? <div className="px-4 py-5"><Trong>Đang tải…</Trong></div> : hs.length === 0 ? <div className="px-4 py-5"><Trong>Lớp chưa có học sinh. Thêm ở phần bên dưới.</Trong></div> : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-[13px]">
                  <thead className="text-[11.5px] uppercase tracking-wide text-ink-soft"><tr><th className="px-4 py-2">Mã</th><th className="px-2 py-2">Họ tên</th><th className="px-2 py-2">Email đăng nhập</th><th className="px-2 py-2">Trạng thái</th><th className="px-4 py-2 text-right">Thao tác</th></tr></thead>
                  <tbody>
                    {hs.map((h) => (
                      <tr key={h.ma} className="border-t border-line">
                        <td className="px-4 py-2 font-mono text-[12.5px]">{h.ma}</td>
                        <td className="px-2 py-2 font-semibold text-ink">{h.ho_ten}</td>
                        <td className="px-2 py-2 text-ink-soft">{h.email ?? '—'}</td>
                        <td className="px-2 py-2">{h.dang_hoat_dong ? <Chip tone="green">Hoạt động</Chip> : <Chip tone="slate">Đã khoá</Chip>}</td>
                        <td className="px-4 py-2">
                          <div className="flex justify-end gap-1.5">
                            <Nut nho disabled={dangLam} onClick={() => { if (window.confirm(`Cấp mật khẩu mới cho ${h.ho_ten}? Mật khẩu cũ sẽ không dùng được nữa.`)) void suaEm(h.ma, { dat_lai_mat_khau: true }, (d) => { setMoi((cu) => [{ ma: h.ma, ho_ten: h.ho_ten, email: h.email ?? '', mat_khau_ban_dau: String(d.mat_khau_moi) }, ...cu]); return `Đã cấp mật khẩu mới cho ${h.ho_ten}. Mật khẩu chỉ hiện một lần.` }) }}><KeyRound size={13} />Mật khẩu mới</Nut>
                            <Nut nho bien={h.dang_hoat_dong ? 'nguy' : 'phu'} disabled={dangLam} onClick={() => void suaEm(h.ma, { dang_hoat_dong: !h.dang_hoat_dong }, () => h.dang_hoat_dong ? `Đã khoá tài khoản ${h.ho_ten}.` : `Đã mở lại tài khoản ${h.ho_ten}.`)}>
                              {h.dang_hoat_dong ? <><Lock size={13} />Khoá</> : <><LockOpen size={13} />Mở</>}
                            </Nut>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {moi.length > 0 && (
            <Card title="Tài khoản vừa tạo" sub="Mật khẩu chỉ hiện ở đây một lần. Tải về và gửi riêng cho từng em."
              action={<Nut nho bien="chinh" onClick={taiBangMk}><Download size={13} />Tải CSV</Nut>} tone="sand">
              <div className="overflow-x-auto"><table className="w-full min-w-[520px] text-left text-[13px]">
                <thead className="text-[11.5px] uppercase tracking-wide text-ink-soft"><tr><th className="py-1 pr-3">Mã</th><th className="pr-3">Họ tên</th><th className="pr-3">Email</th><th>Mật khẩu</th></tr></thead>
                <tbody>{moi.map((m) => <tr key={`${m.ma}-${m.mat_khau_ban_dau}`} className="border-t border-line/60"><td className="py-1.5 pr-3 font-mono">{m.ma}</td><td className="pr-3">{m.ho_ten}</td><td className="pr-3">{m.email}</td><td className="font-mono font-bold">{m.mat_khau_ban_dau}</td></tr>)}</tbody>
              </table></div>
            </Card>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <Card title="Thêm một em" icon={<UserPlus size={16} />}>
              <form onSubmit={themMot} className="space-y-3">
                <Truong nhan="Họ tên"><input className={O} value={hoTen} onChange={(e) => setHoTen(e.target.value)} required /></Truong>
                <Truong nhan="Email đăng nhập (bỏ trống để hệ thống tự đặt)"><input className={O} type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Truong>
                <Nut bien="chinh" type="submit" disabled={dangLam || !hoTen.trim()}>Thêm học sinh</Nut>
              </form>
            </Card>
            <Card title="Dán danh sách lớp" sub="Mỗi dòng một em: Họ tên, email. Dán thẳng từ Excel được.">
              <form onSubmit={themDan} className="space-y-3">
                <textarea className={`${O} h-[118px] font-mono`} value={dan} onChange={(e) => setDan(e.target.value)} placeholder={'Nguyễn Văn A, a@truong.edu.vn\nTrần Thị B'} />
                <div className="flex items-center gap-3">
                  <Nut bien="chinh" type="submit" disabled={dangLam || dsDan.length === 0}>Thêm {dsDan.length || ''} học sinh</Nut>
                  <span className="text-[12px] text-ink-soft">Có dòng lỗi thì chưa thêm em nào.</span>
                </div>
              </form>
            </Card>
          </div>

          {laQuanTri && (
            <Card title="Giáo viên phụ trách lớp này" sub="Chỉ quản trị viên gán được. Giáo viên chỉ thấy học sinh của lớp mình được gán.">
              {gv.length === 0 ? <Trong>Chưa có giáo viên nào.</Trong> : (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {gv.map((g) => (
                    <li key={g.id}><label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-slate-50">
                      <input type="checkbox" checked={g.lop.includes(chon)} disabled={dangLam} onChange={(e) => void ganGv(g.id, e.target.checked)} />
                      <span className="text-[13px] font-semibold text-ink">{g.ho_ten}</span><span className="text-[12px] text-ink-soft">{g.email}</span>
                    </label></li>
                  ))}
                </ul>
              )}
            </Card>
          )}
          <KhoiLuuY>Khoá tài khoản chỉ chặn đăng nhập; bài đã nộp của em vẫn được giữ nguyên.</KhoiLuuY>
        </div>
      )}
    </>
  )
}
