/**
 * Supabase Fetch API 工具类
 * 用于替代Supabase客户端库，解决Next.js环境中的兼容性问题
 */

interface SupabaseConfig {
  url: string;
  anonKey: string;
}

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

class SupabaseFetchClient {
  private config: SupabaseConfig;

  constructor() {
    this.config = {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    };
  }

  /**
   * 构建请求头
   */
  private buildHeaders(accessToken?: string, customHeaders: Record<string, string> = {}): Record<string, string> {
    return {
      'apikey': this.config.anonKey,
      'Authorization': `Bearer ${accessToken || this.config.anonKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
      ...customHeaders,
    };
  }

  /**
   * 构建查询参数
   */
  private buildQueryParams(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, item.toString()));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });
    
    return searchParams.toString();
  }

  /**
   * 执行fetch请求
   */
  private async fetch<T>(
    endpoint: string,
    options: FetchOptions = {},
    accessToken?: string
  ): Promise<T> {
    const { method = 'GET', headers = {}, body } = options;
    
    const url = `${this.config.url}/rest/v1/${endpoint}`;
    const requestHeaders = this.buildHeaders(accessToken, headers);
    
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    // 对于DELETE等操作，可能没有返回内容
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return {} as T;
    }

    return await response.json();
  }

  /**
   * 查询数据
   */
  async select<T>(
    table: string,
    options: {
      columns?: string;
      filters?: Record<string, any>;
      order?: { column: string; ascending?: boolean };
      limit?: number;
      offset?: number;
    } = {},
    accessToken?: string
  ): Promise<T[]> {
    const params: Record<string, any> = {};
    
    if (options.columns) {
      params.select = options.columns;
    }
    
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // 如果值已经包含操作符（如 lte., gte., neq. 等），直接使用
          if (typeof value === 'string' && value.includes('.')) {
            params[key] = value;
          } else {
            params[key] = `eq.${value}`;
          }
        }
      });
    }
    
    if (options.order) {
      const direction = options.order.ascending !== false ? 'asc' : 'desc';
      params.order = `${options.order.column}.${direction}`;
    }
    
    if (options.limit) {
      params.limit = options.limit;
    }
    
    if (options.offset) {
      params.offset = options.offset;
    }

    const queryString = this.buildQueryParams(params);
    const endpoint = queryString ? `${table}?${queryString}` : table;
    
    return this.fetch<T[]>(endpoint, { method: 'GET' }, accessToken);
  }

  /**
   * 插入数据
   */
  async insert<T>(
    table: string,
    data: any | any[],
    options: {
      columns?: string;
      upsert?: boolean;
    } = {},
    accessToken?: string
  ): Promise<T> {
    const params: Record<string, any> = {};
    
    if (options.columns) {
      params.select = options.columns;
    }
    
    if (options.upsert) {
      params.on_conflict = 'merge-duplicates';
    }

    const queryString = this.buildQueryParams(params);
    const endpoint = queryString ? `${table}?${queryString}` : table;
    
    // 当有 columns 参数时，使用 return=representation 来获取插入的数据
    const headers = options.columns ? { 'Prefer': 'return=representation' } : undefined;
    
    return this.fetch<T>(endpoint, {
      method: 'POST',
      body: data,
      headers,
    }, accessToken);
  }

  /**
   * 更新数据
   */
  async update<T>(
    table: string,
    data: any,
    filters: Record<string, any>,
    options: {
      columns?: string;
    } = {},
    accessToken?: string
  ): Promise<T> {
    const params: Record<string, any> = {};
    
    if (options.columns) {
      params.select = options.columns;
    }
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // 如果值已经包含操作符（如 lte., gte., neq. 等），直接使用
        if (typeof value === 'string' && value.includes('.')) {
          params[key] = value;
        } else {
          params[key] = `eq.${value}`;
        }
      }
    });

    const queryString = this.buildQueryParams(params);
    const endpoint = queryString ? `${table}?${queryString}` : table;
    
    // 当有 columns 参数时，使用 return=representation 来获取更新的数据
    const headers = options.columns ? { 'Prefer': 'return=representation' } : undefined;
    
    return this.fetch<T>(endpoint, {
      method: 'PATCH',
      body: data,
      headers,
    }, accessToken);
  }

  /**
   * 删除数据
   */
  async delete<T>(
    table: string,
    filters: Record<string, any>,
    accessToken?: string
  ): Promise<T> {
    const params: Record<string, any> = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // 如果值已经包含操作符（如 lte., gte., neq. 等），直接使用
        if (typeof value === 'string' && value.includes('.')) {
          params[key] = value;
        } else {
          params[key] = `eq.${value}`;
        }
      }
    });

    const queryString = this.buildQueryParams(params);
    const endpoint = queryString ? `${table}?${queryString}` : table;
    
    return this.fetch<T>(endpoint, { method: 'DELETE' }, accessToken);
  }

  /**
   * 执行RPC函数
   */
  async rpc<T>(
    functionName: string,
    params: Record<string, any> = {},
    accessToken?: string
  ): Promise<T> {
    return this.fetch<T>(`rpc/${functionName}`, {
      method: 'POST',
      body: params,
    }, accessToken);
  }

  /**
   * 用户注册
   */
  async signUp(email: string, password: string) {
    const response = await fetch(`${this.config.url}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'apikey': this.config.anonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return await response.json();
  }

  /**
   * 用户登录
   */
  async signIn(email: string, password: string) {
    const response = await fetch(`${this.config.url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': this.config.anonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return await response.json();
  }

  /**
   * 用户登出
   */
  async signOut(accessToken?: string) {
    const response = await fetch(`${this.config.url}/auth/v1/logout`, {
      method: 'POST',
      headers: {
        'apikey': this.config.anonKey,
        'Authorization': `Bearer ${accessToken || this.config.anonKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return await response.json();
  }

  /**
   * 获取当前用户信息
   */
  async getUser(accessToken?: string) {
    const response = await fetch(`${this.config.url}/auth/v1/user`, {
      method: 'GET',
      headers: {
        'apikey': this.config.anonKey,
        'Authorization': `Bearer ${accessToken || this.config.anonKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('getUser error response:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    return result;
  }

  /**
   * 刷新访问令牌
   */
  async refreshSession(refreshToken: string) {
    console.log('🔄 Refreshing session...');
    const response = await fetch(`${this.config.url}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: {
        'apikey': this.config.anonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('refreshSession error response:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('refreshSession response:', result);
    return result;
  }
}

// 创建单例实例
export const supabaseFetch = new SupabaseFetchClient();

// 导出类型
export type { SupabaseConfig, FetchOptions };
