CREATE TABLE assets (
    id              BIGSERIAL       PRIMARY KEY,
    author_id       BIGINT          NOT NULL REFERENCES users(id),
    title           VARCHAR(500)    NOT NULL,
    description     TEXT,
    category_id     BIGINT          REFERENCES categories(id),
    price           NUMERIC(10,2)   NOT NULL,
    license_type    VARCHAR(50)     NOT NULL DEFAULT 'STANDARD',
    status          VARCHAR(50)     NOT NULL DEFAULT 'DRAFT',
    file_key        VARCHAR(2048),
    preview_urls    JSONB           NOT NULL DEFAULT '[]',
    tags            TEXT[]          NOT NULL DEFAULT '{}',
    downloads_count INTEGER         NOT NULL DEFAULT 0,
    views_count     INTEGER         NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assets_status      ON assets (status);
CREATE INDEX idx_assets_category_id ON assets (category_id);
CREATE INDEX idx_assets_author_id   ON assets (author_id);
CREATE INDEX idx_assets_price       ON assets (price);
CREATE INDEX idx_assets_created_at  ON assets (created_at DESC);
CREATE INDEX idx_assets_downloads   ON assets (downloads_count DESC);

-- Fulltext index for search
CREATE INDEX idx_assets_fts ON assets USING GIN (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
);
