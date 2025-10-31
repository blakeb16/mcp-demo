/**
 * MCP Server for Local Places
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { D1Client } from '../services/d1.js';
import type { ParsedPlace } from '../types.js';

// Define MCP Tools with full CRUD operations
const TOOLS: Tool[] = [
  {
    name: 'search_places',
    description: 'Search for places with optional filters (category, rating, price level, location)',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: ['cafe', 'restaurant', 'park', 'bookstore', 'gym', 'grocery'],
          description: 'Filter by category',
        },
        minRating: {
          type: 'number',
          description: 'Minimum rating (0-5)',
        },
        maxPriceLevel: {
          type: 'number',
          description: 'Maximum price level (1-3, where 1=$, 2=$$, 3=$$$)',
        },
        location: {
          type: 'string',
          description: 'Filter by city or location name (e.g., "Chicago", "New York", "San Francisco")',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results (default: 50)',
        },
      },
    },
  },
  {
    name: 'get_place_details',
    description: 'Get full details for a specific place by ID',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'Place ID',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'add_place',
    description: 'Add a new place to the database (CREATE operation)',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Place name',
        },
        category: {
          type: 'string',
          enum: ['cafe', 'restaurant', 'park', 'bookstore', 'gym', 'grocery'],
          description: 'Place category',
        },
        latitude: {
          type: 'number',
          description: 'Latitude coordinate',
        },
        longitude: {
          type: 'number',
          description: 'Longitude coordinate',
        },
        rating: {
          type: 'number',
          description: 'Rating (0-5, optional, default: 0)',
        },
        price_level: {
          type: 'number',
          description: 'Price level (1-3, optional, default: 2)',
        },
        description: {
          type: 'string',
          description: 'Description (optional)',
        },
        amenities: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of amenities like ["wifi", "parking", "outdoor_seating"] (optional)',
        },
        hours: {
          type: 'string',
          description: 'Business hours (optional)',
        },
        address: {
          type: 'string',
          description: 'Street address (optional)',
        },
        phone: {
          type: 'string',
          description: 'Phone number (optional)',
        },
        website: {
          type: 'string',
          description: 'Website URL (optional)',
        },
      },
      required: ['name', 'category', 'latitude', 'longitude'],
    },
  },
  {
    name: 'update_place',
    description: 'Update an existing place (UPDATE operation)',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'Place ID to update',
        },
        name: { type: 'string' },
        category: {
          type: 'string',
          enum: ['cafe', 'restaurant', 'park', 'bookstore', 'gym', 'grocery'],
        },
        latitude: { type: 'number' },
        longitude: { type: 'number' },
        rating: { type: 'number' },
        price_level: { type: 'number' },
        description: { type: 'string' },
        amenities: {
          type: 'array',
          items: { type: 'string' },
        },
        hours: { type: 'string' },
        address: { type: 'string' },
        phone: { type: 'string' },
        website: { type: 'string' },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_place',
    description: 'Delete a place from the database (DELETE operation)',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'Place ID to delete',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'get_statistics',
    description: 'Get statistics about places (count, average rating, average price) by category or overall',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: ['cafe', 'restaurant', 'park', 'bookstore', 'gym', 'grocery'],
          description: 'Filter statistics by category (optional)',
        },
      },
    },
  },
  {
    name: 'places_nearby',
    description: 'Find places within a radius of a location',
    inputSchema: {
      type: 'object',
      properties: {
        latitude: {
          type: 'number',
          description: 'Center latitude',
        },
        longitude: {
          type: 'number',
          description: 'Center longitude',
        },
        radiusKm: {
          type: 'number',
          description: 'Search radius in kilometers',
        },
        category: {
          type: 'string',
          enum: ['cafe', 'restaurant', 'park', 'bookstore', 'gym', 'grocery'],
          description: 'Filter by category (optional)',
        },
        limit: {
          type: 'number',
          description: 'Maximum results (default: 20)',
        },
      },
      required: ['latitude', 'longitude', 'radiusKm'],
    },
  },
  {
    name: 'search_by_name',
    description: 'Search for places by name (partial matching)',
    inputSchema: {
      type: 'object',
      properties: {
        searchTerm: {
          type: 'string',
          description: 'Search term to match in place names',
        },
        limit: {
          type: 'number',
          description: 'Maximum results (default: 10)',
        },
      },
      required: ['searchTerm'],
    },
  },
];

/**
 * Format place data for display
 */
function formatPlace(place: ParsedPlace): string {
  const priceSymbols = '$'.repeat(place.price_level || 1);
  const stars = '★'.repeat(Math.round(place.rating));

  let output = `\n=== ${place.name} ===\n`;
  output += `Category: ${place.category}\n`;
  output += `Rating: ${place.rating}/5 ${stars}\n`;
  output += `Price: ${priceSymbols}\n`;

  if (place.description) output += `Description: ${place.description}\n`;
  if (place.address) output += `Address: ${place.address}\n`;
  if (place.hours) output += `Hours: ${place.hours}\n`;
  if (place.phone) output += `Phone: ${place.phone}\n`;
  if (place.website) output += `Website: ${place.website}\n`;
  if (place.amenities.length > 0)
    output += `Amenities: ${place.amenities.join(', ')}\n`;

  output += `Location: ${place.latitude}, ${place.longitude}\n`;

  return output;
}

