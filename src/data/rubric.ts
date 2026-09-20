/**
 * ⚠️  BẢN TẠM CHO DEMO — `BMM_v0.0-demo`
 *
 * Đây KHÔNG phải bảng mô tả mức chính thức. Bản chính thức là `BMM_v0.3`
 * trong "Khung năng lực thiết kế kĩ thuật trong chuyên đề STEM Thiết kế cầu
 * giấy chịu lực", KHBD yêu cầu dùng NGUYÊN VĂN.
 *
 * Mô tả dưới đây được viết tạm theo nguyên tắc chung nêu ở KHBD mục VII:
 *   M1 chưa thực hiện được / sai hoặc thiếu cơ bản
 *   M2 thực hiện một phần, còn cần hỗ trợ
 *   M3 thực hiện khá đầy đủ với hỗ trợ tối thiểu
 *   M4 thực hiện đầy đủ, độc lập, có căn cứ, biết tự điều chỉnh
 *
 * Khi có file BMM_v0.3: thay nội dung file này, đổi RUBRIC_PHIEN_BAN. Không sửa UI.
 */

export const RUBRIC_PHIEN_BAN = 'BMM_v0.0-demo'
export const RUBRIC_LA_BAN_TAM = true

export interface ChiBao {
  ma: string
  ten: string
  hop_phan: string
  la_chi_bao_loi: boolean
  mo_ta_muc: Record<1 | 2 | 3 | 4, string>
}

