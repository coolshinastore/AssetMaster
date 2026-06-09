CREATE TABLE orders (
    id           BIGSERIAL    PRIMARY KEY,
    buyer_id     BIGINT       NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    total_amount NUMERIC(10,2) NOT NULL,
    status       VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_status   ON orders(status);
