-- SDT: định danh, phân quyền và nhật ký kiểm toán. Dữ liệu học tập nằm ở 002-bang-that.sql.
CREATE TABLE IF NOT EXISTS lop_hoc (
  id TEXT PRIMARY KEY,
  ten TEXT NOT NULL,
  nam_hoc TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS nguoi_dung (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  mat_khau_hash TEXT NOT NULL,
  ho_ten TEXT NOT NULL,
  vai_tro TEXT NOT NULL CHECK (vai_tro IN ('HOC_SINH', 'GIAO_VIEN', 'QUAN_TRI')),
  hoc_sinh_id TEXT,
  lop_id TEXT REFERENCES lop_hoc(id),
  dang_hoat_dong BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT hs_co_ma CHECK ((vai_tro = 'HOC_SINH' AND hoc_sinh_id IS NOT NULL) OR vai_tro <> 'HOC_SINH')
);

CREATE TABLE IF NOT EXISTS nhat_ky_kiem_toan (
  id BIGSERIAL PRIMARY KEY,
  nguoi_dung_id TEXT REFERENCES nguoi_dung(id),
  hanh_dong TEXT NOT NULL,
  doi_tuong TEXT NOT NULL,
  chi_tiet JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_nguoi_dung_vai_tro ON nguoi_dung(vai_tro);
CREATE INDEX IF NOT EXISTS idx_audit_nguoi_dung ON nhat_ky_kiem_toan(nguoi_dung_id, created_at DESC);
