-- SDT M1: bảng thật, chỉ-thêm (append-only). Không UPDATE, không DELETE.
-- Sửa là INSERT dòng mới + thay_the_cho. Chặn ghi đè ở tầng CSDL bằng RULE.
-- Giữ nguyên: lop_hoc, nguoi_dung, nhat_ky_kiem_toan (init.sql).

CREATE TABLE IF NOT EXISTS hoc_sinh (
  ma      TEXT PRIMARY KEY,                    -- 'HS0812' mã nghiên cứu
  ho_ten  TEXT NOT NULL,                       -- chỉ GV thấy, không vào phân tích
  lop_id  TEXT NOT NULL REFERENCES lop_hoc(id),
  nhom    TEXT
);

CREATE TABLE IF NOT EXISTS phieu (
  id            BIGSERIAL PRIMARY KEY,
  ma_hs         TEXT NOT NULL REFERENCES hoc_sinh(ma),
  chang         SMALLINT NOT NULL CHECK (chang BETWEEN 0 AND 6),
  loai          TEXT NOT NULL CHECK (loai IN ('P0','E1','E2','E3','E4','E5','P1')),
  noi_dung      JSONB NOT NULL,                -- một phiếu của một em
  thay_the_cho  BIGINT REFERENCES phieu(id),   -- bản nộp lại trỏ về bản cũ
  nguoi_tao     TEXT NOT NULL REFERENCES nguoi_dung(id),
  nhap_ho       BOOLEAN NOT NULL DEFAULT false,
  thoi_diem     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phieu_hs_loai_td ON phieu (ma_hs, loai, thoi_diem DESC);

CREATE TABLE IF NOT EXISTS lan_thu (            -- tách khỏi JSONB vì phải so sánh
  id         BIGSERIAL PRIMARY KEY,
  phieu_id   BIGINT NOT NULL REFERENCES phieu(id),
  lan        SMALLINT NOT NULL,
  tai_g      INTEGER,
  giu_giay   SMALLINT,
  vi_tri     TEXT,                              -- vị trí đặt tải
  bien_dang  TEXT,                              -- chỗ biến dạng
  dang_hong  TEXT,
  ghi_chu    TEXT
);

CREATE TABLE IF NOT EXISTS goi_y (
  id              BIGSERIAL PRIMARY KEY,
  ma_hs           TEXT NOT NULL REFERENCES hoc_sinh(ma),
  phieu_id        BIGINT NOT NULL REFERENCES phieu(id),
  nhanh           TEXT NOT NULL,                -- 'N4.3'
  can_cu          TEXT,                         -- trích câu HS viết
  noi_dung        TEXT NOT NULL,
  nguon           TEXT NOT NULL CHECK (nguon IN ('LUAT','AI')),
  model           TEXT,
  prompt_phien_ban TEXT,
  do_chac_chan    REAL,
  bi_loc          BOOLEAN NOT NULL DEFAULT false, -- bộ lọc từ cấm đã chặn
  trang_thai      TEXT NOT NULL DEFAULT 'CHO'
                  CHECK (trang_thai IN ('CHO','GUI','SUA','TU_NOI','BO')),
  thoi_diem       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_goi_y_tt_td ON goi_y (trang_thai, thoi_diem);

CREATE TABLE IF NOT EXISTS phan_hoi_gv (
  id           BIGSERIAL PRIMARY KEY,
  goi_y_id     BIGINT NOT NULL REFERENCES goi_y(id),
  quyet_dinh   TEXT NOT NULL CHECK (quyet_dinh IN ('GUI','SUA','TU_NOI','BO')),
  noi_dung_sua TEXT,
  ly_do_bo     TEXT,
  gv           TEXT NOT NULL REFERENCES nguoi_dung(id),
  thoi_diem    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quan_sat (
  id          BIGSERIAL PRIMARY KEY,
  ma_hs       TEXT NOT NULL REFERENCES hoc_sinh(ma),
  chi_bao     TEXT NOT NULL,
  hanh_vi     TEXT NOT NULL,
  co_ho_tro   TEXT NOT NULL CHECK (co_ho_tro IN ('DOC_LAP','CO_HO_TRO','KHONG_RO')),
  gv          TEXT NOT NULL REFERENCES nguoi_dung(id),
  thoi_diem   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS danh_gia (
  id         BIGSERIAL PRIMARY KEY,
  phieu_id   BIGINT NOT NULL REFERENCES phieu(id),
  chi_bao    TEXT NOT NULL,
  muc        SMALLINT NOT NULL CHECK (muc BETWEEN 1 AND 4),
  rubric_ban TEXT NOT NULL,                     -- 'BMM_v0.3'
  li_do      TEXT,
  gv         TEXT NOT NULL REFERENCES nguoi_dung(id),
  thay_the_cho BIGINT REFERENCES danh_gia(id),
  thoi_diem  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vi_du_mau (
  id              BIGSERIAL PRIMARY KEY,
  nhanh           TEXT NOT NULL,
  bai_lam_tom_tat TEXT NOT NULL,
  cau_hoi_duyet   TEXT NOT NULL,
  goi_y_id        BIGINT REFERENCES goi_y(id),
  dang_dung       BOOLEAN NOT NULL DEFAULT true, -- tắt khi khoá đợt
  thoi_diem       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS su_kien (
  id        BIGSERIAL PRIMARY KEY,
  ma_hs     TEXT REFERENCES hoc_sinh(ma),
  loai      TEXT NOT NULL,
  chi_tiet  JSONB NOT NULL DEFAULT '{}'::jsonb,
  thoi_diem TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Chặn ghi đè ở tầng CSDL, không tin vào tầng ứng dụng.
-- CREATE OR REPLACE RULE để file chạy lại được.
CREATE OR REPLACE RULE phieu_ro_u  AS ON UPDATE TO phieu   DO INSTEAD NOTHING;
CREATE OR REPLACE RULE phieu_ro_d  AS ON DELETE TO phieu   DO INSTEAD NOTHING;
CREATE OR REPLACE RULE lanthu_ro_u AS ON UPDATE TO lan_thu DO INSTEAD NOTHING;
CREATE OR REPLACE RULE lanthu_ro_d AS ON DELETE TO lan_thu DO INSTEAD NOTHING;
CREATE OR REPLACE RULE qs_ro_u     AS ON UPDATE TO quan_sat DO INSTEAD NOTHING;
CREATE OR REPLACE RULE qs_ro_d     AS ON DELETE TO quan_sat DO INSTEAD NOTHING;
CREATE OR REPLACE RULE dg_ro_u     AS ON UPDATE TO danh_gia DO INSTEAD NOTHING;
CREATE OR REPLACE RULE dg_ro_d     AS ON DELETE TO danh_gia DO INSTEAD NOTHING;

-- Đọc trạng thái hiện tại không cần khối JSON.
CREATE OR REPLACE VIEW phieu_moi_nhat AS
SELECT DISTINCT ON (ma_hs, loai) *
FROM phieu ORDER BY ma_hs, loai, thoi_diem DESC, id DESC;
