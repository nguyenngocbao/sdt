import { useCallback, useEffect, useState } from 'react'
import {
  chenhLech, dieuKienV1, docNhap, e4Trong, e5Trong, ghiNhap, loiE4, loiE5, luaChonNguyenNhan, nopE4, nopE5, tomTat, tuTomTat, xoaNhap,
  THAY_DOI_E5, type BanLuu, type LoaiPhieu, type NhapE4, type NhapE5, type PhieuDaNop, type TomTatLanThu,
} from '../../data/phieu'
import { BangLanThu, KhoiLoi, Nhan, NutChon, OChu, SoNhap } from './Truong'
import { BangChenhLech } from './ChenhLech'

/** Nháp lưu localStorage sau mỗi thay đổi; mở lại vẫn còn. */
function useNhap<T>(nguoi: string, loai: LoaiPhieu, khoiTao: () => T, cu: PhieuDaNop | null, tuPhieu: (p: PhieuDaNop) => T) {
  const [ban, setBan] = useState<BanLuu<T>>(() => {
    const nhap = docNhap<T>(nguoi, loai)
    if (nhap) return nhap
    return cu ? { du_lieu: tuPhieu(cu), thay_the_cho: cu.id } : { du_lieu: khoiTao(), thay_the_cho: null }
  })
  const doi = useCallback((p: Partial<T>) => setBan((b) => ({ ...b, du_lieu: { ...b.du_lieu, ...p } })), [])
  useEffect(() => { ghiNhap(nguoi, loai, ban) }, [nguoi, loai, ban])
  return { ban, doi }
}

type Props = { nguoi: string; onXong: () => void; onDong: () => void }

export function FormE4({ nguoi, cu, onXong, onDong }: Props & { cu: PhieuDaNop | null }) {
  const { ban, doi } = useNhap<NhapE4>(nguoi, 'E4', e4Trong, cu, (p) => ({
    lan_thu: tuTomTat(p.noi_dung.tom_tat_lan_thu), thay_doi_so_voi_thiet_ke: String(p.noi_dung.thay_doi_so_voi_thiet_ke ?? ''),
    nguyen_nhan_han_che: String(p.noi_dung.nguyen_nhan_han_che ?? ''), minh_chung_vien_dan: (p.noi_dung.minh_chung_vien_dan as number | null) ?? null,
  }))
  const d = ban.du_lieu
  const [loi, setLoi] = useState<string[]>([])
  const [dangNop, setDangNop] = useState(false)
  const nop = async () => {
    const l = loiE4(d); setLoi(l)
    if (l.length) return
    setDangNop(true)
    try { await nopE4(d, ban.thay_the_cho); xoaNhap(nguoi, 'E4'); onXong() }
    catch (e) { setLoi([(e as Error).message]); setDangNop(false) }
  }
  return (
    <div>
      <p className="text-[13px] text-ink-soft">Phiếu E4 · phiên bản v1 · tự lưu nháp trên máy này{ban.thay_the_cho && ' · đang nộp lại, bản cũ vẫn được giữ'}</p>
      <Nhan>Các lần thử tải</Nhan>
      <BangLanThu ds={d.lan_thu} onDoi={(lan_thu) => doi({ lan_thu, minh_chung_vien_dan: lan_thu.some((l) => l.lan === d.minh_chung_vien_dan) ? d.minh_chung_vien_dan : null })} />
      <Nhan>Em đã thay đổi gì so với thiết kế?</Nhan>
      <OChu ten="Thay đổi so với thiết kế" gia_tri={d.thay_doi_so_voi_thiet_ke} onDoi={(v) => doi({ thay_doi_so_voi_thiet_ke: v })} />
      <Nhan>Nguyên nhân hạn chế của cầu</Nhan>
      <OChu ten="Nguyên nhân hạn chế" gia_tri={d.nguyen_nhan_han_che} onDoi={(v) => doi({ nguyen_nhan_han_che: v })} />
      <Nhan phu="câu giải thích của em dựa vào lần thử nào?">Minh chứng viện dẫn</Nhan>
      <NutChon ds={d.lan_thu.map((l) => `Lần ${l.lan}`)} chon={d.minh_chung_vien_dan ? `Lần ${d.minh_chung_vien_dan}` : ''} onChon={(v) => doi({ minh_chung_vien_dan: Number(v.replace('Lần ', '')) })} />
      <KhoiLoi loi={loi} />
      <Nut onNop={nop} onDong={onDong} dangNop={dangNop} />
    </div>
  )
}

