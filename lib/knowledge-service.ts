import { supabase, KnowledgePoint } from './supabase';
import { supabaseFetch } from './supabase-fetch';

const REVIEW_INTERVALS = [1, 7, 16, 35];

export async function createKnowledgePoint(question: string, answer: string, accessToken?: string) {
  if (!accessToken) {
    throw new Error('Access token required for creating knowledge points');
  }

  // 获取用户信息
  const userResponse = await supabaseFetch.getUser(accessToken);
  const user = userResponse.user;
  
  if (!user) {
    throw new Error('Not authenticated');
  }

  // 创建知识点
  const knowledgePoint = await supabaseFetch.insert<KnowledgePoint>(
    'knowledge_points',
    {
      user_id: user.id,
      question,
      answer,
    },
    { columns: '*' },
    accessToken
  );

  // 创建复习计划
  const schedules = REVIEW_INTERVALS.map((days, index) => {
    const reviewDate = new Date();
    reviewDate.setDate(reviewDate.getDate() + days);

    return {
      knowledge_point_id: knowledgePoint.id,
      user_id: user.id,
      review_date: reviewDate.toISOString().split('T')[0],
      review_number: index + 1,
      completed: false,
    };
  });

  await supabaseFetch.insert('review_schedules', schedules, {}, accessToken);

  return knowledgePoint;
}

export async function updateKnowledgePoint(id: string, question: string, answer: string, accessToken?: string) {
  return supabaseFetch.update(
    'knowledge_points',
    { question, answer, updated_at: new Date().toISOString() },
    { id },
    { columns: '*' },
    accessToken
  );
}

export async function deleteKnowledgePoint(id: string, accessToken?: string) {
  await supabaseFetch.delete('knowledge_points', { id }, accessToken);
}

export async function getAllKnowledgePoints(userId: string, accessToken?: string) {
  return supabaseFetch.select<KnowledgePoint>(
    'knowledge_points',
    {
      columns: '*',
      filters: { user_id: userId },
      order: { column: 'created_at', ascending: false }
    },
    accessToken
  );
}

export async function getTodayReviews(userId: string, accessToken?: string) {
  const today = new Date().toISOString().split('T')[0];
  
  return supabaseFetch.select(
    'review_schedules',
    {
      columns: '*,knowledge_points(*)',
      filters: { 
        user_id: userId,
        review_date: `lte.${today}`,
        completed: false
      },
      order: { column: 'review_date', ascending: true }
    },
    accessToken
  );
}

export async function completeReview(scheduleId: string, recallText: string, accessToken?: string) {
  await supabaseFetch.update(
    'review_schedules',
    {
      completed: true,
      completed_at: new Date().toISOString(),
      recall_text: recallText,
    },
    { id: scheduleId },
    {},
    accessToken
  );
}

export async function getKnowledgePointWithSchedules(id: string, accessToken?: string) {
  return supabaseFetch.select(
    'knowledge_points',
    {
      columns: '*,review_schedules(*)',
      filters: { id }
    },
    accessToken
  );
}

export async function createDefaultKnowledgePoints(accessToken: string) {
  const defaultKnowledgePoints = [
    {
      question: '什么是主动回忆？',
      answer: '主动回忆是一种学习技巧，通过主动尝试从记忆中提取信息来强化学习效果。与被动阅读不同，主动回忆要求你主动思考并尝试回忆所学内容，这能更好地巩固记忆并提高长期保留率。'
    },
    {
      question: '什么是分散学习？',
      answer: '分散学习（Spaced Repetition）是一种学习策略，通过在不同时间间隔重复学习相同内容来优化记忆效果。相比集中学习，分散学习能更好地将信息从短期记忆转移到长期记忆，提高学习效率和记忆持久性。'
    }
  ];

  const createdPoints = [];

  for (const point of defaultKnowledgePoints) {
    const knowledgePoint = await createKnowledgePoint(point.question, point.answer, accessToken);
    createdPoints.push(knowledgePoint);
  }

  return createdPoints;
}
