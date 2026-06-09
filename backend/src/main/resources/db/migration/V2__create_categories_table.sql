CREATE TABLE categories (
    id        BIGSERIAL     PRIMARY KEY,
    name      VARCHAR(100)  NOT NULL UNIQUE,
    slug      VARCHAR(100)  NOT NULL UNIQUE,
    parent_id BIGINT        REFERENCES categories(id),
    icon_url  VARCHAR(2048)
);

CREATE INDEX idx_categories_slug ON categories (slug);
