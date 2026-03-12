-- Create custom ENUM types
DO $$ BEGIN
    CREATE TYPE public.borrow_status AS ENUM('BORROWED', 'RETURNED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.role AS ENUM('USER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.status AS ENUM('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create books table
CREATE TABLE IF NOT EXISTS books (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "title" varchar(255) NOT NULL,
  "author" varchar(255) NOT NULL,
  "category" text NOT NULL,
  "publisher" text NOT NULL,
  "publishedYear" integer NOT NULL,
  "ISBN" varchar(20) NOT NULL,
  "language" varchar(50) NOT NULL,
  "pages" integer NOT NULL,
  "totalCopies" integer DEFAULT 1 NOT NULL,
  "availableCopies" integer DEFAULT 0 NOT NULL,
  "description" text NOT NULL,
  "cover" text NOT NULL,
  "pdffile" text NOT NULL,
  "created_at" timestamptz DEFAULT now(),
  CONSTRAINT "books_id_unique" UNIQUE("id")
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "firstName" varchar(255) NOT NULL,
  "lastName" varchar(255) NOT NULL,
  "email" text NOT NULL,
  "university_id" integer,
  "password" text NOT NULL,
  "status" "status" DEFAULT 'PENDING',
  "role" "role" DEFAULT 'USER',
  "last_activity_date" date DEFAULT now(),
  "created_at" timestamptz DEFAULT now(),
  CONSTRAINT "users_id_unique" UNIQUE("id"),
  CONSTRAINT "users_email_unique" UNIQUE("email"),
  CONSTRAINT "users_university_id_unique" UNIQUE("university_id") DEFERRABLE INITIALLY DEFERRED
);

-- Create borrow_records table
CREATE TABLE IF NOT EXISTS borrow_records (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "book_id" uuid NOT NULL,
  "borrow_date" timestamptz DEFAULT now() NOT NULL,
  "due_date" date NOT NULL,
  "return_date" date,
  "status" "borrow_status" DEFAULT 'BORROWED' NOT NULL,
  "created_at" timestamptz DEFAULT now(),
  CONSTRAINT "borrow_records_id_unique" UNIQUE("id"),
  CONSTRAINT "borrow_records_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id"),
  CONSTRAINT "borrow_records_book_id_fk" FOREIGN KEY ("book_id") REFERENCES "books"("id")
);
