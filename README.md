# Local Places Explorer - MCP Server

MCP server with local places database and AI chatbot powered by Google Gemini.

Demonstrates full **CRUD operations** with Cloudflare D1 (SQLite) database.

## Features

- **Interactive Map** - Explore 80 local businesses across US cities
- **AI Chatbot** - Natural language queries with Gemini AI function calling
- **Full CRUD** - Create, Read, Update, Delete places via MCP tools
- **D1 Database** - Cloudflare's serverless SQLite database
- **MCP Protocol** - 8 tools showcasing database operations



## MCP Tools (Full CRUD)

- `search_places` - Find places by category, rating, price
- `get_place_details` - Get full details for a place
- `add_place` - **CREATE** a new place
- `update_place` - **UPDATE** existing place
- `delete_place` - **DELETE** a place
- `get_statistics` - Get aggregated stats by category
- `places_nearby` - Find places within radius
- `search_by_name` - Search by name (partial matching)

## Database Schema

```sql
CREATE TABLE places (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,  -- cafe, restaurant, park, bookstore, gym, grocery
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  rating REAL,              -- 0-5 stars
  price_level INTEGER,      -- 1-3 ($-$$$)
  description TEXT,
  amenities TEXT,           -- JSON array
  hours TEXT,
  address TEXT,
  phone TEXT,
  website TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Example Queries

- "Find me a good coffee shop"
- "Show me all parks"
- "What are the best rated restaurants?"
- "Add a new cafe called Bean Counter at coordinates 40.7, -74.0"
- "Update place ID 5 to have a rating of 4.5"
- "What are the statistics for gyms?"
- "Find bookstores with WiFi"

## Deployment

#

## Tech Stack

- **MCP Server** - Model Context Protocol SDK
- **Database** - Cloudflare D1 (SQLite)
- **Hosting** - Cloudflare Workers
- **AI** - Google Gemini 2.5 Flash
- **Frontend** - Leaflet.js map
- **Language** - TypeScript

## Project Structure

```
├── schema.sql          # Database schema
├── seed.sql            # Sample data (80 places)
├── src/
│   ├── index.ts        # Cloudflare Worker entry point
│   ├── types.ts        # TypeScript definitions
│   ├── mcp/
│   │   └── server.ts   # MCP server with 8 tools
│   ├── services/
│   │   ├── d1.ts       # D1 database client
│   │   └── gemini.ts   # Gemini AI integration
│   └── public/
│       ├── index.html  # Frontend UI
│       ├── app.js      # Map and chat logic
│       └── styles.css  # Styling
└── wrangler.toml       # Cloudflare config
```

## Development

- `npm run build` - Compile TypeScript
- `npm run dev` - Run local dev server with D1 database
- `npm run deploy` - Deploy to Cloudflare

## Learn More

- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [MCP Protocol](https://modelcontextprotocol.io/)
- [Gemini API](https://ai.google.dev/docs)


