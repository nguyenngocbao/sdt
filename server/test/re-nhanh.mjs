import assert from 'node:assert/strict'
import { reNhanh } from '../src/re-nhanh.mjs'

const lan = (doi = {}) => ({ lan: 1, tai_g: 600, giu_giay: 5, vi_tri: 'giữa nhịp', bien_dang: 'mép điểm tựa', dang_hong: 'gãy gập', ...doi })
const e4 = (doi = {}) => ({ id: '4', ma_hs: 'A', loai: 'E4', noi_dung: { nguyen_nhan_han_che: 'giấy mỏng', minh_chung_vien_dan: 1, ...doi } })
const e2 = (doi = {}) => ({ id: '2', ma_hs: 'A', loai: 'E2', noi_dung: { du_doan_tai_g: 600, cho_doan_yeu: 'gãy gập', ...doi } })
const e5 = (doi = {}) => ({ id: '5', ma_hs: 'A', loai: 'E5', noi_dung: { nham_vao_nguyen_nhan: 'giấy mỏng', e4_phieu_id: '4', ...doi } })
const v1 = (ds = [lan()], doi = {}) => ({ ...e4(doi), lan_thu: ds })
const cases = [
  ['N4.1 ba vị trí', e4(), [lan(), lan({ lan: 2, vi_tri: 'lệch tâm' }), lan({ lan: 3, vi_tri: 'mép điểm tựa' })], [], ['N4.1']],
  ['N4.1 thời gian giữ, kể cả 0', e4(), [lan({ giu_giay: 0 }), lan({ lan: 2 })], [], ['N4.1']],
  ['N4.2 đoán 800 thật 600', e4(), [lan()], [e2({ du_doan_tai_g: 800 })], ['N4.2']],
  ['N4.2 vượt dự đoán, dùng tải lớn nhất', e4({ du_doan_tai_g: 400 }), [lan({ tai_g: 450 }), lan({ lan: 2, tai_g: 600 })], [], ['N4.2']],
  ['N4.3 khác dạng hỏng E2', e4(), [lan()], [e2({ cho_doan_yeu: 'bung nối' })], ['N4.3']],
  ['N4.3 vị trí M2: so bien_dang', e4(), [lan()], [e2({ cho_doan_yeu: 'giữa nhịp' })], ['N4.3']],
  ['N4.4 nguyên nhân chỉ khoảng trắng', e4({ nguyen_nhan_han_che: '  \n' }), [lan()], [], ['N4.4']],
  ['N4.4 không có ô nguyên nhân, không sinh N4.5', { id: '4', ma_hs: 'A', loai: 'E4', noi_dung: {} }, [], [], ['N4.4']],
  ['N4.5 có nguyên nhân thiếu minh chứng', e4({ minh_chung_vien_dan: null }), [lan()], [], ['N4.5']],
  ['N4.5 minh chứng khoảng trắng', e4({ minh_chung_vien_dan: ' \t' }), [lan()], [], ['N4.5']],
  ['N5.1 nhắm sai dạng hỏng', e5({ nham_vao_nguyen_nhan: 'bung nối' }), [lan()], [v1()], ['N5.1']],
  ['N5.1 nhắm sai vị trí M2', e5({ nham_vao_nguyen_nhan: 'giữa nhịp' }), [lan()], [v1()], ['N5.1']],
  ['N5.3 tải v2 giảm', e5(), [lan({ tai_g: 500 })], [v1()], ['N5.3']],
  ['N5.3 tải v2 bằng 0 vẫn là số liệu', e5(), [lan({ tai_g: 0 })], [v1()], ['N5.3']],
  ['N5.4 vị trí đặt tải đổi', e5(), [lan({ vi_tri: 'lệch tâm' })], [v1()], ['N5.4']],
  ['N5.4 giây giữ đổi ở lần thứ hai', e5(), [lan(), lan({ lan: 2, giu_giay: 10 })], [v1()], ['N5.4']],
  ['Biên 20% không rẽ, E2 mới nhất được dùng', e4(), [lan()], [e2({ du_doan_tai_g: 750 }), { ...e2({ du_doan_tai_g: 1000 }), id: '1' }], []],
  ['Đa nhánh E4, không trộn dữ liệu em khác', e4({ minh_chung_vien_dan: null }), [lan(), lan({ lan: 2, vi_tri: 'lệch tâm' })], [{ ...e2({ du_doan_tai_g: 1000 }), ma_hs: 'B' }, e2({ du_doan_tai_g: 800, cho_doan_yeu: 'bung nối' })], ['N4.1', 'N4.2', 'N4.3', 'N4.5']],
  ['E5 đủ dữ liệu, nguyên nhân chính em chọn, không chạy N5.2', e5({ giai_thich: 'tốt hơn' }), [lan({ tai_g: 800 })], [v1()], []],
  ['Không E4 tham chiếu: không lấy E4 khác hoặc em khác', e5({ e4_phieu_id: '99' }), [lan({ tai_g: 100 })], [v1(), { ...v1(), id: '99', ma_hs: 'B' }], []],
]

