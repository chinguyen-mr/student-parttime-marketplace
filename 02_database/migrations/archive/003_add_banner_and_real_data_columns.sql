-- Migration 003: Add banner_url to jobs and company_logo_url to profiles
-- Supporting Real Logos and Unsplash Banners from Marketplace_Parttime_TestData_RealLogos.xlsx

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_logo_url TEXT;

ALTER TABLE jobs ALTER COLUMN title TYPE VARCHAR(255);
ALTER TABLE jobs ALTER COLUMN location TYPE VARCHAR(255);
ALTER TABLE jobs ALTER COLUMN category TYPE VARCHAR(150);
ALTER TABLE profiles ALTER COLUMN company_name TYPE VARCHAR(255);
ALTER TABLE profiles ALTER COLUMN company_address TYPE VARCHAR(255);
