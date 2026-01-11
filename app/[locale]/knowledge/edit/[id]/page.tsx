'use client';

import { KnowledgePointEditor } from '@/components/KnowledgePointEditor';
import { useAuth } from '@/contexts/AuthContext';
import { updateKnowledgePoint } from '@/lib/knowledge-service';
import { toast } from 'sonner';
import { useRouter } from '@/i18n';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { supabaseFetch } from '@/lib/supabase-fetch';
import { KnowledgePoint } from '@/lib/supabase';

export default function EditKnowledgePointPage() {
  const { accessToken, refreshToken, user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const t = useTranslations();
  const id = params.id as string;

  const [initialQuestion, setInitialQuestion] = useState('');
  const [initialAnswer, setInitialAnswer] = useState('');
  const [initialIsInReviewPlan, setInitialIsInReviewPlan] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadKnowledgePoint = async () => {
      if (!user || !accessToken || !id) return;

      try {
        const data = await supabaseFetch.select(
          'knowledge_points',
          {
            columns: '*',
            filters: { id, user_id: user.id },
          },
          accessToken
        );

        if (data && data.length > 0) {
          const point = data[0] as KnowledgePoint;
          setInitialQuestion(point.question);
          setInitialAnswer(point.answer);
          setInitialIsInReviewPlan(point.is_in_review_plan ?? true);
        } else {
          toast.error(t('knowledgePointNotFound'));
          router.push('/');
        }
      } catch (err) {
        console.error('Load knowledge point error:', err);
        toast.error(t('dataLoadFailed'));
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadKnowledgePoint();
  }, [user, accessToken, id, router, t]);

  const handleSave = async (question: string, answer: string, isInReviewPlan: boolean) => {
    try {
      await updateKnowledgePoint(id, question, answer, accessToken!, isInReviewPlan);
      toast.success(t('pointUpdated'));
      router.push('/');
    } catch (error: any) {
      // 如果是认证错误，尝试刷新token
      if (error.message?.includes('认证已过期') || error.message?.includes('401')) {
        const refreshSuccess = await refreshToken();
        if (refreshSuccess) {
          await updateKnowledgePoint(id, question, answer, accessToken!, isInReviewPlan);
          toast.success(t('pointUpdated'));
          router.push('/');
          return;
        }
      }
      console.error('Update error:', error);
      toast.error(t('updateFailed'));
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">{t('dataLoadFailed')}</p>
        </div>
      </div>
    );
  }

  return (
    <KnowledgePointEditor
      initialQuestion={initialQuestion}
      initialAnswer={initialAnswer}
      initialIsInReviewPlan={initialIsInReviewPlan}
      onSave={handleSave}
      isEditing={true}
    />
  );
}
