import { useCallback, useEffect, useRef, useState } from 'react'
import { PageHead } from '../components/layout/PageHead'
import { Avatar, MaMan, Trong } from '../components/ui/Ui'
import { request } from '../lib/auth'
import { BangGhiNhanh } from '../components/quansat/BangGhiNhanh'
import { HANH_VI_THEO_CHANG, TEN_CHANG, type HanhViSan } from '../components/quansat/hanhvi'
import { docHangDoi, guiHangDoi, themVaoHangDoi } from '../components/quansat/hangDoi'

interface HocSinhLop { ma: string; ho_ten: string; da_nop: boolean; co_goi_y: boolean }

/** "Trần Minh Đức" → "Đức T." — đủ phân biệt trong ô nhỏ. */
function tenVietTat(ten: string) {
  const k = ten.split(' ').filter(Boolean)
  return k.length < 2 ? ten : `${k[k.length - 1]} ${k[0][0]}.`
}

const KHOA_CHANG = 'sdt.quan_sat.chang'
const changBanDau = () => { const n = Number(localStorage.getItem(KHOA_CHANG)); return Number.isInteger(n) && n >= 0 && n <= 6 ? n : 4 }

export function ManC_LopToi() {
  const [chang, setChang] = useState(changBanDau)
  const [ds, setDs] = useState<HocSinhLop[] | null>(null)
  const [loi, setLoi] = useState('')
  const [dangMo, setDangMo] = useState<HocSinhLop | null>(null)
  const [daChon, setDaChon] = useState<HanhViSan | null>(null)
  const [choGui, setChoGui] = useState(() => docHangDoi().length)
  const [vuaGhi, setVuaGhi] = useState<Record<string, number>>({})
  const huy = useRef(0)

  useEffect(() => {
    const lan = ++huy.current
    request(`/api/gv/lop?chang=${chang}`)
      .then((d) => { if (lan === huy.current) { setDs(d.hoc_sinh); setLoi('') } })
      .catch((e: Error) => { if (lan === huy.current) { setLoi(e.message); setDs((cu) => cu ?? []) } })
  }, [chang])

  const xaHangDoi = useCallback(() => { guiHangDoi().then(setChoGui) }, [])
  useEffect(() => {
    xaHangDoi()
    window.addEventListener('online', xaHangDoi)
    const t = window.setInterval(xaHangDoi, 15000)
    return () => { window.removeEventListener('online', xaHangDoi); window.clearInterval(t) }
  }, [xaHangDoi])

  const dong = useCallback(() => { setDangMo(null); setDaChon(null) }, [])
  const chonMuc = (hs: HocSinhLop, muc: 'DOC_LAP' | 'CO_HO_TRO') => {
    if (!daChon) return
    // Lạc quan: đóng bảng và hiện dấu ngay, gửi ở nền.
    themVaoHangDoi({ ma_hs: hs.ma, chi_bao: daChon.chi_bao, hanh_vi: daChon.hanh_vi, co_ho_tro: muc, thoi_diem: new Date().toISOString() })
    setChoGui(docHangDoi().length)
    setVuaGhi((v) => ({ ...v, [hs.ma]: (v[hs.ma] ?? 0) + 1 }))
    dong()
    xaHangDoi()
  }
  const doiChang = (n: number) => { setChang(n); localStorage.setItem(KHOA_CHANG, String(n)); setDs(null) }

  return (
    <>
      <PageHead crumbs={['Lớp học', 'Lớp tôi']} title={<><MaMan ma="C" />Lớp tôi</>} sub="Thiết kế cầu giấy chịu lực"
        right={choGui > 0 ? <span role="status" className="rounded-full bg-amber-50 px-3 py-1.5 text-[12.5px] font-semibold text-amber-800 ring-1 ring-amber-200">Còn {choGui} chưa gửi</span> : undefined} />
      <div className="sticky top-0 z-10 -mx-1 mb-3 bg-white/90 px-1 py-2 backdrop-blur">
        <label className="flex items-center gap-2 text-[13px] font-semibold text-ink-soft">
          Chặng
          <select value={chang} onChange={(e) => doiChang(Number(e.target.value))} className="min-h-11 flex-1 rounded-xl bg-white px-3 text-[15px] font-semibold text-ink ring-1 ring-slate-300">
            {Object.entries(TEN_CHANG).map(([n, t]) => <option key={n} value={n}>{t}</option>)}
          </select>
        </label>
      </div>
      {loi && <p role="alert" className="mb-3 text-sm text-amber-800">{loi}</p>}
      {ds?.length === 0 && !loi && <Trong>Lớp chưa có học sinh.</Trong>}
      <ul className="grid grid-cols-4 gap-1.5 sm:grid-cols-5 lg:grid-cols-8" aria-label="Học sinh trong lớp">
        {(ds ?? []).map((h) => (
          <li key={h.ma}>
            <button onClick={() => { setDangMo(h); setDaChon(null) }} aria-label={`${h.ho_ten}, ${h.da_nop ? 'đã nộp' : 'chưa nộp'}${h.co_goi_y ? ', có gợi ý chờ duyệt' : ''}`}
              className={`relative flex min-h-[76px] w-full min-w-11 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 ring-1 active:scale-95 ${h.da_nop ? 'bg-emerald-50 ring-emerald-300' : 'bg-slate-100 ring-slate-300'}`}>
              <Avatar ten={h.ho_ten} size={30} tone={h.da_nop ? 'brand' : 'slate'} />
              <span className="w-full truncate text-center text-[12px] font-semibold leading-tight text-ink">{tenVietTat(h.ho_ten)}</span>
              {h.co_goi_y && <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-white" aria-hidden />}
              {vuaGhi[h.ma] > 0 && <span className="absolute left-1 top-1 rounded-full bg-violet-600 px-1.5 text-[10px] font-bold leading-4 text-white" aria-hidden>{vuaGhi[h.ma]}</span>}
            </button>
          </li>
        ))}
      </ul>
      {dangMo && (
        <BangGhiNhanh ten={dangMo.ho_ten} hanhVi={HANH_VI_THEO_CHANG[chang]} daChon={daChon}
          onChonHanhVi={setDaChon} onChonMuc={(m) => chonMuc(dangMo, m)} onDong={dong} />
      )}
    </>
  )
}
