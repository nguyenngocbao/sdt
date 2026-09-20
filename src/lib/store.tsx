import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react'
import type { DuLieu } from './trace'
import type {
  AnhXaHD, BanGhiXuat, MinhChung, PhienBanCauHinh, QuanSat, TrangThaiSDT, DanhGia, TepDinhKem, VaiTro,
} from '../types'
import {
  CAU_HINH_PHIEN_BAN, CHAN_DOAN, DANH_GIA, GOI_Y_AI, HOC_SINH, HO_TRO, MINH_CHUNG, NHAT_KY_XUAT,
  NHIEM_VU, NHOM, QUAN_SAT, QUYET_DINH, TRANG_THAI, TRAO_DOI,
} from '../data/seed'
import { RUBRIC_PHIEN_BAN } from '../data/rubric'
import { layMau } from '../data/catalog'
import { bayGio, gio } from './time'

export type ManHinh = 'S01' | 'S02' | 'S03' | 'S04' | 'S05' | 'S06' | 'S08' | 'S09' | 'S10' | 'S12' | 'S14' | 'S15' | 'S16'
export type TabS04 = 'nhiem_vu' | 'khao_sat' | 'phuong_an' | 'nop'

export interface TrangThaiUng {
  du_lieu: DuLieu
  vai_tro: VaiTro
  hoc_sinh_hien_tai: string          // học sinh đang đăng nhập (vai trò HS)
  che_do_nghien_cuu: boolean
  man_hinh: ManHinh
  ho_so_dang_mo: string | null       // học sinh GV đang xem
  ca_dang_mo: string | null          // id hỗ trợ đang mở ở S14
  tab_s04: TabS04
  nhat_ky: string[]
  toast: { id: number; noi_dung: string } | null
}

const duLieuGoc = (): DuLieu => structuredClone({
  hoc_sinh: HOC_SINH, nhom: NHOM, nhiem_vu: NHIEM_VU, minh_chung: MINH_CHUNG,
  danh_gia: DANH_GIA, trang_thai: TRANG_THAI, chan_doan: CHAN_DOAN,
  goi_y_ai: GOI_Y_AI, ho_tro: HO_TRO, quyet_dinh: QUYET_DINH,
  quan_sat: QUAN_SAT, trao_doi: TRAO_DOI, cau_hinh: CAU_HINH_PHIEN_BAN, nhat_ky_xuat: NHAT_KY_XUAT,
  ghi_chu_gv: {
    HS0812: 'Các em đã có ý tưởng khá tốt. Hãy chú ý sử dụng dữ liệu từ thí nghiệm nhỏ để ước lượng tải trọng và so sánh khách quan giữa các phương án. Có thể tham khảo lại mục HĐ2 – Ví dụ minh họa về tính toán.',
  },
})

const banDau = (): TrangThaiUng => ({
  du_lieu: duLieuGoc(),
  vai_tro: 'GIAO_VIEN',
  hoc_sinh_hien_tai: 'HS0812',
  che_do_nghien_cuu: false,
  man_hinh: 'S10',
  ho_so_dang_mo: null,
  ca_dang_mo: 'HT-0812-05',
  tab_s04: 'nhiem_vu',
  nhat_ky: [],
  toast: null,
})

export const MAN_HINH_MAC_DINH: Record<VaiTro, ManHinh> = { HOC_SINH: 'S02', GIAO_VIEN: 'S10', QUAN_TRI: 'S15' }

