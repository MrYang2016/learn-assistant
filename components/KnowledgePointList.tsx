'use client';

import { KnowledgePointWithSchedule } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Trash2 } from 'lucide-react';
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
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';

interface KnowledgePointListProps {
  points: KnowledgePointWithSchedule[];
  onEdit: (point: KnowledgePointWithSchedule) => void;
  onDelete: (id: string) => Promise<void>;
}

export function KnowledgePointList({ points, onEdit, onDelete }: KnowledgePointListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const t = useTranslations();
  const locale = useLocale();

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
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t('noKnowledgePoints')}</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {points.map((point) => {
          const nextReviewDate = getNextReviewDate(point);
          return (
            <Card key={point.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg line-clamp-2">{point.question}</CardTitle>
                    <div className="mt-1 space-y-1">
                      <CardDescription>
                        {t('createdAt')}{new Date(point.created_at).toLocaleDateString(locale)}
                      </CardDescription>
                      {nextReviewDate && (
                        <CardDescription className="text-blue-600 font-medium">
                          {t('nextReview')}{new Date(nextReviewDate).toLocaleDateString(locale)}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(point)}
                      className="h-8 w-8"
                      aria-label={t('edit')}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(point.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      aria-label={t('delete')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                  {point.answer}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmDeleteDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? t('deleting') : t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
