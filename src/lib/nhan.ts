/** Nhãn tiếng Việt dùng chung cho các chip trạng thái. */
export const nhanTrangThai = (t: string) =>
  ({
    KHONG_CO_CO_HOI: 'KHÔNG CÓ CƠ HỘI',
    THIEU_MINH_CHUNG: 'THIẾU MINH CHỨNG',
    CAN_XEM_XET: 'CẦN XEM XÉT',
    HOP_LE: 'HỢP LỆ',
  }[t] ?? t)

export const nhanDocLap = (t: string) =>
  ({ DOC_LAP: 'ĐỘC LẬP', CO_HO_TRO: 'CÓ HỖ TRỢ', KHONG_RO: 'CHƯA RÕ' }[t] ?? t)
