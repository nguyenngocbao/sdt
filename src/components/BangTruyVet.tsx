import { useEffect } from 'react'
import { X } from 'lucide-react'
import { useApp } from '../lib/store'
import { nhanTinCay, truyNguoc, truyXuoi } from '../lib/trace'
import { gio, ngay } from '../lib/time'
import { CHI_BAO, RUBRIC_PHIEN_BAN } from '../data/rubric'
import { TEN_NGAN } from '../data/khbd'
import { ChipDocLap, ChipMuc, ChipTrangThai, Ma, Nhan } from './ui/Ui'

/**
 * "Vì sao?" — bảng truy vết hai chiều.
 * Toàn bộ nội dung được TÍNH từ đồ thị dữ liệu bằng truyNguoc/truyXuoi. Không có đoạn nào viết cứng.
 */
export function BangTruyVet({ trangThaiId, onDong }: { trangThaiId: string; onDong: () => void }) {
  const { s } = useApp()
  const nguoc = truyNguoc(s.du_lieu, trangThaiId)
  const xuoi = truyXuoi(s.du_lieu, trangThaiId)
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onDong() }
    document.addEventListener('keydown', k)
    return () => document.removeEventListener('keydown', k)
  }, [onDong])
  if (!nguoc) return null

  const { trang_thai: t, danh_gia, minh_chung, minh_chung_cha, nhiem_vu, lich_su } = nguoc
  const cb = CHI_BAO[t.chi_bao]
  const daCo = new Set(minh_chung.map((m) => m.id))
  const chuoiMC = [...minh_chung_cha.filter((m) => !daCo.has(m.id)), ...minh_chung]

  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-slate-900/40" onClick={onDong} role="dialog" aria-modal aria-label="Vì sao có kết luận này">
      <div className="rise h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <header className="sticky top-0 z-10 border-b border-line bg-white/95 px-5 py-4 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[16px] font-extrabold text-ink">Vì sao có kết luận này?<Ma>{t.id}</Ma></h2>
              <p className="mt-1 text-[13px] text-ink-soft">{TEN_NGAN[t.chi_bao] ?? cb?.ten ?? t.chi_bao}<Ma>{t.chi_bao}</Ma></p>
            </div>
            <button onClick={onDong} aria-label="Đóng" className="rounded-lg p-1.5 text-ink-soft hover:bg-slate-100"><X size={18} /></button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <ChipMuc muc={t.muc} /><ChipTrangThai t={t.trang_thai_chat_luong} /><ChipDocLap t={t.tinh_doc_lap} />
            <span className="text-xs text-ink-soft">Độ tin cậy: {nhanTinCay(t.do_tin_cay)}</span>
          </div>
        </header>

        <div className="space-y-5 px-5 py-5">
          <div>
            <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-mute">Truy ngược về nguồn</h3>
            <ol className="space-y-3 border-l-2 border-line pl-4">
              {nhiem_vu.map((nv) => (
                <li key={nv.id}><Nhan>Nhiệm vụ</Nhan>
                  <p className="text-[13px] text-ink">{nv.hoat_dong_pha} — {nv.ten}<Ma>{nv.id}</Ma></p><p className="text-xs text-ink-soft">{nv.mo_ta}</p></li>
              ))}
              {chuoiMC.map((m) => (
                <li key={m.id}><Nhan>{m.loai_chu_the === 'NHOM' ? 'Minh chứng của nhóm' : 'Minh chứng cá nhân'}</Nhan>
                  <div className="flex flex-wrap items-center gap-2"><span className="text-[13px] text-ink">{m.loai_minh_chung} · phiên bản {m.phien_ban}</span><Ma>{m.ma_minh_chung}</Ma><ChipTrangThai t={m.trang_thai} nho /></div>
                  {m.minh_chung_cha_id && <p className="mt-0.5 text-xs text-ink-soft">Là phần cá nhân bên trong sản phẩm nhóm — cơ sở để không quy sản phẩm nhóm thành năng lực cá nhân.</p>}
                  <p className="mt-1 text-xs text-ink-soft">Tạo lúc {gio(m.thoi_diem)} ngày {ngay(m.thoi_diem)} · bối cảnh: {m.boi_canh_ho_tro === 'DOC_LAP' ? 'không hỗ trợ' : m.boi_canh_ho_tro === 'CO_HO_TRO' ? 'có hỗ trợ' : 'chưa rõ'}</p></li>
              ))}
              {danh_gia ? (
                <li><Nhan>Người đánh giá</Nhan><p className="text-[13px] text-ink">{danh_gia.nguoi_danh_gia_id} — lúc {gio(danh_gia.thoi_diem)}</p>
                  <p className="mt-1 rounded-lg bg-slate-50 px-3 py-2 text-xs italic text-ink-soft">“{danh_gia.ly_do}”</p>
                  <p className="mt-1 text-xs text-ink-soft">Bảng mô tả mức: <span className="font-mono">{danh_gia.rubric_id || RUBRIC_PHIEN_BAN}</span></p></li>
              ) : (
                <li><Nhan>Người đánh giá</Nhan><p className="text-[13px] text-ink-soft">Chưa có — trạng thái này chưa được đánh giá vì minh chứng chưa hợp lệ hoặc chưa có cơ hội thể hiện.</p></li>
              )}
            </ol>
          </div>

          {cb && t.muc && (
            <div className="rounded-xl border border-line bg-slate-50 p-3.5"><Nhan>Mô tả mức {t.muc} đã dùng để đối chiếu</Nhan><p className="text-[12.5px] leading-relaxed text-ink">{cb.mo_ta_muc[t.muc]}</p></div>
          )}

          {lich_su.length > 1 && (
            <div>
              <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-mute">Lịch sử trạng thái — bản cũ không bị ghi đè</h3>
              <div className="space-y-1.5">{lich_su.map((h, i) => (
                <div key={h.id} className={`flex flex-wrap items-center gap-2 rounded-lg px-3 py-2 text-xs ${i === 0 ? 'bg-brand-50 ring-1 ring-brand-200' : 'bg-slate-50'}`}>
                  <ChipMuc muc={h.muc} /><ChipDocLap t={h.tinh_doc_lap} nho /><span className="text-ink-soft">{gio(h.thoi_diem)} · {ngay(h.thoi_diem)}</span>
                  {h.sau_ho_tro && <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[11px] font-semibold text-sky-800">sau hỗ trợ</span>}
                  {i === 0 && <span className="ml-auto text-[11px] font-bold text-brand-700">hiện tại</span>}
                </div>))}</div>
            </div>
          )}

          {xuoi.length > 0 && (
            <div>
              <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-mute">Truy xuôi tới hành động</h3>
              {xuoi.map((x) => (
                <div key={x.chan_doan.id} className="space-y-3 border-l-2 border-line pl-4">
                  <div><Nhan>Chẩn đoán<Ma>{x.chan_doan.ma_mau} · {x.chan_doan.phien_ban_catalog}</Ma></Nhan>
                    <p className="text-[13px] leading-relaxed text-ink">{x.chan_doan.gia_thuyet}</p>
                    <p className="mt-1 text-[11px] text-ink-soft">Đây là giả thuyết sư phạm, không phải kết luận về học sinh.</p></div>
                  {x.ho_tro && (
                    <div><Nhan>Hỗ trợ ({x.ho_tro.muc_ho_tro === 'NHE' ? 'nhẹ' : 'sâu'})</Nhan>
                      <p className="rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-900">“{x.ho_tro.noi_dung}”</p>
                      <p className="mt-1 text-xs text-ink-soft">Trạng thái duyệt: {x.ho_tro.trang_thai_duyet === 'CHO_DUYET' ? 'đang chờ giáo viên' : x.ho_tro.trang_thai_duyet === 'DA_DUYET' ? 'đã duyệt' : x.ho_tro.trang_thai_duyet === 'BO_SUNG' ? 'chờ bổ sung' : 'đã từ chối'}</p></div>
                  )}
                  {x.quyet_dinh && (
                    <div><Nhan>Quyết định giáo viên</Nhan>
                      <p className="text-[13px] text-ink">{{ DUYET: 'Duyệt', SUA: 'Chỉnh sửa và gửi', TU_CHOI: 'Từ chối', YEU_CAU_THEM_MINH_CHUNG: 'Yêu cầu thêm minh chứng' }[x.quyet_dinh.quyet_dinh]} — {x.quyet_dinh.nguoi_thuc_hien_id}</p>
                      <p className="mt-1 rounded-lg bg-slate-50 px-3 py-2 text-xs italic text-ink-soft">“{x.quyet_dinh.ly_do}”</p>
                      {x.quyet_dinh.gia_tri_truoc && x.quyet_dinh.gia_tri_sau && x.quyet_dinh.quyet_dinh === 'SUA' && (
                        <p className="mt-1 text-[11px] text-ink-mute">Trước: <span className="line-through">{x.quyet_dinh.gia_tri_truoc}</span></p>)}</div>
                  )}
                  {x.minh_chung_hau_kiem.length > 0 && (
                    <div><Nhan>Minh chứng hậu kiểm</Nhan>
                      {x.minh_chung_hau_kiem.map((m) => <p key={m.id} className="text-[13px] text-ink">{m.loai_minh_chung} phiên bản {m.phien_ban}<Ma>{m.ma_minh_chung}</Ma></p>)}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="rounded-xl bg-slate-50 px-3.5 py-3 text-[11.5px] leading-relaxed text-ink-soft">
            Lí do hệ thống ghi: {t.ly_do}
            {t.hanh_dong_tiep_theo && <><br />Bước tiếp theo đề xuất: {t.hanh_dong_tiep_theo}</>}
          </div>
        </div>
      </div>
    </div>
  )
}
