import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { verifyApiKey } from './api-key-auth';

interface MCPContext {
  userId: string;
  apiKeyId: string;
}

/**
 * MCP Server for Learn Assistant
 * Provides tools for managing knowledge points and reviews
 */
export class LearnAssistantMCPServer {
  private server: Server;
  private context: MCPContext | null = null;

  constructor() {
    this.server = new Server(
      {
        name: 'learn-assistant',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'list_reviews',
            description: '查询今日需要复习的列表',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'list_knowledge_points',
            description: '查询所有知识点列表',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_knowledge_point',
            description: '根据ID获取单个知识点的详细信息',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: '知识点的ID',
                },
              },
              required: ['id'],
            },
          },
          {
            name: 'create_knowledge_point',
            description: '创建新的知识点',
            inputSchema: {
              type: 'object',
              properties: {
                question: {
                  type: 'string',
                  description: '问题/提示',
                },
                answer: {
                  type: 'string',
                  description: '答案/详细说明',
                },
              },
              required: ['question', 'answer'],
            },
          },
          {
            name: 'update_knowledge_point',
            description: '更新现有的知识点',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: '知识点的ID',
                },
                question: {
                  type: 'string',
                  description: '问题/提示',
                },
                answer: {
                  type: 'string',
                  description: '答案/详细说明',
                },
              },
              required: ['id'],
            },
          },
          {
            name: 'delete_knowledge_point',
            description: '删除知识点',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: '知识点的ID',
                },
              },
              required: ['id'],
            },
          },
          {
            name: 'submit_recall',
            description: '提交主动回忆（完成复习）',
            inputSchema: {
              type: 'object',
              properties: {
                schedule_id: {
                  type: 'string',
                  description: '复习计划的ID',
                },
                recall_text: {
                  type: 'string',
                  description: '主动回忆的内容',
                },
              },
              required: ['schedule_id', 'recall_text'],
            },
          },
          {
            name: 'mark_as_reviewed',
            description: '将知识点标记为已复习（更新最后一个未完成的复习计划）',
            inputSchema: {
              type: 'object',
              properties: {
                knowledge_point_id: {
                  type: 'string',
                  description: '知识点的ID',
                },
                recall_text: {
                  type: 'string',
                  description: '主动回忆的内容（可选）',
                },
              },
              required: ['knowledge_point_id'],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (!this.context) {
        throw new McpError(
          ErrorCode.InternalError,
          'Server not initialized with user context'
        );
      }

      const { name, arguments: args } = request.params;
      return await this.handleCallTool(name, args || {});
    });
  }

  /**
   * Set the user context from API key
   */
  async setContextFromApiKey(apiKey: string): Promise<void> {
    const result = await verifyApiKey(apiKey);
    if (!result) {
      throw new McpError(ErrorCode.InvalidRequest, 'Invalid API key');
    }
    this.context = result;
  }

  /**
   * Set the user context directly
   */
  setContext(context: MCPContext): void {
    this.context = context;
  }

  /**
   * Get access token for user operations
   * Since we're using userId, we'll need to adapt the knowledge service
   * For now, we'll pass undefined and modify queries to use userId directly
   */
  private getAccessToken(): string | undefined {
    // Return undefined - we'll handle auth differently
    return undefined;
  }

  private async handleListReviews() {
    const reviews = await this.getTodayReviewsWithUserId();
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(reviews, null, 2),
        },
      ],
    };
  }

  private async handleListKnowledgePoints() {
    const points = await this.getAllKnowledgePointsWithUserId();
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(points, null, 2),
        },
      ],
    };
  }

  private async handleGetKnowledgePoint(id: string) {
    const point = await this.getKnowledgePointWithSchedulesById(id);
    if (!point) {
      throw new McpError(ErrorCode.InvalidRequest, `Knowledge point not found: ${id}`);
    }
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(point, null, 2),
        },
      ],
    };
  }

  private async handleCreateKnowledgePoint(question: string, answer: string) {
    // We need to create a Supabase session token for the user
    // For now, we'll use a workaround by creating a service role session
    // or modify the knowledge service to accept userId directly
    const knowledgePoint = await this.createKnowledgePointWithUserId(question, answer);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(knowledgePoint, null, 2),
        },
      ],
    };
  }

  private async handleUpdateKnowledgePoint(
    id: string,
    question?: string,
    answer?: string
  ) {
    // Get current knowledge point
    const current = await this.getKnowledgePointWithSchedulesById(id);
    if (!current) {
      throw new McpError(ErrorCode.InvalidRequest, `Knowledge point not found: ${id}`);
    }

    const updatedQuestion = question ?? current.question;
    const updatedAnswer = answer ?? current.answer;

    const updated = await this.updateKnowledgePointWithUserId(id, updatedQuestion, updatedAnswer);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(updated, null, 2),
        },
      ],
    };
  }

  private async handleDeleteKnowledgePoint(id: string) {
    await this.deleteKnowledgePointWithUserId(id);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: true, id }, null, 2),
        },
      ],
    };
  }

  private async handleSubmitRecall(scheduleId: string, recallText: string) {
    await this.completeReviewWithUserId(scheduleId, recallText);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: true, schedule_id: scheduleId }, null, 2),
        },
      ],
    };
  }

  private async handleMarkAsReviewed(
    knowledgePointId: string,
    recallText?: string
  ) {
    // Get all review schedules for this knowledge point
    const point = await this.getKnowledgePointWithSchedulesById(knowledgePointId);
    if (!point) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Knowledge point not found: ${knowledgePointId}`
      );
    }

    const schedules = (point as any).review_schedules || [];
    const incompleteSchedule = schedules.find(
      (s: any) => !s.completed
    ) as any;

    if (!incompleteSchedule) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        'No incomplete review schedule found'
      );
    }

    await this.completeReviewWithUserId(incompleteSchedule.id, recallText || '');

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            { success: true, schedule_id: incompleteSchedule.id },
            null,
            2
          ),
        },
      ],
    };
  }

  // Helper methods using service role
  private async getTodayReviewsWithUserId() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const today = new Date().toISOString().split('T')[0];

    const response = await fetch(
      `${supabaseUrl}/rest/v1/review_schedules?user_id=eq.${this.context!.userId}&review_date=lte.${today}&completed=eq.false&select=*,knowledge_points(*)&order=review_date.asc`,
      {
        method: 'GET',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get reviews: ${response.statusText}`);
    }

    return await response.json();
  }

  private async getAllKnowledgePointsWithUserId() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const response = await fetch(
      `${supabaseUrl}/rest/v1/knowledge_points?user_id=eq.${this.context!.userId}&select=*,review_schedules(*)&order=created_at.desc`,
      {
        method: 'GET',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get knowledge points: ${response.statusText}`);
    }

    return await response.json();
  }

  private async getKnowledgePointWithSchedulesById(id: string) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const response = await fetch(
      `${supabaseUrl}/rest/v1/knowledge_points?id=eq.${id}&user_id=eq.${this.context!.userId}&select=*,review_schedules(*)`,
      {
        method: 'GET',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get knowledge point: ${response.statusText}`);
    }

    const result = await response.json();
    return result[0] || null;
  }

  private async completeReviewWithUserId(scheduleId: string, recallText: string) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const response = await fetch(
      `${supabaseUrl}/rest/v1/review_schedules?id=eq.${scheduleId}&user_id=eq.${this.context!.userId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: true,
          completed_at: new Date().toISOString(),
          recall_text: recallText,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to complete review: ${response.statusText}`);
    }
  }

  // Helper methods to work with userId directly using service role
  private async createKnowledgePointWithUserId(question: string, answer: string) {
    const REVIEW_INTERVALS = [1, 7, 16, 35];
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Create knowledge point using service role
    const response = await fetch(
      `${supabaseUrl}/rest/v1/knowledge_points?select=*`,
      {
        method: 'POST',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          user_id: this.context!.userId,
          question,
          answer,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create knowledge point: ${response.statusText}`);
    }

    const knowledgePoint = (await response.json())[0];

    // Create review schedules
    const schedules = REVIEW_INTERVALS.map((days, index) => {
      const reviewDate = new Date();
      reviewDate.setDate(reviewDate.getDate() + days);

      return {
        knowledge_point_id: knowledgePoint.id,
        user_id: this.context!.userId,
        review_date: reviewDate.toISOString().split('T')[0],
        review_number: index + 1,
        completed: false,
      };
    });

    await fetch(
      `${supabaseUrl}/rest/v1/review_schedules`,
      {
        method: 'POST',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(schedules),
      }
    );

    return knowledgePoint;
  }

  private async updateKnowledgePointWithUserId(id: string, question: string, answer: string) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Verify ownership first
    const checkResponse = await fetch(
      `${supabaseUrl}/rest/v1/knowledge_points?id=eq.${id}&user_id=eq.${this.context!.userId}&select=id`,
      {
        method: 'GET',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
      }
    );

    const existing = await checkResponse.json();
    if (!existing || existing.length === 0) {
      throw new Error('Knowledge point not found or access denied');
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/knowledge_points?id=eq.${id}&user_id=eq.${this.context!.userId}&select=*`,
      {
        method: 'PATCH',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          question,
          answer,
          updated_at: new Date().toISOString(),
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update knowledge point: ${response.statusText}`);
    }

    const result = await response.json();
    return result[0];
  }

  private async deleteKnowledgePointWithUserId(id: string) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Verify ownership first
    const checkResponse = await fetch(
      `${supabaseUrl}/rest/v1/knowledge_points?id=eq.${id}&user_id=eq.${this.context!.userId}&select=id`,
      {
        method: 'GET',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
      }
    );

    const existing = await checkResponse.json();
    if (!existing || existing.length === 0) {
      throw new Error('Knowledge point not found or access denied');
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/knowledge_points?id=eq.${id}&user_id=eq.${this.context!.userId}`,
      {
        method: 'DELETE',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete knowledge point: ${response.statusText}`);
    }
  }

  /**
   * Start the server with stdio transport
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }

  /**
   * Get the server instance for use in HTTP/SSE handlers
   */
  getServer(): Server {
    return this.server;
  }

  /**
   * Handle tools/list request directly (for HTTP API)
   */
  async handleListTools() {
    return {
      tools: [
        {
          name: 'list_reviews',
          description: '查询今日需要复习的列表',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'list_knowledge_points',
          description: '查询所有知识点列表',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_knowledge_point',
          description: '根据ID获取单个知识点的详细信息',
          inputSchema: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: '知识点的ID',
              },
            },
            required: ['id'],
          },
        },
        {
          name: 'create_knowledge_point',
          description: '创建新的知识点',
          inputSchema: {
            type: 'object',
            properties: {
              question: {
                type: 'string',
                description: '问题/提示',
              },
              answer: {
                type: 'string',
                description: '答案/详细说明',
              },
            },
            required: ['question', 'answer'],
          },
        },
        {
          name: 'update_knowledge_point',
          description: '更新现有的知识点',
          inputSchema: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: '知识点的ID',
              },
              question: {
                type: 'string',
                description: '问题/提示',
              },
              answer: {
                type: 'string',
                description: '答案/详细说明',
              },
            },
            required: ['id'],
          },
        },
        {
          name: 'delete_knowledge_point',
          description: '删除知识点',
          inputSchema: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: '知识点的ID',
              },
            },
            required: ['id'],
          },
        },
        {
          name: 'submit_recall',
          description: '提交主动回忆（完成复习）',
          inputSchema: {
            type: 'object',
            properties: {
              schedule_id: {
                type: 'string',
                description: '复习计划的ID',
              },
              recall_text: {
                type: 'string',
                description: '主动回忆的内容',
              },
            },
            required: ['schedule_id', 'recall_text'],
          },
        },
        {
          name: 'mark_as_reviewed',
          description: '将知识点标记为已复习（更新最后一个未完成的复习计划）',
          inputSchema: {
            type: 'object',
            properties: {
              knowledge_point_id: {
                type: 'string',
                description: '知识点的ID',
              },
              recall_text: {
                type: 'string',
                description: '主动回忆的内容（可选）',
              },
            },
            required: ['knowledge_point_id'],
          },
        },
      ],
    };
  }

  /**
   * Handle tools/call request directly (for HTTP API)
   */
  async handleCallTool(name: string, args: any) {
    if (!this.context) {
      throw new Error('Server not initialized with user context');
    }

    try {
      switch (name) {
        case 'list_reviews':
          return await this.handleListReviews();

        case 'list_knowledge_points':
          return await this.handleListKnowledgePoints();

        case 'get_knowledge_point':
          return await this.handleGetKnowledgePoint(args.id as string);

        case 'create_knowledge_point':
          return await this.handleCreateKnowledgePoint(
            args.question as string,
            args.answer as string
          );

        case 'update_knowledge_point':
          return await this.handleUpdateKnowledgePoint(
            args.id as string,
            args.question as string | undefined,
            args.answer as string | undefined
          );

        case 'delete_knowledge_point':
          return await this.handleDeleteKnowledgePoint(args.id as string);

        case 'submit_recall':
          return await this.handleSubmitRecall(
            args.schedule_id as string,
            args.recall_text as string
          );

        case 'mark_as_reviewed':
          return await this.handleMarkAsReviewed(
            args.knowledge_point_id as string,
            args.recall_text as string | undefined
          );

        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${name}`
          );
      }
    } catch (error: any) {
      throw new McpError(
        ErrorCode.InternalError,
        `Tool execution failed: ${error.message}`
      );
    }
  }
}

