import { supabase, KnowledgePoint, ReviewSchedule } from './supabase';

const REVIEW_INTERVALS = [0, 7, 16, 31];

export async function createKnowledgePoint(question: string, answer: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: knowledgePoint, error: kpError } = await supabase
    .from('knowledge_points')
    .insert({
      user_id: user.id,
      question,
      answer,
    })
    .select()
    .single();

  if (kpError) throw kpError;

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

  const { error: scheduleError } = await supabase
    .from('review_schedules')
    .insert(schedules);

  if (scheduleError) throw scheduleError;

  return knowledgePoint;
}

export async function updateKnowledgePoint(id: string, question: string, answer: string) {
  const { data, error } = await supabase
    .from('knowledge_points')
    .update({
      question,
      answer,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteKnowledgePoint(id: string) {
  const { error } = await supabase
    .from('knowledge_points')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getAllKnowledgePoints() {
  const { data, error } = await supabase
    .from('knowledge_points')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as KnowledgePoint[];
}

export async function getTodayReviews() {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('review_schedules')
    .select(`
      *,
      knowledge_points (*)
    `)
    .lte('review_date', today)
    .eq('completed', false)
    .order('review_date', { ascending: true });

  if (error) throw error;
  return data;
}

export async function completeReview(scheduleId: string, recallText: string) {
  const { error } = await supabase
    .from('review_schedules')
    .update({
      completed: true,
      completed_at: new Date().toISOString(),
      recall_text: recallText,
    })
    .eq('id', scheduleId);

  if (error) throw error;
}

export async function getKnowledgePointWithSchedules(id: string) {
  const { data, error } = await supabase
    .from('knowledge_points')
    .select(`
      *,
      review_schedules (*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}
