import { Fragment, useState } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, Download, Paperclip, Send, Sparkles } from 'lucide-react'
import { useApp } from '../lib/store'
import { CHI_BAO } from '../data/rubric'
import { HD_CUA_CHI_BAO, HOAT_DONG, TEN_NGAN } from '../data/khbd'
import { CAU_HINH } from '../data/seed'
import { CHI_BAO_LOI_12 } from '../data/builders'
import { lyDoChanCham, trangThaiMoiNhat } from '../lib/trace'
import { minhChungMoiNhat } from '../lib/derive'
import { nid, ngayGio } from '../lib/time'
import { PageHead } from '../components/layout/PageHead'
import { AnhCau } from '../components/art/Art'
import { NoiDungPhieu } from '../components/NoiDungPhieu'
import { phanLoaiTep, XemTruocTep } from '../components/Tep'
import { Avatar, Card, Chip, ChipDocLap, ChipMuc, KhoiChan, Ma, MaMan, Nhan, Nut, Tabs } from '../components/ui/Ui'
import type { MaHD, MinhChung } from '../types'

const NHAN_MUC: Record<1 | 2 | 3 | 4, [string, string]> = {
  1: ['M1', 'Chưa thực hiện được'], 2: ['M2', 'Thực hiện một phần'], 3: ['M3', 'Khá đầy đủ'], 4: ['M4', 'Đầy đủ, độc lập'],
}

/** S12 — Đối chiếu minh chứng với bảng mô tả mức M1–M4 trước khi chốt. Không có điểm trung bình. */
export function S12DanhGia() {
  const { s, d } = useApp()
  const dl = s.du_lieu
  const cast = dl.hoc_sinh.filter((h) => h.co_ho_so)
  const hsId = s.ho_so_dang_mo && cast.some((h) => h.id === s.ho_so_dang_mo) ? s.ho_so_dang_mo : 'HS0812'
  const hs = dl.hoc_sinh.find((h) => h.id === hsId)!
  const [hd, setHd] = useState<MaHD>('HĐ2')
  const hdi = HOAT_DONG.find((h) => h.ma === hd)!
  const eLoai = hdi.minh_chung
  const nhiemVuId = { E1: 'NV-1.3', E2: 'NV-2.3', E3: 'NV-3.3', E4: 'NV-4.4', E5: 'NV-5.1' }[eLoai]!
  const mc = minhChungMoiNhat(dl, hsId, nhiemVuId)
  const cha = mc?.minh_chung_cha_id ? dl.minh_chung.find((m) => m.id === mc.minh_chung_cha_id) ?? null : null
  const hangCB = CHI_BAO_LOI_12.filter((c) => HD_CUA_CHI_BAO[c] === hd)

  const doiHS = (id: string) => d({ kieu: 'DOI_MAN_HINH', man_hinh: 'S12', hoc_sinh: id })

  return (
    <>
      <PageHead
        crumbs={['Lớp học', CAU_HINH.lop, `${hd} – ${hdi.ten_day_du}`, <span key="x"><MaMan ma="S12" />Minh chứng + Rubric</span>]}
        title={<><MaMan ma="S12" />Minh chứng + Rubric</>}
        sub="Cầu giấy chịu lực"
        right={<>
          <label className="text-[11px] text-ink-soft">Học sinh
            <select value={hsId} onChange={(e) => doiHS(e.target.value)} className="field mt-0.5 !w-48 !py-1.5">{cast.map((h) => <option key={h.id} value={h.id}>{h.ho_ten}</option>)}</select></label>
          <label className="text-[11px] text-ink-soft">Hoạt động
            <select value={hd} onChange={(e) => setHd(e.target.value as MaHD)} className="field mt-0.5 !w-40 !py-1.5">{HOAT_DONG.map((h) => <option key={h.ma} value={h.ma}>{h.ma} – {h.ten}</option>)}</select></label>
          <Chip tone="orange" className="!px-3.5 !py-2 !text-[12.5px]">Đang đánh giá</Chip>
          <Nut onClick={() => d({ kieu: 'DOI_MAN_HINH', man_hinh: 'S10' })}><ArrowLeft size={15} /> Quay lại</Nut>
        </>}
      />
      {mc ? <NoiDung key={`${hsId}-${hd}-${mc.id}`} hs={hs} mc={mc} cha={cha} hang={hangCB} /> : (
        <Card><p className="py-6 text-center text-[13px] text-ink-soft">{hs.ho_ten} chưa có minh chứng nào ở {hd}. Hoạt động này chưa mở hoặc học sinh chưa bắt đầu — hệ thống ghi <strong>KHÔNG CÓ CƠ HỘI</strong>, không gán M1.</p></Card>
      )}
    </>
  )
}

