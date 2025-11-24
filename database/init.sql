CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS users(
    user_id BIGSERIAL PRIMARY KEY,
    photo_id BIGINT UNIQUE,
    mail VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    gender VARCHAR(10) NOT NULL,
    birth_date DATE NOT NULL,
    Bio VARCHAR(255) NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    education VARCHAR(255) NOT NULL,
    location_lat GEOGRAPHY(POINT, 4326) NOT NULL
    location_ing GEOGRAPHY(POINT, 4326) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()

)

CREATE TABLE IF NOT EXISTS uses_photos(
    photo_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    photo_url VARCHAR(255) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_preferences(
    preference_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    interested_in_gender VARCHAR(10) NOT NULL,
    age_min INT NOT NULL,
    age_max INT NOT NULL,
    max-distance_km INT NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
)

CREATE TABLE IF NOT EXISTS user_interests(
    interest_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    interest VARCHAR(100) NOT NULL,
    added_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS likes(
    like_id BIGSERIAL PRIMARY KEY,
    from_user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    to_user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    status_like VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages(
    message_id BIGSERIAL PRIMARY KEY,
    from_user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    to_user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sent_at TIMESTAMP NOT NULL DEFAULT NOW(),
    read_at TIMESTAMP
);