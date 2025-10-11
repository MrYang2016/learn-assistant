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
import { useTranslations } from 'next-intl';

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

  const t = useTranslations();

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
          <DialogTitle>{editingPoint ? t('editKnowledgePoint') : t('addKnowledgePoint')}</DialogTitle>
          <DialogDescription>
            {editingPoint ? t('editDescription') : t('addDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="question">{t('question')}</Label>
            <Input
              id="question"
              placeholder={t('questionPlaceholder')}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="answer">{t('answer')}</Label>
            <Textarea
              id="answer"
              placeholder={t('answerPlaceholder')}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={8}
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSave} disabled={loading || !question.trim() || !answer.trim()}>
            {loading ? t('saving') : t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
