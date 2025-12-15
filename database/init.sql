-- database/init.sql

-- 1. Cài đặt Extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------
-- 2. TẠO BẢNG (SCHEMA)
-- --------------------------------------------------------

-- 2.1 Users
CREATE TABLE IF NOT EXISTS users (
    user_id         BIGSERIAL PRIMARY KEY,
    username        VARCHAR(50) UNIQUE NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- 2.2 Profiles + Vị trí (PostGIS)
CREATE TABLE IF NOT EXISTS profiles (
    user_id         BIGINT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    bio             TEXT,
    job_title       VARCHAR(100),
    company         VARCHAR(100),
    education       VARCHAR(150),
    -- Lưu tọa độ GPS: Kinh độ, Vĩ độ (SRID 4326)
    location        GEOGRAPHY(POINT, 4326), 
    gender          VARCHAR(20),
    birth_date      DATE NOT NULL,
    is_active       BOOLEAN DEFAULT TRUE,
    is_verified     BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_profiles_location ON profiles USING GIST(location);

-- 2.3 Photos
CREATE TABLE IF NOT EXISTS photos (
    photo_id        BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    url             TEXT NOT NULL,
    is_primary      BOOLEAN DEFAULT FALSE,
    order_index     SMALLINT DEFAULT 0,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- 2.4 Preferences (Cài đặt tìm kiếm)
CREATE TABLE IF NOT EXISTS preferences (
    user_id             BIGINT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    interested_in       VARCHAR(20) DEFAULT 'everyone',
    age_min             INT DEFAULT 18,
    age_max             INT DEFAULT 99,
    max_distance_km     INT DEFAULT 50,
    updated_at          TIMESTAMP DEFAULT NOW()
);

-- --------------------------------------------------------
-- 2.5 INTERESTS SYSTEM (Hệ thống Sở thích - Style Tinder)
-- --------------------------------------------------------

-- Bảng danh mục lớn (Category)
CREATE TABLE IF NOT EXISTS interest_categories (
    category_id     SERIAL PRIMARY KEY,
    category_name   VARCHAR(50) UNIQUE NOT NULL, 
    icon            VARCHAR(20) -- Icon của danh mục lớn
);

-- Bảng sở thích chi tiết (Items)
CREATE TABLE IF NOT EXISTS interest_map (
    interest_id     SERIAL PRIMARY KEY,
    interest_tag    VARCHAR(50) NOT NULL,
    icon            VARCHAR(20), -- Icon của từng sở thích con
    category_id     INT REFERENCES interest_categories(category_id) ON DELETE CASCADE,
    UNIQUE(interest_tag, category_id)
);

-- Bảng nối User <-> Interest
CREATE TABLE IF NOT EXISTS user_interests (
    user_interest_id BIGSERIAL PRIMARY KEY,
    user_id          BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    interest_id      INT NOT NULL REFERENCES interest_map(interest_id) ON DELETE CASCADE,
    UNIQUE(user_id, interest_id)
);

-- --------------------------------------------------------
-- 2.6 ACTIONS & CHAT
-- --------------------------------------------------------

-- Swipes (Like/Pass)
CREATE TABLE IF NOT EXISTS swipes (
    swipe_id        BIGSERIAL PRIMARY KEY,
    from_user_id    BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    to_user_id      BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    action          VARCHAR(10) NOT NULL CHECK (action IN ('LIKE', 'PASS')),
    created_at      TIMESTAMP DEFAULT NOW(),
    UNIQUE(from_user_id, to_user_id)
);

-- Matches (Cặp đôi)
CREATE TABLE IF NOT EXISTS matches (
    match_id        BIGSERIAL PRIMARY KEY,
    user1_id        BIGINT NOT NULL REFERENCES users(user_id),
    user2_id        BIGINT NOT NULL REFERENCES users(user_id),
    created_at      TIMESTAMP DEFAULT NOW(),
    UNIQUE(user1_id, user2_id)
);

-- Messages (Tin nhắn)
CREATE TABLE IF NOT EXISTS messages (
    message_id      BIGSERIAL PRIMARY KEY,
    match_id        BIGINT NOT NULL REFERENCES matches(match_id) ON DELETE CASCADE,
    from_user_id    BIGINT NOT NULL REFERENCES users(user_id),
    content         TEXT,
    photo_url       TEXT,
    sent_at         TIMESTAMP DEFAULT NOW(),
    read_at         TIMESTAMP
);
CREATE INDEX idx_messages_match ON messages(match_id, sent_at);

-- --------------------------------------------------------
-- 3. SEED DATA (Dữ liệu mẫu - Đã Việt hóa & Bổ sung đầy đủ)
-- --------------------------------------------------------

-- 3.1 Nạp Categories (Tiếng Việt)
INSERT INTO interest_categories (category_name, icon) 
VALUES 
    ('Sáng tạo', '🎨'),
    ('Thể thao', '⚽'),
    ('Giải trí', '🍻'),
    ('Âm nhạc', '🎵'),
    ('Ẩm thực', '🍕'),
    ('Du lịch', '✈️'),
    ('Công nghệ', '💻'),
    ('Thú cưng', '🐶')
ON CONFLICT (category_name) DO NOTHING;

-- 3.2 Nạp Interests chi tiết (Tiếng Việt + Icon)

-- === SÁNG TẠO ===
INSERT INTO interest_map (interest_tag, icon, category_id)
SELECT t.tag, t.icon, c.category_id 
FROM interest_categories c
CROSS JOIN (VALUES 
    ('Nghệ thuật', '🎨'), 
    ('Thủ công', '🧶'), 
    ('Nhảy múa', '💃'), 
    ('Thiết kế', '✏️'), 
    ('Trang điểm', '💄'), 
    ('Quay video', '📹'), 
    ('Nhiếp ảnh', '📷'), 
    ('Ca hát', '🎤'), 
    ('Viết lách', '📝')
) AS t(tag, icon)
WHERE c.category_name = 'Sáng tạo'
ON CONFLICT DO NOTHING;

-- === THỂ THAO ===
INSERT INTO interest_map (interest_tag, icon, category_id)
SELECT t.tag, t.icon, c.category_id 
FROM interest_categories c
CROSS JOIN (VALUES 
    ('Điền kinh', '🎽'), 
    ('Cầu lông', '🏸'), 
    ('Bóng chày', '⚾'), 
    ('Bóng rổ', '🏀'), 
    ('Leo núi', '🧗'), 
    ('Bowling', '🎳'), 
    ('Quyền anh', '🥊'), 
    ('Chèo thuyền', '🚣'),
    ('Bóng đá', '⚽'), 
    ('Tập Gym', '💪'),
    ('Yoga', '🧘')
) AS t(tag, icon)
WHERE c.category_name = 'Thể thao'
ON CONFLICT DO NOTHING;

-- === GIẢI TRÍ ===
INSERT INTO interest_map (interest_tag, icon, category_id)
SELECT t.tag, t.icon, c.category_id 
FROM interest_categories c
CROSS JOIN (VALUES 
    ('Quán Bar', '🍻'), 
    ('Đi Cà phê', '☕'), 
    ('Vũ trường', '🕺'), 
    ('Hòa nhạc', '🎫'), 
    ('Lễ hội', '🎉'), 
    ('Karaoke', '🎤'), 
    ('Bảo tàng', '🏛️'), 
    ('Hài độc thoại', '🎙️'), 
    ('Xem kịch', '🎭')
) AS t(tag, icon)
WHERE c.category_name = 'Giải trí'
ON CONFLICT DO NOTHING;

-- === ÂM NHẠC ===
INSERT INTO interest_map (interest_tag, icon, category_id)
SELECT t.tag, t.icon, c.category_id 
FROM interest_categories c
CROSS JOIN (VALUES 
    ('Nhạc Pop', '🎤'), 
    ('Nhạc Rock', '🎸'), 
    ('Hip Hop', '🎧'), 
    ('Nhạc Indie', '🎹'), 
    ('K-Pop', '🇰🇷'),
    ('EDM', '🎛️')
) AS t(tag, icon)
WHERE c.category_name = 'Âm nhạc' 
ON CONFLICT DO NOTHING;

-- === ẨM THỰC ===
INSERT INTO interest_map (interest_tag, icon, category_id)
SELECT t.tag, t.icon, c.category_id 
FROM interest_categories c
CROSS JOIN (VALUES 
    ('Sushi', '🍣'), 
    ('Đồ chay', '🥗'), 
    ('Cà phê', '☕'), 
    ('Trà sữa', '🧋'), 
    ('Pizza', '🍕'), 
    ('Ẩm thực đường phố', '🍢')
) AS t(tag, icon)
WHERE c.category_name = 'Ẩm thực' 
ON CONFLICT DO NOTHING;

-- === CÔNG NGHỆ ===
INSERT INTO interest_map (interest_tag, icon, category_id)
SELECT t.tag, t.icon, c.category_id 
FROM interest_categories c
CROSS JOIN (VALUES 
    ('Lập trình', '💻'), 
    ('Chơi game', '🎮'), 
    ('Tiền ảo/Crypto', '💰'), 
    ('Trí tuệ nhân tạo (AI)', '🤖'), 
    ('Khởi nghiệp', '🚀')
) AS t(tag, icon)
WHERE c.category_name = 'Công nghệ' 
ON CONFLICT DO NOTHING;

-- === THÚ CƯNG (Mới bổ sung) ===
INSERT INTO interest_map (interest_tag, icon, category_id)
SELECT t.tag, t.icon, c.category_id 
FROM interest_categories c
CROSS JOIN (VALUES 
    ('Yêu Chó', '🐶'), 
    ('Yêu Mèo', '🐱'), 
    ('Chim cảnh', '🐦'), 
    ('Cá cảnh', '🐠'), 
    ('Hamster', '🐹'),
    ('Bò sát', '🦎')
) AS t(tag, icon)
WHERE c.category_name = 'Thú cưng' 
ON CONFLICT DO NOTHING;

-- === DU LỊCH (Mới bổ sung) ===
INSERT INTO interest_map (interest_tag, icon, category_id)
SELECT t.tag, t.icon, c.category_id 
FROM interest_categories c
CROSS JOIN (VALUES 
    ('Phượt', '🎒'), 
    ('Cắm trại', '⛺'), 
    ('Đi biển', '🏖️'), 
    ('Leo núi', '⛰️'), 
    ('Road trips', '🚗'),
    ('Khám phá', '🗺️')
) AS t(tag, icon)
WHERE c.category_name = 'Du lịch' 
ON CONFLICT DO NOTHING;

-- Thêm User Mặc định (ID sẽ là 1) để test không cần đăng nhập
INSERT INTO users (username, email, password_hash) 
VALUES ('test_user', 'test@gmail.com', 'dummy_hash')
ON CONFLICT (username) DO NOTHING;