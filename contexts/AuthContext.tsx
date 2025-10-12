'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabaseFetch } from '@/lib/supabase-fetch';
import { createDefaultKnowledgePoints } from '@/lib/knowledge-service';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // 标记为客户端环境
    setIsClient(true);

    // 检查localStorage中的认证信息
    const checkAuthState = async () => {
      try {

        // 检查所有可能的localStorage keys
        const allKeys = Object.keys(localStorage);

        // 查找Supabase相关的key
        const supabaseKeys = allKeys.filter(key => key.includes('supabase') || key.includes('sb-'));

        let authData = null;
        let authKey = null;

        // 尝试从找到的key中获取认证数据
        for (const key of supabaseKeys) {
          try {
            const data = localStorage.getItem(key);
            if (data) {
              const parsed = JSON.parse(data);
              if (parsed.access_token && parsed.user) {
                authData = parsed;
                authKey = key;
                break;
              }
            }
          } catch (e) {
            // 忽略解析错误
          }
        }

        if (authData && authKey) {

          // 检查token是否过期（基于时间）
          const now = Math.floor(Date.now() / 1000);
          const expiresAt = authData.expires_at;

          if (expiresAt && now < expiresAt) {
            // Token未过期，直接使用
            setUser(authData.user);
            setAccessToken(authData.access_token);
          } else if (authData.refresh_token) {
            // Token过期，尝试刷新
            try {
              const refreshResponse = await supabaseFetch.refreshSession(authData.refresh_token);
              if (refreshResponse.access_token && refreshResponse.user) {
                setUser(refreshResponse.user);
                setAccessToken(refreshResponse.access_token);

                // 更新localStorage
                const updatedAuthData = {
                  user: refreshResponse.user,
                  access_token: refreshResponse.access_token,
                  refresh_token: refreshResponse.refresh_token,
                  expires_at: refreshResponse.expires_at,
                  token_type: refreshResponse.token_type
                };
                localStorage.setItem(authKey, JSON.stringify(updatedAuthData));
              } else {
                throw new Error('Invalid refresh response');
              }
            } catch (error) {
              console.log('❌ Token refresh failed:', error);
              localStorage.removeItem(authKey);
            }
          } else {
            // 没有refresh token，清除认证数据
            console.log('❌ No refresh token available, clearing auth');
            localStorage.removeItem(authKey);
          }
        } else {
          console.log('❌ No valid auth data found');
        }
      } catch (error) {
        console.log('❌ Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthState();
  }, []);

  const signUp = async (email: string, password: string) => {
    let response;
    try {
      response = await supabaseFetch.signUp(email, password);
    } catch (error) {
      console.error('SignUp error:', error);
      throw error;
    }

    // Normalize response: if it's a user object without nested user, wrap it
    let user = response.user || response;
    let access_token = response.access_token;
    let refresh_token = response.refresh_token;
    let expires_at = response.expires_at;
    let token_type = response.token_type;

    if (user && user.id && !access_token) {
      try {
        response = await supabaseFetch.signIn(email, password);
        user = response.user;
        access_token = response.access_token;
        refresh_token = response.refresh_token;
        expires_at = response.expires_at;
        token_type = response.token_type;
      } catch (loginError) {
        console.error('Auto SignIn error:', loginError);
        throw new Error('Registration successful. Please check your email to confirm your account.');
      }
    }

    if (user && user.id && access_token) {
      try {
        await createDefaultKnowledgePoints(access_token);
      } catch (error) {
        console.error('❌ Failed to create default knowledge points:', error);
        // 不抛出错误，因为用户注册已经成功
      }

      // 自动设置用户状态，实现自动登录
      setUser(user);
      setAccessToken(access_token);

      // 保存到localStorage - 使用Supabase的标准格式
      const authData = {
        user,
        access_token,
        refresh_token,
        expires_at,
        token_type
      };

      // 尝试找到现有的Supabase key，如果没有则使用默认key
      const allKeys = Object.keys(localStorage);
      const supabaseKeys = allKeys.filter(key => key.includes('supabase') || key.includes('sb-'));
      const authKey = supabaseKeys.length > 0 ? supabaseKeys[0] : 'sb-zuvgcqgetnmhlmjsxjrs-auth-token';

      localStorage.setItem(authKey, JSON.stringify(authData));
    } else {
      throw new Error(`Registration failed: ${JSON.stringify(response)}`);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await supabaseFetch.signIn(email, password);
      // 更新状态
      if (response.user) {
        setUser(response.user);
        setAccessToken(response.access_token);

        // 保存到localStorage - 使用Supabase的标准格式
        const authData = {
          user: response.user,
          access_token: response.access_token,
          refresh_token: response.refresh_token,
          expires_at: response.expires_at,
          token_type: response.token_type
        };

        // 尝试找到现有的Supabase key，如果没有则使用默认key
        const allKeys = Object.keys(localStorage);
        const supabaseKeys = allKeys.filter(key => key.includes('supabase') || key.includes('sb-'));
        const authKey = supabaseKeys.length > 0 ? supabaseKeys[0] : 'sb-zuvgcqgetnmhlmjsxjrs-auth-token';

        localStorage.setItem(authKey, JSON.stringify(authData));
      }
    } catch (error: any) {
      // 检查是否是账号不存在的错误
      if (error.message && (
        error.message.includes('Invalid login credentials') ||
        error.message.includes('User not found') ||
        error.message.includes('Invalid email or password') ||
        error.message.includes('400') ||
        error.message.includes('401')
      )) {
        // 账号不存在，自动注册并登录
        console.log('Account not found, auto-registering...');
        await signUp(email, password);
      } else {
        // 其他错误，重新抛出
        throw error;
      }
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      // 获取当前的refresh token
      const allKeys = Object.keys(localStorage);
      const supabaseKeys = allKeys.filter(key => key.includes('supabase') || key.includes('sb-'));

      for (const key of supabaseKeys) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const parsed = JSON.parse(data);
            if (parsed.refresh_token) {
              const refreshResponse = await supabaseFetch.refreshSession(parsed.refresh_token);

              if (refreshResponse.access_token && refreshResponse.user) {
                setUser(refreshResponse.user);
                setAccessToken(refreshResponse.access_token);

                // 更新localStorage
                const updatedAuthData = {
                  user: refreshResponse.user,
                  access_token: refreshResponse.access_token,
                  refresh_token: refreshResponse.refresh_token,
                  expires_at: refreshResponse.expires_at,
                  token_type: refreshResponse.token_type
                };
                localStorage.setItem(key, JSON.stringify(updatedAuthData));
                return true;
              }
            }
          }
        } catch (e) {
          // 忽略解析错误，继续尝试下一个key
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const signOut = async () => {
    if (accessToken) {
      try {
        await supabaseFetch.signOut(accessToken);
      } catch (error) {
        console.error('Sign out error:', error);
      }
    }

    // 清除状态和存储
    setUser(null);
    setAccessToken(null);

    // 清除所有Supabase相关的localStorage
    const allKeys = Object.keys(localStorage);
    const supabaseKeys = allKeys.filter(key => key.includes('supabase') || key.includes('sb-'));
    supabaseKeys.forEach(key => {
      localStorage.removeItem(key);
    });
  };

  return (
    <AuthContext.Provider value={{
      user: isClient ? user : null,
      accessToken: isClient ? accessToken : null,
      loading: isClient ? loading : true,
      signUp,
      signIn,
      signOut,
      refreshToken
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
