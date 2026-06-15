ALTER TABLE users
    ADD COLUMN stripe_account_id          VARCHAR(100),
    ADD COLUMN stripe_onboarding_complete BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE payouts
    ADD COLUMN stripe_transfer_id VARCHAR(100);

CREATE INDEX idx_users_stripe_account_id ON users(stripe_account_id) WHERE stripe_account_id IS NOT NULL;
