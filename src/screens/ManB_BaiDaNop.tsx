import { PageHead } from '../components/layout/PageHead'
import { Card, MaMan, Trong } from '../components/ui/Ui'

export function ManB_BaiDaNop() {
  return (
    <>
      <PageHead crumbs={['Học tập', 'Bài đã nộp']} title={<><MaMan ma="B" />Bài đã nộp</>} sub="Thiết kế cầu giấy chịu lực" />
      <Card title="Các phiếu đã nộp">
        <Trong>Em sẽ xem lại bài đã nộp và các lần chỉnh sửa tại đây. Chức năng đang được chuẩn bị.</Trong>
      </Card>
    </>
  )
}
