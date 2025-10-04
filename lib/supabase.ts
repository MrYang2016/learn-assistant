import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface KnowledgePoint {
  id: string;
  user_id: string;
  question: string;
  answer: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewSchedule {
  id: string;
  knowledge_point_id: string;
  user_id: string;
  review_date: string;
  review_number: number;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface KnowledgePointWithSchedule extends KnowledgePoint {
  review_schedules?: ReviewSchedule[];
}
