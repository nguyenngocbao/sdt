import type { ReactNode } from 'react'
import type { MinhChung } from '../types'
import { AnhCau, KetCauGiay, type KieuKetCau } from './art/Art'

type Ban = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

const Muc = ({ t, children, canh }: { t: string; children: ReactNode; canh?: boolean }) => (
  <div>
    <div className="text-[11px] font-bold uppercase tracking-wide text-ink-mute">{t}</div>
    <div className={`mt-0.5 text-[12.5px] leading-relaxed ${canh ? 'text-amber-700' : 'text-ink'}`}>{children}</div>
  </div>
)

const Vien = ({ ds, khaoSat }: { ds?: string[]; khaoSat?: Ban[] }) => {
  if (!ds) return null
  if (ds.length === 0) return <span className="text-amber-700">Chưa chọn dòng dữ liệu nào làm căn cứ.</span>
  return (
    <span className="flex flex-wrap gap-1.5">
      {ds.map((id) => {
        const r = khaoSat?.find((x) => x.id === id)
        return <span key={id} className="rounded-md bg-brand-100 px-2 py-0.5 text-[11.5px] font-semibold text-brand-800">{r ? `${r.cau_truc} · ${r.tai_g} g / ${r.bien_dang_mm} mm` : id}</span>
      })}
    </span>
  )
}

