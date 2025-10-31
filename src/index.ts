/**
 * Main entry point for Local Places MCP Server
 * Can run as both MCP server (stdio) and Cloudflare Worker (HTTP)
 */

import { GeminiClient } from './services/gemini.js';
import { D1Client } from './services/d1.js';
import type { Env } from './types.js';

// Simple in-memory session store for Gemini conversations
// In production on Cloudflare, consider using Durable Objects
const sessions = new Map<string, GeminiClient>();

function getOrCreateSession(sessionId: string, apiKey: string, db: D1Database): GeminiClient {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, new GeminiClient(apiKey, db));
  }
  return sessions.get(sessionId)!;
}

// Cloudflare Workers export
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(
        JSON.stringify({ status: 'ok', service: 'local-places-mcp' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get all places endpoint (for map)
    if (url.pathname === '/api/places' && request.method === 'GET') {
      try {
        const dbClient = new D1Client(env.DB);
        const places = await dbClient.getAllPlaces();

        return new Response(JSON.stringify(places), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: 'Failed to fetch places',
            details: error instanceof Error ? error.message : String(error),
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Chat endpoint
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      try {
        // Check for API key
        if (!env.GEMINI_API_KEY) {
          return new Response(
            JSON.stringify({ error: 'Gemini API key not configured' }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        // Check for database
        if (!env.DB) {
          return new Response(
            JSON.stringify({ error: 'Database not configured' }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        // Parse request body
        const body = (await request.json()) as { message: string; sessionId?: string };

        if (!body.message) {
          return new Response(
            JSON.stringify({ error: 'Message is required' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        // Get or create session
        const sessionId = body.sessionId || crypto.randomUUID();
        const gemini = getOrCreateSession(sessionId, env.GEMINI_API_KEY, env.DB);

        // Get AI response
        const response = await gemini.chat(body.message);

        return new Response(
          JSON.stringify({
            response,
            sessionId,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      } catch (error) {
        console.error('Chat error:', error);
        return new Response(
          JSON.stringify({
            error: 'Failed to process chat message',
            details: error instanceof Error ? error.message : String(error),
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Reset conversation endpoint
    if (url.pathname === '/api/chat/reset' && request.method === 'POST') {
      try {
        const body = (await request.json()) as { sessionId: string };

        if (body.sessionId && sessions.has(body.sessionId)) {
          sessions.delete(body.sessionId);
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Conversation reset' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to reset conversation' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // API info endpoint
    if (url.pathname === '/api') {
      return new Response(
        JSON.stringify({
          service: 'Local Places MCP Server',
          version: '1.0.0',
          description:
            'MCP server for local places database with AI chatbot powered by Gemini',
          endpoints: {
            'GET /health': 'Health check',
            'GET /api': 'API information',
            'GET /api/places': 'Get all places (for map display)',
            'POST /api/chat': 'Chat with AI about places (body: { message, sessionId? })',
            'POST /api/chat/reset': 'Reset conversation (body: { sessionId })',
            'GET /': 'Web interface',
          },
          mcp_tools: [
            'search_places',
            'get_place_details',
            'add_place',
            'update_place',
            'delete_place',
            'get_statistics',
            'places_nearby',
            'search_by_name',
          ],
          example_questions: [
            'Find me a good coffee shop',
            'Show me all parks',
            'What are the best rated restaurants?',
            'Add a new cafe called The Bean Counter',
            'What are the statistics for gyms?',
            'Find bookstores with WiFi',
          ],
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Serve static files from assets
    if (env.ASSETS) {
      try {
        const asset = await env.ASSETS.fetch(request);
        if (asset.status !== 404) {
          return asset;
        }
      } catch (error) {
        console.error('Asset fetch error:', error);
      }
    }

    // Default response - redirect to /api for info
    if (url.pathname === '/') {
      return Response.redirect(`${url.origin}/api`, 302);
    }

    // Default 404 response
    return new Response('Not Found', {
      status: 404,
      headers: corsHeaders,
    });
  },
} satisfies ExportedHandler<Env>;
