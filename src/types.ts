/**
 * Type definitions for Local Places database
 */

// Place categories
export const CATEGORIES = [
  'cafe',
  'restaurant',
  'park',
  'bookstore',
  'gym',
  'grocery',
] as const;

export type Category = typeof CATEGORIES[number];

// Place interface matching database schema
export interface Place {
  id: number;
  name: string;
  category: Category;
  latitude: number;
  longitude: number;
  rating: number; // 0-5
  price_level: number; // 1-3 ($, $$, $$$)
  description: string | null;
  amenities: string | null; // JSON array as string
  hours: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  created_at: string;
}

// Parsed amenities
export interface ParsedPlace extends Omit<Place, 'amenities'> {
  amenities: string[];
}

// MCP Tool Input types
export interface SearchPlacesInput {
  category?: Category;
  minRating?: number;
  maxPriceLevel?: number;
  location?: string; // City or location name to search in address
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  limit?: number;
}

export interface GetPlaceDetailsInput {
  id: number;
}

export interface AddPlaceInput {
  name: string;
  category: Category;
  latitude: number;
  longitude: number;
  rating?: number;
  price_level?: number;
  description?: string;
  amenities?: string[];
  hours?: string;
  address?: string;
  phone?: string;
  website?: string;
}

export interface UpdatePlaceInput {
  id: number;
  name?: string;
  category?: Category;
  latitude?: number;
  longitude?: number;
  rating?: number;
  price_level?: number;
  description?: string;
  amenities?: string[];
  hours?: string;
  address?: string;
  phone?: string;
  website?: string;
}

export interface DeletePlaceInput {
  id: number;
}

export interface PlacesNearbyInput {
  latitude: number;
  longitude: number;
  radiusKm: number;
  category?: Category;
  limit?: number;
}

export interface GetStatisticsInput {
  category?: Category;
}

// Statistics response
export interface CategoryStats {
  category: string;
  count: number;
  avg_rating: number;
  avg_price_level: number;
}

// Environment bindings for Cloudflare Worker
export interface Env {
  GEMINI_API_KEY: string;
  DB: D1Database;
  ASSETS?: any; // Static assets binding
}
