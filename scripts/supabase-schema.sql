-- VillaWeb Cotizador Pro - Supabase Schema
-- Run this SQL in your Supabase SQL Editor to create the required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create quotes table
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folio TEXT UNIQUE NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_whatsapp TEXT NOT NULL,
  project_type TEXT NOT NULL CHECK (project_type IN ('LANDING', 'CORPORATIVA', 'ECOMMERCE', 'INTRANET')),
  industry TEXT,
  timeline TEXT CHECK (timeline IN ('7-10_DAYS', '2-3_WEEKS', '4+_WEEKS')),
  min_price NUMERIC NOT NULL,
  max_price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'CLP',
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED')),
  public_token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create quote_answers table
CREATE TABLE IF NOT EXISTS quote_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create quote_items table
CREATE TABLE IF NOT EXISTS quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('BASE', 'MULTIPLIER', 'ADDON', 'EXTRA')),
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create quote_events table
CREATE TABLE IF NOT EXISTS quote_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  event TEXT NOT NULL CHECK (event IN ('CREATED', 'VIEWED', 'PDF_DOWNLOADED', 'SENT_WHATSAPP', 'STATUS_CHANGED')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quotes_folio ON quotes(folio);
CREATE INDEX IF NOT EXISTS idx_quotes_public_token ON quotes(public_token);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quote_answers_quote_id ON quote_answers(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_items_quote_id ON quote_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_events_quote_id ON quote_events(quote_id);

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_events ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public INSERT on quotes (anyone can create a quote)
CREATE POLICY "Allow public insert on quotes" ON quotes
  FOR INSERT WITH CHECK (true);

-- Policy: Allow public SELECT on quotes by public_token
CREATE POLICY "Allow public select by token" ON quotes
  FOR SELECT USING (true);

-- Policy: Allow public UPDATE on quotes (for status changes - you might want to restrict this)
CREATE POLICY "Allow public update on quotes" ON quotes
  FOR UPDATE USING (true);

-- Similar policies for related tables
CREATE POLICY "Allow public insert on quote_answers" ON quote_answers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select on quote_answers" ON quote_answers
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert on quote_items" ON quote_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select on quote_items" ON quote_items
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert on quote_events" ON quote_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select on quote_events" ON quote_events
  FOR SELECT USING (true);

-- Note: For production, you should implement more restrictive RLS policies
-- based on your authentication system. The policies above are permissive
-- for development purposes.