/**
 * Create and configure MCP Server
 */
export function createMCPServer(db: D1Database) {
  const dbClient = new D1Client(db);

  const server = new Server(
    {
      name: 'local-places-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: TOOLS };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case 'search_places': {
          const places = await dbClient.searchPlaces(args as any);

          if (places.length === 0) {
            return {
              content: [{ type: 'text', text: 'No places found matching criteria.' }],
            };
          }

          let output = `\n=== Found ${places.length} places ===\n`;
          places.forEach((place, i) => {
            output += `\n${i + 1}. ${place.name} (${place.category}) - ${place.rating}★`;
            if (place.address) output += ` - ${place.address}`;
            output += '\n';
          });

          return {
            content: [{ type: 'text', text: output }],
          };
        }

        case 'get_place_details': {
          const { id } = args as any;
          const place = await dbClient.getPlaceById(id);

          if (!place) {
            return {
              content: [{ type: 'text', text: `Place with ID ${id} not found.` }],
            };
          }

          return {
            content: [{ type: 'text', text: formatPlace(place) }],
          };
        }

        case 'add_place': {
          const place = await dbClient.addPlace(args as any);

          return {
            content: [
              {
                type: 'text',
                text: `✅ Successfully added "${place.name}"!\n${formatPlace(place)}`,
              },
            ],
          };
        }

        case 'update_place': {
          const place = await dbClient.updatePlace(args as any);

          if (!place) {
            return {
              content: [
                { type: 'text', text: `Place with ID ${(args as any).id} not found.` },
              ],
            };
          }

          return {
            content: [
              {
                type: 'text',
                text: `✅ Successfully updated "${place.name}"!\n${formatPlace(place)}`,
              },
            ],
          };
        }

        case 'delete_place': {
          const { id } = args as any;
          const success = await dbClient.deletePlace(id);

          if (!success) {
            return {
              content: [{ type: 'text', text: `Place with ID ${id} not found.` }],
            };
          }

          return {
            content: [{ type: 'text', text: `✅ Successfully deleted place ID ${id}.` }],
          };
        }

        case 'get_statistics': {
          const stats = await dbClient.getStatistics((args as any)?.category);

          if (stats.length === 0) {
            return {
              content: [{ type: 'text', text: 'No statistics available.' }],
            };
          }

          let output = '\n=== Place Statistics ===\n\n';
          stats.forEach((stat) => {
            output += `${stat.category.toUpperCase()}:\n`;
            output += `  • Total: ${stat.count} places\n`;
            output += `  • Avg Rating: ${stat.avg_rating}/5\n`;
            output += `  • Avg Price: ${'$'.repeat(Math.round(stat.avg_price_level))}\n\n`;
          });

          return {
            content: [{ type: 'text', text: output }],
          };
        }

        case 'places_nearby': {
          const { latitude, longitude, radiusKm, category, limit = 20 } = args as any;
          const places = await dbClient.getPlacesNearby(
            latitude,
            longitude,
            radiusKm,
            category,
            limit
          );

          if (places.length === 0) {
            return {
              content: [
                {
                  type: 'text',
                  text: `No places found within ${radiusKm}km of (${latitude}, ${longitude}).`,
                },
              ],
            };
          }

          let output = `\n=== ${places.length} places within ${radiusKm}km ===\n`;
          places.forEach((place, i) => {
            output += `\n${i + 1}. ${place.name} (${place.category}) - ${place.rating}★\n`;
          });

          return {
            content: [{ type: 'text', text: output }],
          };
        }

        case 'search_by_name': {
          const { searchTerm, limit = 10 } = args as any;
          const places = await dbClient.searchByName(searchTerm, limit);

          if (places.length === 0) {
            return {
              content: [
                { type: 'text', text: `No places found matching "${searchTerm}".` },
              ],
            };
          }

          let output = `\n=== Search results for "${searchTerm}" ===\n`;
          places.forEach((place, i) => {
            output += `\n${i + 1}. ${place.name} (${place.category}) - ${place.rating}★\n`;
          });

          return {
            content: [{ type: 'text', text: output }],
          };
        }

        default:
          return {
            content: [{ type: 'text', text: `Unknown tool: ${name}` }],
            isError: true,
          };
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error executing ${name}: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}

/**
 * Run MCP server with stdio transport
 * Note: This won't work in Cloudflare Workers, only for local MCP clients
 */
export async function runMCPServer(db: D1Database) {
  const server = createMCPServer(db);
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('Local Places MCP Server running on stdio');
}
