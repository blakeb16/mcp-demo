-- Local Places Database Schema

DROP TABLE IF EXISTS places;

CREATE TABLE places (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  rating REAL CHECK(rating >= 0 AND rating <= 5),
  price_level INTEGER CHECK(price_level >= 0 AND price_level <= 3),
  description TEXT,
  amenities TEXT, -- JSON array stored as text
  hours TEXT,
  address TEXT,
  phone TEXT,
  website TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common queries
CREATE INDEX idx_category ON places(category);
CREATE INDEX idx_rating ON places(rating);
CREATE INDEX idx_location ON places(latitude, longitude);