export type HanhDong =
  | { kieu: 'HYDRATE_DU_LIEU'; du_lieu: DuLieu }
  | { kieu: 'DOI_VAI_TRO'; vai_tro: VaiTro }
  | { kieu: 'DOI_MAN_HINH'; man_hinh: ManHinh; hoc_sinh?: string; ca?: string; tab?: TabS04 }
  | { kieu: 'DOI_HOC_SINH'; hoc_sinh_id: string }
  | { kieu: 'BAT_CHE_DO_NGHIEN_CUU'; bat: boolean }
  | { kieu: 'TOAST'; noi_dung: string }
  | { kieu: 'SUA_GOI_Y'; goi_y_id: string; noi_dung: string }
  | { kieu: 'DOI_CAU_HOI_MAU'; goi_y_id: string }
  | { kieu: 'QUYET_DINH_HO_TRO'; id: string; ho_tro_id: string; quyet_dinh: 'DUYET' | 'SUA' | 'TU_CHOI' | 'YEU_CAU_THEM_MINH_CHUNG'; ly_do: string }
  | { kieu: 'HS_NOP_MOI'; id: string; hoc_sinh_id: string; nhom_id: string; ham_y: string; dong_vien_dan: string[]; du_doan: string; phuong_an: Record<string, unknown>[]; tep: TepDinhKem[] }
  | { kieu: 'HS_NOP_LAI'; id: string; minh_chung_id: string; ham_y: string; dong_vien_dan: string[]; du_doan: string; phuong_an?: Record<string, unknown>[]; tep?: TepDinhKem[] }
  | { kieu: 'HS_NOP_HOAT_DONG'; id: string; hoc_sinh_id: string; nhom_id: string; loai_minh_chung: 'E1' | 'E3' | 'E4' | 'E5'; nhiem_vu_id: string; chi_so_hoat_dong: number; noi_dung: Record<string, unknown>; tep: TepDinhKem[] }
  | { kieu: 'GV_CHAM'; ids: string[]; hoc_sinh_id: string; muc_theo_chi_bao: Record<string, 1 | 2 | 3 | 4>; ly_do: string; minh_chung_ids: string[] }
  | { kieu: 'YEU_CAU_BO_SUNG'; id: string; hoc_sinh_id: string; nhiem_vu_id: string; minh_chung_id: string; noi_dung: string }
  | { kieu: 'GHI_QUAN_SAT'; quan_sat: QuanSat }
  | { kieu: 'GUI_TRAO_DOI'; id: string; minh_chung_id: string; noi_dung: string }
  | { kieu: 'LUU_GHI_CHU_GV'; hoc_sinh_id: string; noi_dung: string }
  | { kieu: 'HS_XIN_GOI_Y'; id: string; hoc_sinh_id: string; noi_dung: string; nhiem_vu_id: string }
  | { kieu: 'NHAN_BAN_CAU_HINH'; id: string }
  | { kieu: 'SUA_ANH_XA'; id: string; hd: string; truong: keyof Pick<AnhXaHD, 'minh_chung' | 'quy_tac'> | 'chi_bao'; gia_tri: string }
  | { kieu: 'LUU_CAU_HINH'; id: string; ghi_chu: string }
  | { kieu: 'KHOA_CAU_HINH'; id: string }
  | { kieu: 'GHI_XUAT'; ban_ghi: BanGhiXuat }
  | { kieu: 'RESET' }

const ghi = (s: TrangThaiUng, dong: string) => [...s.nhat_ky, `${gio(bayGio())} · ${dong}`]
let toastId = 0
const toast = (noi_dung: string) => ({ id: ++toastId, noi_dung })

