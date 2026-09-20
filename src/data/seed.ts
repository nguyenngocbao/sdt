/**
 * Dữ liệu seed cho demo.
 *
 * HƯ CẤU nhưng NHẤT QUÁN: mọi liên kết id đều có thật, để hàm truy vết trong
 * lib/trace.ts chạy thật trên đồ thị này. Không có màn hình nào viết cứng
 * kết quả truy vết.
 *
 * Kịch bản trung tâm = kịch bản 7.1 của SDT.docx:
 *   HS0812 (Trần Minh Đức) · HĐ2 · B1.2 = M3 nhưng B1.3 = M2 → mẫu P01 → hỗ trợ nhẹ chờ GV duyệt.
 * Đi kèm các ca khác để minh hoạ từng nhánh: bổ sung dữ liệu, phương án khác biệt hình thức,
 * chỉ có sản phẩm nhóm (bị chặn chấm) và một ca đã đi hết vòng (Đỗ Thu Trang).
 */
import type {
  BanGhiXuat, CauHinhPhien, ChanDoan, DanhGia, GoiYAI, HoTro, MinhChung, PhienBanCauHinh,
  QuanSat, QuyetDinhGV, TraoDoi, TrangThaiSDT,
} from '../types'
import { RUBRIC_PHIEN_BAN } from './rubric'
import { CATALOG, CATALOG_PHIEN_BAN } from './catalog'
import { HOAT_DONG, NHIEM_VU } from './khbd'
import { HOC_SINH, NHOM } from './lop'
import { hoSo, minhChungNhom, T } from './builders'

export { HOC_SINH, NHOM, NHIEM_VU }

export const CAU_HINH: CauHinhPhien = {
  ma_phien: 'PH01',
  lop: '10A1',
  ten_bai: 'Thiết kế cầu giấy chịu lực',
  giao_vien: 'Nguyễn Văn An',
  khbd_phien_ban: 'KHBD_v0.3',
  rubric_phien_ban: RUBRIC_PHIEN_BAN,
  catalog_phien_ban: CATALOG_PHIEN_BAN,
  hoat_dong_dang_mo: 'HĐ5',
  nam_hoc: '2024 – 2025',
}

const P = (ma: string) => CATALOG.find((m) => m.ma === ma)!

// ── Bộ tệp đính kèm cho E2 của Trần Minh Đức (khớp màn S12) ─────────────────
const TEP_DUC = [
  { ten: 'Cau_giay_phuong_an1.jpg', loai: 'anh', dung_luong: '1.2 MB', mo_ta: 'Mô hình cầu giấy - Phương án 1 (nhìn nghiêng)', kieu: 'truss', tone: 'light' },
  { ten: 'Cau_giay_thi_nghiem.jpg', loai: 'anh', dung_luong: '0.9 MB', mo_ta: 'Thử nghiệm khảo sát cấu trúc', kieu: 'arch', tone: 'light' },
  { ten: 'goc_nhin_tren.jpg', loai: 'anh', dung_luong: '1.0 MB', mo_ta: 'Nhìn từ trên xuống', kieu: 'plank', tone: 'wood' },
  { ten: 'moi_noi_chi_tiet.jpg', loai: 'anh', dung_luong: '0.8 MB', mo_ta: 'Chi tiết mối nối', kieu: 'truss', tone: 'dark' },
  { ten: 'ban_phac_pa1.jpg', loai: 'anh', dung_luong: '0.6 MB', mo_ta: 'Bản phác phương án 1', kieu: 'box', tone: 'light' },
  { ten: 'ban_phac_pa2.jpg', loai: 'anh', dung_luong: '0.6 MB', mo_ta: 'Bản phác phương án 2', kieu: 'arch', tone: 'wood' },
  { ten: 'video_khao_sat.mp4', loai: 'video', dung_luong: '8.4 MB', mo_ta: 'Video khảo sát cấu trúc giấy' },
  { ten: 'video_gioi_thieu_pa1.mp4', loai: 'video', dung_luong: '5.1 MB', mo_ta: 'Giới thiệu phương án 1' },
  { ten: 'BaoCao_HD2.docx', loai: 'tai_lieu', dung_luong: '256 KB' },
  { ten: 'PhieuKhaoSat_E2.pdf', loai: 'tai_lieu', dung_luong: '310 KB' },
  { ten: 'BanPhac_PA.pdf', loai: 'tai_lieu', dung_luong: '180 KB' },
] as const

