CREATE TABLE blog_posts (
    id         BIGSERIAL PRIMARY KEY,
    slug       VARCHAR(200) NOT NULL UNIQUE,
    tag        VARCHAR(100),
    title      VARCHAR(500) NOT NULL,
    excerpt    TEXT,
    content    TEXT         NOT NULL,
    published  BOOLEAN      NOT NULL DEFAULT false,
    read_time  VARCHAR(50),
    author_id  BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE INDEX idx_blog_posts_slug      ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON blog_posts(published, created_at DESC);
