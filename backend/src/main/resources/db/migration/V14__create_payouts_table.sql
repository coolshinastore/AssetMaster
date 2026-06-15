CREATE TYPE payout_status AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED');

CREATE TABLE payouts (
    id            BIGSERIAL PRIMARY KEY,
    author_id     BIGINT         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount        NUMERIC(12,2)  NOT NULL,
    status        payout_status  NOT NULL DEFAULT 'PENDING',
    period_start  DATE           NOT NULL,
    period_end    DATE           NOT NULL,
    processed_at  TIMESTAMP,
    notes         TEXT,
    created_at    TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payouts_author_id ON payouts(author_id);
CREATE INDEX idx_payouts_status    ON payouts(status);