// ── Hồ sơ từng học sinh mẫu ─────────────────────────────────────────────────
const duc = hoSo('HS0812', 'N02', {
  tienDo: 'xxxxd',
  mc: {
    E2: {
      noi_dung: {
        mo_ta_hs: 'Nhóm em thiết kế cầu giấy dạng dàn tam giác. Đã tiến hành thử nghiệm với các mẫu tải khác nhau. Em nhận thấy cầu bị võng nhẹ ở giữa khi tải > 500g. Em muốn được góp ý cách cải thiện độ cứng.',
        giai_thich: 'Khi gấp giấy thành hình chữ U hoặc hình hộp thì tờ giấy không còn phẳng nữa, mặt cắt cao lên nên khó bị uốn cong hơn. Ở nhóm em, tờ phẳng võng rất nhiều còn tờ gấp gần như không võng.',
        ham_y: 'Em nghĩ nên làm cầu cho chắc chắn và cân đối để chịu được tải nặng hơn.',
        dong_du_lieu_vien_dan: [],
        du_doan: 'Em dự đoán phương án 1 chịu lực tốt hơn vì các thanh tam giác giúp phân tán lực đều lên các thanh, tăng độ cứng và giảm võng. Ngoài ra, cấu trúc này ổn định hơn và phù hợp với mục tiêu chế tạo cầu chịu lực.',
        phuong_an: [
          { ten: 'Phương án 1: Cầu giàn tam giác', kieu: 'truss', dac_diem: ['Sử dụng cấu trúc tam giác lặp lại', 'Chiều cao cầu: 4 cm', 'Dài cầu: 30 cm', 'Vật liệu: giấy A4 gấp nhiều lớp', 'Mối nối: dán keo giấy'], uu: ['Chịu lực tốt', 'Ổn định, ít biến dạng'], han_che: ['Tốn nhiều thời gian gấp', 'Sử dụng nhiều vật liệu hơn'] },
          { ten: 'Phương án 2: Cầu vòm cong', kieu: 'arch', dac_diem: ['Cấu trúc vòm cong', 'Chiều cao vòm: 5 cm', 'Dài cầu: 30 cm', 'Vật liệu: giấy A4 gấp định hình', 'Mối nối: dán keo'], uu: ['Tiết kiệm vật liệu', 'Thiết kế đơn giản, dễ làm', 'Tính thẩm mỹ cao'], han_che: ['Khó đảm bảo độ chính xác', 'Khả năng chịu lực thấp hơn so với giàn tam giác'] },
        ],
      },
      tep: TEP_DUC as never,
    },
  },
  ghi: {
    'B1.2': { m: 3, tc: 'CAO', ly: 'Giải thích được quan hệ hình dạng – độ cứng và có viện dẫn hiện tượng quan sát được (tờ phẳng võng nhiều, tờ gấp gần như không võng).' },
    'B1.3': { m: 2, tc: 'TRUNG_BINH', ly: 'Có nêu hàm ý nhưng chưa chỉ ra dòng dữ liệu nào dẫn tới hàm ý; lập luận còn dựa vào cảm nhận chung.', tiep: 'Kiểm B2.3 trước khi kết luận; cân nhắc gợi hỏi nhẹ' },
    'B2.3': { m: 3, ly: 'Dự đoán ưu/nhược có căn cứ từ kiến thức — loại trừ khả năng điểm nghẽn nằm ở kiến thức nền.' },
    'D1.2': { m: 3, tc: 'CAO' },
    'D3.2': { m: 3, ht: 'HT-0812-04', ly: 'Lí do thay đổi bám vào nguyên nhân đã xác định. Kết quả xuất hiện sau hướng dẫn của giáo viên.', tiep: 'Giao nhiệm vụ tương đương không hỗ trợ để kiểm chứng ĐỘC LẬP' },
    'D3.4': { q: 'KHONG_CO_CO_HOI', ly: 'Pha 5.3 (so sánh trước – sau) chưa được mở nên chưa có cơ hội thể hiện chỉ báo này.', tiep: 'Chờ Pha 5.3' },
    'D4.2': { q: 'KHONG_CO_CO_HOI', ly: 'Pha 5.4 (bảo vệ quyết định) chưa được mở.', tiep: 'Chờ Pha 5.4' },
  },
})