export function FormE5({ nguoi, e4, cu, onXong, onDong }: Props & { e4: PhieuDaNop; cu: PhieuDaNop | null }) {
  const { ban, doi } = useNhap<NhapE5>(nguoi, 'E5', e5Trong, cu, (p) => ({
    lan_thu: tuTomTat(p.noi_dung.tom_tat_lan_thu), thay_doi: (p.noi_dung.thay_doi as string[]) ?? [], thay_doi_chu: String(p.noi_dung.thay_doi_chu ?? ''),
    nham_vao_nguyen_nhan: String(p.noi_dung.nham_vao_nguyen_nhan ?? ''), du_doan_tai_moi_g: String(p.noi_dung.du_doan_tai_moi_g ?? ''), giai_thich: String(p.noi_dung.giai_thich ?? ''),
  }))
  const d = ban.du_lieu
  const v1 = (e4.noi_dung.tom_tat_lan_thu as TomTatLanThu[]) ?? []
  // Danh sách lấy từ CHÍNH nguyên nhân em viết ở E4 của em (phiếu E4 mới nhất của chính em).
  const nguyenNhan = luaChonNguyenNhan(String(e4.noi_dung.nguyen_nhan_han_che ?? ''))
  const [loi, setLoi] = useState<string[]>([])
  const [dangNop, setDangNop] = useState(false)
  const nop = async () => {
    const l = loiE5(d); setLoi(l)
    if (l.length) return
    setDangNop(true)
    try { await nopE5(d, e4, v1, ban.thay_the_cho); xoaNhap(nguoi, 'E5'); onXong() }
    catch (e) { setLoi([(e as Error).message]); setDangNop(false) }
  }
  const dk = dieuKienV1(v1)
  const doiThayDoi = (g: string) => doi({ thay_doi: d.thay_doi.includes(g) ? d.thay_doi.filter((x) => x !== g) : [...d.thay_doi, g] })
  return (
    <div>
      <p className="text-[13px] text-ink-soft">Phiếu E5 · phiên bản v2 · tự lưu nháp trên máy này{ban.thay_the_cho && ' · đang nộp lại, bản cũ vẫn được giữ'}</p>
      <Nhan>Em đã thay đổi gì? <span className="font-normal text-ink-soft">(chọn nhiều)</span></Nhan>
      <NutChon nhieu ds={THAY_DOI_E5} chon={d.thay_doi} onChon={doiThayDoi} />
      <div className="mt-2"><OChu ten="Thay đổi khác" gia_tri={d.thay_doi_chu} onDoi={(v) => doi({ thay_doi_chu: v })} dong={2} /></div>
      <Nhan phu="chọn điều em đã chẩn đoán ở E4">Em nhắm vào nguyên nhân nào?</Nhan>
      {nguyenNhan.length
        ? <NutChon ds={nguyenNhan} chon={d.nham_vao_nguyen_nhan} onChon={(v) => doi({ nham_vao_nguyen_nhan: v })} />
        : <p className="text-[13px] text-amber-800">Em chưa viết nguyên nhân ở phiếu E4.</p>}
      <Nhan>Dự đoán tải mới</Nhan>
      <SoNhap ten="Dự đoán tải mới" gia_tri={d.du_doan_tai_moi_g} onDoi={(v) => doi({ du_doan_tai_moi_g: v })} don_vi="g" />
      <Nhan>Các lần thử v2</Nhan>
      {dk && <p className="mb-2 rounded-xl bg-sky-50 p-3 text-[13.5px] text-sky-900 ring-1 ring-sky-200">Điều kiện thử v1 của em — {dk}. Thử v2 cùng điều kiện để so sánh được.</p>}
      <BangLanThu ds={d.lan_thu} onDoi={(lan_thu) => doi({ lan_thu })} />
      <BangChenhLech cl={chenhLech(v1, tomTat(d.lan_thu))} duDoan={d.du_doan_tai_moi_g} />
      <Nhan>Giải thích</Nhan>
      <OChu ten="Giải thích" gia_tri={d.giai_thich} onDoi={(v) => doi({ giai_thich: v })} />
      <KhoiLoi loi={loi} />
      <Nut onNop={nop} onDong={onDong} dangNop={dangNop} />
    </div>
  )
}

function Nut({ onNop, onDong, dangNop }: { onNop: () => void; onDong: () => void; dangNop: boolean }) {
  return (
    <div className="mt-5 flex gap-2">
      <button type="button" disabled={dangNop} onClick={onNop} className="min-h-12 flex-1 rounded-xl bg-brand-600 px-4 text-[15px] font-bold text-white disabled:opacity-60">{dangNop ? 'Đang nộp…' : 'Nộp phiếu'}</button>
      <button type="button" onClick={onDong} className="min-h-12 rounded-xl bg-white px-4 text-[14px] font-semibold text-ink ring-1 ring-slate-300">Để sau</button>
    </div>
  )
}
