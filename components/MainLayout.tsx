'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Calendar, LogOut, Plus, Key, Plug, Sparkles, MessageSquare, Menu, ChevronLeft } from 'lucide-react';
import { ReactNode, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from './LanguageSwitcher';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from '@/i18n';

interface MainLayoutProps {
  children?: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  showAddButton?: boolean;
}

export function MainLayout({ children, activeTab, onTabChange, showAddButton = true }: MainLayoutProps) {
  const { signOut, user } = useAuth();
  const t = useTranslations();
  const router = useRouter();
  // PC端默认展开，移动端默认关闭
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 根据屏幕宽度设置初始状态 - 仅在首次加载时检查
  useEffect(() => {
    // PC端（>= 1024px）默认展开
    if (window.innerWidth >= 1024) {
      setIsSidebarOpen(true);
    }
  }, []);

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
              {/* 菜单切换按钮 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-secondary/80 transition-colors duration-200"
                aria-label={isSidebarOpen ? t('hideSidebar') : t('showSidebar')}
              >
                <Menu className="h-5 w-5" />
              </Button>

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

      <div className="flex relative z-10">
        {/* 遮罩层 - 仅在移动端显示 */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* 左侧导航栏 */}
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <motion.aside
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed left-0 top-0 bottom-0 w-64 lg:w-72 bg-background border-r border-border/40 z-50 overflow-y-auto shadow-2xl lg:shadow-none"
            >
              {/* 侧边栏头部 */}
              <div className="flex items-center justify-between p-4 border-b border-border/40">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/20">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="font-bold text-lg">{t('appName')}</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 hover:bg-secondary/80 lg:hidden"
                  aria-label={t('hideSidebar')}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </div>

              {/* 导航菜单 */}
              <div className="flex flex-col h-[calc(100vh-80px)]">
                <div className="flex-1 p-4 space-y-2 overflow-y-auto">
                  <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
                    <TabsList className="flex flex-col w-full h-auto p-1 bg-transparent gap-1">
                      {[
                        { value: 'review', icon: Calendar, label: t('reviewTab') },
                        { value: 'chat', icon: MessageSquare, label: t('chatTab') },
                        { value: 'manage', icon: BookOpen, label: t('manageTab') },
                        { value: 'apikey', icon: Key, label: t('apiKeyTab') },
                        { value: 'mcp', icon: Plug, label: t('mcpTab') },
                      ].map((tab) => (
                        <TabsTrigger
                          key={tab.value}
                          value={tab.value}
                          onClick={() => {
                            // 移动端点击菜单项后自动关闭侧边栏
                            const isMobile = window.innerWidth < 1024;
                            if (isMobile) {
                              setTimeout(() => setIsSidebarOpen(false), 150);
                            }
                          }}
                          className="w-full justify-start gap-3 py-3 px-4 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-secondary/30 data-[state=inactive]:hover:bg-secondary/50 transition-all duration-300 ease-out"
                        >
                          <tab.icon className="h-5 w-5" />
                          <span className="font-medium">{tab.label}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>

                {/* 添加知识点按钮 - 固定在侧边栏底部 */}
                {showAddButton && (
                  <div className="p-4 border-t border-border/40 bg-background">
                    <Button
                      onClick={() => {
                        router.push('/knowledge/new');
                        // 移动端点击后关闭侧边栏
                        const isMobile = window.innerWidth < 1024;
                        if (isMobile) {
                          setIsSidebarOpen(false);
                        }
                      }}
                      className="gap-2 w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 rounded-xl py-6"
                    >
                      <Plus className="h-5 w-5" />
                      <span className="font-semibold">{t('addKnowledgePoint')}</span>
                    </Button>
                  </div>
                )}
              </div>

              {/* 桌面端折叠按钮 */}
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="hidden lg:block absolute top-20 -right-10 p-2 bg-secondary/50 backdrop-blur-sm border border-border/50 rounded-r-lg hover:bg-secondary/80 transition-colors"
                aria-label={t('hideSidebar')}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* 主内容区域 */}
        <main
          className={`flex-1 w-full transition-all duration-300 ${isSidebarOpen ? 'lg:ml-72' : 'lg:ml-0'
            }`}
        >
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <Tabs value={activeTab} onValueChange={onTabChange} className="w-full space-y-8">
              <div className="min-h-[500px]">
                {children}
              </div>
            </Tabs>
          </div>

          {/* 移动端悬浮添加按钮 - 仅在侧边栏关闭时显示，聊天页面除外 */}
          <AnimatePresence>
            {!isSidebarOpen && showAddButton && activeTab !== 'chat' && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.3, type: "spring" }}
                onClick={() => router.push('/knowledge/new')}
                className="fixed right-6 bottom-6 lg:hidden z-50 flex items-center justify-center w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full shadow-2xl hover:shadow-indigo-500/50 active:scale-95 transition-all duration-200"
                aria-label={t('addKnowledgePoint')}
              >
                <Plus className="h-6 w-6" />
              </motion.button>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
