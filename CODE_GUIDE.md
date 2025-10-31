# Code Guide

## Project Overview

This is an MCP (Model Context Protocol) server that provides local places data (cafes, restaurants, parks, bookstores, gyms, grocery stores) through multiple interfaces:
1. **MCP Server** - Can be used by Claude Desktop or other MCP clients
2. **Web API** - HTTP endpoints hosted on Cloudflare Workers
3. **Web UI** - Interactive map and chatbot interface
4. **D1 Database** - Cloudflare's serverless SQLite database with full CRUD operations

## Folder Structure

```
src/
├── mcp/              # MCP server implementation
├── services/         # Service clients (D1 database, Gemini AI)
├── public/           # Frontend files (HTML, CSS, JS)
├── index.ts          # Main entry point & Cloudflare Worker handler
└── types.ts          # TypeScript types for places data

Root files:
├── schema.sql        # Database schema definition
├── seed.sql          # Sample data for database
├── wrangler.toml     # Cloudflare Workers configuration
└── tsconfig.json     # TypeScript configuration
```

---

## Core Files

### `src/index.ts`
**Purpose:** Main entry point for the Cloudflare Worker

**Mode: Cloudflare Worker (HTTP)**
- Handles HTTP requests from the web
- Provides these endpoints:
  - `GET /health` - Health check
  - `GET /api` - API documentation
  - `GET /api/places` - Get all places for map display
  - `POST /api/chat` - Chat with AI about places
  - `POST /api/chat/reset` - Reset conversation
  - `GET /` - Serves the web UI

**Key Features:**
- In-memory session storage for chat conversations
- CORS headers for browser access
- Integration with Gemini AI for natural language queries
- Direct D1 database access

**How it works on Cloudflare:**
1. Cloudflare Workers is an edge computing platform
2. This file exports a `fetch` handler that processes all HTTP requests
3. The worker runs on Cloudflare's global network (instant startup, no cold starts)
4. Environment variables (like `GEMINI_API_KEY`) are passed via the `env` parameter
5. D1 database is accessed via `env.DB` binding
6. Static files (HTML, CSS, JS) are served from the `ASSETS` binding

### `src/types.ts`
**Purpose:** TypeScript type definitions for places data

**What it contains:**
- `Category` type - cafe, restaurant, park, bookstore, gym, grocery
- `Place` interface - Database schema matching D1 table structure
- `ParsedPlace` interface - Place with parsed amenities array
- Input types for all MCP tools (SearchPlacesInput, AddPlaceInput, etc.)
- `CategoryStats` interface - Statistics response format
- `Env` interface - Environment bindings (DB, GEMINI_API_KEY, ASSETS)

**Why it's important:**
- Provides type safety across the project
- Documents all data structures
- Used by D1 client, MCP server, and Gemini AI

---

## Database Files

### `schema.sql`
**Purpose:** Defines the D1 database structure

**What it contains:**
- `places` table definition with columns:
  - id (PRIMARY KEY AUTOINCREMENT)
  - name, category, latitude, longitude
  - rating (0-5), price_level (0-3)
  - description, amenities (JSON), hours, address, phone, website
  - created_at (TIMESTAMP)
- Indexes for performance:
  - idx_category on category
  - idx_rating on rating
  - idx_location on (latitude, longitude)

**Usage:**
```bash
# Local database
npx wrangler d1 execute local-places --local --file=./schema.sql

# Remote database
npx wrangler d1 execute local-places --remote --file=./schema.sql
```

### `seed.sql`
**Purpose:** Populates database with sample data

**What it contains:**
- 60+ places across major US cities (SF, NYC, Portland, Chicago, LA, Austin, Seattle, San Diego)
- Multiple NYC parks (Central Park, Prospect Park, etc.)
- Diverse categories: cafes, restaurants, parks, bookstores, gyms, grocery stores
- Realistic data with addresses, ratings, hours, amenities

**Usage:**
```bash
# Local database
npx wrangler d1 execute local-places --local --file=./seed.sql

# Remote database
npx wrangler d1 execute local-places --remote --file=./seed.sql
```

