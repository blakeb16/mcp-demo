/**
 * Google Gemini AI Service Client
 * Handles natural language queries about local places
 */

import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { D1Client } from './d1.js';

// Function declarations for Gemini function calling
const PLACE_FUNCTIONS = [
  {
    name: 'search_places',
    description: 'Search for places with optional filters like category, rating, price level, or location. Use this when users ask about finding places in a specific city or area.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        category: {
          type: SchemaType.STRING,
          enum: ['cafe', 'restaurant', 'park', 'bookstore', 'gym', 'grocery'],
          description: 'Filter by category',
        },
        minRating: {
          type: SchemaType.NUMBER,
          description: 'Minimum rating (0-5)',
        },
        maxPriceLevel: {
          type: SchemaType.NUMBER,
          description: 'Maximum price level (1-3)',
        },
        location: {
          type: SchemaType.STRING,
          description: 'Filter by city or location name (e.g., "Chicago", "New York", "San Francisco"). Searches in the address field.',
        },
        limit: {
          type: SchemaType.NUMBER,
          description: 'Maximum results',
        },
      },
    },
  },
  {
    name: 'get_place_details',
    description: 'Get full details for a specific place by ID.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        id: {
          type: SchemaType.NUMBER,
          description: 'Place ID',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'add_place',
    description: 'Add a new place to the database. Use when user wants to create or add a new location.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        name: {
          type: SchemaType.STRING,
          description: 'Place name',
        },
        category: {
          type: SchemaType.STRING,
          enum: ['cafe', 'restaurant', 'park', 'bookstore', 'gym', 'grocery'],
          description: 'Place category',
        },
        latitude: {
          type: SchemaType.NUMBER,
          description: 'Latitude',
        },
        longitude: {
          type: SchemaType.NUMBER,
          description: 'Longitude',
        },
        rating: {
          type: SchemaType.NUMBER,
          description: 'Rating (0-5, optional)',
        },
        price_level: {
          type: SchemaType.NUMBER,
          description: 'Price level (1-3, optional)',
        },
        description: {
          type: SchemaType.STRING,
          description: 'Description (optional)',
        },
        amenities: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: 'Amenities array (optional)',
        },
        hours: {
          type: SchemaType.STRING,
          description: 'Business hours (optional)',
        },
        address: {
          type: SchemaType.STRING,
          description: 'Address (optional)',
        },
        phone: {
          type: SchemaType.STRING,
          description: 'Phone (optional)',
        },
        website: {
          type: SchemaType.STRING,
          description: 'Website (optional)',
        },
      },
      required: ['name', 'category', 'latitude', 'longitude'],
    },
  },
  {
    name: 'update_place',
    description: 'Update an existing place. Use when user wants to modify or edit place information.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        id: {
          type: SchemaType.NUMBER,
          description: 'Place ID to update',
        },
        name: { type: SchemaType.STRING },
        rating: { type: SchemaType.NUMBER },
        price_level: { type: SchemaType.NUMBER },
        description: { type: SchemaType.STRING },
        amenities: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
        hours: { type: SchemaType.STRING },
        address: { type: SchemaType.STRING },
        phone: { type: SchemaType.STRING },
        website: { type: SchemaType.STRING },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_place',
    description: 'Delete a place from the database. Use when user wants to remove a location.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        id: {
          type: SchemaType.NUMBER,
          description: 'Place ID to delete',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'get_statistics',
    description: 'Get statistics about places including counts and averages by category.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        category: {
          type: SchemaType.STRING,
          enum: ['cafe', 'restaurant', 'park', 'bookstore', 'gym', 'grocery'],
          description: 'Filter by category (optional)',
        },
      },
    },
  },
  {
    name: 'places_nearby',
    description: 'Find places within a certain distance of coordinates.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        latitude: { type: SchemaType.NUMBER },
        longitude: { type: SchemaType.NUMBER },
        radiusKm: { type: SchemaType.NUMBER },
        category: {
          type: SchemaType.STRING,
          enum: ['cafe', 'restaurant', 'park', 'bookstore', 'gym', 'grocery'],
        },
        limit: { type: SchemaType.NUMBER },
      },
      required: ['latitude', 'longitude', 'radiusKm'],
    },
  },
  {
    name: 'search_by_name',
    description: 'Search for places by name (partial matching).',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        searchTerm: {
          type: SchemaType.STRING,
          description: 'Search term',
        },
        limit: {
          type: SchemaType.NUMBER,
          description: 'Max results',
        },
      },
      required: ['searchTerm'],
    },
  },
];

