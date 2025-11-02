'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, CircleCheck as CheckCircle2, GitCompare } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

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
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

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

  const handleAnalyze = async () => {
    if (!recallText.trim()) {
      toast.error(t('recallTextRequired'));
      return;
    }

    setAnalyzing(true);
    setAnalysisResult(null);
    
    try {
      const response = await fetch('/api/analyze-recall', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recallText,
          correctAnswer: answer,
          question,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t('analysisFailed'));
      }

      const data = await response.json();
      setAnalysisResult(data.analysis);
    } catch (error: any) {
      console.error('Analyze error:', error);
      toast.error(error.message || t('analysisFailed'));
    } finally {
      setAnalyzing(false);
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
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="text-sm mb-2">{children}</p>,
                  h1: ({ children }) => <h1 className="text-base font-bold mb-2">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-sm font-bold mb-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 text-sm">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 text-sm">{children}</ol>,
                  li: ({ children }) => <li className="text-sm">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  code: ({ children }) => <code className="bg-muted-foreground/20 px-1 py-0.5 rounded text-xs">{children}</code>,
                }}
              >
                {answer}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {showAnswer && recallText.trim() && (
          <div className="pt-2">
            <Button
              variant="outline"
              onClick={handleAnalyze}
              disabled={analyzing}
              className="w-full gap-2"
            >
              <GitCompare className="h-4 w-4" />
              {analyzing ? t('analyzing') : t('compareAnalysis')}
            </Button>
          </div>
        )}

        {analysisResult && (
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
            <h4 className="text-sm font-semibold mb-2 text-blue-900 dark:text-blue-100">
              {t('analysisResult')}
            </h4>
            <div className="prose prose-sm dark:prose-invert max-w-none prose-blue dark:prose-blue">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="text-blue-800 dark:text-blue-200 mb-2">{children}</p>,
                  h1: ({ children }) => <h1 className="text-blue-900 dark:text-blue-100 text-lg font-bold mb-2">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-blue-900 dark:text-blue-100 text-base font-bold mb-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-blue-900 dark:text-blue-100 text-sm font-semibold mb-1">{children}</h3>,
                  ul: ({ children }) => <ul className="list-disc list-inside text-blue-800 dark:text-blue-200 mb-2 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside text-blue-800 dark:text-blue-200 mb-2 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="text-blue-800 dark:text-blue-200">{children}</li>,
                  strong: ({ children }) => <strong className="text-blue-900 dark:text-blue-100 font-semibold">{children}</strong>,
                  code: ({ children }) => <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded text-xs text-blue-900 dark:text-blue-100">{children}</code>,
                }}
              >
                {analysisResult}
              </ReactMarkdown>
            </div>
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
