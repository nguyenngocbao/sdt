-- Một giáo viên dạy nhiều lớp: bảng gán giáo viên ↔ lớp. nguoi_dung.lop_id giữ làm lớp mặc định.
CREATE TABLE IF NOT EXISTS giao_vien_lop (
  giao_vien_id TEXT NOT NULL REFERENCES nguoi_dung(id),
  lop_id       TEXT NOT NULL REFERENCES lop_hoc(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (giao_vien_id, lop_id)
);
CREATE INDEX IF NOT EXISTS idx_gvl_lop ON giao_vien_lop(lop_id);

INSERT INTO giao_vien_lop (giao_vien_id, lop_id)
SELECT id, lop_id FROM nguoi_dung WHERE vai_tro = 'GIAO_VIEN' AND lop_id IS NOT NULL
ON CONFLICT DO NOTHING;
