'use client';

import { KnowledgePointWithSchedule } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Trash2, Calendar as CalendarIcon, ChevronRight } from 'lucide-react';
import { MarkdownPreview } from './MarkdownPreview';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { useRouter } from '@/i18n';

interface KnowledgePointListProps {
  points: KnowledgePointWithSchedule[];
  onDelete: (id: string) => Promise<void>;
  hasMore?: boolean;
  onLoadMore?: () => void;
  loading?: boolean;
}

export function KnowledgePointList({ points, onDelete, hasMore, onLoadMore, loading }: KnowledgePointListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  // 检测设备类型
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 移动端滚动加载
  useEffect(() => {
    if (!isMobile || !hasMore || !onLoadMore || loading) {
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isMobile, hasMore, onLoadMore, loading]);

  const getNextReviewDate = (point: KnowledgePointWithSchedule) => {
    if (!point.review_schedules || point.review_schedules.length === 0) {
      return null;
    }

    const today = new Date().toISOString().split('T')[0];
    const upcomingReviews = point.review_schedules
      .filter(schedule => !schedule.completed && schedule.review_date >= today)
      .sort((a, b) => new Date(a.review_date).getTime() - new Date(b.review_date).getTime());

    return upcomingReviews.length > 0 ? upcomingReviews[0].review_date : null;
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await onDelete(deleteId);
      setDeleteId(null);
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setDeleting(false);
    }
  };

  if (points.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-20 bg-secondary/30 rounded-3xl border border-border/50 border-dashed"
      >
        <p className="text-muted-foreground text-lg">{t('noKnowledgePoints')}</p>
      </motion.div>
    );
  }

  return (
    <>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 w-full">
        {points.map((point, index) => {
          const nextReviewDate = getNextReviewDate(point);
          return (
            <motion.div
              key={point.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index > 20 ? 0 : index * 0.05 }}
            >
              <Card className="group hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 w-full max-w-full overflow-hidden bg-card/50 backdrop-blur-sm border-border/60">
                <CardHeader className="w-full pb-3">
                  <div className="flex items-start justify-between gap-2 w-full">
                    <div className="flex-1 min-w-0 overflow-hidden space-y-1.5">
                      <CardTitle className="text-lg font-semibold line-clamp-2 break-words leading-tight group-hover:text-primary transition-colors">
                        {point.question}
                      </CardTitle>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                          {new Date(point.created_at).toLocaleDateString(locale)}
                        </span>
                        {nextReviewDate && (
                          <span className="flex items-center gap-1 text-indigo-500 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-full">
                            <CalendarIcon className="w-3 h-3" />
                            {new Date(nextReviewDate).toLocaleDateString(locale)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/knowledge/edit/${point.id}`)}
                        className="h-8 w-8 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400"
                        aria-label={t('edit')}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(point.id)}
                        className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                        aria-label={t('delete')}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="w-full pt-0">
                  <div className="text-sm text-muted-foreground line-clamp-3 overflow-hidden leading-relaxed">
                    <MarkdownPreview content={point.answer} className="prose-sm" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* 分页控制 */}
      {hasMore && (
        <>
          {/* PC端按钮 */}
          {!isMobile && (
            <div className="flex justify-center mt-6">
              <Button
                onClick={onLoadMore}
                disabled={loading}
                className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg hover:shadow-xl transition-all"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                    {t('loading')}
                  </>
                ) : (
                  <>
                    {t('loadMore')}
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}
          {/* 移动端滚动触发器 */}
          {isMobile && (
            <div ref={loadMoreRef} className="flex justify-center py-4">
              {loading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                  {t('loading')}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmDeleteDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} className="rounded-xl">{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl shadow-lg shadow-destructive/20">
              {deleting ? t('deleting') : t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
