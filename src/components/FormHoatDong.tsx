import { useEffect, useState } from 'react'
import { Check, ClipboardList, FileText } from 'lucide-react'
import { useApp, type ManHinh } from '../lib/store'
import { nid } from '../lib/time'
import { PageHead } from './layout/PageHead'
import { Card, KhoiLuuY, MaMan, Nut, VungThaTep } from './ui/Ui'

type LoaiMinhChung = 'E1' | 'E3' | 'E4' | 'E5'
interface Truong { khoa: string; nhan: string; goi_y: string; hang?: number }
export interface CauHinhFormHoatDong {
  man: ManHinh
  maMan: string
  tieuDe: string
  moTa: string
  buoc: string[]
  loai: LoaiMinhChung
  nhiemVu: string
  chiSo: number
  truong: Truong[]
}

export const FORM_HOAT_DONG: Record<'HD1' | 'HD3' | 'HD4' | 'HD5', CauHinhFormHoatDong> = {
  HD1: {
    man: 'S01', maMan: 'S01', tieuDe: 'HĐ1: Xác định vấn đề và yêu cầu thiết kế', loai: 'E1', nhiemVu: 'NV-1.3', chiSo: 0,
    moTa: 'Phân tích tình huống, xác định yêu cầu có thể đo/kiểm và các ràng buộc trước khi thiết kế cầu giấy.',
    buoc: ['Nêu vấn đề cần giải quyết.', 'Liệt kê tiêu chí thành công có thể đo hoặc kiểm.', 'Nêu ràng buộc về vật liệu, kích thước và an toàn.'],
    truong: [
      { khoa: 'van_de', nhan: 'Vấn đề thiết kế', goi_y: 'Cây cầu giấy cần giải quyết vấn đề gì?' },
      { khoa: 'tieu_chi', nhan: 'Tiêu chí có thể đo hoặc kiểm', goi_y: 'Ví dụ: chịu tối thiểu 600 g trong 5 giây; độ võng…', hang: 4 },
      { khoa: 'rang_buoc', nhan: 'Ràng buộc thiết kế', goi_y: 'Số tờ giấy, chiều dài nhịp, băng dính, an toàn…', hang: 3 },
    ],
  },
  HD3: {
    man: 'S03', maMan: 'S03', tieuDe: 'HĐ3: Lựa chọn giải pháp', loai: 'E3', nhiemVu: 'NV-3.3', chiSo: 2,
    moTa: 'So sánh các phương án, nêu đánh đổi và bảo vệ lựa chọn cá nhân bằng tiêu chí và dữ liệu.',
    buoc: ['Chọn một phương án cụ thể.', 'Viện dẫn tiêu chí hoặc dữ liệu để giải thích.', 'Nêu đánh đổi chấp nhận được.'],
    truong: [
      { khoa: 'phuong_an_chon', nhan: 'Phương án được chọn', goi_y: 'Ví dụ: Phương án 1 – Cầu giàn tam giác' },
      { khoa: 'ly_do_ca_nhan', nhan: 'Lí do lựa chọn cá nhân', goi_y: 'Dựa vào tiêu chí nào, số liệu nào, vì sao?', hang: 5 },
      { khoa: 'danh_doi', nhan: 'Đánh đổi chấp nhận', goi_y: 'Em chấp nhận hạn chế nào để đổi lấy lợi ích gì?', hang: 3 },
    ],
  },
  HD4: {
    man: 'S06', maMan: 'S06', tieuDe: 'HĐ4: Chế tạo và thử nghiệm', loai: 'E4', nhiemVu: 'NV-4.4', chiSo: 3,
    moTa: 'Ghi lại nguyên mẫu đã chế tạo, dữ liệu thử tải và phân tích nguyên nhân của hạn chế quan sát được.',
    buoc: ['Mô tả nguyên mẫu và thay đổi khi chế tạo.', 'Ghi điều kiện thử và các số liệu quan sát.', 'Phân tích vị trí hoặc nguyên nhân hạn chế.'],
    truong: [
      { khoa: 'mo_ta_san_pham', nhan: 'Mô tả nguyên mẫu và thay đổi', goi_y: 'Kết cấu, vật liệu, các thay đổi đã thực hiện…', hang: 4 },
      { khoa: 'du_lieu_thu', nhan: 'Dữ liệu thử tải', goi_y: 'Nêu nấc tải, biến dạng, vị trí hỏng và điều kiện thử.', hang: 4 },
      { khoa: 'phan_tich', nhan: 'Phân tích nguyên nhân hạn chế', goi_y: 'Bằng chứng nào cho thấy nguyên nhân này?', hang: 4 },
    ],
  },
  HD5: {
    man: 'S05', maMan: 'S05', tieuDe: 'HĐ5: Cải tiến và phản tư', loai: 'E5', nhiemVu: 'NV-5.1', chiSo: 4,
    moTa: 'Đề xuất thay đổi dựa trên nguyên nhân đã xác định, dự đoán tác động và phản tư từ dữ liệu trước–sau.',
    buoc: ['Nêu điểm cần cải tiến.', 'Liên kết thay đổi với nguyên nhân và bằng chứng.', 'Dự đoán tác động để chuẩn bị kiểm thử lại.'],
    truong: [
      { khoa: 'gia_thuyet', nhan: 'Giả thuyết cải tiến', goi_y: 'Em sẽ thay đổi chi tiết nào và vì sao?', hang: 4 },
      { khoa: 'bang_chung', nhan: 'Bằng chứng dẫn tới thay đổi', goi_y: 'Dữ liệu hoặc quan sát nào làm căn cứ?', hang: 4 },
      { khoa: 'du_doan_tac_dong', nhan: 'Dự đoán tác động', goi_y: 'Kết quả nào sẽ thay đổi sau khi cải tiến?', hang: 4 },
    ],
  },
}

