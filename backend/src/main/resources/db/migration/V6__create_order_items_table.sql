CREATE TABLE order_items (
    id                BIGSERIAL    PRIMARY KEY,
    order_id          BIGINT       NOT NULL REFERENCES orders(id)  ON DELETE CASCADE,
    asset_id          BIGINT       NOT NULL REFERENCES assets(id)  ON DELETE RESTRICT,
    price_at_purchase NUMERIC(10,2) NOT NULL,
    license_type      VARCHAR(20)  NOT NULL
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_asset_id ON order_items(asset_id);
