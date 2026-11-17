import { PageHead } from '../components/layout/PageHead'
import { Card, MaMan, Trong } from '../components/ui/Ui'

export function ManC_LopToi() {
  return (
    <>
      <PageHead crumbs={['Lớp học', 'Lớp tôi']} title={<><MaMan ma="C" />Lớp tôi</>} sub="Thiết kế cầu giấy chịu lực" />
      <Card title="Theo dõi lớp học">
        <Trong>Danh sách học sinh, tiến độ nộp bài và ghi nhận quan sát sẽ xuất hiện tại đây. Chức năng đang được chuẩn bị.</Trong>
      </Card>
    </>
  )
}