const hoangAnh = hoSo('HS0815', 'N02', {
  tienDo: 'xxxt-',
  mc: {
    E2: {
      noi_dung: {
        mo_ta_hs: 'Em phác hai phương án cầu giàn.',
        giai_thich: 'Gấp giấy làm giấy cứng hơn nên chịu được tải lớn hơn.',
        ham_y: 'Từ dòng "Dạng giàn 520 g", em chọn kết cấu giàn cho cả hai phương án.',
        dong_du_lieu_vien_dan: ['r5'],
        du_doan: 'Cả hai phương án đều sẽ chịu lực tốt vì đều là dạng giàn.',
        phuong_an: [
          { ten: 'Phương án 1: Giàn tam giác cao 4 cm', kieu: 'truss', dac_diem: ['Giàn tam giác', 'Chiều cao 4 cm'], uu: ['Cứng'], han_che: ['Tốn giấy'] },
          { ten: 'Phương án 2: Giàn tam giác cao 5 cm', kieu: 'truss', dac_diem: ['Giàn tam giác', 'Chiều cao 5 cm'], uu: ['Cứng hơn'], han_che: ['Tốn giấy hơn'] },
        ],
      },
      tep: [{ ten: 'BaoCao_HD2.pdf', loai: 'tai_lieu', dung_luong: '340 KB' }],
    },
  },
  ghi: {
    'B2.1': { m: 2, tc: 'TRUNG_BINH', ly: 'Có hai phương án nhưng khác biệt chủ yếu về hình thức (chiều cao 4 cm và 5 cm), chưa khác biệt về cách chịu lực.', tiep: 'Gợi hỏi về khác biệt kết cấu giữa hai phương án' },
  },
})

const giaHan = hoSo('HS0809', 'N02', {
  tienDo: 'xtxx-',
  mc: {
    E2: {
      tep: [{ ten: 'Thi_nghiem_1.mp4', loai: 'video', dung_luong: '3.2 MB', mo_ta: 'Video thí nghiệm' }],
      ly_do_trang_thai: 'Ô hàm ý thiết kế và phương án còn trống; mới nộp video thí nghiệm. Chưa đủ căn cứ để đánh giá.',
    },
  },
})

const giaBao = hoSo('HS0823', 'N02', {
  tienDo: 'xxxx-',
  mc: {
    E2: {
      trang_thai: 'CAN_XEM_XET',
      ly_do_trang_thai: 'Bảng dữ liệu cá nhân không ghi điều kiện thử (nhịp, loại giấy, thời gian giữ) nên chưa so sánh được với dữ liệu nhóm.',
      boi_canh_ho_tro: 'KHONG_RO',
      tep: [{ ten: 'Hinh_anh_thi_nghiem.jpg', loai: 'anh', dung_luong: '1.1 MB', mo_ta: 'Ảnh thí nghiệm cá nhân', kieu: 'plank', tone: 'wood' }],
    },
  },
  ghi: {
    'B1.2': { q: 'CAN_XEM_XET', ly: 'Dữ liệu cá nhân thiếu điều kiện thử, chưa so sánh được với dữ liệu nhóm.' },
    'B1.3': { q: 'CAN_XEM_XET', ly: 'Dữ liệu cá nhân thiếu điều kiện thử, chưa so sánh được với dữ liệu nhóm.' },
    'B2.1': { q: 'CAN_XEM_XET', ly: 'Dữ liệu cá nhân thiếu điều kiện thử, chưa so sánh được với dữ liệu nhóm.' },
    'B2.3': { q: 'CAN_XEM_XET', ly: 'Dữ liệu cá nhân thiếu điều kiện thử, chưa so sánh được với dữ liệu nhóm.' },
  },
})

