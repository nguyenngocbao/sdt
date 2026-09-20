import type { ReactNode } from 'react'
import { ChevronRight, House } from 'lucide-react'

/** Đường dẫn + tiêu đề trang, theo bố cục của thiết kế. */
export function PageHead({ crumbs, title, sub, right }: { crumbs: ReactNode[]; title: ReactNode; sub?: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="min-w-0">
        <nav aria-label="Đường dẫn" className="flex flex-wrap items-center gap-1 text-[12px] text-ink-soft">
          <House size={13} className="text-ink-mute" />
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1">
              <ChevronRight size={12} className="text-ink-mute" />
              <span className={i === crumbs.length - 1 ? 'font-semibold text-ink' : ''}>{c}</span>
            </span>
          ))}
        </nav>
        <h1 className="mt-1.5 text-[26px] font-extrabold leading-tight tracking-tight text-ink">{title}</h1>
        {sub && <p className="mt-0.5 text-[13.5px] text-ink-soft">{sub}</p>}
      </div>
      {right && <div className="flex flex-wrap items-center gap-2.5">{right}</div>}
    </div>
  )
}
