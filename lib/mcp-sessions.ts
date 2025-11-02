import { LearnAssistantMCPServer } from './mcp-server';

/**
 * Session management for MCP SSE connections
 * Stored in a shared module to avoid Next.js route export restrictions
 */

export interface Session {
  mcpServer: LearnAssistantMCPServer;
  userId: string;
  apiKeyId: string;
  messageQueue: Array<{ id: string; message: any }>;
  messageResolvers: Map<string, (response: any) => void>;
}

// Use global to share sessions across route handlers
export const sessions = (global as any).mcpSessions || new Map<string, Session>();
(global as any).mcpSessions = sessions;

