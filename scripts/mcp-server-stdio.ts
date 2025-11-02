#!/usr/bin/env node
/**
 * MCP Server stdio entry point for Cursor
 * This script starts the MCP server using stdio transport
 * 
 * Usage:
 *   node scripts/mcp-server-stdio.js
 * 
 * Environment variables:
 *   - LEARN_ASSISTANT_API_KEY: API key for authentication
 */

import { LearnAssistantMCPServer } from '../lib/mcp-server';

async function main() {
  try {
    // Get API key from environment variable
    const apiKey = process.env.LEARN_ASSISTANT_API_KEY;
    
    if (!apiKey) {
      console.error('Error: LEARN_ASSISTANT_API_KEY environment variable is required');
      process.exit(1);
    }

    // Create and initialize server
    const server = new LearnAssistantMCPServer();
    await server.setContextFromApiKey(apiKey);
    
    // Start server with stdio transport
    await server.start();
    
    // Server will keep running until stdin is closed
  } catch (error: any) {
    console.error('Failed to start MCP server:', error.message);
    process.exit(1);
  }
}

main();


