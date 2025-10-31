/**
 * Cloudflare D1 Database Service for Local Places
 */

import type {
  Place,
  ParsedPlace,
  SearchPlacesInput,
  AddPlaceInput,
  UpdatePlaceInput,
  CategoryStats,
  Category,
} from '../types.js';

export class D1Client {
  constructor(private db: D1Database) {}

  /**
   * Parse amenities JSON string to array
   */
  private parsePlace(place: Place): ParsedPlace {
    return {
      ...place,
      amenities: place.amenities ? JSON.parse(place.amenities) : [],
    };
  }

  /**
   * Search for places with filters
   */
  async searchPlaces(input: SearchPlacesInput = {}): Promise<ParsedPlace[]> {
    const {
      category,
      minRating = 0,
      maxPriceLevel = 3,
      location,
      latitude,
      longitude,
      radiusKm,
      limit = 50,
    } = input;

    let query = 'SELECT * FROM places WHERE 1=1';
    const params: any[] = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (minRating > 0) {
      query += ' AND rating >= ?';
      params.push(minRating);
    }

    if (maxPriceLevel < 3) {
      query += ' AND price_level <= ?';
      params.push(maxPriceLevel);
    }

    // Location/city search
    if (location) {
      query += ' AND address LIKE ?';
      params.push(`%${location}%`);
    }

    // Distance filtering (approximate using lat/lng bounds)
    if (latitude !== undefined && longitude !== undefined && radiusKm) {
      // Approximate: 1 degree latitude ≈ 111km
      // 1 degree longitude varies by latitude, but we'll use rough approximation
      const latDelta = radiusKm / 111;
      const lngDelta = radiusKm / (111 * Math.cos((latitude * Math.PI) / 180));

      query += ' AND latitude BETWEEN ? AND ?';
      params.push(latitude - latDelta, latitude + latDelta);

      query += ' AND longitude BETWEEN ? AND ?';
      params.push(longitude - lngDelta, longitude + lngDelta);
    }

    query += ' ORDER BY rating DESC LIMIT ?';
    params.push(limit);

    const result = await this.db.prepare(query).bind(...params).all<Place>();

    return result.results.map((place) => this.parsePlace(place));
  }

  /**
   * Get place by ID
   */
  async getPlaceById(id: number): Promise<ParsedPlace | null> {
    const result = await this.db
      .prepare('SELECT * FROM places WHERE id = ?')
      .bind(id)
      .first<Place>();

    return result ? this.parsePlace(result) : null;
  }

  /**
   * Get all places (for map display)
   */
  async getAllPlaces(): Promise<ParsedPlace[]> {
    const result = await this.db
      .prepare('SELECT * FROM places ORDER BY name')
      .all<Place>();

    return result.results.map((place) => this.parsePlace(place));
  }

  /**
   * Add a new place
   */
  async addPlace(input: AddPlaceInput): Promise<ParsedPlace> {
    const {
      name,
      category,
      latitude,
      longitude,
      rating = 0,
      price_level = 2,
      description = null,
      amenities = [],
      hours = null,
      address = null,
      phone = null,
      website = null,
    } = input;

    const amenitiesJson = JSON.stringify(amenities);

    const result = await this.db
      .prepare(
        `INSERT INTO places (name, category, latitude, longitude, rating, price_level, description, amenities, hours, address, phone, website)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         RETURNING *`
      )
      .bind(
        name,
        category,
        latitude,
        longitude,
        rating,
        price_level,
        description,
        amenitiesJson,
        hours,
        address,
        phone,
        website
      )
      .first<Place>();

    if (!result) {
      throw new Error('Failed to insert place');
    }

    return this.parsePlace(result);
  }

  /**
   * Update an existing place
   */
  async updatePlace(input: UpdatePlaceInput): Promise<ParsedPlace | null> {
    const { id, ...updates } = input;

    // Build dynamic UPDATE query
    const setClauses: string[] = [];
    const params: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'amenities') {
          setClauses.push(`${key} = ?`);
          params.push(JSON.stringify(value));
        } else {
          setClauses.push(`${key} = ?`);
          params.push(value);
        }
      }
    });

    if (setClauses.length === 0) {
      return this.getPlaceById(id);
    }

    params.push(id);

    const query = `UPDATE places SET ${setClauses.join(', ')} WHERE id = ? RETURNING *`;

    const result = await this.db.prepare(query).bind(...params).first<Place>();

    return result ? this.parsePlace(result) : null;
  }

  /**
   * Delete a place
   */
  async deletePlace(id: number): Promise<boolean> {
    const result = await this.db
      .prepare('DELETE FROM places WHERE id = ? RETURNING id')
      .bind(id)
      .first();

    return result !== null;
  }

  /**
   * Find places nearby a location
   */
  async getPlacesNearby(
    latitude: number,
    longitude: number,
    radiusKm: number,
    category?: Category,
    limit: number = 20
  ): Promise<ParsedPlace[]> {
    return this.searchPlaces({
      latitude,
      longitude,
      radiusKm,
      category,
      limit,
    });
  }

  /**
   * Get statistics by category
   */
  async getStatistics(category?: Category): Promise<CategoryStats[]> {
    let query = `
      SELECT
        category,
        COUNT(*) as count,
        ROUND(AVG(rating), 2) as avg_rating,
        ROUND(AVG(price_level), 2) as avg_price_level
      FROM places
    `;

    const params: any[] = [];

    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }

    query += ' GROUP BY category ORDER BY count DESC';

    const result = await this.db.prepare(query).bind(...params).all<CategoryStats>();

    return result.results;
  }

  /**
   * Get places by category
   */
  async getPlacesByCategory(category: Category): Promise<ParsedPlace[]> {
    return this.searchPlaces({ category });
  }

  /**
   * Search places by name
   */
  async searchByName(searchTerm: string, limit: number = 10): Promise<ParsedPlace[]> {
    const result = await this.db
      .prepare(
        'SELECT * FROM places WHERE name LIKE ? ORDER BY rating DESC LIMIT ?'
      )
      .bind(`%${searchTerm}%`, limit)
      .all<Place>();

    return result.results.map((place) => this.parsePlace(place));
  }
}

// Export singleton-like factory
export function createD1Client(db: D1Database): D1Client {
  return new D1Client(db);
}
