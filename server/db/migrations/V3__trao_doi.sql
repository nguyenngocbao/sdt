-- Hội thoại quanh một gợi ý đã tới học sinh (GUI hoặc SUA).
-- Append-only như phieu/quan_sat: không UPDATE, không DELETE.
--   HOC_SINH: HIEU_ROI (bấm "Em hiểu rồi"), CHUA_HIEU (có thể kèm câu), HOI (bắt buộc có câu)
--   GIAO_VIEN: TRA_LOI (bắt buộc có câu)
CREATE TABLE IF NOT EXISTS trao_doi (
  id         BIGSERIAL PRIMARY KEY,
  goi_y_id   BIGINT NOT NULL REFERENCES goi_y(id),
  nguoi_gui  TEXT NOT NULL REFERENCES nguoi_dung(id),
  vai_tro    TEXT NOT NULL CHECK (vai_tro IN ('HOC_SINH','GIAO_VIEN')),
  loai       TEXT NOT NULL CHECK (loai IN ('HIEU_ROI','CHUA_HIEU','HOI','TRA_LOI')),
  noi_dung   TEXT,
  ma_gui     TEXT,                              -- khóa chống gửi trùng do máy khách sinh
  thoi_diem  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (loai IN ('HIEU_ROI','CHUA_HIEU') OR length(btrim(coalesce(noi_dung, ''))) > 0),
  CHECK ((vai_tro = 'GIAO_VIEN') = (loai = 'TRA_LOI'))
);
CREATE INDEX IF NOT EXISTS idx_trao_doi_goi_y ON trao_doi (goi_y_id, id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_trao_doi_ma_gui ON trao_doi (nguoi_gui, ma_gui) WHERE ma_gui IS NOT NULL;

CREATE OR REPLACE RULE traodoi_ro_u AS ON UPDATE TO trao_doi DO INSTEAD NOTHING;
CREATE OR REPLACE RULE traodoi_ro_d AS ON DELETE TO trao_doi DO INSTEAD NOTHING;
