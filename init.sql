CREATE TABLE IF NOT EXISTS users (
                                     id SERIAL PRIMARY KEY,
                                     username VARCHAR(50) NOT NULL UNIQUE,
                                     password_hash TEXT NOT NULL,
                                     email VARCHAR(100) NOT NULL,
                                     role VARCHAR(10) DEFAULT 'user',
                                     confirmed BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS categories (
                                          id SERIAL PRIMARY KEY,
                                          name VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS algorithms (
                                          id SERIAL PRIMARY KEY,
                                          code TEXT,
                                          programming_language VARCHAR(50),
                                          title VARCHAR(100) NOT NULL,
                                          topic VARCHAR(100),
                                          user_id INTEGER REFERENCES users(id),

                                          is_private  BOOLEAN DEFAULT FALSE,
                                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                          description TEXT,

                                          category_id INTEGER REFERENCES categories(id),
                                          rating DOUBLE PRECISION DEFAULT 0,
                                          approved BOOLEAN DEFAULT FALSE
);

-- ALTER TABLE algorithms
--     ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT FALSE;


CREATE TABLE IF NOT EXISTS email_verification_tokens (
                                                         user_id INTEGER REFERENCES users(id),
                                                         token VARCHAR(32) PRIMARY KEY,
                                                         created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                                                         email VARCHAR(255) NOT NULL,
                                                         username VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
                                                     user_id INTEGER NOT NULL REFERENCES users(id),
                                                     token TEXT NOT NULL,
                                                     created_at TIMESTAMP NOT NULL,
                                                     email VARCHAR(255) NOT NULL,
                                                     username VARCHAR(255) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_algorithms_user_id ON algorithms(user_id);
CREATE INDEX IF NOT EXISTS idx_algorithms_category_id ON algorithms(category_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
