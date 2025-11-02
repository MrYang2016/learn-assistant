'use client';

import { useAuth } from '@/contexts/AuthContext';
import { AuthForm } from '@/components/AuthForm';
import { MainLayout } from '@/components/MainLayout';
import { KnowledgePointDialog } from '@/components/KnowledgePointDialog';
import { KnowledgePointList } from '@/components/KnowledgePointList';
import { ReviewCard } from '@/components/ReviewCard';
import { ApiKeyManagement } from '@/components/ApiKeyManagement';
import { MCPSetup } from '@/components/MCPSetup';
import { useState, useEffect } from 'react';
import { KnowledgePointWithSchedule } from '@/lib/supabase';
import {
  createKnowledgePoint,
  updateKnowledgePoint,
  deleteKnowledgePoint,
  getAllKnowledgePoints,
  getTodayReviews,
  completeReview,
} from '@/lib/knowledge-service';
import { toast } from 'sonner';
import { TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, BookOpen, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function Home() {
  const { user, accessToken, loading: authLoading, refreshToken } = useAuth();
  const [activeTab, setActiveTab] = useState('review');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<KnowledgePointWithSchedule | null>(null);
  const [knowledgePoints, setKnowledgePoints] = useState<KnowledgePointWithSchedule[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations();

  // 通用的API调用包装函数，处理认证错误
  const apiCall = async <T,>(apiFunction: () => Promise<T>): Promise<T> => {
    try {
      return await apiFunction();
    } catch (error: any) {
      // 如果是认证错误，尝试刷新token
      if (error.message?.includes('认证已过期') || error.message?.includes('401')) {
        console.log('🔄 Authentication error detected, attempting token refresh...');
        const refreshSuccess = await refreshToken();
        if (refreshSuccess) {
          console.log('✅ Token refreshed, retrying API call...');
          return await apiFunction();
        } else {
          console.log('❌ Token refresh failed, user needs to re-login');
          throw error;
        }
      }
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [points, todayReviews] = await Promise.all([
        apiCall(() => getAllKnowledgePoints(user!.id, accessToken!)),
        apiCall(() => getTodayReviews(user!.id, accessToken!)),
      ]);
      setKnowledgePoints(points);
      setReviews(todayReviews);
    } catch (error) {
      console.error('Load data error:', error);

      // 降级方案：使用空数据，让用户可以正常使用应用
      setKnowledgePoints([]);
      setReviews([]);
      toast.error(t('dataLoadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveKnowledgePoint = async (question: string, answer: string) => {
    try {
      if (editingPoint) {
        await apiCall(() => updateKnowledgePoint(editingPoint.id, question, answer, accessToken!));
        toast.success(t('pointUpdated'));
      } else {
        await apiCall(() => createKnowledgePoint(question, answer, accessToken!));
        toast.success(t('pointAdded'));
      }
      await loadData();
    } catch (error) {
      console.error('Save error:', error);
      toast.error(editingPoint ? t('updateFailed') : t('addFailed'));
      throw error;
    }
  };

  const handleDeleteKnowledgePoint = async (id: string) => {
    try {
      await apiCall(() => deleteKnowledgePoint(id, accessToken!));
      toast.success(t('pointDeleted'));
      await loadData();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(t('deleteFailed'));
      throw error;
    }
  };

  const handleEditClick = (point: KnowledgePointWithSchedule) => {
    setEditingPoint(point);
    setDialogOpen(true);
  };

  const handleAddClick = () => {
    setEditingPoint(null);
    setDialogOpen(true);
  };

  const handleCompleteReview = async (scheduleId: string, recallText: string) => {
    try {
      await apiCall(() => completeReview(scheduleId, recallText, accessToken!));
      toast.success(t('reviewCompleted'));
      await loadData();
    } catch (error) {
      console.error('Complete review error:', error);
      toast.error(t('operationFailed'));
      throw error;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <>
      <MainLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddClick={activeTab === 'manage' ? handleAddClick : undefined}
      >
        <TabsContent value="review" className="mt-0">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Calendar className="h-6 w-6" />
                  {t('todayReview', { count: reviews.length })}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('useActiveRecall')}
                </p>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {reviews.length} {t('pendingReviews')}
              </Badge>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">{t('noReviewsToday')}</p>
                <p className="text-sm text-muted-foreground mt-2 mb-6">
                  {t('continueAddNewPoints')}
                </p>
                <Button onClick={handleAddClick} className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t('addNewPoint')}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    question={review.knowledge_points.question}
                    answer={review.knowledge_points.answer}
                    reviewNumber={review.review_number}
                    reviewDate={review.review_date}
                    onComplete={(recallText) => handleCompleteReview(review.id, recallText)}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="manage" className="mt-0">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="h-6 w-6" />
                {t('knowledgePointsManagement')}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t('manageYourKnowledgePoints')}
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              </div>
            ) : (
              <KnowledgePointList
                points={knowledgePoints}
                onEdit={handleEditClick}
                onDelete={handleDeleteKnowledgePoint}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="apikey" className="mt-0">
          <ApiKeyManagement />
        </TabsContent>

        <TabsContent value="mcp" className="mt-0">
          <MCPSetup />
        </TabsContent>
      </MainLayout>

      <KnowledgePointDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveKnowledgePoint}
        editingPoint={editingPoint}
      />
    </>
  );
}
