import type { TomTatLanThu } from '../../data/phieu'

export function BangSoLieu({ ds }: { ds: TomTatLanThu[] }) {
  if (!ds.length) return <p className="text-[13px] text-ink-soft">Chưa có số liệu.</p>
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] text-left text-[13px]">
        <thead className="text-ink-soft"><tr><th className="py-1 pr-3">Lần</th><th className="pr-3">Tải (g)</th><th className="pr-3">Giữ (giây)</th><th className="pr-3">Đặt tải</th><th className="pr-3">Biến dạng</th><th>Dạng hỏng</th></tr></thead>
        <tbody>
          {ds.map((l) => (
            <tr key={l.lan} className="border-t border-slate-200">
              <td className="py-1.5 pr-3 font-bold">{l.lan}</td><td className="pr-3 font-bold">{l.tai_g ?? '—'}</td><td className="pr-3">{l.giu_giay ?? '—'}</td>
              <td className="pr-3">{l.vi_tri ?? '—'}</td><td className="pr-3">{l.bien_dang ?? '—'}</td><td>{l.dang_hong ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
