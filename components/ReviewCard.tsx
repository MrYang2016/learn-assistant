'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, CircleCheck as CheckCircle2 } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

interface ReviewCardProps {
  question: string;
  answer: string;
  reviewNumber: number;
  reviewDate: string;
  onComplete: (recallText: string) => Promise<void>;
}

export function ReviewCard({
  question,
  answer,
  reviewNumber,
  reviewDate,
  onComplete,
}: ReviewCardProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [recallText, setRecallText] = useState('');

  const t = useTranslations();
  const locale = useLocale();

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await onComplete(recallText);
    } catch (error) {
      console.error('Complete error:', error);
      setCompleting(false);
    }
  };

  const getReviewLabel = (num: number) => {
    if (num === 1) return t('firstReview');
    if (num === 2) return t('secondReview');
    if (num === 3) return t('thirdReview');
    if (num === 4) return t('fourthReview');
    return t('nthReview', { num });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-xl flex-1">{question}</CardTitle>
          <Badge variant="secondary">{getReviewLabel(reviewNumber)}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {t('scheduledDate')}{new Date(reviewDate).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="recall">{t('recallPrompt')}</Label>
          <Textarea
            id="recall"
            placeholder={t('recallPlaceholder')}
            value={recallText}
            onChange={(e) => setRecallText(e.target.value)}
            rows={6}
            className="resize-none"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-sm font-medium">
            {showAnswer ? t('correctAnswer') : t('showAnswer')}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAnswer(!showAnswer)}
            className="gap-2"
          >
            {showAnswer ? (
              <>
                <EyeOff className="h-4 w-4" />
                {t('hideAnswer')}
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                {t('showAnswer')}
              </>
            )}
          </Button>
        </div>

        {showAnswer && (
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm whitespace-pre-wrap">{answer}</p>
          </div>
        )}
      </CardContent>
      {showAnswer && (
        <CardFooter>
          <Button onClick={handleComplete} disabled={completing} className="w-full gap-2">
            <CheckCircle2 className="h-4 w-4" />
            {completing ? t('marking') : t('markAsReviewed')}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
