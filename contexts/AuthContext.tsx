'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { createDefaultKnowledgePoints } from '@/lib/knowledge-service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session) => {
      setUser(session?.user ?? null);

      // 当用户首次登录时，检查是否需要创建默认知识点
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          // 检查用户是否已有知识点，如果没有则创建默认知识点
          const { data: existingPoints } = await supabase
            .from('knowledge_points')
            .select('id')
            .eq('user_id', session.user.id)
            .limit(1);

          if (!existingPoints || existingPoints.length === 0) {
            await createDefaultKnowledgePoints();
            // 创建默认知识点后刷新页面以显示新内容
            window.location.reload();
          }
        } catch (error) {
          console.error('Failed to create default knowledge points:', error);
        }
      }
    });
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
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