// System instruction
const SYSTEM_INSTRUCTION = `You are a helpful local places assistant. You help users discover, search, and manage local businesses and points of interest.

You have access to a database of places across different categories:
- **cafes** - Coffee shops and cafes
- **restaurants** - Dining establishments
- **parks** - Public parks and recreation areas
- **bookstores** - Book shops and libraries
- **gyms** - Fitness centers and gyms
- **grocery** - Grocery and convenience stores

Each place has:
- Name, category, location (lat/lng)
- Rating (0-5 stars)
- Price level (1=$, 2=$$, 3=$$$)
- Description, hours, address, phone, website
- Amenities (wifi, parking, outdoor_seating, etc.)

**Your capabilities:**
1. **Search** - Find places by category, rating, price, or location (city name)
2. **Details** - Get full information about a specific place
3. **Add** - Create new place entries (users can suggest additions)
4. **Update** - Modify existing place information
5. **Delete** - Remove places from the database
6. **Statistics** - Show aggregated data and trends
7. **Nearby** - Find places within a radius
8. **Name Search** - Find places by name

**Guidelines:**
1. Be conversational and friendly
2. When users ask vague questions, make reasonable assumptions (e.g., "coffee shops" = cafes)
3. Suggest related queries or nearby alternatives
4. For CRUD operations (add/update/delete), confirm what you did
5. Explain ratings and price levels clearly (★ for ratings, $ for price)
6. Provide context - mention address, hours, amenities when relevant
7. When users ask about places "in [city]" or "near [location]", use the location parameter

**Example interactions:**
- "Find me a good coffee shop" → search_places with category=cafe, minRating=4
- "Show me parks in Chicago" → search_places with category=park, location="Chicago"
- "Add a new cafe called Bean There" → add_place with provided details
- "What are the stats for restaurants?" → get_statistics with category=restaurant
- "Find bookstores in San Francisco" → search_places with category=bookstore, location="San Francisco"`;

export class GeminiClient {
  private model: any;
  private conversationHistory: any[] = [];
  private dbClient: D1Client;

  constructor(apiKey: string, db: D1Database) {
    const genAI = new GoogleGenerativeAI(apiKey);
    this.dbClient = new D1Client(db);

    // Initialize model with function calling
    this.model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{ functionDeclarations: PLACE_FUNCTIONS as any }],
    });
  }

  /**
   * Execute a function call from Gemini
   */
  private async executeFunction(functionCall: any): Promise<any> {
    const { name, args } = functionCall;

    try {
      switch (name) {
        case 'search_places': {
          const places = await this.dbClient.searchPlaces(args);
          return {
            success: true,
            count: places.length,
            data: places.map((p) => ({
              id: p.id,
              name: p.name,
              category: p.category,
              rating: p.rating,
              price_level: p.price_level,
              address: p.address,
              amenities: p.amenities,
            })),
          };
        }

        case 'get_place_details': {
          const place = await this.dbClient.getPlaceById(args.id);
          return place
            ? { success: true, data: place }
            : { success: false, error: 'Place not found' };
        }

        case 'add_place': {
          const place = await this.dbClient.addPlace(args);
          return { success: true, data: place };
        }

        case 'update_place': {
          const place = await this.dbClient.updatePlace(args);
          return place
            ? { success: true, data: place }
            : { success: false, error: 'Place not found' };
        }

        case 'delete_place': {
          const success = await this.dbClient.deletePlace(args.id);
          return success
            ? { success: true, message: 'Place deleted' }
            : { success: false, error: 'Place not found' };
        }

        case 'get_statistics': {
          const stats = await this.dbClient.getStatistics(args.category);
          return { success: true, data: stats };
        }

        case 'places_nearby': {
          const { latitude, longitude, radiusKm, category, limit } = args;
          const places = await this.dbClient.getPlacesNearby(
            latitude,
            longitude,
            radiusKm,
            category,
            limit
          );
          return {
            success: true,
            count: places.length,
            data: places.map((p) => ({
              id: p.id,
              name: p.name,
              category: p.category,
              rating: p.rating,
              address: p.address,
            })),
          };
        }

        case 'search_by_name': {
          const { searchTerm, limit = 10 } = args;
          const places = await this.dbClient.searchByName(searchTerm, limit);
          return {
            success: true,
            count: places.length,
            data: places.map((p) => ({
              id: p.id,
              name: p.name,
              category: p.category,
              rating: p.rating,
              address: p.address,
            })),
          };
        }

        default:
          return { success: false, error: `Unknown function: ${name}` };
      }
    } catch (error) {
      console.error(`Function ${name} failed:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Send a message and get a response with function calling support
   */
  async chat(userMessage: string): Promise<string> {
    try {
      // Start or continue chat
      const chat = this.model.startChat({
        history: this.conversationHistory,
      });

      let result = await chat.sendMessage(userMessage);
      let response = result.response;

      // Get function calls
      let functionCalls;
      if (typeof response.functionCalls === 'function') {
        functionCalls = response.functionCalls();
      } else {
        functionCalls = response.functionCalls;
      }

      // Handle function calls
      while (functionCalls && functionCalls.length > 0) {
        const functionCall = functionCalls[0];

        // Execute the function
        const functionResult = await this.executeFunction(functionCall);

        // Send function result back to model
        result = await chat.sendMessage([
          {
            functionResponse: {
              name: functionCall.name,
              response: functionResult,
            },
          },
        ]);

        response = result.response;

        // Re-check for more function calls
        if (typeof response.functionCalls === 'function') {
          functionCalls = response.functionCalls();
        } else {
          functionCalls = response.functionCalls;
        }
      }

      // Get final text response
      const text = response.text();

      if (!text || text.trim().length === 0) {
        console.error('WARNING: Empty response from Gemini!');
        return 'I received the data but had trouble formulating a response. Please try rephrasing your question.';
      }

      // Update conversation history
      this.conversationHistory.push(
        { role: 'user', parts: [{ text: userMessage }] },
        { role: 'model', parts: [{ text }] }
      );

      return text;
    } catch (error) {
      console.error('Chat error:', error);
      throw new Error(
        `Failed to process query: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Reset conversation history
   */
  resetConversation(): void {
    this.conversationHistory = [];
  }

  /**
   * Get conversation history
   */
  getHistory(): any[] {
    return this.conversationHistory;
  }
}
