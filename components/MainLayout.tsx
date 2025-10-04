'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Calendar, LogOut, Plus } from 'lucide-react';
import { ReactNode } from 'react';

interface MainLayoutProps {
  children?: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddClick?: () => void;
}

export function MainLayout({ children, activeTab, onTabChange, onAddClick }: MainLayoutProps) {
  const { signOut, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">学习助手</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user?.email}
              </span>
              <Button variant="ghost" size="sm" onClick={() => signOut()} className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">退出</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="review" className="flex-1 sm:flex-initial gap-2">
                <Calendar className="h-4 w-4" />
                今日复习
              </TabsTrigger>
              <TabsTrigger value="manage" className="flex-1 sm:flex-initial gap-2">
                <BookOpen className="h-4 w-4" />
                知识点管理
              </TabsTrigger>
            </TabsList>
            {activeTab === 'manage' && onAddClick && (
              <Button onClick={onAddClick} className="gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                添加知识点
              </Button>
            )}
          </div>
          {children}
        </Tabs>
      </main>
    </div>
  );
}
