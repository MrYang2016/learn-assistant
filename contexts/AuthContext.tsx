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
            console.log('🔄 Token expired, attempting refresh...');
            try {
              const refreshResponse = await supabaseFetch.refreshSession(authData.refresh_token);
              if (refreshResponse.access_token && refreshResponse.user) {
                console.log('✅ Token refreshed successfully');
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
    const response = await supabaseFetch.signUp(email, password);

    // 如果注册成功，创建默认知识点并自动登录
    if (response.user && response.access_token) {
      try {
        console.log('📚 Creating default knowledge points for new user...');
        await createDefaultKnowledgePoints(response.access_token);
        console.log('✅ Default knowledge points created successfully');
      } catch (error) {
        console.error('❌ Failed to create default knowledge points:', error);
        // 不抛出错误，因为用户注册已经成功
      }

      // 自动设置用户状态，实现自动登录
      console.log('✅ Sign up successful, setting user state');
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
      console.log('💾 Auth data saved to localStorage with key:', authKey);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Signing in...');
    const response = await supabaseFetch.signIn(email, password);
    // 更新状态
    if (response.user) {
      console.log('✅ Sign in successful, setting user state');
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
      console.log('💾 Auth data saved to localStorage with key:', authKey);
    }
  };

  const signOut = async () => {
    console.log('🚪 Signing out...');
    if (accessToken) {
      try {
        await supabaseFetch.signOut(accessToken);
      } catch (error) {
        console.log('Sign out error:', error);
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
      console.log('🗑️ Removed localStorage key:', key);
    });
  };

  return (
    <AuthContext.Provider value={{
      user: isClient ? user : null,
      accessToken: isClient ? accessToken : null,
      loading: isClient ? loading : true,
      signUp,
      signIn,
      signOut
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
