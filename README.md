# Local Places Explorer - MCP Server

MCP server with local places database and AI chatbot powered by Google Gemini.

Demonstrates full **CRUD operations** with Cloudflare D1 (SQLite) database.

## Features

- **Interactive Map** - Explore 80 local businesses across US cities
- **AI Chatbot** - Natural language queries with Gemini AI function calling
- **Full CRUD** - Create, Read, Update, Delete places via MCP tools
- **D1 Database** - Cloudflare's serverless SQLite database
- **MCP Protocol** - 8 tools showcasing database operations

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Cloudflare D1 database

Create the D1 database:
```bash
npx wrangler d1 create local-places
```

Copy the database ID from the output and update `wrangler.toml` with your database ID.

Initialize the database with schema and seed data:
```bash
npx wrangler d1 execute local-places --local --file=./schema.sql
npx wrangler d1 execute local-places --local --file=./seed.sql
```

### 3. Add API key to `.dev.vars`
Create a `.dev.vars` file:
```
GEMINI_API_KEY=your_key_here
```

Get a free Gemini API key at: https://aistudio.google.com/app/apikey

### 4. Build and run
```bash
npm run build
npm run dev
```

### 5. Open the app
Visit: **http://localhost:8787/index.html**

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

### Deploy to Cloudflare Workers

1. Login to Cloudflare:
```bash
npx wrangler login
```

2. Create production database:
```bash
npx wrangler d1 create local-places
```

3. Update `wrangler.toml` with the production database ID

4. Initialize production database:
```bash
npx wrangler d1 execute local-places --file=./schema.sql
npx wrangler d1 execute local-places --file=./seed.sql
```

5. Add API key as secret:
```bash
npx wrangler secret put GEMINI_API_KEY
```

6. Deploy:
```bash
npm run deploy
```

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

---

Built to showcase MCP protocol with full CRUD operations using Cloudflare D1.
