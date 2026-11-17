import { PageHead } from '../components/layout/PageHead'
import { Card, MaMan, Trong } from '../components/ui/Ui'

export function ManE_Cham() {
  return (
    <>
      <PageHead crumbs={['Lớp học', 'Chấm']} title={<><MaMan ma="E" />Chấm</>} sub="Thiết kế cầu giấy chịu lực" />
      <Card title="Đánh giá bài làm">
        <Trong>Bài làm và bảng mô tả mức sẽ xuất hiện tại đây để giáo viên đánh giá. Chức năng đang được chuẩn bị.</Trong>
      </Card>
    </>
  )
}