---

## MCP Folder: `src/mcp/`

### `src/mcp/server.ts`
**Purpose:** Implements the MCP server protocol for local places queries

**What it does:**
- Defines 8 MCP tools that external clients (like Claude) can call
- Handles tool requests and returns formatted responses
- Translates MCP requests into D1 database queries

**The 8 MCP Tools:**
1. `search_places` - Find places by category, rating, price, or location
2. `get_place_details` - Get full details for a specific place by ID
3. `add_place` - Add a new place to the database (CREATE)
4. `update_place` - Update existing place information (UPDATE)
5. `delete_place` - Remove a place from the database (DELETE)
6. `get_statistics` - Get stats by category (count, avg rating, avg price)
7. `places_nearby` - Find places within a radius of coordinates
8. `search_by_name` - Search places by name (partial matching)

**Key Functions:**
- `createMCPServer(db)` - Sets up the MCP server with tool definitions
- `runMCPServer(db)` - Starts server with stdio transport (not used in Workers)
- `formatPlace(place)` - Formats place data for human-readable display

**How it works:**
1. MCP client (like Claude Desktop) sends tool request
2. Server receives request
3. Calls appropriate D1Client method
4. Formats and returns data to client

---

## Services Folder: `src/services/`

### `src/services/d1.ts`
**Purpose:** Client for Cloudflare D1 database operations

**What it does:**
- Provides typed methods for all database operations
- Handles SQL query construction and parameter binding
- Parses amenities JSON to/from arrays

**Key Methods:**
- `searchPlaces(input)` - Search with filters (category, rating, price, location, coordinates)
- `getPlaceById(id)` - Get specific place
- `getAllPlaces()` - Get all places for map display
- `addPlace(input)` - Create new place
- `updatePlace(input)` - Update existing place (dynamic query building)
- `deletePlace(id)` - Delete place
- `getPlacesNearby(lat, lng, radiusKm, category?, limit?)` - Distance-based search
- `getStatistics(category?)` - Aggregate stats
- `searchByName(searchTerm, limit?)` - Name search
- `getPlacesByCategory(category)` - Category filter

**How it works:**
1. Receives typed input parameters
2. Constructs SQL query with proper parameter binding
3. Executes query on D1 database
4. Parses results and converts amenities JSON to arrays
5. Returns typed results

**Example Query:**
```typescript
// Input: { category: "park", location: "Chicago", minRating: 4 }
// SQL: SELECT * FROM places WHERE 1=1 AND category = ? AND address LIKE ? AND rating >= ? ORDER BY rating DESC LIMIT ?
// Params: ["park", "%Chicago%", 4, 50]
```

### `src/services/gemini.ts`
**Purpose:** Client for Google Gemini AI with function calling for place queries

**What it does:**
- Integrates Gemini AI for natural language chat
- Implements function calling - Gemini can call place tools automatically
- Maintains conversation history for context

**Key Features:**
- Uses `gemini-2.5-flash` model
- System instruction teaches Gemini about place categories and capabilities
- Automatic function calling - Gemini decides which tool to use
- Maps 8 function declarations to D1Client methods

**Function Calling Flow:**
1. User asks: "Show me parks in Chicago"
2. Gemini recognizes it needs to search places
3. Calls `search_places` function with parameters:
   - `category: "park"`
   - `location: "Chicago"`
4. `executeFunction()` fetches data from D1
5. Gemini receives data and formats natural response
6. Returns: "I found X parks in Chicago: [list]"

**Key Methods:**
- `chat(userMessage)` - Send message, get AI response
- `executeFunction(functionCall)` - Execute place queries via D1Client
- `resetConversation()` - Clear chat history
- `getHistory()` - Get conversation history

**How Cloudflare executes this:**
- Gemini API calls are made from the Cloudflare Worker
- API key stored in Cloudflare environment variables/secrets
- D1 database accessed directly in the same worker
- No timeout limits (Cloudflare Workers can run up to 30 seconds per request)