const thuTrang = hoSo('HS0806', 'N01', {
  tienDo: 'xxxc-',
  mc: {
    E2: {
      noi_dung: {
        mo_ta_hs: 'Nhóm em thử năm cấu trúc và chọn giàn tam giác.',
        giai_thich: 'Gấp giấy làm mặt cắt cao lên nên khó uốn cong; tờ phẳng võng nhiều nhất trong bảng khảo sát của nhóm.',
        ham_y: 'Em nghĩ nên làm cầu giàn tam giác vì nó vững và chịu được tải lớn.',
        dong_du_lieu_vien_dan: [],
        du_doan: 'Giàn tam giác sẽ chịu lực tốt hơn vì phân tán lực đều.',
      },
    },
  },
  ghi: {
    'B1.2': { m: 3, tc: 'CAO' },
    'B1.3': { m: 2, ly: 'Nêu được hàm ý nhưng chưa chỉ ra dòng dữ liệu nào dẫn tới hàm ý.', tiep: 'Cân nhắc gợi hỏi nhẹ' },
  },
})

// Ca đã đi hết vòng: minh chứng mới sau hỗ trợ + trạng thái mới, giữ bản cũ
const E2_TRANG_V2: MinhChung = {
  ...structuredClone(thuTrang.mc.find((m) => m.id === 'E2-HS0806-01')!),
  id: 'E2-HS0806-01-v2', phien_ban: 2, minh_chung_truoc_id: 'E2-HS0806-01', thoi_diem: T(15, '13:10'),
  noi_dung: {
    mo_ta_hs: 'Nhóm em thử năm cấu trúc và chọn giàn tam giác.',
    giai_thich: 'Gấp giấy làm mặt cắt cao lên nên khó uốn cong; tờ phẳng võng nhiều nhất trong bảng khảo sát của nhóm.',
    ham_y: 'Từ dòng "Dạng giàn 520 g, biến dạng 2,4 mm" so với "tờ phẳng 80 g, 12,5 mm", em thấy nên dùng giàn tam giác để tăng độ cứng mà không tốn thêm giấy.',
    dong_du_lieu_vien_dan: ['r1', 'r5'],
    du_doan: 'Giàn tam giác sẽ chịu lực tốt hơn vì phân tán lực đều.',
  },
  boi_canh_ho_tro: 'CO_HO_TRO', ho_tro_id: 'HT-0806-01',
}
const DG_TRANG_V2: DanhGia = {
  id: 'DG-HS0806-B1.3-v2', hoc_sinh_id: 'HS0806', chi_bao: 'B1.3', muc: 3, rubric_id: RUBRIC_PHIEN_BAN,
  nguoi_danh_gia_id: 'GV01', thoi_diem: T(15, '14:00'), minh_chung_ids: ['E2-HS0806-01-v2', 'E2-N01-01'],
  danh_gia_truoc_id: 'DG-HS0806-B1.3',
  ly_do: 'Đã nối hàm ý với hai dòng dữ liệu cụ thể (tờ phẳng và dạng giàn). Kết quả xuất hiện sau gợi ý nhẹ.',
}
const TT_TRANG_V2: TrangThaiSDT = {
  id: 'TT-HS0806-B1.3-v2', hoc_sinh_id: 'HS0806', chi_bao: 'B1.3', muc: 3, trang_thai_chat_luong: 'HOP_LE',
  tinh_doc_lap: 'CO_HO_TRO', do_tin_cay: 'TRUNG_BINH', danh_gia_id: 'DG-HS0806-B1.3-v2', hoat_dong_pha: 'HĐ2 – Pha 2.3',
  thoi_diem: T(15, '14:00'), ly_do: 'Đạt mức 3 sau gợi ý nhẹ. Chưa có cơ hội tương đương không hỗ trợ để xác nhận độc lập.',
  trang_thai_truoc_id: 'TT-HS0806-B1.3', hanh_dong_tiep_theo: 'Giao nhiệm vụ tương đương sau lớp để kiểm độc lập', sau_ho_tro: true,
}

const khoa = hoSo('HS0820', 'N03', {
  tienDo: 'xxv--',
  mc: { E3: { noi_dung: { ly_do_ca_nhan: '' }, tep: [] } },
})