/** Hiển thị nội dung một phiếu minh chứng (E1–E5), theo đúng cấu trúc trường của từng phiếu. */
export function NoiDungPhieu({ mc, khaoSat }: { mc: MinhChung; khaoSat?: Ban[] }) {
  const n = mc.noi_dung as Ban
  const rong = Object.keys(n).length === 0

  if (rong) return <p className="rounded-lg bg-amber-50 px-3 py-3 text-[12.5px] text-amber-800">Phiếu chưa có nội dung — các trường bắt buộc còn trống.</p>

  if (Array.isArray(n.bang_khao_sat)) {
    return (
      <div>
        <table className="w-full text-left text-[12px]">
          <thead><tr className="border-b border-line text-[10.5px] font-bold uppercase tracking-wide text-ink-mute"><th className="py-1.5 pr-2">Cấu trúc</th><th className="py-1.5 pr-2 text-right">Tải (g)</th><th className="py-1.5 pr-2 text-right">Biến dạng (mm)</th><th className="py-1.5">Nhận xét</th></tr></thead>
          <tbody>{n.bang_khao_sat.map((r: Ban) => (
            <tr key={r.id} className="border-b border-slate-100 last:border-0">
              <td className="py-1.5 pr-2"><span className="flex items-center gap-2"><KetCauGiay kieu={r.kieu as KieuKetCau} className="h-6 w-11 shrink-0" />{r.cau_truc}</span></td>
              <td className="py-1.5 pr-2 text-right tabular-nums">{r.tai_g}</td><td className="py-1.5 pr-2 text-right tabular-nums">{r.bien_dang_mm}</td><td className="py-1.5 text-ink-soft">{r.nhan_xet}</td>
            </tr>))}</tbody>
        </table>
        {n.dieu_kien_thu && <p className="mt-2 text-[11px] text-ink-mute">Điều kiện thử: {n.dieu_kien_thu}</p>}
      </div>
    )
  }

  if (Array.isArray(n.ma_tran)) {
    return (
      <div>
        <table className="w-full text-left text-[12px]">
          <thead><tr className="border-b border-line text-[10.5px] font-bold uppercase tracking-wide text-ink-mute"><th className="py-1.5">Tiêu chí</th><th className="py-1.5">PA1</th><th className="py-1.5">PA2</th></tr></thead>
          <tbody>{n.ma_tran.map((r: Ban, i: number) => <tr key={i} className="border-b border-slate-100 last:border-0"><td className="py-1.5">{r.tieu_chi}</td><td className="py-1.5 text-ink-soft">{r.PA1}</td><td className="py-1.5 text-ink-soft">{r.PA2}</td></tr>)}</tbody>
        </table>
        <p className="mt-2 text-[12px] text-ink">Nhóm chọn: <strong>{n.phuong_an_chon}</strong></p>
        <p className="text-[11.5px] text-ink-soft">Đánh đổi: {n.danh_doi}</p>
      </div>
    )
  }

  if (Array.isArray(n.nhat_ky)) {
    return (
      <div>
        <table className="w-full text-left text-[12px]">
          <thead><tr className="border-b border-line text-[10.5px] font-bold uppercase tracking-wide text-ink-mute"><th className="py-1.5">Lần</th><th className="py-1.5 text-right">Tải (g)</th><th className="py-1.5 pl-3">Vị trí biến dạng</th><th className="py-1.5">Dạng hư hỏng</th><th className="py-1.5">Ghi chú</th></tr></thead>
          <tbody>{n.nhat_ky.map((r: Ban) => (
            <tr key={r.lan} className={`border-b border-slate-100 last:border-0 ${r.loi ? 'bg-rose-50' : ''}`}>
              <td className="py-1.5 tabular-nums">{r.lan}</td><td className="py-1.5 text-right tabular-nums">{r.tai_g}</td><td className="py-1.5 pl-3">{r.vi_tri}</td><td className="py-1.5">{r.dang}</td><td className="py-1.5 text-ink-soft">{r.ghi_chu}</td>
            </tr>))}</tbody>
        </table>
        <p className="mt-2 text-[11px] text-ink-mute">{n.dieu_kien_thu}. Tải tối đa ổn định: <strong className="text-ink">{n.tai_toi_da_on_dinh_g} g</strong>.</p>
      </div>
    )
  }

  if (Array.isArray(n.yeu_cau_do_kiem)) {
    return (
      <div className="space-y-2">
        {n.yeu_cau_do_kiem.map((r: Ban, i: number) => (
          <div key={i} className="rounded-lg bg-slate-50 p-2.5 text-[12px]"><div className="font-semibold text-ink">{r.yeu_cau}</div><div className="text-ink-soft">→ {r.dai_luong} · {r.cach_do}</div></div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {n.giai_thich !== undefined && <Muc t="Giải thích quan hệ hình dạng – độ cứng – tải">{n.giai_thich}</Muc>}
      {'ham_y' in n && (
        <div className="rounded-lg border border-brand-200 bg-brand-50/50 p-2.5">
          <Muc t="Hàm ý thiết kế" canh={!n.ham_y}>{n.ham_y || 'Còn trống'}</Muc>
          <div className="mt-2"><Muc t="Dòng dữ liệu được viện dẫn"><Vien ds={n.dong_du_lieu_vien_dan} khaoSat={khaoSat} /></Muc></div>
        </div>
      )}
      {n.du_doan !== undefined && <Muc t="Dự đoán ưu/nhược">{n.du_doan}</Muc>}
      {Array.isArray(n.phuong_an) && n.phuong_an.length > 0 && (
        <Muc t={`Phương án (${n.phuong_an.length})`}>
          <div className="grid gap-2 sm:grid-cols-2">
            {n.phuong_an.map((p: Ban, i: number) => (
              <div key={i} className="overflow-hidden rounded-lg border border-line">
                <div className="h-16"><AnhCau kieu={p.kieu} tone="light" className="h-full w-full" /></div>
                <div className="p-2"><div className="text-[12px] font-bold text-ink">{p.ten}</div>
                  {p.uu && <div className="mt-0.5 text-[11px] text-emerald-700">Ưu: {(p.uu as string[]).join('; ')}</div>}
                  {p.han_che && <div className="text-[11px] text-rose-700">Hạn chế: {(p.han_che as string[]).join('; ')}</div>}</div>
              </div>
            ))}
          </div>
        </Muc>
      )}
      {n.ly_do_ca_nhan !== undefined && <Muc t="Lí do lựa chọn của cá nhân" canh={!n.ly_do_ca_nhan}>{n.ly_do_ca_nhan || 'Phần lí do cá nhân còn trống'}</Muc>}
      {n.phan_tich !== undefined && <Muc t="Phân tích nguyên nhân hạn chế chịu tải">{n.phan_tich}</Muc>}
      {n.gia_thuyet !== undefined && <Muc t="Giả thuyết cải tiến">{n.gia_thuyet}</Muc>}
    </div>
  )
}