const tuCam = /(?<![\p{L}\p{N}])(ống|gấp nếp|thanh giằng|tam giác|dầm|nên dùng)(?![\p{L}\p{N}])/iu
const daPhu = new Set()
for (const [i, [ten, phieu, lanThu, truoc, mongDoi]] of cases.entries()) {
  try {
    const input = structuredClone({ phieu, lanThu, truoc })
    const dongBang = (v) => { if (v && typeof v === 'object') { Object.freeze(v); Object.values(v).forEach(dongBang) } }
    dongBang(input)
    const result = reNhanh(input.phieu, input.lanThu, input.truoc)
    assert.deepEqual(result.map((n) => n.ma_nhanh), mongDoi)
    assert.deepEqual(result, reNhanh(input.phieu, input.lanThu, input.truoc), 'Hàm phải tất định')
    for (const nhanh of result) {
      daPhu.add(nhanh.ma_nhanh)
      assert.ok(nhanh.can_cu.length > 0)
      assert.ok(nhanh.cau_mau.endsWith('?'), 'Gợi ý phải là câu hỏi')
      assert.ok(!tuCam.test(nhanh.cau_mau), 'Câu mẫu chứa từ chỉ giải pháp')
      if (nhanh.ma_nhanh === 'N4.2') {
        assert.ok(nhanh.can_cu.includes('600'))
        assert.ok(nhanh.can_cu.includes(String(phieu.noi_dung.du_doan_tai_g ?? truoc.find((p) => p.ma_hs === phieu.ma_hs).noi_dung.du_doan_tai_g)))
      }
    }
    console.log(`PASS ${i + 1}: ${ten} → ${mongDoi.join(', ') || 'không nhánh'}`)
  } catch (error) {
    console.error(`FAIL ${i + 1}: ${ten} — ${error.message}`)
    process.exitCode = 1
  }
}
assert.deepEqual([...daPhu].sort(), ['N4.1', 'N4.2', 'N4.3', 'N4.4', 'N4.5', 'N5.1', 'N5.3', 'N5.4'])
// Dữ liệu thiếu không thành số 0; phiếu E2/tiết 1–2 hoàn toàn không rẽ nhánh.
assert.deepEqual(reNhanh(e4({ du_doan_tai_g: null }), [lan({ tai_g: null, giu_giay: null })], []), [])
assert.deepEqual(reNhanh(e2(), [lan()], []), [])
assert.deepEqual(reNhanh(e4({ du_doan_tai_g: 0 }), [lan()], []), [])
assert.deepEqual(reNhanh(e5(), [lan({ tai_g: null })], [v1()]), [])
const samePlace = e2({ cho_doan_yeu: 'mép điểm tựa' })
assert.deepEqual(reNhanh(e4(), [lan()], [samePlace]), [])
// Trích nguyên văn câu của em được giữ trong căn cứ, không biến thành lời giải.
const cauEm = 'Em nghĩ nên dùng ống, gấp nếp, thanh giằng, tam giác, dầm'
const [coTrich] = reNhanh(e4({ nguyen_nhan_han_che: cauEm, minh_chung_vien_dan: null }), [lan()], [])
assert.ok(coTrich.can_cu.includes(cauEm))
assert.ok(!tuCam.test(coTrich.cau_mau))
console.log('PASS bất biến: 8 nhánh luật; N5.2 dành M6; không từ cấm; giữ nguyên dữ liệu đầu vào và căn cứ.')
