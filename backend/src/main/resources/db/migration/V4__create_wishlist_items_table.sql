CREATE TABLE wishlist_items (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT      NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    asset_id   BIGINT      NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_wishlist_user_asset UNIQUE (user_id, asset_id)
);

CREATE INDEX idx_wishlist_user_id ON wishlist_items(user_id);