const HO_SO = [duc, hoangAnh, giaHan, giaBao, thuTrang, khoa]

export const MINH_CHUNG: MinhChung[] = [
  ...['N01', 'N02', 'N03'].flatMap(minhChungNhom),
  ...HO_SO.flatMap((h) => h.mc),
  E2_TRANG_V2,
]
export const DANH_GIA: DanhGia[] = [...HO_SO.flatMap((h) => h.dg), DG_TRANG_V2]
export const TRANG_THAI: TrangThaiSDT[] = [...HO_SO.flatMap((h) => h.tt), TT_TRANG_V2]

// ── Chẩn đoán → gợi ý → hỗ trợ → quyết định ────────────────────────────────
const loaiTruKhongApDung = (ds: string[]) => ds.map((mo_ta) => ({ mo_ta, da_kiem: true, ket_qua: 'KHONG_AP_DUNG' as const }))

export const CHAN_DOAN: ChanDoan[] = [
  {
    id: 'CD-0812-P01', ma_mau: 'P01', phien_ban_catalog: CATALOG_PHIEN_BAN, hoc_sinh_id: 'HS0812',
    gia_thuyet: 'Học sinh giải thích được quan hệ hình dạng – độ cứng – tải – biến dạng (B1.2 = M3), nhưng chưa dùng kết quả khảo sát của chính mình để rút ra hàm ý thiết kế (B1.3 = M2). Điểm nghẽn nằm ở bước dữ liệu → quyết định, không nằm ở kiến thức nền.',
    chi_bao_lien_quan: ['B1.2', 'B1.3'], trang_thai_ids: ['TT-HS0812-B1.2', 'TT-HS0812-B1.3'],
    minh_chung_ids: ['E2-HS0812-01', 'E2-N02-01'], do_tin_cay: 'TRUNG_BINH',
    dieu_kien_loai_tru: loaiTruKhongApDung([...P('P01').loai_tru, 'Kiểm thêm B2.3 — nếu B2.3 cũng thấp thì điểm nghẽn có thể ở kiến thức nền (B2.3 = M3: không áp dụng)']),
    thoi_diem: T(15, '14:32'),
  },
  {
    id: 'CD-0815-P04', ma_mau: 'P04', phien_ban_catalog: CATALOG_PHIEN_BAN, hoc_sinh_id: 'HS0815',
    gia_thuyet: P('P04').gia_thuyet + ' Hai phương án của học sinh đều là giàn tam giác, chỉ khác chiều cao 4 cm và 5 cm.',
    chi_bao_lien_quan: ['B2.1'], trang_thai_ids: ['TT-HS0815-B2.1'],
    minh_chung_ids: ['E2-HS0815-01', 'E2-N02-01'], do_tin_cay: 'TRUNG_BINH',
    dieu_kien_loai_tru: loaiTruKhongApDung(P('P04').loai_tru), thoi_diem: T(15, '14:35'),
  },
  {
    id: 'CD-0806-P01', ma_mau: 'P01', phien_ban_catalog: CATALOG_PHIEN_BAN, hoc_sinh_id: 'HS0806',
    gia_thuyet: P('P01').gia_thuyet, chi_bao_lien_quan: ['B1.2', 'B1.3'],
    trang_thai_ids: ['TT-HS0806-B1.2', 'TT-HS0806-B1.3'], minh_chung_ids: ['E2-HS0806-01', 'E2-N01-01'],
    do_tin_cay: 'TRUNG_BINH', dieu_kien_loai_tru: loaiTruKhongApDung(P('P01').loai_tru), thoi_diem: T(15, '10:10'),
  },
]

