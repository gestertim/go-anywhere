-- Add end_date column for accommodation support
ALTER TABLE itinerary_items ADD COLUMN end_date DATE NULL;

-- Add comment for clarity
COMMENT ON COLUMN itinerary_items.end_date IS 'Optional end date for multi-day accommodations; only applicable to accommodation type items';

-- Create index for common queries on date range
CREATE INDEX IF NOT EXISTS idx_itinerary_items_date_range ON itinerary_items(trip_id, date, end_date) WHERE end_date IS NOT NULL;
