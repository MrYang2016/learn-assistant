'use client';

import { KnowledgePointEditor } from '@/components/KnowledgePointEditor';
import { useAuth } from '@/contexts/AuthContext';
import { createKnowledgePoint } from '@/lib/knowledge-service';
import { toast } from 'sonner';
import { useRouter } from '@/i18n';
import { useTranslations } from 'next-intl';

export default function NewKnowledgePointPage() {
  const { accessToken, refreshToken } = useAuth();
  const router = useRouter();
  const t = useTranslations();

  const handleSave = async (question: string, answer: string, isInReviewPlan: boolean) => {
    try {
      await createKnowledgePoint(question, answer, accessToken!, isInReviewPlan);
      toast.success(t('pointAdded'));
      router.push('/');
    } catch (error: any) {
      // 如果是认证错误，尝试刷新token
      if (error.message?.includes('认证已过期') || error.message?.includes('401')) {
        const refreshSuccess = await refreshToken();
        if (refreshSuccess) {
          await createKnowledgePoint(question, answer, accessToken!, isInReviewPlan);
          toast.success(t('pointAdded'));
          router.push('/');
          return;
        }
      }
      console.error('Save error:', error);
      toast.error(t('addFailed'));
      throw error;
    }
  };

  return (
    <KnowledgePointEditor
      onSave={handleSave}
      isEditing={false}
    />
  );
}
