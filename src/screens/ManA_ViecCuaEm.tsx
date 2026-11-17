import { PageHead } from '../components/layout/PageHead'
import { Card, MaMan, Trong } from '../components/ui/Ui'

export function ManA_ViecCuaEm() {
  return (
    <>
      <PageHead crumbs={['Học tập', 'Việc của em']} title={<><MaMan ma="A" />Việc của em</>} sub="Thiết kế cầu giấy chịu lực" />
      <Card title="Nhiệm vụ học tập">
        <Trong>Phiếu học tập và bước tiếp theo của em sẽ xuất hiện tại đây. Chức năng đang được chuẩn bị.</Trong>
      </Card>
    </>
  )
}
