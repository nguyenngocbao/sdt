import { useEffect } from 'react'
import { Avatar } from '../ui/Ui'
import type { HanhViSan } from './hanhvi'

/**
 * Bảng chọn nhanh dạng tấm trượt từ dưới, không rời trang. Chạm 2 và 3 của quy trình 3 chạm:
 * chọn hành vi → chọn Độc lập / Có hỗ trợ → tự đóng. Không cuộn, không ô chữ, không nút Lưu.
 */
export function BangGhiNhanh({ ten, hanhVi, daChon, onChonHanhVi, onChonMuc, onDong }: {
  ten: string; hanhVi: HanhViSan[]; daChon: HanhViSan | null
  onChonHanhVi: (h: HanhViSan) => void; onChonMuc: (m: 'DOC_LAP' | 'CO_HO_TRO') => void; onDong: () => void
}) {
  useEffect(() => {
    const f = (e: KeyboardEvent) => { if (e.key === 'Escape') onDong() }
    window.addEventListener('keydown', f)
    return () => window.removeEventListener('keydown', f)
  }, [onDong])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40" onClick={onDong} role="dialog" aria-modal="true" aria-label={`Ghi quan sát ${ten}`}>
      <div className="w-full max-w-xl rounded-t-2xl bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-2 flex items-center gap-2.5 px-1">
          <Avatar ten={ten} size={36} />
          <p className="min-w-0 flex-1 truncate text-[16px] font-bold text-ink">{ten}</p>
        </div>
        {!daChon ? (
          <ul className="space-y-2">
            {hanhVi.map((h) => (
              <li key={h.hanh_vi}>
                <button onClick={() => onChonHanhVi(h)} className="flex min-h-14 w-full items-center rounded-xl bg-slate-50 px-4 py-2 text-left text-[16px] font-semibold leading-snug text-ink ring-1 ring-slate-200 active:bg-brand-50">
                  {h.hanh_vi}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <>
            <p className="mb-2 rounded-xl bg-brand-50 px-4 py-2.5 text-[15px] font-semibold text-brand-800">{daChon.hanh_vi}</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => onChonMuc('DOC_LAP')} className="min-h-20 rounded-xl bg-violet-600 text-[18px] font-bold text-white active:bg-violet-700">Độc lập</button>
              <button onClick={() => onChonMuc('CO_HO_TRO')} className="min-h-20 rounded-xl bg-sky-600 text-[18px] font-bold text-white active:bg-sky-700">Có hỗ trợ</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