---

## Public Folder: `src/public/`

### `src/public/index.html`
**Purpose:** Main web interface with map and chatbot

**Features:**
- Interactive Leaflet.js map showing all places as colored markers
- Category legend (each category has a color)
- Click markers to see place details
- Chat interface for asking questions
- List of available MCP tools shown on load

**How it works:**
1. Loads on page: `/index.html`
2. Fetches all places from `/api/places`
3. Draws colored markers on map (one per place)
4. User clicks marker → shows popup with place details
5. User types question → sends to `/api/chat`
6. Displays available tools: search_places, add_place, update_place, etc.

### `src/public/app.js`
**Purpose:** Frontend JavaScript logic

**Key Functions:**
- `initMap()` - Initializes Leaflet.js map centered on US
- `loadPlaces()` - Fetches all places from API and draws markers
- `getMarkerIcon(category)` - Returns colored marker for category
- `sendMessage()` - Sends chat messages to the API
- `addMessage()` - Adds messages to chat UI
- `resetConversation()` - Clears chat history

**Category Colors:**
- cafe: brown (#8B4513)
- restaurant: tomato red (#FF6347)
- park: green (#228B22)
- bookstore: indigo (#4B0082)
- gym: orange (#FF8C00)
- grocery: lime green (#32CD32)

**How it works:**
1. On page load, initializes map
2. Fetches all places (fast - stored in D1)
3. Renders each place as a colored marker
4. Sets up chat event listeners
5. Handles user interactions

### `src/public/styles.css`
**Purpose:** Styling for the web interface

**What it styles:**
- Two-column layout (map on left, chat on right)
- Chat message bubbles (user vs bot)
- Map controls and popups
- Category legend with colored markers
- Place popup styling
- Responsive design

---

## Configuration Files

### `wrangler.toml`
**Purpose:** Cloudflare Workers configuration

**Key settings:**
- `name = "mcp-local-places"` - Worker name
- `main = "dist/index.js"` - Entry point after build
- `compatibility_date = "2024-01-01"` - Cloudflare API version
- `[[d1_databases]]` - D1 database binding:
  - `binding = "DB"` - Access via env.DB
  - `database_name = "local-places"`
  - `database_id = "84a81534-c4eb-45b3-9e24-bb6b5f14de8a"`
- `[assets]` - Static file serving:
  - `directory = "src/public"` - Serves HTML/CSS/JS files
  - `binding = "ASSETS"`
- `[build]` - Build configuration:
  - `command = "npm run build"`

**How deployment works:**
1. Run `npm run build` - TypeScript compiles to `dist/`
2. Run `npm run deploy` - Wrangler uploads code to Cloudflare
3. Cloudflare distributes worker to global edge network
4. D1 database is automatically bound to the worker
5. Worker runs on demand when HTTP requests arrive

### `tsconfig.json`
**Purpose:** TypeScript compiler configuration

**Key settings:**
- `target: "ES2022"` - Modern JavaScript output
- `module: "ES2022"` - ES modules for Cloudflare Workers
- `moduleResolution: "bundler"` - Cloudflare bundler resolution
- `outDir: "dist"` - Compiled files go here
- `include: ["src/**/*"]` - Compile all files in src/

### `package.json`
**Purpose:** Project metadata and dependencies

**Scripts:**
- `build` - Compiles TypeScript
- `dev` - Runs local development server with D1
- `deploy` - Deploys to Cloudflare production

**Dependencies:**
- `@google/generative-ai` - Gemini AI client
- `@modelcontextprotocol/sdk` - MCP protocol implementation

**Dev Dependencies:**
- `typescript` - TypeScript compiler
- `wrangler` - Cloudflare Workers CLI
- `@cloudflare/workers-types` - TypeScript types for Workers

---

## How It All Works on Cloudflare

### Request Flow

```
User Request → Cloudflare Edge → Worker Code → D1 Database → Response
                                       ↓
                                 Gemini AI (for chat)
```

**Step-by-step:**

1. **User visits mcp-local-places.workers.dev**
   - Request hits Cloudflare's global network
   - Routed to nearest edge location (< 50ms latency worldwide)

2. **Cloudflare Worker starts**
   - Executes `src/index.ts` → `export default { fetch() }`
   - No cold start (V8 isolates are pre-warmed)
   - D1 database binding available via `env.DB`

3. **Worker handles request**
   - `GET /` → Serves `index.html` from ASSETS binding
   - `GET /api/places` → Queries D1 → Returns all places as JSON
   - `POST /api/chat` → Calls Gemini AI → Gemini calls functions → Queries D1 → Returns response

4. **Response sent back**
   - Cloudflare caches static files (HTML, CSS, JS)
   - API responses sent immediately (not cached)

### Why Cloudflare Workers + D1?

1. **Free Tier:** 100,000 requests/day, 5GB D1 storage
2. **Global:** Runs in 300+ data centers worldwide
3. **Fast:** No cold starts, < 10ms startup time, D1 queries < 5ms
4. **Scalable:** Auto-scales to millions of requests
5. **Simple:** No servers to manage, serverless SQL database
6. **Cheap:** First 10M D1 reads/day free

### Environment Variables

**Local development (`.dev.vars`):**
```
GEMINI_API_KEY=your_key_here
```

**Production (Cloudflare secrets):**
```bash
npx wrangler secret put GEMINI_API_KEY
```

Workers access via `env.GEMINI_API_KEY` and `env.DB` in the fetch handler.

### Database Access

The D1 database is accessed via:
```typescript
export default {
  async fetch(request: Request, env: Env) {
    const dbClient = new D1Client(env.DB);
    const places = await dbClient.getAllPlaces();
    // ...
  }
}
```

**Query execution:**
```typescript
const result = await this.db
  .prepare('SELECT * FROM places WHERE category = ?')
  .bind('cafe')
  .all<Place>();
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     USER BROWSER                        │
│  - Clicks map marker (place)                            │
│  - Types chat message                                   │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│               CLOUDFLARE WORKER                         │
│               (src/index.ts)                            │
│                                                         │
│  If GET /: Serve HTML from ASSETS                      │
│  If GET /api/places: Query D1 → Return places          │
│  If POST /api/chat:                                    │
│    1. Parse message                                     │
│    2. Call Gemini AI ──────────────────┐               │
│    3. Gemini calls function            │               │
│    4. Query D1 database                │               │
│    5. Return formatted response        │               │
└────────────┬───────────────────────────┼────────────────┘
             │                           │
             ▼                           ▼
┌──────────────────────┐    ┌────────────────────────────┐
│   Cloudflare D1      │    │   Google Gemini API        │
│   (SQLite Database)  │    │   (AI Function Calling)    │
│                      │    │                            │
│  - places table      │    │  - Understands questions   │
│  - Full CRUD ops     │    │  - Calls place functions   │
│  - Indexes           │    │  - Formats responses       │
└──────────────────────┘    └────────────────────────────┘
```

---

## Quick Reference

### To run locally:
```bash
npm install
npm run build

# Initialize local D1 database
npx wrangler d1 execute local-places --local --file=./schema.sql
npx wrangler d1 execute local-places --local --file=./seed.sql

# Start dev server
npm run dev
# Visit http://localhost:8787
```

### To deploy:
```bash
# Set up remote database (one time)
npx wrangler d1 execute local-places --remote --file=./schema.sql
npx wrangler d1 execute local-places --remote --file=./seed.sql

# Set API key (one time)
npx wrangler secret put GEMINI_API_KEY

# Deploy
npm run deploy
```

### Key entry points:
- **Web UI:** `src/public/index.html`
- **API Handler:** `src/index.ts` (fetch function)
- **MCP Server:** `src/mcp/server.ts`
- **D1 Client:** `src/services/d1.ts`
- **AI Chat:** `src/services/gemini.ts`
- **Database Schema:** `schema.sql`
- **Sample Data:** `seed.sql`
