CREATE TABLE reviews (
    id         BIGSERIAL PRIMARY KEY,
    asset_id   BIGINT       NOT NULL REFERENCES assets(id)  ON DELETE CASCADE,
    author_id  BIGINT       NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
    rating     SMALLINT     NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment    TEXT,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (asset_id, author_id)
);

CREATE INDEX idx_reviews_asset_id ON reviews(asset_id);
