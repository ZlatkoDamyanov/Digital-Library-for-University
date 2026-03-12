-- Migration to allow NULL values in university_id column for admin users
-- This allows admin users (with @bfu.bg emails) to register without university ID

ALTER TABLE users ALTER COLUMN university_id DROP NOT NULL; 