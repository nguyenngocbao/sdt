import { useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, CircleCheck, CircleDot, Clock, Download, MessageSquareWarning, Pencil, Search, SquareCheckBig, TriangleAlert, X } from 'lucide-react'
import { useApp } from '../lib/store'
import { danhSachCa, chuoiPhienBan, type CaHoTro } from '../lib/derive'
import { layMau } from '../data/catalog'
import { CHI_BAO } from '../data/rubric'
import { CAU_HINH } from '../data/seed'
import { ngayGio, ngay, gio } from '../lib/time'
import { nid } from '../lib/time'
import { trangThaiMoiNhat, nhanTinCay, nhanDocLap } from '../lib/trace'
import { PageHead } from '../components/layout/PageHead'
import { KhoTepNho } from '../components/Tep'
import { Avatar, Card, Chip, ChipMuc, KhoiChan, KhoiLuuY, LinkNho, Ma, MaMan, Nhan, Nut, SegBar } from '../components/ui/Ui'
import type { MinhChung } from '../types'

type LocTT = 'ALL' | 'CHO_DUYET' | 'BO_SUNG' | 'DA_DUYET'

const NHAN_LOAI: Record<string, string> = {
  PHUONG_PHAP: 'Hỗ trợ phương pháp', KY_THUAT: 'Hỗ trợ kỹ thuật', BO_SUNG: 'Yêu cầu thêm dữ liệu', TAI_LIEU: 'Gợi ý tài liệu',
  GIAI_THICH: 'Giải thích kiến thức', LAM_RO: 'Làm rõ yêu cầu', GOI_Y_Y_TUONG: 'Gợi ý ý tưởng',
}
const UU_TIEN = { CAO: { t: 'Cao', c: 'bg-rose-500' }, TB: { t: 'Trung bình', c: 'bg-amber-400' }, THAP: { t: 'Thấp', c: 'bg-emerald-500' } }

const TT_CA = (c: CaHoTro) =>
  c.ho_tro.trang_thai_duyet === 'BO_SUNG' ? { t: 'Bổ sung', tone: 'amber' as const }
  : c.ho_tro.trang_thai_duyet === 'CHO_DUYET' ? { t: 'Chờ duyệt', tone: 'amber' as const }
  : c.ho_tro.trang_thai_duyet === 'TU_CHOI' ? { t: 'Đã từ chối', tone: 'slate' as const }
  : { t: 'Đã duyệt', tone: 'green' as const }