function NoiDung({ hs, mc, cha, hang }: { hs: { id: string; ho_ten: string; lop: string; nhom_id: string }; mc: MinhChung; cha: MinhChung | null; hang: string[] }) {
  const { s, d } = useApp()
  const dl = s.du_lieu
  const p = phanLoaiTep(mc.tep)
  const [tab, setTab] = useState<'anh' | 'video' | 'tai_lieu' | 'phieu'>(p.anh.length ? 'anh' : 'phieu')
  const [idx, setIdx] = useState(0)
  const [chon, setChon] = useState<Record<string, 1 | 2 | 3 | 4 | null>>(() =>
    Object.fromEntries(hang.map((cb) => [cb, trangThaiMoiNhat(dl, hs.id, cb)?.muc ?? null])))
  const [moRong, setMoRong] = useState<Set<string>>(new Set())
  const [lyDo, setLyDo] = useState('')
  const [binhLuan, setBinhLuan] = useState('')

  const idsChinh = cha ? [mc.id, cha.id] : [mc.id]
  const chan = lyDoChanCham(dl, idsChinh, hs.id)
  const nhom = dl.nhom.find((n) => n.id === hs.nhom_id)
  const laTruongNhom = nhom?.truong_nhom_id === hs.id
  const traoDoi = dl.trao_doi.filter((t) => t.minh_chung_id === mc.id).sort((a, b) => a.thoi_diem.localeCompare(b.thoi_diem))
  const khaoSat = ((cha?.noi_dung ?? {}) as { bang_khao_sat?: unknown[] }).bang_khao_sat as Record<string, unknown>[] | undefined

  const thayDoi = hang.filter((cb) => chon[cb] !== null && chon[cb] !== (trangThaiMoiNhat(dl, hs.id, cb)?.muc ?? null))
  const duLyDo = lyDo.trim().length >= 5
  const dsTep = tab === 'anh' ? p.anh : tab === 'video' ? p.video : tab === 'tai_lieu' ? p.tai_lieu : []
  const hienTep = dsTep[Math.min(idx, Math.max(0, dsTep.length - 1))]

  const chotMuc = () => {
    if (!duLyDo || thayDoi.length === 0) return
    d({
      kieu: 'GV_CHAM', ids: thayDoi.map(() => nid('DG')), hoc_sinh_id: hs.id, ly_do: lyDo.trim(), minh_chung_ids: idsChinh,
      muc_theo_chi_bao: Object.fromEntries(thayDoi.map((cb) => [cb, chon[cb] as 1 | 2 | 3 | 4])),
    })
    setLyDo('')
  }

  const chenMoTa = () => {
    const dong = hang.filter((cb) => chon[cb]).map((cb) => `${cb}: ${CHI_BAO[cb].mo_ta_muc[chon[cb]!]}`)
    setLyDo((v) => (v ? v + '\n' : '') + (dong.length ? `Đối chiếu bảng mô tả mức — ${dong.join(' | ')}` : ''))
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      {/* ── Trái: minh chứng ── */}
      <div className="min-w-0 space-y-4">
        <Card title="Minh chứng của học sinh" sub="Xem và đánh giá sản phẩm, quá trình thực hiện của học sinh" pad={false}>
          <div className="px-4 pb-4">
            <Tabs value={tab} onChange={(t) => { setTab(t); setIdx(0) }} tabs={[
              { id: 'anh', nhan: `Hình ảnh (${p.anh.length})` }, { id: 'video', nhan: `Video (${p.video.length})` },
              { id: 'tai_lieu', nhan: `Tài liệu (${p.tai_lieu.length})` }, { id: 'phieu', nhan: <>Nội dung phiếu <Ma>{mc.loai_minh_chung}</Ma></> },
            ]} />

            {tab === 'phieu' ? (
              <div className="mt-3 space-y-3">
                {cha && <div className="rounded-xl border border-line bg-slate-50/70 p-3"><Nhan>Sản phẩm của nhóm <Ma>{cha.ma_minh_chung}</Ma></Nhan><NoiDungPhieu mc={cha} /></div>}
                <div className="rounded-xl border border-line p-3"><Nhan>Phần của cá nhân <Ma>{mc.ma_minh_chung}</Ma></Nhan><NoiDungPhieu mc={mc} khaoSat={khaoSat} /></div>
              </div>
            ) : hienTep ? (
              <div className="mt-3">
                {hienTep.loai === 'tai_lieu' ? (
                  <div className="flex h-[210px] items-center justify-center rounded-xl bg-slate-50 ring-1 ring-line"><XemTruocTep t={hienTep} cao="h-32 w-44" /></div>
                ) : (
                  <div className="relative overflow-hidden rounded-xl ring-1 ring-line">
                    <div className="aspect-[16/8.4]"><AnhCau kieu={hienTep.kieu ?? 'truss'} tone={hienTep.loai === 'video' ? 'dark' : (hienTep.tone ?? 'light')} className="h-full w-full" /></div>
                    {dsTep.length > 1 && <>
                      <button onClick={() => setIdx((idx - 1 + dsTep.length) % dsTep.length)} aria-label="Ảnh trước" className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white"><ChevronLeft size={18} /></button>
                      <button onClick={() => setIdx((idx + 1) % dsTep.length)} aria-label="Ảnh sau" className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white"><ChevronRight size={18} /></button>
                    </>}
                    <span className="absolute right-2 top-2 rounded-md bg-black/55 px-2 py-0.5 text-[11px] font-semibold text-white">{Math.min(idx, dsTep.length - 1) + 1}/{dsTep.length}</span>
                  </div>
                )}
                <div className="mt-2.5 flex items-start justify-between gap-3">
                  <div className="min-w-0"><div className="truncate text-[13px] font-bold text-ink">{hienTep.ten}</div>
                    {hienTep.mo_ta && <div className="text-[12px] text-ink-soft">{hienTep.mo_ta}</div>}
                    <div className="text-[11.5px] text-ink-mute">{ngayGio(mc.thoi_diem)} · {hienTep.dung_luong}</div></div>
                  <Nut nho onClick={() => d({ kieu: 'TOAST', noi_dung: 'Bản demo không tải tệp thật — tệp minh chứng là hình minh hoạ.' })}><Download size={13} /> Tải xuống</Nut>
                </div>
                {dsTep.length > 1 && (
                  <div className="mt-3 grid grid-cols-6 gap-2">
                    {dsTep.slice(0, 6).map((t, i) => <XemTruocTep key={t.ten} t={t} chon={i === Math.min(idx, dsTep.length - 1)} onClick={() => setIdx(i)} cao="h-[52px]" />)}
                  </div>
                )}
              </div>
            ) : <p className="mt-3 rounded-lg bg-slate-50 px-3 py-8 text-center text-[12.5px] text-ink-soft">Không có tệp loại này. Xem tab “Nội dung phiếu”.</p>}
          </div>
        </Card>

        <Card title="Thông tin học sinh" pad={false}>
          <div className="grid gap-x-6 gap-y-2 px-4 pb-4 pt-2 text-[12.5px] sm:grid-cols-2">
            <div className="flex items-center gap-3 sm:col-span-2"><Avatar ten={hs.ho_ten} size={40} tone="slate" /><div><div className="font-bold text-ink">{hs.ho_ten}<Ma>{hs.id}</Ma></div><div className="text-ink-soft">Lớp {hs.lop} · {nhom?.ten}</div></div></div>
            {[
              ['Vai trò', laTruongNhom ? 'Trưởng nhóm' : 'Thành viên'], ['Thời gian nộp', ngayGio(mc.thoi_diem)],
              ['Sản phẩm', mc.loai_minh_chung === 'E4' ? 'Nhật kí + ảnh/video thử tải' : 'Phiếu + bản phác + báo cáo'], ['Định dạng', [p.anh.length && 'Ảnh', p.video.length && 'video', p.tai_lieu.length && 'PDF/Word'].filter(Boolean).join(', ') || 'Văn bản'],
            ].map(([k, v]) => <div key={k} className="grid grid-cols-[92px_1fr] gap-2"><span className="text-ink-soft">{k}</span><span className="font-medium text-ink">{v}</span></div>)}
            <div className="grid grid-cols-[92px_1fr] items-center gap-2"><span className="text-ink-soft">Trạng thái</span><span className="flex flex-wrap items-center gap-1.5"><Chip tone="green" dot>Đã nộp</Chip><ChipDocLap t={mc.boi_canh_ho_tro} nho /></span></div>
            <div className="grid grid-cols-[92px_1fr] items-center gap-2"><span className="text-ink-soft">Phiên bản</span><span className="font-medium text-ink">{mc.phien_ban}{mc.phien_ban > 1 && <span className="ml-1.5 rounded bg-sky-100 px-1.5 py-0.5 text-[10.5px] font-semibold text-sky-800">nộp lại sau hỗ trợ</span>}</span></div>
          </div>
        </Card>

        <Card title="Trao đổi và nhận xét" sub="Chỉ gắn với minh chứng này — không phải hộp trò chuyện tự do">
          <div className="space-y-3">
            {traoDoi.length === 0 && <p className="text-[12.5px] text-ink-mute">Chưa có trao đổi nào về minh chứng này.</p>}
            {traoDoi.map((t) => (
              <div key={t.id} className="flex gap-2.5">
                <Avatar ten={t.tac_gia} size={30} tone={t.vai_tro === 'GV' ? 'navy' : 'slate'} />
                <div className="min-w-0 flex-1 rounded-xl bg-slate-50 px-3 py-2">
                  <div className="text-[12px]"><strong className="text-ink">{t.tac_gia}</strong> <span className="text-ink-mute">({t.vai_tro === 'GV' ? 'Giáo viên' : 'Học sinh'}) · {ngayGio(t.thoi_diem)}</span></div>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink">{t.noi_dung}</p>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <div className="relative flex-1"><input value={binhLuan} onChange={(e) => setBinhLuan(e.target.value)} placeholder="Nhập bình luận về minh chứng này…" aria-label="Bình luận"
                onKeyDown={(e) => { if (e.key === 'Enter' && binhLuan.trim()) { d({ kieu: 'GUI_TRAO_DOI', id: nid('TD'), minh_chung_id: mc.id, noi_dung: binhLuan.trim() }); setBinhLuan('') } }}
                className="field !pr-9" /><Paperclip size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-mute" /></div>
              <Nut bien="chinh" disabled={!binhLuan.trim()} onClick={() => { d({ kieu: 'GUI_TRAO_DOI', id: nid('TD'), minh_chung_id: mc.id, noi_dung: binhLuan.trim() }); setBinhLuan('') }}><Send size={14} /> Gửi</Nut>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Phải: rubric ── */}
      <div className="min-w-0 space-y-4">
        <Card title="Rubric đánh giá (M1 – M4)" sub="Chọn mức đã đạt cho từng chỉ báo, dựa trên minh chứng bên trái"
          action={<Nut nho onClick={() => setMoRong((v) => v.size === hang.length ? new Set() : new Set(hang))}>{moRong.size === hang.length ? 'Ẩn mô tả mức' : 'Xem mô tả mức chi tiết'}</Nut>}>
          {chan && <div className="mb-3"><KhoiChan>{chan}</KhoiChan>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <Nut bien="vang" nho onClick={() => d({ kieu: 'YEU_CAU_BO_SUNG', id: nid('HT'), hoc_sinh_id: hs.id, nhiem_vu_id: mc.nhiem_vu_id, minh_chung_id: mc.id, noi_dung: 'Em hãy bổ sung phần còn thiếu của phiếu để giáo viên có đủ căn cứ đánh giá.' })}>Yêu cầu bổ sung minh chứng</Nut>
              <span className="text-[11.5px] text-ink-soft">Thiếu minh chứng ≠ năng lực thấp: hệ thống không cho gán M1 khi chưa có căn cứ.</span></div></div>}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left text-[12.5px]">
              <thead>
                <tr className="bg-slate-50 text-[11.5px]">
                  <th className="rounded-tl-lg border border-line px-3 py-2 font-bold text-ink">Chỉ báo</th>
                  {([1, 2, 3, 4] as const).map((m, i) => (
                    <th key={m} className={`border border-line px-1.5 py-2 text-center font-bold text-ink ${i === 3 ? 'rounded-tr-lg' : ''}`}>{NHAN_MUC[m][0]}<div className="text-[10px] font-medium text-ink-soft">({NHAN_MUC[m][1]})</div></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hang.map((cb) => {
                  const cur = trangThaiMoiNhat(dl, hs.id, cb)
                  const mo = moRong.has(cb)
                  return (
                    <Fragment key={cb}>
                      <tr>
                        <td className="border border-line px-3 py-2.5 align-top">
                          <button onClick={() => setMoRong((v) => { const n = new Set(v); if (n.has(cb)) n.delete(cb); else n.add(cb); return n })} className="text-left" aria-expanded={mo}>
                            <span className="font-bold text-ink">{TEN_NGAN[cb]}<Ma>{cb}</Ma></span>
                            <span className="mt-0.5 block text-[11px] leading-snug text-ink-soft">{CHI_BAO[cb].ten}</span>
                            <span className="mt-1 flex items-center gap-1.5 text-[10.5px] text-ink-mute">{cur?.muc ? <>Hiện tại: <ChipMuc muc={cur.muc} /></> : 'Chưa có mức'}{cur && cur.tinh_doc_lap !== 'KHONG_RO' && cur.muc && <ChipDocLap t={cur.tinh_doc_lap} nho />}</span>
                          </button>
                        </td>
                        {([1, 2, 3, 4] as const).map((m) => (
                          <td key={m} className={`border border-line text-center ${chon[cb] === m ? 'bg-brand-50' : ''}`}>
                            <label className={`flex h-full cursor-pointer items-center justify-center py-3 ${chan ? 'cursor-not-allowed opacity-40' : ''}`}>
                              <input type="radio" name={`muc-${cb}`} disabled={!!chan} checked={chon[cb] === m} onChange={() => setChon((v) => ({ ...v, [cb]: m }))} aria-label={`${cb} mức ${m}`} className="h-[18px] w-[18px] accent-[#0e8c93]" />
                            </label>
                          </td>
                        ))}
                      </tr>
                      {mo && (
                        <tr><td colSpan={5} className="border border-line bg-slate-50/70 px-3 py-2.5">
                          <div className="grid gap-1.5 sm:grid-cols-2">{([1, 2, 3, 4] as const).map((m) => (
                            <div key={m} className={`rounded-lg border p-2 text-[11.5px] leading-snug ${chon[cb] === m ? 'border-brand-400 bg-white' : 'border-line bg-white/70'}`}><strong className="text-ink">Mức {m}. </strong><span className="text-ink-soft">{CHI_BAO[cb].mo_ta_muc[m]}</span></div>))}</div>
                        </td></tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Nhận xét của giáo viên" action={<Nut nho bien="phu" disabled={!!chan || hang.every((c) => !chon[c])} onClick={chenMoTa}><Sparkles size={13} /> Gợi ý nhận xét</Nut>}>
          <textarea value={lyDo} onChange={(e) => setLyDo(e.target.value.slice(0, 500))} rows={4} disabled={!!chan}
            placeholder="Lí do chốt mức — bắt buộc, dựa trên minh chứng cụ thể. Nút “Gợi ý nhận xét” chỉ chèn mô tả mức đã chọn từ rubric, không phải AI chấm."
            className="field leading-relaxed disabled:bg-slate-50" />
          <div className="mt-1 text-right text-[11px] tabular-nums text-ink-mute">{lyDo.length}/500</div>
        </Card>

        <Card title="Tóm tắt theo chỉ báo" sub="Hệ thống không cộng hay lấy trung bình các mức — mỗi chỉ báo giữ nguyên mức của nó">
          <div className="flex flex-wrap gap-2">
            {hang.map((cb) => (
              <div key={cb} className="flex items-center gap-2 rounded-xl border border-line px-3 py-2">
                <span className="max-w-[170px] truncate text-[12px] text-ink" title={TEN_NGAN[cb]}>{TEN_NGAN[cb]}</span>
                <ChipMuc muc={chon[cb] ?? null} />
                {chon[cb] !== (trangThaiMoiNhat(dl, hs.id, cb)?.muc ?? null) && chon[cb] && <span className="text-[10px] font-bold text-brand-700">MỚI</span>}
              </div>
            ))}
          </div>
          {mc.boi_canh_ho_tro === 'CO_HO_TRO' && (
            <p className="mt-3 rounded-lg bg-sky-50 px-3 py-2 text-[11.5px] leading-relaxed text-sky-900">Minh chứng này xuất hiện <strong>sau hỗ trợ</strong>. Dù mức nào được chốt, trạng thái sẽ ghi CÓ HỖ TRỢ — hệ thống không tự nâng thành ĐỘC LẬP.</p>
          )}
          <div className="mt-4 flex flex-wrap items-center justify-end gap-2.5">
            <span className="mr-auto text-[11.5px] text-ink-mute">{thayDoi.length === 0 ? 'Chưa có thay đổi nào so với trạng thái hiện tại.' : `${thayDoi.length} chỉ báo sẽ tạo bản ghi mới; bản cũ được giữ.`}{!duLyDo && thayDoi.length > 0 ? ' Cần ghi lí do.' : ''}</span>
            <Nut onClick={() => d({ kieu: 'TOAST', noi_dung: 'Đã lưu nháp trong phiên làm việc (chưa tạo bản ghi đánh giá).' })}>Lưu tạm</Nut>
            <Nut bien="nhat" onClick={() => { setChon(Object.fromEntries(hang.map((cb) => [cb, trangThaiMoiNhat(dl, hs.id, cb)?.muc ?? null]))); setLyDo('') }}>Hủy</Nut>
            <Nut bien="chinh" disabled={!!chan || !duLyDo || thayDoi.length === 0} onClick={chotMuc}>Hoàn thành đánh giá</Nut>
          </div>
        </Card>
      </div>
    </div>
  )
}