function reducer(s: TrangThaiUng, a: HanhDong): TrangThaiUng {
  const dl = s.du_lieu
  switch (a.kieu) {
    case 'HYDRATE_DU_LIEU':
      return { ...s, du_lieu: a.du_lieu }

    case 'DOI_VAI_TRO':
      return { ...s, vai_tro: a.vai_tro, man_hinh: MAN_HINH_MAC_DINH[a.vai_tro], ho_so_dang_mo: null }

    case 'DOI_MAN_HINH':
      return {
        ...s, man_hinh: a.man_hinh,
        ho_so_dang_mo: a.hoc_sinh ?? s.ho_so_dang_mo,
        ca_dang_mo: a.ca ?? s.ca_dang_mo,
        tab_s04: a.tab ?? (a.man_hinh === 'S04' ? s.tab_s04 : 'nhiem_vu'),
      }

    case 'DOI_HOC_SINH':
      return { ...s, hoc_sinh_hien_tai: a.hoc_sinh_id }

    case 'BAT_CHE_DO_NGHIEN_CUU':
      return { ...s, che_do_nghien_cuu: a.bat }

    case 'TOAST':
      return { ...s, toast: toast(a.noi_dung) }

    case 'SUA_GOI_Y': {
      const goi_y_ai = dl.goi_y_ai.map((g) => (g.id === a.goi_y_id ? { ...g, ban_sau_chinh: a.noi_dung } : g))
      const ho_tro = dl.ho_tro.map((h) => (h.goi_y_ai_id === a.goi_y_id ? { ...h, noi_dung: a.noi_dung } : h))
      return { ...s, du_lieu: { ...dl, goi_y_ai, ho_tro }, nhat_ky: ghi(s, 'GV chỉnh bản nháp gợi ý — lưu cả bản trước và sau') }
    }

    case 'DOI_CAU_HOI_MAU': {
      // Chỉ xoay vòng trong DANH SÁCH MẪU của catalog — không sinh câu hỏi tự do.
      const g = dl.goi_y_ai.find((x) => x.id === a.goi_y_id)
      const cd = g && dl.chan_doan.find((c) => c.id === g.chan_doan_id)
      const mau = cd && layMau(cd.ma_mau)
      if (!g || !mau) return s
      const idx = (g.mau_chi_so + 1) % mau.mau_cau_hoi.length
      const cau = mau.mau_cau_hoi[idx]
      const goi_y_ai = dl.goi_y_ai.map((x) => (x.id === g.id ? { ...x, mau_chi_so: idx, ban_nhap: cau } : x))
      const ho_tro = dl.ho_tro.map((h) => (h.goi_y_ai_id === g.id && h.trang_thai_duyet === 'CHO_DUYET' ? { ...h, noi_dung: cau } : h))
      return { ...s, du_lieu: { ...dl, goi_y_ai, ho_tro } }
    }

    case 'QUYET_DINH_HO_TRO': {
      const moi = a.quyet_dinh === 'TU_CHOI' ? 'TU_CHOI' : a.quyet_dinh === 'YEU_CAU_THEM_MINH_CHUNG' ? 'BO_SUNG' : 'DA_DUYET'
      const cu = dl.ho_tro.find((h) => h.id === a.ho_tro_id)
      const ho_tro = dl.ho_tro.map((h) => (h.id === a.ho_tro_id ? { ...h, trang_thai_duyet: moi as typeof h.trang_thai_duyet } : h))
      const quyet_dinh = [...dl.quyet_dinh, {
        id: a.id, ho_tro_id: a.ho_tro_id, chan_doan_id: cu?.chan_doan_id ?? null,
        nguoi_thuc_hien_id: 'GV01', quyet_dinh: a.quyet_dinh, ly_do: a.ly_do,
        gia_tri_truoc: cu?.trang_thai_duyet ?? null, gia_tri_sau: moi, thoi_diem: bayGio(),
      }]
      const ten = { DUYET: 'duyệt', SUA: 'chỉnh và gửi', TU_CHOI: 'từ chối', YEU_CAU_THEM_MINH_CHUNG: 'yêu cầu thêm minh chứng cho' }[a.quyet_dinh]
      return {
        ...s, du_lieu: { ...dl, ho_tro, quyet_dinh },
        nhat_ky: ghi(s, `GV ${ten} hỗ trợ ${a.ho_tro_id} — có ghi lí do`),
        toast: toast(`Đã ghi quyết định: ${ten} hỗ trợ. Lí do và giá trị trước–sau được lưu.`),
      }
    }

    case 'HS_NOP_LAI': {
      const cu = dl.minh_chung.find((m) => m.id === a.minh_chung_id)
      if (!cu) return s
      const ht = dl.ho_tro.find((h) => h.hoc_sinh_id === cu.hoc_sinh_id && h.trang_thai_duyet === 'DA_DUYET' && h.minh_chung_id === cu.id)
      const nd = cu.noi_dung as Record<string, unknown>
      const moi: MinhChung = {
        ...structuredClone(cu),
        id: a.id, ma_minh_chung: cu.ma_minh_chung, phien_ban: cu.phien_ban + 1,
        noi_dung: { ...nd, ham_y: a.ham_y, dong_du_lieu_vien_dan: a.dong_vien_dan, du_doan: a.du_doan, ...(a.phuong_an ? { phuong_an: a.phuong_an } : {}) },
        tep: a.tep ? [...cu.tep, ...a.tep] : cu.tep,
        thoi_diem: bayGio(), minh_chung_truoc_id: cu.id,
        // Kết quả xuất hiện SAU hỗ trợ → không được coi là độc lập
        boi_canh_ho_tro: ht ? 'CO_HO_TRO' : cu.boi_canh_ho_tro, ho_tro_id: ht?.id ?? cu.ho_tro_id,
        trang_thai: 'HOP_LE', ly_do_trang_thai: null,
      }
      return {
        ...s, du_lieu: { ...dl, minh_chung: [...dl.minh_chung, moi] },
        nhat_ky: ghi(s, `HS nộp ${moi.ma_minh_chung} phiên bản ${moi.phien_ban} — bản cũ được giữ nguyên`),
        toast: toast(`Đã nộp phiên bản ${moi.phien_ban}. Bản ${cu.phien_ban} vẫn được giữ nguyên trong hồ sơ.`),
      }
    }

    case 'HS_NOP_MOI': {
      const moi: MinhChung = {
        id: a.id, ma_minh_chung: `E2-${a.hoc_sinh_id}-01`, phien_ban: 1,
        // Khi nhóm chưa nộp dữ liệu chung, chưa gắn cha để tránh giả vờ có minh chứng nhóm.
        minh_chung_cha_id: dl.minh_chung.some((m) => m.id === `E2-${a.nhom_id}-01`) ? `E2-${a.nhom_id}-01` : null,
        loai_chu_the: 'CA_NHAN', hoc_sinh_id: a.hoc_sinh_id, nhom_id: null,
        nhiem_vu_id: 'NV-2.3', loai_minh_chung: 'E2',
        noi_dung: { ham_y: a.ham_y, dong_du_lieu_vien_dan: a.dong_vien_dan, du_doan: a.du_doan, phuong_an: a.phuong_an },
        tep: a.tep, nguoi_tao_id: a.hoc_sinh_id, nhap_ho: false, thoi_diem: bayGio(),
        trang_thai: 'HOP_LE', ly_do_trang_thai: null, boi_canh_ho_tro: 'DOC_LAP', ho_tro_id: null, minh_chung_truoc_id: null,
      }
      const hoc_sinh = dl.hoc_sinh.map((h) => h.id !== a.hoc_sinh_id ? h : { ...h, tien_do: `${h.tien_do.slice(0, 1)}c${h.tien_do.slice(2)}` })
      return {
        ...s, du_lieu: { ...dl, hoc_sinh, minh_chung: [...dl.minh_chung, moi] },
        nhat_ky: ghi(s, `HS nộp ${moi.ma_minh_chung} phiên bản đầu tiên`),
        toast: toast('Đã nộp minh chứng đầu tiên. Giáo viên sẽ đối chiếu rubric trước khi kết luận mức.'),
      }
    }

    case 'HS_NOP_HOAT_DONG': {
      const cu = dl.minh_chung
        .filter((m) => m.hoc_sinh_id === a.hoc_sinh_id && m.loai_minh_chung === a.loai_minh_chung)
        .sort((x, y) => y.phien_ban - x.phien_ban)[0]
      const canCha = a.loai_minh_chung === 'E3' || a.loai_minh_chung === 'E4'
      const idCha = `${a.loai_minh_chung}-${a.nhom_id}-01`
      const moi: MinhChung = {
        ...(cu ? structuredClone(cu) : {}),
        id: a.id, ma_minh_chung: cu?.ma_minh_chung ?? `${a.loai_minh_chung}-${a.hoc_sinh_id}-01`, phien_ban: (cu?.phien_ban ?? 0) + 1,
        minh_chung_cha_id: cu?.minh_chung_cha_id ?? (canCha && dl.minh_chung.some((m) => m.id === idCha) ? idCha : null),
        loai_chu_the: 'CA_NHAN', hoc_sinh_id: a.hoc_sinh_id, nhom_id: null, nhiem_vu_id: a.nhiem_vu_id, loai_minh_chung: a.loai_minh_chung,
        noi_dung: a.noi_dung, tep: cu ? [...cu.tep, ...a.tep] : a.tep, nguoi_tao_id: a.hoc_sinh_id, nhap_ho: false,
        thoi_diem: bayGio(), trang_thai: 'HOP_LE', ly_do_trang_thai: null,
        boi_canh_ho_tro: cu?.boi_canh_ho_tro ?? 'DOC_LAP', ho_tro_id: cu?.ho_tro_id ?? null, minh_chung_truoc_id: cu?.id ?? null,
      }
      const hoc_sinh = dl.hoc_sinh.map((h) => h.id !== a.hoc_sinh_id ? h : { ...h, tien_do: `${h.tien_do.slice(0, a.chi_so_hoat_dong)}c${h.tien_do.slice(a.chi_so_hoat_dong + 1)}` })
      return {
        ...s, du_lieu: { ...dl, hoc_sinh, minh_chung: [...dl.minh_chung, moi] },
        nhat_ky: ghi(s, `HS nộp ${moi.ma_minh_chung} phiên bản ${moi.phien_ban}`),
        toast: toast(cu ? `Đã lưu phiên bản ${moi.phien_ban}; bản trước vẫn giữ nguyên.` : 'Đã nộp minh chứng đầu tiên. Giáo viên sẽ đối chiếu rubric.'),
      }
    }

    case 'GV_CHAM': {
      const dgs: DanhGia[] = []
      const tts: TrangThaiSDT[] = []
      const mc = a.minh_chung_ids.map((id) => dl.minh_chung.find((m) => m.id === id)).filter((m): m is MinhChung => !!m)
      const coHoTro = mc.some((m) => m.boi_canh_ho_tro === 'CO_HO_TRO')
      const t = bayGio()
      Object.entries(a.muc_theo_chi_bao).forEach(([cb, muc], i) => {
        const truoc = dl.trang_thai.filter((x) => x.hoc_sinh_id === a.hoc_sinh_id && x.chi_bao === cb).sort((x, y) => y.thoi_diem.localeCompare(x.thoi_diem))[0] ?? null
        const idDg = `${a.ids[i]}-dg`
        dgs.push({ id: idDg, hoc_sinh_id: a.hoc_sinh_id, chi_bao: cb, muc, rubric_id: RUBRIC_PHIEN_BAN, nguoi_danh_gia_id: 'GV01',
          ly_do: a.ly_do, thoi_diem: t, minh_chung_ids: a.minh_chung_ids, danh_gia_truoc_id: truoc?.danh_gia_id ?? null })
        tts.push({ id: `${a.ids[i]}-tt`, hoc_sinh_id: a.hoc_sinh_id, chi_bao: cb, muc, trang_thai_chat_luong: 'HOP_LE',
          tinh_doc_lap: coHoTro ? 'CO_HO_TRO' : 'DOC_LAP', do_tin_cay: 'TRUNG_BINH', danh_gia_id: idDg,
          hoat_dong_pha: truoc?.hoat_dong_pha ?? '—', ly_do: a.ly_do, trang_thai_truoc_id: truoc?.id ?? null,
          hanh_dong_tiep_theo: coHoTro ? 'Giao nhiệm vụ tương đương không hỗ trợ để kiểm chứng ĐỘC LẬP' : null,
          thoi_diem: t, sau_ho_tro: coHoTro })
      })
      return {
        ...s, du_lieu: { ...dl, danh_gia: [...dl.danh_gia, ...dgs], trang_thai: [...dl.trang_thai, ...tts] },
        nhat_ky: ghi(s, `GV chốt ${Object.entries(a.muc_theo_chi_bao).map(([c, m]) => `${c}=M${m}`).join(', ')}${coHoTro ? ' · CÓ HỖ TRỢ (không tự nâng thành ĐỘC LẬP)' : ''}`),
        toast: toast(coHoTro
          ? 'Đã lưu đánh giá. Minh chứng xuất hiện sau hỗ trợ nên trạng thái ghi CÓ HỖ TRỢ, không tự nâng thành ĐỘC LẬP.'
          : 'Đã lưu đánh giá. Bản ghi trước vẫn được giữ nguyên.'),
      }
    }

    case 'YEU_CAU_BO_SUNG': {
      const moi = {
        id: a.id, chan_doan_id: null, hoc_sinh_id: a.hoc_sinh_id, muc_ho_tro: 'NHE' as const, cap: 1 as const,
        loai: 'BO_SUNG' as const, nguon: 'GV' as const, noi_dung: a.noi_dung, goi_y_ai_id: null,
        trang_thai_duyet: 'BO_SUNG' as const, uu_tien: 'CAO' as const, nhiem_vu_id: a.nhiem_vu_id,
        minh_chung_id: a.minh_chung_id, nhiem_vu_hau_kiem_id: a.nhiem_vu_id, ket_qua: null, thoi_diem: bayGio(),
      }
      return { ...s, du_lieu: { ...dl, ho_tro: [moi, ...dl.ho_tro] }, toast: toast('Đã gửi yêu cầu bổ sung minh chứng. Chưa chấm — thiếu minh chứng không bị coi là mức thấp.'), nhat_ky: ghi(s, 'GV yêu cầu bổ sung minh chứng') }
    }

    case 'GHI_QUAN_SAT':
      return { ...s, du_lieu: { ...dl, quan_sat: [a.quan_sat, ...dl.quan_sat] }, toast: toast('Đã ghi quan sát — mô tả hành vi, không gắn nhãn.'), nhat_ky: ghi(s, 'GV ghi một quan sát trực tiếp') }

    case 'GUI_TRAO_DOI': {
      const vai = s.vai_tro === 'HOC_SINH' ? 'HS' : 'GV'
      const ten = vai === 'HS' ? (dl.hoc_sinh.find((h) => h.id === s.hoc_sinh_hien_tai)?.ho_ten ?? 'Học sinh') : 'Nguyễn Văn An'
      return { ...s, du_lieu: { ...dl, trao_doi: [...dl.trao_doi, { id: a.id, minh_chung_id: a.minh_chung_id, tac_gia: ten, vai_tro: vai, noi_dung: a.noi_dung, thoi_diem: bayGio() }] } }
    }

    case 'LUU_GHI_CHU_GV':
      return { ...s, du_lieu: { ...dl, ghi_chu_gv: { ...dl.ghi_chu_gv, [a.hoc_sinh_id]: a.noi_dung } }, toast: toast('Đã lưu ghi chú của giáo viên.') }

    case 'HS_XIN_GOI_Y': {
      // Mức nhẹ, gắn với NHIỆM VỤ, không cần biết trạng thái năng lực → thuộc "làn nhanh" (SPEC-hop-nhat mục 4).
      const moi = {
        id: a.id, chan_doan_id: null, hoc_sinh_id: a.hoc_sinh_id, muc_ho_tro: 'NHE' as const, cap: 1 as const,
        loai: 'GOI_Y_Y_TUONG' as const, nguon: 'AI' as const, noi_dung: a.noi_dung, goi_y_ai_id: null,
        trang_thai_duyet: 'DA_DUYET' as const, uu_tien: 'THAP' as const, nhiem_vu_id: a.nhiem_vu_id,
        minh_chung_id: null, nhiem_vu_hau_kiem_id: null, ket_qua: null, thoi_diem: bayGio(),
      }
      return { ...s, du_lieu: { ...dl, ho_tro: [moi, ...dl.ho_tro] }, toast: toast('Đã ghi yêu cầu hỗ trợ. Gợi ý nhẹ gắn với nhiệm vụ, không cần chờ giáo viên chấm.'), nhat_ky: ghi(s, 'HS xin thêm gợi ý (làn nhanh)') }
    }

    case 'NHAN_BAN_CAU_HINH': {
      const goc = dl.cau_hinh.find((c) => c.hien_tai) ?? dl.cau_hinh[0]
      const so = dl.cau_hinh.length
      const moi: PhienBanCauHinh = { ...structuredClone(goc), id: `v1.${so}`, khoa: false, hien_tai: false, nguoi: 'Nguyễn Văn An', thoi_diem: bayGio(), ghi_chu: '' }
      return { ...s, du_lieu: { ...dl, cau_hinh: [moi, ...dl.cau_hinh] }, toast: toast(`Đã nhân bản thành ${moi.id} (bản nháp). Phiên bản đang chạy ${goc.id} không bị đụng tới.`) }
    }

    case 'SUA_ANH_XA': {
      const cau_hinh = dl.cau_hinh.map((c) => {
        if (c.id !== a.id || c.khoa) return c   // không sửa phiên bản đã khoá
        return { ...c, anh_xa: c.anh_xa.map((r) => r.hd !== a.hd ? r
          : a.truong === 'chi_bao' ? { ...r, chi_bao: a.gia_tri.split(/[,\s]+/).map((x) => x.trim()).filter(Boolean) }
          : { ...r, [a.truong]: a.gia_tri }) }
      })
      return { ...s, du_lieu: { ...dl, cau_hinh } }
    }

    case 'LUU_CAU_HINH': {
      const cau_hinh = dl.cau_hinh.map((c) => (c.id === a.id && !c.khoa ? { ...c, ghi_chu: a.ghi_chu, thoi_diem: bayGio() } : c))
      return { ...s, du_lieu: { ...dl, cau_hinh }, toast: toast(`Đã lưu cấu hình ${a.id}.`), nhat_ky: ghi(s, `Lưu cấu hình ${a.id}`) }
    }

    case 'KHOA_CAU_HINH': {
      const cau_hinh = dl.cau_hinh.map((c) => (c.id === a.id ? { ...c, khoa: true } : c))
      return { ...s, du_lieu: { ...dl, cau_hinh }, toast: toast(`Đã khoá ${a.id}. Từ nay chỉ nhân bản được, không sửa lại.`), nhat_ky: ghi(s, `Khoá phiên bản ${a.id}`) }
    }

    case 'GHI_XUAT':
      return { ...s, du_lieu: { ...dl, nhat_ky_xuat: [a.ban_ghi, ...dl.nhat_ky_xuat] }, nhat_ky: ghi(s, `Xuất dữ liệu: ${a.ban_ghi.so_ban_ghi} bản ghi (${a.ban_ghi.dinh_dang})`) }

    case 'RESET':
      return banDau()
  }
}

const Ctx = createContext<{ s: TrangThaiUng; d: Dispatch<HanhDong> } | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [s, d] = useReducer(reducer, undefined, banDau)
  return <Ctx.Provider value={{ s, d }}>{children}</Ctx.Provider>
}

export function useApp() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp phải nằm trong AppProvider')
  return v
}