export const GOI_Y_AI: GoiYAI[] = [
  { id: 'AI-0812-01', chan_doan_id: 'CD-0812-P01', phien_ban_mau: `P01/mau_cau_hoi@${CATALOG_PHIEN_BAN}`, ban_nhap: P('P01').mau_cau_hoi[0], ban_sau_chinh: null, mau_chi_so: 0 },
  { id: 'AI-0815-01', chan_doan_id: 'CD-0815-P04', phien_ban_mau: `P04/mau_cau_hoi@${CATALOG_PHIEN_BAN}`, ban_nhap: P('P04').mau_cau_hoi[0], ban_sau_chinh: null, mau_chi_so: 0 },
  { id: 'AI-0806-01', chan_doan_id: 'CD-0806-P01', phien_ban_mau: `P01/mau_cau_hoi@${CATALOG_PHIEN_BAN}`, ban_nhap: P('P01').mau_cau_hoi[0],
    ban_sau_chinh: 'Trong bảng khảo sát của nhóm, dòng nào giúp em quyết định chọn cấu trúc giàn?', mau_chi_so: 0 },
]

const ht = (o: Partial<HoTro> & Pick<HoTro, 'id' | 'hoc_sinh_id' | 'noi_dung' | 'thoi_diem'>): HoTro => ({
  chan_doan_id: null, muc_ho_tro: 'NHE', cap: 2, loai: 'PHUONG_PHAP', nguon: 'AI', goi_y_ai_id: null,
  trang_thai_duyet: 'DA_DUYET', uu_tien: 'TB', nhiem_vu_id: 'NV-2.3', minh_chung_id: null,
  nhiem_vu_hau_kiem_id: null, ket_qua: null, ...o,
})

export const HO_TRO: HoTro[] = [
  // Lịch sử hỗ trợ của Trần Minh Đức (màn S08)
  ht({ id: 'HT-0812-01', hoc_sinh_id: 'HS0812', cap: 1, loai: 'GOI_Y_Y_TUONG', nguon: 'AI', nhiem_vu_id: 'NV-2.4',
    noi_dung: 'Nhắc: bài cần từ hai phương án khác nhau về cách chịu lực. Em đã có phương án thứ hai chưa?',
    ket_qua: 'Học sinh đã bổ sung phương án 2', thoi_diem: T(13, '15:40') }),
  ht({ id: 'HT-0812-02', hoc_sinh_id: 'HS0812', cap: 2, loai: 'LAM_RO', nguon: 'GV', nhiem_vu_id: 'NV-2.1',
    noi_dung: 'Giải thích tiêu chí đánh giá HĐ2', ket_qua: 'Học sinh nắm rõ yêu cầu, tiếp tục thực hiện', thoi_diem: T(14, '10:05') }),
  ht({ id: 'HT-0812-03', hoc_sinh_id: 'HS0812', cap: 1, loai: 'TAI_LIEU', nguon: 'AI', nhiem_vu_id: 'NV-2.1',
    noi_dung: 'Đề xuất xem video thí nghiệm cầu giấy (học liệu 2)', ket_qua: 'Học sinh đã xem tài liệu', thoi_diem: T(14, '16:20') }),
  ht({ id: 'HT-0812-04', hoc_sinh_id: 'HS0812', cap: 2, loai: 'GIAI_THICH', nguon: 'GV', nhiem_vu_id: 'NV-5.1',
    noi_dung: 'Hướng dẫn cách ước lượng tải trọng và so sánh phương án', ket_qua: 'Học sinh điều chỉnh phương án, tiến độ tăng', thoi_diem: T(15, '10:15') }),
  // Các ca đang chờ / đã xử lý (màn S14)
  ht({ id: 'HT-0812-05', hoc_sinh_id: 'HS0812', chan_doan_id: 'CD-0812-P01', goi_y_ai_id: 'AI-0812-01', loai: 'PHUONG_PHAP', nguon: 'AI',
    noi_dung: P('P01').mau_cau_hoi[0], trang_thai_duyet: 'CHO_DUYET', uu_tien: 'CAO', minh_chung_id: 'E2-HS0812-01',
    nhiem_vu_hau_kiem_id: 'NV-2.3', thoi_diem: T(15, '14:32') }),
  ht({ id: 'HT-0815-01', hoc_sinh_id: 'HS0815', chan_doan_id: 'CD-0815-P04', goi_y_ai_id: 'AI-0815-01', loai: 'PHUONG_PHAP', nguon: 'AI',
    noi_dung: P('P04').mau_cau_hoi[0], trang_thai_duyet: 'CHO_DUYET', uu_tien: 'TB', minh_chung_id: 'E2-HS0815-01',
    nhiem_vu_id: 'NV-2.4', nhiem_vu_hau_kiem_id: 'NV-2.4', thoi_diem: T(15, '14:35') }),
  ht({ id: 'HT-0809-01', hoc_sinh_id: 'HS0809', cap: 1, loai: 'BO_SUNG', nguon: 'AI',
    noi_dung: 'Em hãy bổ sung ô hàm ý thiết kế và ít nhất một phương án trước khi giáo viên đánh giá.',
    trang_thai_duyet: 'BO_SUNG', uu_tien: 'CAO', minh_chung_id: 'E2-HS0809-01', thoi_diem: T(14, '16:20') }),
  ht({ id: 'HT-0823-01', hoc_sinh_id: 'HS0823', cap: 1, loai: 'KY_THUAT', nguon: 'AI',
    noi_dung: 'Nhắc ghi điều kiện thử (nhịp, loại giấy, thời gian giữ tải) cho bảng dữ liệu cá nhân để so sánh được với dữ liệu nhóm.',
    trang_thai_duyet: 'CHO_DUYET', uu_tien: 'TB', minh_chung_id: 'E2-HS0823-01', thoi_diem: T(14, '10:05') }),
  ht({ id: 'HT-0806-01', hoc_sinh_id: 'HS0806', chan_doan_id: 'CD-0806-P01', goi_y_ai_id: 'AI-0806-01', loai: 'PHUONG_PHAP', nguon: 'AI',
    noi_dung: 'Trong bảng khảo sát của nhóm, dòng nào giúp em quyết định chọn cấu trúc giàn?', trang_thai_duyet: 'DA_DUYET', uu_tien: 'THAP',
    minh_chung_id: 'E2-HS0806-01', nhiem_vu_hau_kiem_id: 'NV-2.3',
    ket_qua: 'Học sinh nối hàm ý với hai dòng dữ liệu; giáo viên chấm lại B1.3 = M3 (CÓ HỖ TRỢ)', thoi_diem: T(15, '10:25') }),
]

