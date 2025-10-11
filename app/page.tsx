'use client';

import { useAuth } from '@/contexts/AuthContext';
import { AuthForm } from '@/components/AuthForm';
import { MainLayout } from '@/components/MainLayout';
import { KnowledgePointDialog } from '@/components/KnowledgePointDialog';
import { KnowledgePointList } from '@/components/KnowledgePointList';
import { ReviewCard } from '@/components/ReviewCard';
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

export default function Home() {
  const { user, accessToken, loading: authLoading, refreshToken } = useAuth();
  const [activeTab, setActiveTab] = useState('review');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<KnowledgePointWithSchedule | null>(null);
  const [knowledgePoints, setKnowledgePoints] = useState<KnowledgePointWithSchedule[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      toast.error('数据加载失败，但您可以继续使用应用');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveKnowledgePoint = async (question: string, answer: string) => {
    try {
      if (editingPoint) {
        await apiCall(() => updateKnowledgePoint(editingPoint.id, question, answer, accessToken!));
        toast.success('知识点已更新');
      } else {
        await apiCall(() => createKnowledgePoint(question, answer, accessToken!));
        toast.success('知识点已添加！复习计划：1天后、7天后、16天后、35天后各复习一次');
      }
      await loadData();
    } catch (error) {
      console.error('Save error:', error);
      toast.error(editingPoint ? '更新失败' : '添加失败');
      throw error;
    }
  };

  const handleDeleteKnowledgePoint = async (id: string) => {
    try {
      await apiCall(() => deleteKnowledgePoint(id, accessToken!));
      toast.success('知识点已删除');
      await loadData();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('删除失败');
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
      toast.success('复习已完成');
      await loadData();
    } catch (error) {
      console.error('Complete review error:', error);
      toast.error('操作失败');
      throw error;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">加载中...</p>
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
                  今日复习
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  使用主动回忆来加深记忆
                </p>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {reviews.length} 个待复习
              </Badge>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">今天没有需要复习的内容</p>
                <p className="text-sm text-muted-foreground mt-2 mb-6">
                  继续添加新知识点或等待下次复习
                </p>
                <Button onClick={handleAddClick} className="gap-2">
                  <Plus className="h-4 w-4" />
                  新增知识点
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
                知识点管理
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                管理你的所有知识点
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
