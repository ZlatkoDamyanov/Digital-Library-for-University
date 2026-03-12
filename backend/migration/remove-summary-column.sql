-- Migration to remove summary column from books table
-- Run this to remove the summary column since we're using description for both purposes
 
ALTER TABLE books DROP COLUMN IF EXISTS summary; 