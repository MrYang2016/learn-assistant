'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Calendar, LogOut, Plus, Key, Plug, Sparkles } from 'lucide-react';
import { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from './LanguageSwitcher';
import { motion } from 'framer-motion';

interface MainLayoutProps {
  children?: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddClick?: () => void;
}

export function MainLayout({ children, activeTab, onTabChange, onAddClick }: MainLayoutProps) {
  const { signOut, user } = useAuth();
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden transition-colors duration-300">
      {/* Artistic Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 blur-[120px] dark:bg-purple-900/20" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[120px] dark:bg-blue-900/20" />
        <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] rounded-full bg-indigo-400/20 blur-[100px] dark:bg-indigo-900/20" />
      </div>

      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 transition-all duration-300">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/20">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                {t('appName')}
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex items-center gap-3"
            >
              <span className="text-sm text-muted-foreground hidden md:inline-block px-3 py-1 rounded-full bg-secondary/50 border border-border/50">
                {user?.email}
              </span>
              <LanguageSwitcher />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="gap-2 text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{t('logout')}</span>
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList className="w-full sm:w-auto p-1 bg-secondary/50 backdrop-blur-sm border border-border/50 rounded-2xl h-auto gap-1">
              {[
                { value: 'review', icon: Calendar, label: t('reviewTab') },
                { value: 'manage', icon: BookOpen, label: t('manageTab') },
                { value: 'apikey', icon: Key, label: t('apiKeyTab') },
                { value: 'mcp', icon: Plug, label: t('mcpTab') },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex-1 sm:flex-initial gap-2 py-2.5 px-4 rounded-xl data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-300 ease-out"
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="font-medium">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {activeTab === 'manage' && onAddClick && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  onClick={onAddClick}
                  className="gap-2 w-full sm:w-auto bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 rounded-xl py-6"
                >
                  <Plus className="h-5 w-5" />
                  <span className="font-semibold">{t('addKnowledgePoint')}</span>
                </Button>
              </motion.div>
            )}
          </div>

          <div className="min-h-[500px]">
            {children}
          </div>
        </Tabs>
      </main>
    </div>
  );
}
