-- database/init.sql  ← COPY-PASTE 100% LÀ CHẠY NGON
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
    user_id         BIGSERIAL PRIMARY KEY,
    username        VARCHAR(50)  UNIQUE NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    gender          VARCHAR(20),
    birth_date      DATE,
    is_active       BOOLEAN DEFAULT TRUE,
    is_verified     BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- 2. Profiles + vị trí (PostGIS)
CREATE TABLE IF NOT EXISTS profiles (
    user_id         BIGINT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    bio             TEXT,
    job_title       VARCHAR(100),
    company         VARCHAR(100),
    education       VARCHAR(150),
    location        GEOGRAPHY(POINT, 4326),
    updated_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_profiles_location ON profiles USING GIST(location);

-- 3. Photos
CREATE TABLE IF NOT EXISTS photos (
    photo_id        BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    url             TEXT NOT NULL,
    is_primary      BOOLEAN DEFAULT FALSE,
    order_index     SMALLINT DEFAULT 0,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- 4. Preferences
CREATE TABLE IF NOT EXISTS preferences (
    user_id             BIGINT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    interested_in       VARCHAR(20) DEFAULT 'everyone',
    age_min             INT DEFAULT 18,
    age_max             INT DEFAULT 99,
    max_distance_km     INT DEFAULT 100,
    updated_at          TIMESTAMP DEFAULT NOW()
);

-- 5. Interests (Đã được chuẩn hóa thành 2 bảng Many-to-Many) 🚀
----------------------------------------------------------------------
-- 5.1 Bảng danh sách sở thích chuẩn (Từ điển/Master List)
-- Chứa tất cả sở thích có trên hệ thống, đảm bảo không trùng lặp.
CREATE TABLE IF NOT EXISTS master_interests (
    interest_id     SERIAL PRIMARY KEY,
    name            VARCHAR(50) UNIQUE NOT NULL, -- Tên sở thích chuẩn hóa
    category        VARCHAR(30) DEFAULT 'other', -- Phân loại mềm (sport, tech, food)
    emoji           VARCHAR(10),                 -- Icon hiển thị
    created_at      TIMESTAMP DEFAULT NOW()
);

-- 5.2 Bảng liên kết User - Sở thích (User chọn cái gì)
-- Lưu mối quan hệ giữa User và các Interest đã được chuẩn hóa (dựa trên interest_id).
CREATE TABLE IF NOT EXISTS user_interests (
    user_id         BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    interest_id     INT NOT NULL REFERENCES master_interests(interest_id) ON DELETE CASCADE,
    added_at        TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, interest_id) -- User không thể chọn 1 sở thích 2 lần
);
----------------------------------------------------------------------

-- 6. Swipes (vuốt trái/phải)
CREATE TABLE IF NOT EXISTS swipes (
    swipe_id        BIGSERIAL PRIMARY KEY,
    from_user_id    BIGINT NOT NULL REFERENCES users(user_id),
    to_user_id      BIGINT NOT NULL REFERENCES users(user_id),
    action          VARCHAR(10) NOT NULL CHECK (action IN ('LIKE', 'PASS')),
    created_at      TIMESTAMP DEFAULT NOW(),
    UNIQUE(from_user_id, to_user_id)
);

-- 7. Matches ← ID này chính là ID phòng chat luôn!
CREATE TABLE IF NOT EXISTS matches (
    match_id        BIGSERIAL PRIMARY KEY,
    user1_id        BIGINT NOT NULL REFERENCES users(user_id),
    user2_id        BIGINT NOT NULL REFERENCES users(user_id),
    created_at      TIMESTAMP DEFAULT NOW(),
    UNIQUE(user1_id, user2_id)
);

-- 8. Messages (real-time chat)
CREATE TABLE IF NOT EXISTS messages (
    message_id      BIGSERIAL PRIMARY KEY,
    match_id        BIGINT NOT NULL REFERENCES matches(match_id) ON DELETE CASCADE,
    from_user_id    BIGINT NOT NULL REFERENCES users(user_id),
    content         TEXT,
    photo_url       TEXT,
    sent_at         TIMESTAMP DEFAULT NOW(),
    read_at         TIMESTAMP
);
CREATE INDEX idx_messages_match ON messages(match_id, sent_at);