import type { ChenhLech } from '../../data/phieu'

const dau = (n: number | null, hau = '') => (n === null ? '—' : `${n > 0 ? '+' : ''}${n}${hau}`)

/** Hệ thống tự tính chênh lệch v1 → v2. */
export function BangChenhLech({ cl, duDoan }: { cl: ChenhLech; duDoan?: string }) {
  if (cl.v2.tai_max === null) return null
  const dd = duDoan && duDoan !== '' ? Number(duDoan) : null
  return (
    <div className="mt-4 rounded-2xl bg-mint p-3 ring-1 ring-emerald-200" aria-live="polite">
      <div className="text-[13.5px] font-extrabold text-ink">Chênh lệch v1 → v2 (tự tính)</div>
      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[14px]">
        <dt className="text-ink-soft">Tải lớn nhất</dt><dd className="font-bold">{cl.v1.tai_max ?? '—'} → {cl.v2.tai_max} g ({dau(cl.max_g, ' g')}{cl.max_pct !== null && `, ${dau(cl.max_pct, '%')}`})</dd>
        <dt className="text-ink-soft">Tải trung bình</dt><dd className="font-bold">{cl.v1.tai_tb ?? '—'} → {cl.v2.tai_tb} g ({dau(cl.tb_g, ' g')}{cl.tb_pct !== null && `, ${dau(cl.tb_pct, '%')}`})</dd>
        {dd !== null && <><dt className="text-ink-soft">So với dự đoán</dt><dd className="font-bold">dự đoán {dd} g, thực tế {cl.v2.tai_max} g ({dau(cl.v2.tai_max - dd, ' g')})</dd></>}
      </dl>
    </div>
  )
}
