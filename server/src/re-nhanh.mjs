// Luật M3: hàm thuần, không DB/AI. Phiếu trước xếp mới nhất trước;
// mỗi phiếu trước mang lan_thu lấy từ bảng thật, không từ JSON tóm tắt.
const chu = (v) => typeof v === 'string' ? v.trim() : ''
const so = (v) => (typeof v === 'number' && Number.isFinite(v) && v >= 0) ? v : null
const trich = (v) => JSON.stringify(v ?? null)
const co = (v) => v !== null && v !== undefined && v !== ''
const khac = (a, b) => co(a) && co(b) && a !== b
const taiMax = (ds) => {
  const tai = ds.map((l) => so(l.tai_g)).filter((v) => v !== null)
  return tai.length ? Math.max(...tai) : null
}
const dieuKienKhac = (a, b) => khac(chu(a.vi_tri), chu(b.vi_tri)) || khac(so(a.giu_giay), so(b.giu_giay))
const bangThu = (ds) => ds.map((l) => `lần ${l.lan}: tai_g=${trich(l.tai_g)}, vi_tri=${trich(l.vi_tri)}, giu_giay=${trich(l.giu_giay)}, bien_dang=${trich(l.bien_dang)}, dang_hong=${trich(l.dang_hong)}`).join('; ')
const VI_TRI = ['giữa nhịp', 'lệch tâm', 'mép điểm tựa']

// M2 tách vị trí (bien_dang) khỏi kiểu hỏng (dang_hong). Khi ô dự đoán/
// nhắm vào là một vị trí đã cấu trúc, so với vị trí, tránh so hai đại lượng khác nhau.
const choHong = (lan, duDoan) => VI_TRI.includes(duDoan) ? chu(lan.bien_dang) || chu(lan.dang_hong) : chu(lan.dang_hong)

export function reNhanh(phieu, lanThu = [], phieuTruoc = []) {
  if (!['E4', 'E5'].includes(phieu.loai)) return []
  const d = phieu.noi_dung ?? {}
  const truoc = phieuTruoc.filter((p) => p.ma_hs === phieu.ma_hs && (phieu.id == null || p.id == null || String(p.id) !== String(phieu.id)))
  const e2 = truoc.find((p) => p.loai === 'E2')
  const nhanh = []
  const them = (ma_nhanh, can_cu, cau_mau) => nhanh.push({ ma_nhanh, can_cu, cau_mau })

  if (phieu.loai === 'E4') {
    if (lanThu.some((a, i) => lanThu.slice(i + 1).some((b) => dieuKienKhac(a, b)))) {
      const baCho = lanThu.length === 3 && new Set(lanThu.map((l) => chu(l.vi_tri)).filter(Boolean)).size === 3
      them('N4.1', bangThu(lanThu), baCho
        ? 'Ba lần thử của em đặt tải ở ba chỗ khác nhau. Như vậy chưa so sánh được với nhau. Em có thể thử cùng điều kiện không?'
        : 'Các lần thử của em khác vị trí đặt tải hoặc thời gian giữ. Như vậy chưa so sánh được với nhau. Em có thể thử cùng điều kiện không?')
    }
    const duDoan = so(d.du_doan_tai_g) ?? so(e2?.noi_dung?.du_doan_tai_g)
    const tai = taiMax(lanThu)
    if (duDoan !== null && duDoan > 0 && tai !== null && Math.abs(tai - duDoan) * 100 > duDoan * 20) {
      them('N4.2', `du_doan_tai_g=${duDoan}; tai_g lớn nhất=${tai}; lệch=${Math.abs(tai - duDoan) / duDoan * 100}%; ${bangThu(lanThu)}`,
        `Em đoán ${duDoan} g, thật ${tai} g. Điều gì em chưa tính tới?`)
    }
    const yeu = chu(e2?.noi_dung?.cho_doan_yeu)
    const lech = lanThu.filter((l) => khac(choHong(l, yeu), yeu))
    if (yeu && lech.length) {
      them('N4.3', `E2 cho_doan_yeu=${trich(e2.noi_dung.cho_doan_yeu)}; ${bangThu(lech)}`,
        `Cầu em gãy ở ${choHong(lech[0], yeu)} chứ không phải ${yeu} như em đoán. Chỗ đó chịu lực khác chỗ giữa thế nào?`)
    }
    if (!chu(d.nguyen_nhan_han_che)) {
      them('N4.4', `nguyen_nhan_han_che=${trich(d.nguyen_nhan_han_che)}; ${bangThu(lanThu)}`, 'Theo em vì sao nó hỏng ở đó?')
    } else if (!co(d.minh_chung_vien_dan) || (typeof d.minh_chung_vien_dan === 'string' && !d.minh_chung_vien_dan.trim())) {
      them('N4.5', `nguyen_nhan_han_che=${trich(d.nguyen_nhan_han_che)}; minh_chung_vien_dan=${trich(d.minh_chung_vien_dan)}; ${bangThu(lanThu)}`, 'Lần thử nào cho em thấy điều đó?')
    }
    return nhanh
  }

  // Không dùng E4 của em khác; nếu E5 chỉ rõ E4, không tự đổi sang bản khác.
  const e4 = truoc.find((p) => p.loai === 'E4' && (!co(d.e4_phieu_id) || String(p.id) === String(d.e4_phieu_id)))
  if (!e4) return nhanh
  const v1 = e4.lan_thu ?? []
  const nham = chu(d.nham_vao_nguyen_nhan)
  // Ô chọn M2 lấy nguyên nhân từ chính E4. Chọn đúng một nguyên nhân đã ghi
  // không phải bằng chứng "sửa sai chỗ"; không dùng AI suy đoán ý câu chữ.
  const nguyenNhan = chu(e4.noi_dung?.nguyen_nhan_han_che).split(/[\n;.!?]+/).map(chu).filter(Boolean)
  const lech = v1.filter((l) => khac(choHong(l, nham), nham))
  if (nham && !nguyenNhan.includes(nham) && lech.length) {
    them('N5.1', `E5 nham_vao_nguyen_nhan=${trich(d.nham_vao_nguyen_nhan)}; E4 ${bangThu(lech)}`,
      `Cầu em gãy ở ${choHong(lech[0], nham)} mà em gia cố ${nham}. Vậy chênh lệch sẽ đến từ đâu?`)
  }
  const tai1 = taiMax(v1), tai2 = taiMax(lanThu)
  if (tai1 !== null && tai2 !== null && tai2 < tai1) {
    them('N5.3', `E4 tai_g lớn nhất=${tai1}; E5 tai_g lớn nhất=${tai2}; E4 ${bangThu(v1)}; E5 ${bangThu(lanThu)}`,
      'Vì sao lần này chịu kém hơn? Điều kiện thử có giống lần trước không?')
  }
  if (v1.some((a) => lanThu.some((b) => dieuKienKhac(a, b)))) {
    them('N5.4', `E4 ${bangThu(v1)}; E5 ${bangThu(lanThu)}`,
      'Hai phiên bản thử khác điều kiện nên chưa kết luận được mức cải thiện. Em có thể thử hai phiên bản cùng điều kiện không?')
  }
  // N5.2 cần AI đọc giải thích, thuộc M6.
  return nhanh
}