export function FormHoatDong({ cauHinh }: { cauHinh: CauHinhFormHoatDong }) {
  const { s, d } = useApp()
  const hsId = s.hoc_sinh_hien_tai
  const hs = s.du_lieu.hoc_sinh.find((item) => item.id === hsId)!
  const mc = s.du_lieu.minh_chung
    .filter((item) => item.hoc_sinh_id === hsId && item.loai_minh_chung === cauHinh.loai)
    .sort((a, b) => b.phien_ban - a.phien_ban)[0]
  const noiDung = (mc?.noi_dung ?? {}) as Record<string, unknown>
  const [giaTri, setGiaTri] = useState<Record<string, string>>(() => Object.fromEntries(cauHinh.truong.map((field) => [field.khoa, String(noiDung[field.khoa] ?? '')])))
  const [tepMoi, setTepMoi] = useState<string[]>([])

  useEffect(() => {
    setGiaTri(Object.fromEntries(cauHinh.truong.map((field) => [field.khoa, String(noiDung[field.khoa] ?? '')])))
    setTepMoi([])
    // Dữ liệu mới chỉ cần nạp lại khi có một phiên bản minh chứng khác.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mc?.id])

  const hopLe = cauHinh.truong.every((field) => (giaTri[field.khoa] ?? '').trim().length >= 10)
  const sua = (khoa: string, value: string) => setGiaTri((old) => ({ ...old, [khoa]: value }))
  const nop = () => {
    const tep = tepMoi.map((ten) => ({ ten, loai: ten.toLowerCase().endsWith('.pdf') ? 'tai_lieu' as const : 'anh' as const, dung_luong: 'Tệp đã nộp' }))
    d({ kieu: 'HS_NOP_HOAT_DONG', id: nid(cauHinh.loai), hoc_sinh_id: hsId, nhom_id: hs.nhom_id, loai_minh_chung: cauHinh.loai, nhiem_vu_id: cauHinh.nhiemVu, chi_so_hoat_dong: cauHinh.chiSo, noi_dung: giaTri, tep })
  }

  return <>
    <PageHead crumbs={['Bài học', 'Cầu giấy chịu lực', cauHinh.tieuDe]} title={<><MaMan ma={cauHinh.maMan} />{cauHinh.tieuDe}</>} />
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-4">
        <Card title="Mục tiêu hoạt động" icon={<ClipboardList size={17} />}>
          <p className="text-[13px] leading-relaxed text-ink-soft">{cauHinh.moTa}</p>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-[12.5px] leading-relaxed text-ink">{cauHinh.buoc.map((step) => <li key={step}>{step}</li>)}</ol>
        </Card>
        <Card title="Phiếu minh chứng cá nhân" icon={<FileText size={17} />} sub={mc ? `Đang chỉnh từ phiên bản ${mc.phien_ban}` : 'Điền để tạo minh chứng đầu tiên'}>
          <div className="space-y-4">{cauHinh.truong.map((field) => <label key={field.khoa} className="block"><span className="mb-1.5 block text-[12.5px] font-extrabold text-ink">{field.nhan}</span><textarea value={giaTri[field.khoa] ?? ''} onChange={(event) => sua(field.khoa, event.target.value)} rows={field.hang ?? 3} placeholder={field.goi_y} className="field leading-relaxed" /></label>)}</div>
          <div className="mt-4 border-t border-line pt-4"><div className="mb-2 text-[12.5px] font-extrabold text-ink">Tệp minh chứng</div><VungThaTep nho hoTro="Ảnh hoặc PDF (≤ 10 MB)" onChon={(files) => setTepMoi((old) => [...old, ...files])} /><div className="mt-2 flex flex-wrap gap-1.5">{[...(mc?.tep ?? []).map((file) => file.ten), ...tepMoi].map((name) => <span key={name} className="rounded-md bg-slate-100 px-2 py-1 text-[11px] text-ink-soft">{name}</span>)}</div></div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4"><p className="text-[11.5px] text-ink-mute">Các trường cần ít nhất 10 ký tự. Nộp lại luôn tạo phiên bản mới.</p><Nut bien="chinh" disabled={!hopLe} onClick={nop}> {mc ? 'Lưu phiên bản mới' : 'Nộp minh chứng'} →</Nut></div>
        </Card>
      </div>
      <div className="space-y-4"><Card title="Trạng thái" icon={<Check size={17} />}><p className="text-[13px] font-extrabold text-ink">{mc ? `Đã có phiên bản ${mc.phien_ban}` : 'Chưa nộp minh chứng'}</p><p className="mt-1 text-[12px] leading-relaxed text-ink-soft">Sau khi nộp, giáo viên mới đối chiếu rubric. Chưa có minh chứng không phải là mức năng lực thấp.</p></Card><KhoiLuuY>Minh chứng này thuộc về <strong>{hs.ho_ten}</strong>. Nội dung nhóm (nếu có) chỉ là bối cảnh, không được dùng để tự suy năng lực cá nhân.</KhoiLuuY></div>
    </div>
  </>
}