export const QUYET_DINH: QuyetDinhGV[] = [
  { id: 'QD-0806-01', ho_tro_id: 'HT-0806-01', chan_doan_id: null, nguoi_thuc_hien_id: 'GV01', quyet_dinh: 'SUA',
    ly_do: 'Câu gốc còn chung; chỉnh cho gắn với dòng dữ liệu của nhóm, không nhắc tới giải pháp kết cấu.',
    gia_tri_truoc: P('P01').mau_cau_hoi[0], gia_tri_sau: 'Trong bảng khảo sát của nhóm, dòng nào giúp em quyết định chọn cấu trúc giàn?', thoi_diem: T(15, '10:25') },
]

// ── Quan sát trực tiếp của giáo viên (KHBD A.4) ─────────────────────────────
export const QUAN_SAT: QuanSat[] = [
  { id: 'QS-001', hoc_sinh_id: null, nhom_id: 'N02', hoat_dong_pha: 'HĐ4 – Pha 4.3', chi_bao: ['D1.2'], muc_ho_tro: 'KHONG',
    mo_ta: 'Nhóm ghi số liệu đủ từng nấc tải; Đức đọc số đo, Hoàng Anh ghi bảng. Khi cầu cong rõ ở nấc 800 g, nhóm dừng đủ 5 giây rồi mới tăng tải.',
    nguoi_quan_sat: 'Nguyễn Văn An', thoi_diem: T(14, '10:40') },
  { id: 'QS-002', hoc_sinh_id: 'HS0812', nhom_id: null, hoat_dong_pha: 'HĐ4 – Pha 4.4', chi_bao: ['D2.3'], muc_ho_tro: 'GOI_MO',
    mo_ta: 'Khi được hỏi vì sao cầu gãy ở thanh trên, Đức chỉ vào vị trí gãy và viện dẫn lần thử 6 (1200 g); nêu mối nối đã nứt từ nấc 1000 g. Cần một câu hỏi gợi mở để nối hai chi tiết.',
    nguoi_quan_sat: 'Nguyễn Văn An', thoi_diem: T(14, '11:05') },
]

