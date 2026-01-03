import { supabase, KnowledgePoint } from './supabase';
import { supabaseFetch } from './supabase-fetch';

const REVIEW_INTERVALS = [1, 7, 16, 35];

/**
 * 调用服务端 API 生成向量嵌入
 */
async function generateEmbeddingOnServer(
  question: string,
  answer: string,
  userId: string,
  accessToken: string
): Promise<number[] | undefined> {
  try {
    const response = await fetch('/api/vectorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        answer,
        userId,
        accessToken,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate embedding');
    }

    const data = await response.json();
    return data.success ? data.embedding : undefined;
  } catch (error) {
    console.error('⚠️ Failed to generate embedding on server:', error);
    return undefined;
  }
}

export async function createKnowledgePoint(
  question: string,
  answer: string,
  accessToken?: string,
  isInReviewPlan: boolean = true
) {
  if (!accessToken) {
    throw new Error('Access token required for creating knowledge points');
  }

  // 获取用户信息
  const user = await supabaseFetch.getUser(accessToken);

  if (!user) {
    throw new Error('Not authenticated');
  }

  // 在服务端生成向量嵌入
  const embedding = await generateEmbeddingOnServer(question, answer, user.id, accessToken);

  if (embedding) {
    console.log('✅ Generated embedding for knowledge point on server');
  } else {
    console.warn('⚠️ Creating knowledge point without embedding');
  }

  // 创建知识点
  const knowledgePointResponse = await supabaseFetch.insert<KnowledgePoint[]>(
    'knowledge_points',
    {
      user_id: user.id,
      question,
      answer,
      embedding: embedding ? `[${embedding.join(',')}]` : undefined,
      is_in_review_plan: isInReviewPlan,
    },
    { columns: '*' },
    accessToken
  );

  const knowledgePoint = knowledgePointResponse[0];

  // 只在用户选择加入复习计划时创建复习计划
  if (isInReviewPlan) {
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
  }

  return knowledgePoint;
}

export async function updateKnowledgePoint(
  id: string,
  question: string,
  answer: string,
  accessToken?: string,
  isInReviewPlan?: boolean
) {
  if (!accessToken) {
    throw new Error('Access token required for updating knowledge points');
  }

  // 获取用户信息
  const user = await supabaseFetch.getUser(accessToken);

  if (!user) {
    throw new Error('Not authenticated');
  }

  // 在服务端生成新的向量嵌入
  const embedding = await generateEmbeddingOnServer(question, answer, user.id, accessToken);

  if (embedding) {
    console.log('✅ Generated updated embedding for knowledge point on server');
  } else {
    console.warn('⚠️ Updating knowledge point without new embedding');
  }

  const updateData: any = {
    question,
    answer,
    updated_at: new Date().toISOString(),
  };

  if (embedding) {
    updateData.embedding = `[${embedding.join(',')}]`;
  }

  // 如果指定了 isInReviewPlan，更新该字段
  if (isInReviewPlan !== undefined) {
    updateData.is_in_review_plan = isInReviewPlan;
  }

  const response = await supabaseFetch.update<KnowledgePoint[]>(
    'knowledge_points',
    updateData,
    { id },
    { columns: '*' },
    accessToken
  );

  const updatedPoint = response[0];

  // 如果从不在复习计划变为在复习计划中，需要创建复习计划
  if (isInReviewPlan === true) {
    await addToReviewPlan(id, user.id, accessToken);
  }

  return updatedPoint;
}

/**
 * 将知识点加入复习计划
 * 如果该知识点已有复习计划，则先删除旧的，然后创建新的
 */
export async function addToReviewPlan(knowledgePointId: string, userId: string, accessToken?: string) {
  if (!accessToken) {
    throw new Error('Access token required');
  }

  // 先删除该知识点的所有现有复习计划
  await supabaseFetch.delete(
    'review_schedules',
    { knowledge_point_id: knowledgePointId },
    accessToken
  );

  // 创建新的复习计划
  const schedules = REVIEW_INTERVALS.map((days, index) => {
    const reviewDate = new Date();
    reviewDate.setDate(reviewDate.getDate() + days);

    return {
      knowledge_point_id: knowledgePointId,
      user_id: userId,
      review_date: reviewDate.toISOString().split('T')[0],
      review_number: index + 1,
      completed: false,
    };
  });

  await supabaseFetch.insert('review_schedules', schedules, {}, accessToken);
}

export async function deleteKnowledgePoint(id: string, accessToken?: string) {
  await supabaseFetch.delete('knowledge_points', { id }, accessToken);
}

export async function getAllKnowledgePoints(
  userId: string,
  accessToken?: string,
  options?: { page?: number; pageSize?: number }
) {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 20;
  const offset = (page - 1) * pageSize;

  return supabaseFetch.select<KnowledgePoint>(
    'knowledge_points',
    {
      columns: '*,review_schedules(*)',
      filters: { user_id: userId },
      order: { column: 'created_at', ascending: false },
      limit: pageSize,
      offset: offset
    },
    accessToken
  );
}

export async function getTodayReviews(
  userId: string,
  accessToken?: string,
  options?: { page?: number; pageSize?: number }
) {
  const today = new Date().toISOString().split('T')[0];
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 20;
  const offset = (page - 1) * pageSize;

  return supabaseFetch.select(
    'review_schedules',
    {
      columns: '*,knowledge_points(*)',
      filters: {
        user_id: userId,
        review_date: `lte.${today}`,
        completed: false
      },
      order: { column: 'review_date', ascending: true },
      limit: pageSize,
      offset: offset
    },
    accessToken
  );
}

export async function getTodayReviewsCount(userId: string, accessToken?: string): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  return supabaseFetch.count(
    'review_schedules',
    {
      filters: {
        user_id: userId,
        review_date: `lte.${today}`,
        completed: false
      }
    },
    accessToken
  );
}

export async function getKnowledgePointsCount(userId: string, accessToken?: string): Promise<number> {
  return supabaseFetch.count(
    'knowledge_points',
    {
      filters: { user_id: userId }
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
    const knowledgePoint = await createKnowledgePoint(point.question, point.answer, accessToken, true);
    createdPoints.push(knowledgePoint);
  }

  return createdPoints;
}