export const CHI_BAO: Record<string, ChiBao> = {
  'A2.3': {
    ma: 'A2.3',
    ten: 'Chuyển yêu cầu thiết kế thành tiêu chí có thể quan sát, đo hoặc kiểm thử',
    hop_phan: 'A. Xác định vấn đề và yêu cầu thiết kế',
    la_chi_bao_loi: true,
    mo_ta_muc: {
      1: 'Nêu lại yêu cầu bằng từ định tính ("chắc", "đẹp") mà chưa gắn với cách quan sát hoặc đo nào.',
      2: 'Chuyển được một yêu cầu thành tiêu chí nhưng cách đo còn mơ hồ hoặc không thực hiện được trong điều kiện lớp học.',
      3: 'Chuyển được yêu cầu thành tiêu chí kèm cách đo/kiểm thực hiện được; có thể còn cần gợi ý để hoàn chỉnh.',
      4: 'Tự chuyển nhiều yêu cầu thành tiêu chí đo/kiểm được, nêu rõ đại lượng và điều kiện kiểm, và tự phát hiện tiêu chí nào chưa kiểm được.',
    },
  },
  'B1.2': {
    ma: 'B1.2',
    ten: 'Giải thích mối liên hệ giữa hình dạng kết cấu, độ cứng, tải trọng và biến dạng',
    hop_phan: 'B. Nghiên cứu kiến thức và phát triển giải pháp',
    la_chi_bao_loi: true,
    mo_ta_muc: {
      1: 'Chưa nêu được liên hệ, hoặc nêu liên hệ sai về bản chất.',
      2: 'Nhắc lại được kiến thức đã học nhưng chưa gắn với hiện tượng quan sát trong khảo sát của mình.',
      3: 'Giải thích được liên hệ và có viện dẫn hiện tượng quan sát được; lập luận nhìn chung hợp lí.',
      4: 'Giải thích được liên hệ, viện dẫn dữ liệu cụ thể của mình, và nêu được điều kiện mà liên hệ đó còn đúng hoặc không còn đúng.',
    },
  },
  'B1.3': {
    ma: 'B1.3',
    ten: 'Sử dụng kết quả thí nghiệm/khảo sát để rút ra hàm ý cho việc thiết kế cầu',
    hop_phan: 'B. Nghiên cứu kiến thức và phát triển giải pháp',
    la_chi_bao_loi: true,
    mo_ta_muc: {
      1: 'Chưa rút được hàm ý, hoặc hàm ý không liên quan đến dữ liệu đã thu.',
      2: 'Nêu được hàm ý thiết kế nhưng chưa chỉ ra dòng dữ liệu nào dẫn tới hàm ý đó; lập luận còn dựa vào trực giác hoặc kiến thức chung.',
      3: 'Nối được hàm ý với dữ liệu khảo sát cụ thể của mình; hàm ý dùng được cho quyết định thiết kế.',
      4: 'Nối hàm ý với dữ liệu, đồng thời nêu được giới hạn của hàm ý (điều kiện khảo sát, phạm vi áp dụng) và điều gì cần kiểm thêm.',
    },
  },
  'B2.1': {
    ma: 'B2.1',
    ten: 'Đề xuất từ hai phương án trở lên khác biệt có ý nghĩa về kết cấu hoặc phân bố vật liệu',
    hop_phan: 'B. Nghiên cứu kiến thức và phát triển giải pháp',
    la_chi_bao_loi: true,
    mo_ta_muc: {
      1: 'Chỉ có một phương án, hoặc các phương án trùng nhau về kết cấu.',
      2: 'Có từ hai phương án nhưng khác biệt chủ yếu về hình thức, chưa khác biệt về cách chịu lực.',
      3: 'Có từ hai phương án khác biệt rõ về kết cấu hoặc phân bố vật liệu; nêu được điểm khác biệt.',
      4: 'Có nhiều phương án khác biệt có chủ đích, mỗi phương án gắn với một hướng giải quyết khác nhau rút ra từ khảo sát.',
    },
  },
  'B2.3': {
    ma: 'B2.3',
    ten: 'Dự đoán ưu điểm, hạn chế hoặc khả năng chịu lực của từng phương án',
    hop_phan: 'B. Nghiên cứu kiến thức và phát triển giải pháp',
    la_chi_bao_loi: true,
    mo_ta_muc: {
      1: 'Chưa dự đoán, hoặc dự đoán không có lí do.',
      2: 'Dự đoán chung chung ("cái này chắc hơn") mà chưa nêu căn cứ.',
      3: 'Dự đoán có nêu căn cứ từ kiến thức hoặc dữ liệu khảo sát.',
      4: 'Dự đoán có căn cứ, nêu được cả hạn chế và rủi ro của phương án mình nghiêng về.',
    },
  },
  'C1.2': {
    ma: 'C1.2',
    ten: 'Nhận diện ưu điểm, hạn chế và sự đánh đổi giữa các phương án',
    hop_phan: 'C. Đánh giá, lựa chọn và hiện thực hóa giải pháp',
    la_chi_bao_loi: false,
    mo_ta_muc: {
      1: 'Chưa nhận ra ưu/nhược của từng phương án.',
      2: 'Nêu được ưu hoặc nhược của một số phương án nhưng chưa nêu đánh đổi.',
      3: 'Nêu được ưu, nhược và ít nhất một đánh đổi giữa các phương án.',
      4: 'Nêu đầy đủ đánh đổi và chỉ ra đánh đổi nào có thể chấp nhận được với điều kiện của bài.',
    },
  },
  'C1.3': {
    ma: 'C1.3',
    ten: 'Lựa chọn phương án phù hợp và giải thích quyết định bằng tiêu chí, kiến thức hoặc bằng chứng',
    hop_phan: 'C. Đánh giá, lựa chọn và hiện thực hóa giải pháp',
    la_chi_bao_loi: true,
    mo_ta_muc: {
      1: 'Chưa giải thích được lựa chọn, hoặc lựa chọn hoàn toàn theo cảm tính.',
      2: 'Có giải thích nhưng chưa dùng tiêu chí hoặc bằng chứng đã có; chủ yếu là lí do chủ quan.',
      3: 'Giải thích lựa chọn bằng tiêu chí hoặc bằng chứng cụ thể đã xác lập từ trước.',
      4: 'Giải thích bằng tiêu chí và bằng chứng, đồng thời nêu được đánh đổi đã chấp nhận khi chọn phương án này.',
    },
  },
  'C3.1': {
    ma: 'C3.1',
    ten: 'Chế tạo nguyên mẫu cầu phù hợp với phương án đã lựa chọn',
    hop_phan: 'C. Đánh giá, lựa chọn và hiện thực hóa giải pháp',
    la_chi_bao_loi: true,
    mo_ta_muc: {
      1: 'Nguyên mẫu không thể hiện phương án đã chọn.',
      2: 'Nguyên mẫu thể hiện một phần phương án; nhiều chi tiết lệch so với bản thiết kế.',
      3: 'Nguyên mẫu phù hợp phương án đã chọn ở các đặc điểm kết cấu chính.',
      4: 'Nguyên mẫu phù hợp phương án, thực hiện trong giới hạn nguồn lực, và các điều chỉnh khi chế tạo đều có chủ đích.',
    },
  },
  'D1.2': {
    ma: 'D1.2',
    ten: 'Thu thập và ghi chép dữ liệu thử nghiệm (tải trọng, số lần thử, vị trí và dạng biến dạng/hư hỏng)',
    hop_phan: 'D. Kiểm thử, đánh giá và cải tiến thiết kế',
    la_chi_bao_loi: true,
    mo_ta_muc: {
      1: 'Chưa ghi dữ liệu, hoặc ghi thiếu tới mức không dùng được.',
      2: 'Ghi được tải trọng nhưng thiếu vị trí/dạng hư hỏng hoặc thiếu điều kiện thử.',
      3: 'Ghi đầy đủ các trường chính theo quy trình; dữ liệu dùng được để phân tích.',
      4: 'Ghi đầy đủ, có đơn vị và điều kiện thử rõ ràng, bảo đảm các lần thử so sánh được với nhau.',
    },
  },
  'D2.3': {
    ma: 'D2.3',
    ten: 'Xác định vị trí hoặc nguyên nhân có khả năng làm hạn chế khả năng chịu tải, dựa trên bằng chứng',
    hop_phan: 'D. Kiểm thử, đánh giá và cải tiến thiết kế',
    la_chi_bao_loi: true,
    mo_ta_muc: {
      1: 'Chưa xác định được nguyên nhân, hoặc quy cho lí do không liên quan.',
      2: 'Nêu nguyên nhân chung chung ("giấy yếu", "dán chưa chắc") mà chưa viện dẫn quan sát hay số liệu.',
      3: 'Chỉ ra được vị trí hỏng và nối với đặc điểm kết cấu, có viện dẫn quan sát hoặc số liệu.',
      4: 'Xác định nguyên nhân có bằng chứng, đồng thời cân nhắc nguyên nhân cạnh tranh và nêu cách phân biệt.',
    },
  },
  'D3.2': {
    ma: 'D3.2',
    ten: 'Giải thích lí do của thay đổi và dự đoán ảnh hưởng của thay đổi đối với sản phẩm',
    hop_phan: 'D. Kiểm thử, đánh giá và cải tiến thiết kế',
    la_chi_bao_loi: true,
    mo_ta_muc: {
      1: 'Thay đổi không có lí do, hoặc thay đổi ngẫu nhiên.',
      2: 'Có nêu lí do nhưng chưa nối với nguyên nhân đã xác định; chưa dự đoán ảnh hưởng.',
      3: 'Lí do thay đổi bám vào nguyên nhân đã xác định; có dự đoán ảnh hưởng.',
      4: 'Lí do bám nguyên nhân, dự đoán ảnh hưởng cụ thể và nêu được cách kiểm chứng dự đoán đó.',
    },
  },
  'D3.4': {
    ma: 'D3.4',
    ten: 'So sánh kết quả trước và sau cải tiến để đánh giá hiệu quả của quyết định thiết kế',
    hop_phan: 'D. Kiểm thử, đánh giá và cải tiến thiết kế',
    la_chi_bao_loi: true,
    mo_ta_muc: {
      1: 'Chưa so sánh, hoặc so sánh trên dữ liệu không tương đương.',
      2: 'So sánh được con số tải nhưng quy cải thiện cho lí do chung chung.',
      3: 'So sánh trước–sau trong điều kiện tương đương và nối chênh lệch với thay đổi đã thực hiện.',
      4: 'So sánh có căn cứ, nêu được mức độ tin cậy của kết luận và điều gì còn chưa kết luận được.',
    },
  },
  'D4.2': {
    ma: 'D4.2',
    ten: 'Sử dụng bản thiết kế, số liệu và bằng chứng thử nghiệm để bảo vệ quyết định thiết kế',
    hop_phan: 'D. Kiểm thử, đánh giá và cải tiến thiết kế',
    la_chi_bao_loi: true,
    mo_ta_muc: {
      1: 'Trình bày lại quá trình mà không có bằng chứng.',
      2: 'Có nhắc tới số liệu nhưng chưa dùng số liệu để trả lời câu hỏi phản biện.',
      3: 'Dùng được bản thiết kế và số liệu để giải thích và bảo vệ quyết định.',
      4: 'Dùng bằng chứng để bảo vệ quyết định, thừa nhận được điểm yếu và phản hồi câu hỏi phản biện bằng dữ liệu.',
    },
  },
}

export const CHI_BAO_LOI = Object.values(CHI_BAO).filter((c) => c.la_chi_bao_loi).map((c) => c.ma)