export const TRAO_DOI: TraoDoi[] = [
  { id: 'TD-1', minh_chung_id: 'E1-HS0812-01', tac_gia: 'Nguyễn Văn An', vai_tro: 'GV', tieu_de: 'Nhận xét HĐ1 – Xác định vấn đề',
    noi_dung: 'Bài làm tốt, em xác định vấn đề rất rõ ràng. Hãy thử mở rộng thêm các yêu cầu kỹ thuật cần đo.', thoi_diem: T(14, '16:30') },
  { id: 'TD-2', minh_chung_id: 'E2-HS0812-01', tac_gia: 'Nguyễn Văn An', vai_tro: 'GV', tieu_de: 'Gợi ý cho HĐ2',
    noi_dung: 'Mô hình được hoàn thiện tốt, kết cấu rõ ràng. Em hãy bổ sung thêm video thử tải để minh chứng khả năng chịu lực của cầu.', thoi_diem: T(15, '11:30') },
  { id: 'TD-3', minh_chung_id: 'E2-HS0812-01', tac_gia: 'Trần Minh Đức', vai_tro: 'HS',
    noi_dung: 'Dạ vâng ạ, em đã bổ sung video thử tải ở mục Video ạ.', thoi_diem: T(15, '14:20') },
  { id: 'TD-4', minh_chung_id: 'E3-HS0812-01', tac_gia: 'Nguyễn Văn An', vai_tro: 'GV', tieu_de: 'Phản hồi bài nộp HĐ3',
    noi_dung: 'Tài liệu đầy đủ, bố cục rõ ràng. Tiếp tục phát huy và đối chiếu thêm với tiêu chí đã đặt ở HĐ1.', thoi_diem: T(15, '14:30') },
]

// ── Cấu hình bài học (S15) và nhật ký xuất dữ liệu (S16) ────────────────────
export const CAU_HINH_PHIEN_BAN: PhienBanCauHinh[] = [
  {
    id: 'v1.0', khoa: true, hien_tai: true, nguoi: 'Nguyễn Văn An', thoi_diem: T(15, '14:32'), ghi_chu: '',
    anh_xa: HOAT_DONG.map((h) => ({ hd: h.ma, ten: h.ten, chi_bao: h.chi_bao, minh_chung: h.minh_chung, quy_tac: `Bảng mô tả mức ${h.ma}` })),
  },
]

export const NHAT_KY_XUAT: BanGhiXuat[] = [
  { id: 'XK-5', thoi_diem: T(15, '14:32'), nguoi: 'Nguyễn Văn An', pham_vi: '10A1', loai: 'Minh chứng + Đánh giá', dinh_dang: 'CSV', so_ban_ghi: 284, muc_dich: 'Nghiên cứu' },
  { id: 'XK-4', thoi_diem: T(12, '09:15'), nguoi: 'Trần Thị Mai', pham_vi: '10A1, 10A2', loai: 'Tất cả dữ liệu', dinh_dang: 'Excel', so_ban_ghi: 512, muc_dich: 'Báo cáo phòng GD' },
  { id: 'XK-3', thoi_diem: T(5, '16:20'), nguoi: 'Lê Quốc Việt', pham_vi: '10A1', loai: 'Kết quả đánh giá', dinh_dang: 'CSV', so_ban_ghi: 96, muc_dich: 'Phân tích chất lượng' },
  { id: 'XK-2', thoi_diem: `2024-09-28T10:05:00+07:00`, nguoi: 'Nguyễn Văn An', pham_vi: '10A3', loai: 'Nhật ký học tập', dinh_dang: 'CSV', so_ban_ghi: 148, muc_dich: 'Nghiên cứu' },
  { id: 'XK-1', thoi_diem: `2024-09-20T14:18:00+07:00`, nguoi: 'Phạm Quang Bình', pham_vi: 'Toàn trường', loai: 'Tất cả dữ liệu', dinh_dang: 'Gói ZIP', so_ban_ghi: 1203, muc_dich: 'Lưu trữ học kỳ' },
]

export const NHOM_DEMO = NHOM
export const HOC_SINH_DEMO = HOC_SINH
