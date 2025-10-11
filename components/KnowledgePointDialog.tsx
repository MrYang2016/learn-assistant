'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { KnowledgePointWithSchedule } from '@/lib/supabase';

interface KnowledgePointDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (question: string, answer: string) => Promise<void>;
  editingPoint?: KnowledgePointWithSchedule | null;
}

export function KnowledgePointDialog({
  open,
  onOpenChange,
  onSave,
  editingPoint,
}: KnowledgePointDialogProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingPoint) {
      setQuestion(editingPoint.question);
      setAnswer(editingPoint.answer);
    } else {
      setQuestion('');
      setAnswer('');
    }
  }, [editingPoint, open]);

  const handleSave = async () => {
    if (!question.trim() || !answer.trim()) return;

    setLoading(true);
    try {
      await onSave(question, answer);
      setQuestion('');
      setAnswer('');
      onOpenChange(false);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{editingPoint ? '编辑知识点' : '添加知识点'}</DialogTitle>
          <DialogDescription>
            {editingPoint
              ? '修改知识点的问题和答案'
              : '添加一个新的知识点，系统会自动安排复习计划'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="question">问题</Label>
            <Input
              id="question"
              placeholder="例如：什么是二元函数？"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="answer">详细说明</Label>
            <Textarea
              id="answer"
              placeholder="输入知识点的详细说明..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={8}
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={loading || !question.trim() || !answer.trim()}>
            {loading ? '保存中...' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
