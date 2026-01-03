'use client';

import { useAuth } from '@/contexts/AuthContext';
import { AuthForm } from '@/components/AuthForm';
import { MainLayout } from '@/components/MainLayout';
import { KnowledgePointList } from '@/components/KnowledgePointList';
import { ReviewCard } from '@/components/ReviewCard';
import { ApiKeyManagement } from '@/components/ApiKeyManagement';
import { MCPSetup } from '@/components/MCPSetup';
import { ChatInterface } from '@/components/ChatInterface';
import { useState, useEffect } from 'react';
import { KnowledgePointWithSchedule } from '@/lib/supabase';
import { useRouter } from '@/i18n';
import {
  deleteKnowledgePoint,
  getAllKnowledgePoints,
  getTodayReviews,
  completeReview,
  getTodayReviewsCount,
  getKnowledgePointsCount,
} from '@/lib/knowledge-service';
import { toast } from 'sonner';
import { TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, BookOpen, Plus, MessageSquare, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function Home() {
  const { user, accessToken, loading: authLoading, refreshToken } = useAuth();
  const [activeTab, setActiveTab] = useState('review');
  const [knowledgePoints, setKnowledgePoints] = useState<KnowledgePointWithSchedule[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // 分页状态
  const [managePage, setManagePage] = useState(1);
  const [reviewPage, setReviewPage] = useState(1);
  const [hasMoreManage, setHasMoreManage] = useState(false);
  const [hasMoreReview, setHasMoreReview] = useState(false);
  const [totalReviews, setTotalReviews] = useState(0);
  const [totalKnowledgePoints, setTotalKnowledgePoints] = useState(0);
  const PAGE_SIZE = 20;

  const t = useTranslations();
  const router = useRouter();

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

  const loadData = async (resetPagination = true) => {
    setLoading(true);
    if (resetPagination) {
      setManagePage(1);
      setReviewPage(1);
    }
    try {
      const [points, todayReviews, reviewsCount, pointsCount] = await Promise.all([
        apiCall(() => getAllKnowledgePoints(user!.id, accessToken!, { page: 1, pageSize: PAGE_SIZE })),
        apiCall(() => getTodayReviews(user!.id, accessToken!, { page: 1, pageSize: PAGE_SIZE })),
        apiCall(() => getTodayReviewsCount(user!.id, accessToken!)),
        apiCall(() => getKnowledgePointsCount(user!.id, accessToken!)),
      ]);
      setKnowledgePoints(points);
      setReviews(todayReviews);
      setTotalReviews(reviewsCount);
      setTotalKnowledgePoints(pointsCount);
      setHasMoreManage(points.length >= PAGE_SIZE);
      setHasMoreReview(todayReviews.length >= PAGE_SIZE);
    } catch (error) {
      console.error('Load data error:', error);

      // 降级方案：使用空数据，让用户可以正常使用应用
      setKnowledgePoints([]);
      setReviews([]);
      setTotalReviews(0);
      setTotalKnowledgePoints(0);
      toast.error(t('dataLoadFailed'));
    } finally {
      setLoading(false);
    }
  };

  // 加载更多知识点（管理页面）
  const loadMoreKnowledgePoints = async () => {
    if (loadingMore || !hasMoreManage) return;

    setLoadingMore(true);
    try {
      const nextPage = managePage + 1;
      const morePoints = await apiCall(() =>
        getAllKnowledgePoints(user!.id, accessToken!, { page: nextPage, pageSize: PAGE_SIZE })
      );

      if (morePoints.length > 0) {
        setKnowledgePoints(prev => [...prev, ...morePoints]);
        setManagePage(nextPage);
        setHasMoreManage(morePoints.length >= PAGE_SIZE);
      } else {
        setHasMoreManage(false);
      }
    } catch (error) {
      console.error('Load more knowledge points error:', error);
      toast.error(t('dataLoadFailed'));
    } finally {
      setLoadingMore(false);
    }
  };

  // 加载更多复习项目
  const loadMoreReviews = async () => {
    if (loadingMore || !hasMoreReview) return;

    setLoadingMore(true);
    try {
      const nextPage = reviewPage + 1;
      const moreReviews = await apiCall(() =>
        getTodayReviews(user!.id, accessToken!, { page: nextPage, pageSize: PAGE_SIZE })
      );

      if (moreReviews.length > 0) {
        setReviews(prev => [...prev, ...moreReviews]);
        setReviewPage(nextPage);
        setHasMoreReview(moreReviews.length >= PAGE_SIZE);
      } else {
        setHasMoreReview(false);
      }
    } catch (error) {
      console.error('Load more reviews error:', error);
      toast.error(t('dataLoadFailed'));
    } finally {
      setLoadingMore(false);
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
        showAddButton={true}
      >
        <TabsContent value="review" className="mt-0">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Calendar className="h-6 w-6" />
                  {t('todayReview', { count: totalReviews })}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('useActiveRecall')}
                </p>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {totalReviews} {t('pendingReviews')}
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
                <Button onClick={() => router.push('/knowledge/new')} className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t('addNewPoint')}
                </Button>
              </div>
            ) : (
              <>
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
                {hasMoreReview && (
                  <div className="flex justify-center mt-6">
                    <Button
                      onClick={loadMoreReviews}
                      disabled={loadingMore}
                      className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg hover:shadow-xl transition-all"
                    >
                      {loadingMore ? (
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
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="chat" className="mt-0">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <MessageSquare className="h-6 w-6" />
                {t('chatTitle') || 'AI助手'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t('chatSubtitle') || '基于你的知识库智能回答问题'}
              </p>
            </div>

            <ChatInterface />
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
                onDelete={handleDeleteKnowledgePoint}
                hasMore={hasMoreManage}
                onLoadMore={loadMoreKnowledgePoints}
                loading={loadingMore}
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
    </>
  );
}