/** S14 — Cổng quyết định giáo viên. Không mặc định duyệt; bắt buộc lí do; lưu trước/sau. */
export function S14CongQuyetDinh() {
  const { s, d } = useApp()
  const dl = s.du_lieu
  const [tim, setTim] = useState('')
  const [loc, setLoc] = useState<LocTT>('ALL')
  const [hd, setHd] = useState<'ALL' | 'HĐ1' | 'HĐ2' | 'HĐ3' | 'HĐ4' | 'HĐ5'>('HĐ2')

  const tatCa = useMemo(() => danhSachCa(dl), [dl])
  const theoHD = tatCa.filter((c) => hd === 'ALL' || dl.nhiem_vu.find((n) => n.id === c.ho_tro.nhiem_vu_id)?.hoat_dong_pha.startsWith(hd))
  const ds = theoHD.filter((c) => (loc === 'ALL' || c.ho_tro.trang_thai_duyet === loc) &&
    (!tim || c.hoc_sinh.ho_ten.toLowerCase().includes(tim.toLowerCase())))

  const dem = {
    cho: theoHD.filter((c) => c.ho_tro.trang_thai_duyet === 'CHO_DUYET').length,
    duyet: theoHD.filter((c) => c.co_quyet_dinh && c.ho_tro.trang_thai_duyet === 'DA_DUYET').length,
    bo: theoHD.filter((c) => c.ho_tro.trang_thai_duyet === 'BO_SUNG').length,
  }

  const chon = tatCa.find((c) => c.ho_tro.id === s.ca_dang_mo) ?? ds[0] ?? null
  const viTri = chon ? ds.findIndex((c) => c.ho_tro.id === chon.ho_tro.id) : -1
  const dichChuyen = (n: number) => { const x = ds[viTri + n]; if (x) d({ kieu: 'DOI_MAN_HINH', man_hinh: 'S14', ca: x.ho_tro.id }) }

  const Dem = ({ so, nhan, tone, Ic }: { so: number; nhan: string; tone: string; Ic: typeof Clock }) => (
    <div className={`flex items-center gap-3 rounded-2xl border px-4 py-2.5 ${tone}`}>
      <div><div className="text-[24px] font-extrabold leading-none tabular-nums">{so}</div><div className="mt-1 text-[11.5px] font-semibold">{nhan}</div></div>
      <Ic size={22} className="opacity-80" />
    </div>
  )

  return (
    <>
      <PageHead
        crumbs={['Cổng quyết định', 'S14']}
        title={<span className="flex items-center gap-3"><button onClick={() => d({ kieu: 'DOI_MAN_HINH', man_hinh: 'S10' })} aria-label="Quay lại bảng điều khiển" className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-700 hover:bg-brand-100"><ChevronLeft size={20} /></button><span><MaMan ma="S14" />Cổng quyết định giáo viên</span></span>}
        sub="Xem xét minh chứng, chẩn đoán và đưa ra quyết định hỗ trợ học sinh"
        right={<>
          <Dem so={dem.cho} nhan="Chờ duyệt" tone="border-amber-200 bg-amber-50 text-amber-700" Ic={Clock} />
          <Dem so={dem.duyet} nhan="Đã phê duyệt" tone="border-emerald-200 bg-emerald-50 text-emerald-700" Ic={CircleCheck} />
          <Dem so={dem.bo} nhan="Cần bổ sung" tone="border-orange-200 bg-orange-50 text-orange-700" Ic={TriangleAlert} />
          <div className="flex gap-2 rounded-2xl border border-line bg-white p-2.5">
            <label className="text-[11px] text-ink-soft">Chọn lớp<select className="field mt-0.5 !w-20 !py-1.5" defaultValue="1"><option value="1">{CAU_HINH.lop}</option></select></label>
            <label className="text-[11px] text-ink-soft">Chọn nhiệm vụ
              <select value={hd} onChange={(e) => setHd(e.target.value as typeof hd)} className="field mt-0.5 !w-52 !py-1.5">
                <option value="ALL">Tất cả nhiệm vụ</option>
                {['HĐ1 – Xác định vấn đề', 'HĐ2 – Nghiên cứu phương án', 'HĐ3 – Lựa chọn giải pháp', 'HĐ4 – Chế tạo và thử nghiệm', 'HĐ5 – Cải tiến và phản tư'].map((x) => <option key={x} value={x.slice(0, 3)}>{x}</option>)}
              </select></label>
          </div>
        </>}
      />

      <Card title={`Danh sách minh chứng chờ quyết định (${CAU_HINH.lop}${hd === 'ALL' ? '' : ' – ' + hd})`}
        action={<div className="flex flex-wrap items-center gap-2">
          <div className="relative"><Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-mute" />
            <input value={tim} onChange={(e) => setTim(e.target.value)} placeholder="Tìm học sinh…" aria-label="Tìm học sinh" className="field !w-40 !py-1.5 !pl-8" /></div>
          <select value={loc} onChange={(e) => setLoc(e.target.value as LocTT)} aria-label="Lọc trạng thái" className="field !w-40 !py-1.5">
            <option value="ALL">Tất cả trạng thái</option><option value="CHO_DUYET">Chờ duyệt</option><option value="BO_SUNG">Bổ sung</option><option value="DA_DUYET">Đã duyệt</option>
          </select>
          <span className="rounded-lg border border-line px-3 py-1.5 text-[12.5px] text-ink-soft">Mới nhất</span>
        </div>}>
        <div className="scroll-thin overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-[12.5px]">
            <thead><tr className="border-b border-line bg-slate-50/70 text-[11px] font-bold uppercase tracking-wide text-ink-mute">
              <th className="w-10 px-2 py-2">STT</th><th className="px-2 py-2">Học sinh</th><th className="px-2 py-2">Lớp</th><th className="px-2 py-2">Thời gian nộp</th>
              <th className="px-2 py-2">Sản phẩm minh chứng</th><th className="px-2 py-2">Trạng thái</th><th className="px-2 py-2">Đề xuất ban đầu</th><th className="px-2 py-2">Ưu tiên</th>
            </tr></thead>
            <tbody>
              {ds.map((c, i) => {
                const act = chon?.ho_tro.id === c.ho_tro.id
                const tt = TT_CA(c); const ut = UU_TIEN[c.ho_tro.uu_tien]
                const tep = c.minh_chung?.tep
                return (
                  <tr key={c.ho_tro.id} onClick={() => d({ kieu: 'DOI_MAN_HINH', man_hinh: 'S14', ca: c.ho_tro.id })}
                    className={`cursor-pointer border-b border-slate-100 last:border-0 ${act ? 'bg-brand-50 shadow-[inset_3px_0_0_#0e8c93]' : 'hover:bg-slate-50'}`}>
                    <td className="px-2 py-2.5 tabular-nums text-ink-mute">{i + 1}</td>
                    <td className="whitespace-nowrap px-2 py-2.5 font-bold text-ink">{c.hoc_sinh.ho_ten}<Ma>{c.hoc_sinh.id}</Ma></td>
                    <td className="px-2 py-2.5 text-ink-soft">{c.hoc_sinh.lop}</td>
                    <td className="whitespace-nowrap px-2 py-2.5 text-ink-soft">{ngayGio(c.minh_chung?.thoi_diem ?? c.ho_tro.thoi_diem).replace(' ', '  ')}</td>
                    <td className="max-w-[210px] truncate px-2 py-2.5 text-ink">{tep?.[0]?.ten ?? '—'}{tep && tep.length > 1 ? ` và ${tep.length - 1} file khác` : ''}</td>
                    <td className="px-2 py-2.5"><Chip tone={tt.tone} dot>{tt.t}</Chip></td>
                    <td className="whitespace-nowrap px-2 py-2.5 text-ink">{NHAN_LOAI[c.ho_tro.loai]}</td>
                    <td className="whitespace-nowrap px-2 py-2.5"><span className="inline-flex items-center gap-1.5 font-medium text-ink"><span className={`h-2 w-2 rounded-full ${ut.c}`} />{ut.t}</span></td>
                  </tr>
                )
              })}
              {ds.length === 0 && <tr><td colSpan={8} className="py-8 text-center text-ink-soft">Không có ca nào khớp bộ lọc. Thử đổi nhiệm vụ hoặc trạng thái.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      {chon && (
        <ChiTietCa key={chon.ho_tro.id} ca={chon} viTri={viTri} tong={ds.length} truoc={() => dichChuyen(-1)} sau={() => dichChuyen(1)} />
      )}

      <KhoiLuuY className="mt-4">
        Hệ thống <strong>không có nút "duyệt tất cả"</strong> và không tự mặc định duyệt. Mọi quyết định đều phải ghi lí do và lưu giá trị trước – sau. Từ chối cũng là một quyết định hợp lệ và được ghi nhận như nhau.
      </KhoiLuuY>
    </>
  )
}

function ChiTietCa({ ca, viTri, tong, truoc, sau }: { ca: CaHoTro; viTri: number; tong: number; truoc: () => void; sau: () => void }) {
  const { s, d } = useApp()
  const dl = s.du_lieu
  const { ho_tro: ht, hoc_sinh: hs } = ca
  const cd = ht.chan_doan_id ? dl.chan_doan.find((c) => c.id === ht.chan_doan_id) : null
  const ai = ht.goi_y_ai_id ? dl.goi_y_ai.find((a) => a.id === ht.goi_y_ai_id) : null
  const mau = cd ? layMau(cd.ma_mau) : null
  const nhom = dl.nhom.find((n) => n.id === hs.nhom_id)
  const qd = dl.quyet_dinh.filter((q) => q.ho_tro_id === ht.id).at(-1)
  const daXong = ht.trang_thai_duyet === 'DA_DUYET' || ht.trang_thai_duyet === 'TU_CHOI'
  const ref = useRef<HTMLTextAreaElement>(null)

  const [noiDung, setNoiDung] = useState(ai?.ban_sau_chinh ?? ht.noi_dung)
  const [lyDo, setLyDo] = useState('')
  const goc = ai ? ai.ban_nhap : ht.noi_dung
  const daSua = noiDung.trim() !== (ai?.ban_sau_chinh ?? ht.noi_dung).trim() && noiDung.trim() !== ''
  const duLyDo = lyDo.trim().length >= 5

  // phiên bản mới nhất của cùng bài (nếu học sinh đã nộp lại sau hỗ trợ)
  const moiNhat = ca.minh_chung ? dl.minh_chung.filter((m) => m.hoc_sinh_id === hs.id && m.nhiem_vu_id === ca.minh_chung!.nhiem_vu_id).sort((a, b) => b.phien_ban - a.phien_ban)[0] : null
  const truocMC = moiNhat && moiNhat.minh_chung_truoc_id ? chuoiPhienBan(dl, moiNhat).at(-2) ?? null : null
  const hienTai = moiNhat ?? ca.minh_chung

  const quyet = (q: 'DUYET' | 'SUA' | 'TU_CHOI' | 'YEU_CAU_THEM_MINH_CHUNG') => {
    if (!duLyDo) return
    if ((q === 'DUYET' || q === 'SUA') && ai && daSua) d({ kieu: 'SUA_GOI_Y', goi_y_id: ai.id, noi_dung: noiDung.trim() })
    d({ kieu: 'QUYET_DINH_HO_TRO', id: nid('QD'), ho_tro_id: ht.id, quyet_dinh: q === 'DUYET' && daSua ? 'SUA' : q, ly_do: lyDo.trim() })
  }

  const tepMC = ca.minh_chung?.tep ?? []
  const mota = ca.minh_chung ? ((ca.minh_chung.noi_dung as Record<string, string>).mo_ta_hs ?? '') : ''
  const nd = (m: MinhChung | null | undefined) => (m?.noi_dung ?? {}) as Record<string, unknown>
  const dongVD = (m: MinhChung | null | undefined) => (nd(m).dong_du_lieu_vien_dan as string[] | undefined) ?? []

  const SoSanh = ({ m, nhan, tone }: { m: MinhChung | null; nhan: string; tone: 'slate' | 'teal' }) => (
    <div className={`rounded-xl border p-3 ${tone === 'teal' ? 'border-brand-200 bg-brand-50/50' : 'border-line bg-white'}`}>
      <div className="flex items-center justify-between"><span className="text-[12.5px] font-bold text-ink">{nhan}</span>{m && <span className="text-[11px] text-ink-mute">{ngay(m.thoi_diem)}</span>}</div>
      {m ? (
        <dl className="mt-2 space-y-2 text-[12px]">
          <div><dt className="text-ink-mute">Phiên bản</dt><dd className="font-semibold text-ink">{m.loai_minh_chung} · phiên bản {m.phien_ban}{m.boi_canh_ho_tro === 'CO_HO_TRO' && <span className="ml-1.5 rounded bg-sky-100 px-1.5 py-0.5 text-[10.5px] font-semibold text-sky-800">sau hỗ trợ</span>}</dd></div>
          <div><dt className="text-ink-mute">Hàm ý thiết kế</dt><dd className="leading-snug text-ink">{(nd(m).ham_y as string) || <em className="text-amber-700">còn trống</em>}</dd></div>
          <div><dt className="text-ink-mute">Dòng dữ liệu viện dẫn</dt><dd>{dongVD(m).length ? <span className="flex flex-wrap gap-1">{dongVD(m).map((x) => <span key={x} className="rounded bg-brand-100 px-1.5 py-0.5 text-[11px] font-semibold text-brand-800">{x}</span>)}</span> : <span className="text-amber-700">chưa chọn dòng nào</span>}</dd></div>
        </dl>
      ) : <p className="mt-6 text-center text-[12px] leading-relaxed text-ink-mute">Chưa có minh chứng hậu kiểm.<br />Sau khi giáo viên duyệt hỗ trợ, học sinh chỉnh bài và nộp lại, phiên bản mới sẽ hiện ở đây.</p>}
    </div>
  )

  const cbLienQuan = cd?.chi_bao_lien_quan ?? []
  const phuongAn = mau?.mau_cau_hoi ?? []

  return (
    <section className="card mt-4 rise">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line px-4 py-3">
        <h2 className="text-[16px] font-extrabold text-ink">Chi tiết minh chứng – {hs.ho_ten} ({hs.lop})</h2>
        <Chip tone={TT_CA(ca).tone} dot>{daXong ? (ht.trang_thai_duyet === 'TU_CHOI' ? 'Đã từ chối' : 'Đã quyết định') : ht.trang_thai_duyet === 'BO_SUNG' ? 'Chờ bổ sung' : 'Chờ quyết định'}</Chip>
        <div className="ml-auto flex items-center gap-4 text-[12px] text-ink-soft">
          <span>Thời gian nộp: <strong className="text-ink">{ngayGio(ca.minh_chung?.thoi_diem ?? ht.thoi_diem)}</strong></span>
          <Ma>{ht.id}</Ma>
          <span className="flex items-center gap-1 rounded-lg border border-line px-1">
            <button onClick={truoc} disabled={viTri <= 0} aria-label="Ca trước" className="rounded p-1 hover:bg-slate-100 disabled:opacity-30"><ChevronLeft size={16} /></button>
            <span className="px-1 tabular-nums">{viTri + 1} / {tong}</span>
            <button onClick={sau} disabled={viTri >= tong - 1} aria-label="Ca sau" className="rounded p-1 hover:bg-slate-100 disabled:opacity-30"><ChevronRight size={16} /></button>
          </span>
        </div>
      </header>

      <div className="grid gap-4 p-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.25fr)_minmax(0,1fr)]">
        {/* Cột 1 */}
        <div className="min-w-0 space-y-3">
          <div className="rounded-xl border border-line p-3">
            <div className="flex items-center justify-between"><h3 className="text-[13px] font-bold text-ink">Thông tin học sinh</h3><LinkNho onClick={() => d({ kieu: 'DOI_MAN_HINH', man_hinh: 'S09', hoc_sinh: hs.id })}>Xem hồ sơ</LinkNho></div>
            <div className="mt-2.5 flex items-center gap-3"><Avatar ten={hs.ho_ten} size={44} tone="slate" /><div><div className="text-[14px] font-bold text-ink">{hs.ho_ten}</div><div className="text-[12px] text-ink-soft">Lớp {hs.lop}</div></div></div>
            <dl className="mt-3 space-y-1.5 text-[12px]">
              <div className="grid grid-cols-[110px_1fr] gap-2"><dt className="text-ink-soft">Mã học sinh</dt><dd className="font-medium text-ink">{hs.id}</dd></div>
              <div className="grid grid-cols-[110px_1fr] gap-2"><dt className="text-ink-soft">Nhóm học tập</dt><dd className="font-medium text-ink">{nhom?.ten} ({nhom?.thanh_vien.length} thành viên)</dd></div>
              <div className="grid grid-cols-[110px_1fr] gap-2"><dt className="text-ink-soft">Chỉ báo xem xét</dt><dd className="font-medium text-ink">{cbLienQuan.length ? cbLienQuan.map((c) => c).join(', ') : ht.nhiem_vu_id}<Ma>{ht.nhiem_vu_id}</Ma></dd></div>
              <div className="grid grid-cols-[110px_1fr] gap-2"><dt className="text-ink-soft">Bối cảnh hỗ trợ</dt><dd className="font-medium text-ink">{ca.minh_chung ? nhanDocLap(ca.minh_chung.boi_canh_ho_tro) : '—'}</dd></div>
            </dl>
          </div>

          <div className="rounded-xl border border-line p-3">
            <div className="mb-2 flex items-center justify-between"><h3 className="text-[13px] font-bold text-ink">Minh chứng học sinh nộp</h3>
              <button onClick={() => d({ kieu: 'TOAST', noi_dung: 'Bản demo không tải tệp thật — tệp minh chứng là hình minh hoạ.' })} className="flex items-center gap-1 text-[12px] font-semibold text-brand-700 hover:underline"><Download size={13} /> Tải tất cả</button></div>
            {tepMC.length ? <KhoTepNho tep={tepMC} /> : <p className="rounded-lg bg-amber-50 px-3 py-4 text-center text-[12px] text-amber-800">Chưa có tệp nào được nộp.</p>}
            {mota && <><div className="mt-3 text-[12.5px] font-bold text-ink">Mô tả của học sinh</div><p className="mt-1 rounded-lg bg-slate-50 px-3 py-2 text-[12px] italic leading-relaxed text-ink-soft">“{mota}”</p></>}
          </div>
        </div>

        {/* Cột 2 */}
        <div className="min-w-0 space-y-3">
          <div className="rounded-xl border border-line p-3">
            <h3 className="text-[13px] font-bold text-ink">So sánh trước và sau <span className="font-normal text-ink-soft">(hỗ trợ)</span></h3>
            <div className="mt-2.5 grid gap-2.5 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
              <SoSanh m={truocMC ?? hienTai} nhan={truocMC ? 'Trước hỗ trợ' : 'Hiện tại (trước hỗ trợ)'} tone="slate" />
              <div className="hidden items-center text-brand-600 sm:flex"><ChevronRight size={20} /></div>
              <SoSanh m={truocMC ? hienTai : null} nhan="Sau hỗ trợ" tone="teal" />
            </div>
            <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-[11.5px] leading-relaxed text-ink-soft">
              Bản cũ luôn được giữ. Nếu học sinh nộp lại sau hỗ trợ, kết quả mới được gắn <strong>CÓ HỖ TRỢ</strong> — chưa phải ĐỘC LẬP.
            </div>
          </div>

          <div className="rounded-xl border border-line p-3">
            <h3 className="text-[13px] font-bold text-ink">Chẩn đoán {cd && <Ma>{cd.ma_mau} · {cd.phien_ban_catalog}</Ma>}</h3>
            {cd && mau ? (
              <div className="mt-2 space-y-2.5 text-[12px]">
                <div><Nhan>Giả thuyết</Nhan><p className="font-semibold leading-snug text-ink">{mau.ten}</p><p className="mt-1 leading-relaxed text-ink-soft">{cd.gia_thuyet}</p></div>
                <div><Nhan>Căn cứ — điều kiện <span className="font-mono normal-case">{mau.dieu_kien}</span></Nhan>
                  <div className="space-y-1">{cbLienQuan.map((cb) => { const t = trangThaiMoiNhat(dl, cd.hoc_sinh_id, cb); return (
                    <div key={cb} className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5"><ChipMuc muc={t?.muc ?? null} /><span className="truncate text-ink">{CHI_BAO[cb]?.ten ?? cb}</span><Ma>{cb}</Ma></div>) })}</div></div>
                <div><Nhan>Điều kiện loại trừ đã kiểm</Nhan>
                  <ul className="space-y-1">{cd.dieu_kien_loai_tru.map((e, i) => <li key={i} className="flex gap-2 leading-snug"><span className={e.ket_qua === 'KHONG_AP_DUNG' ? 'text-emerald-600' : 'text-orange-600'}>{e.ket_qua === 'KHONG_AP_DUNG' ? '✓' : '!'}</span><span className="text-ink-soft">{e.mo_ta}</span></li>)}</ul></div>
                <div className="flex items-center gap-3"><Nhan>Độ tin cậy</Nhan><SegBar value={{ THAP: 1, TRUNG_BINH: 2, CAO: 3 }[cd.do_tin_cay]} total={3} /><span className="font-semibold text-ink">{nhanTinCay(cd.do_tin_cay)}</span></div>
                <p className="rounded-lg bg-brand-50 px-3 py-2 italic text-brand-800">Đây là giả thuyết sư phạm, không phải kết luận về học sinh. Giáo viên xác nhận hoặc bác bỏ — bác bỏ cũng được ghi nhận.</p>
              </div>
            ) : (
              <div className="mt-2"><KhoiChan tieuDe="Chưa chẩn đoán năng lực.">{ca.minh_chung?.ly_do_trang_thai ?? 'Minh chứng chưa đủ căn cứ.'} Theo quy tắc, dữ liệu chưa hợp lệ thì hệ thống chỉ nhắc bổ sung — không suy năng lực và không gán mức.</KhoiChan></div>
            )}
          </div>
        </div>

        {/* Cột 3 */}
        <div className="min-w-0 space-y-3">
          <div className="rounded-xl border border-line p-3">
            <div className="flex items-center justify-between"><h3 className="text-[13px] font-bold text-ink">Đề xuất hỗ trợ <span className="font-normal text-ink-soft">(gợi ý từ mẫu)</span></h3></div>
            {ai && <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-relaxed text-ink-soft">Sinh từ <strong>danh sách câu hỏi cố định</strong> của mẫu {cd?.ma_mau}, không phải mô hình sinh tự do. Bản gốc: “{goc}”</p>}
            <ul className="mt-2.5 space-y-1.5">
              {phuongAn.map((q, i) => {
                const dangDung = noiDung.trim() === q.trim()
                return (
                  <li key={q}><button disabled={daXong} onClick={() => setNoiDung(q)}
                    className={`flex w-full items-start gap-2.5 rounded-lg border px-2.5 py-2 text-left text-[12px] leading-snug transition ${dangDung ? 'border-brand-400 bg-brand-50' : 'border-line hover:border-brand-200 hover:bg-slate-50'} disabled:cursor-default`}>
                    <span className="mt-0.5">{dangDung ? <CircleDot size={15} className="text-brand-600" /> : <span className="block h-[15px] w-[15px] rounded-full border border-slate-300" />}</span>
                    <span className="flex-1 text-ink">{q}</span>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${i === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{i === 0 ? 'Phù hợp cao' : 'Phù hợp TB'}</span>
                  </button></li>
                )
              })}
              {phuongAn.length === 0 && <li className="rounded-lg bg-slate-50 px-3 py-3 text-[12px] text-ink-soft">Nhắc bổ sung dữ liệu — không cần chẩn đoán.</li>}
            </ul>
            <Nhan>Bản gửi cho học sinh (giáo viên có thể chỉnh)</Nhan>
            <textarea ref={ref} value={noiDung} onChange={(e) => setNoiDung(e.target.value)} disabled={daXong} rows={3} className="field mt-1 leading-relaxed disabled:bg-slate-50" />
            {daSua && <p className="mt-1 text-[11px] text-sky-700">Đã chỉnh so với bản nháp — hệ thống lưu cả hai bản.</p>}
          </div>
        </div>
      </div>

      {/* Quyết định */}
      <div className="border-t border-line px-4 pb-4 pt-3.5">
        <h3 className="text-[14.5px] font-extrabold text-ink">Quyết định của giáo viên</h3>
        {daXong && qd ? (
          <div className="mt-2 grid gap-3 rounded-xl bg-emerald-50/60 p-3.5 sm:grid-cols-2">
            <div><Nhan>Đã quyết định</Nhan><p className="text-[13px] font-bold text-ink">{{ DUYET: 'Duyệt', SUA: 'Chỉnh sửa và gửi', TU_CHOI: 'Từ chối', YEU_CAU_THEM_MINH_CHUNG: 'Yêu cầu thêm minh chứng' }[qd.quyet_dinh]} — {qd.nguoi_thuc_hien_id} lúc {gio(qd.thoi_diem)}</p>
              <p className="mt-1.5 rounded-lg bg-white px-3 py-2 text-[12px] italic text-ink-soft">“{qd.ly_do}”</p></div>
            <div><Nhan>Trước → sau</Nhan><p className="text-[12px] text-ink-soft"><span className="line-through">{qd.gia_tri_truoc ?? '—'}</span></p><p className="text-[12px] font-medium text-ink">{qd.gia_tri_sau ?? '—'}</p>
              {ht.ket_qua && <><Nhan>Kết quả hậu kiểm</Nhan><p className="text-[12px] text-ink">{ht.ket_qua}</p></>}</div>
          </div>
        ) : (
          <div className="mt-2.5 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <div>
              <Nhan>Hành động</Nhan>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                <Nut bien="duyet" disabled={!duLyDo} onClick={() => quyet('DUYET')} className="!flex-col !gap-1 !py-3"><SquareCheckBig size={20} />Duyệt</Nut>
                <Nut bien="xanh" onClick={() => { ref.current?.focus(); ref.current?.select() }} disabled={ht.trang_thai_duyet === 'BO_SUNG' && !ai} className="!flex-col !gap-1 !py-3"><Pencil size={20} />Chỉnh sửa</Nut>
                <Nut bien="vang" disabled={!duLyDo} onClick={() => quyet('YEU_CAU_THEM_MINH_CHUNG')} className="!flex-col !gap-1 !py-3"><MessageSquareWarning size={20} />Yêu cầu thêm</Nut>
                <Nut bien="nguy" disabled={!duLyDo} onClick={() => quyet('TU_CHOI')} className="!flex-col !gap-1 !py-3"><X size={20} />Từ chối</Nut>
              </div>
              <p className="mt-2 text-[11.5px] text-ink-soft">{duLyDo ? (daSua ? 'Bạn đã chỉnh bản nháp — "Duyệt" sẽ gửi bản đã chỉnh.' : '"Duyệt" gửi nguyên bản nháp cho học sinh.') : 'Các nút quyết định mở khoá khi đã ghi lí do. Hệ thống không mặc định duyệt.'}</p>
            </div>
            <div>
              <Nhan>Lí do quyết định (bắt buộc)</Nhan>
              <textarea value={lyDo} onChange={(e) => setLyDo(e.target.value.slice(0, 500))} rows={3} placeholder="Vì sao duyệt, chỉnh, yêu cầu thêm hoặc từ chối? Lí do được lưu cùng giá trị trước – sau."
                className="field leading-relaxed" />
              <div className="mt-1 text-right text-[11px] tabular-nums text-ink-mute">{lyDo.length}/500</div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

