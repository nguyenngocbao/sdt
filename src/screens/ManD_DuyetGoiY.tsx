import { PageHead } from '../components/layout/PageHead'
import { Card, MaMan, Trong } from '../components/ui/Ui'

export function ManD_DuyetGoiY() {
  return (
    <>
      <PageHead crumbs={['Lớp học', 'Duyệt gợi ý']} title={<><MaMan ma="D" />Duyệt gợi ý</>} sub="Thiết kế cầu giấy chịu lực" />
      <Card title="Gợi ý chờ duyệt">
        <Trong>Các gợi ý học tập cần giáo viên xem xét sẽ xuất hiện tại đây. Chức năng đang được chuẩn bị.</Trong>
      </Card>
    </>
  )
}
