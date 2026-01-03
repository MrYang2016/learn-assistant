'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, CircleCheck as CheckCircle2, GitCompare, Sparkles } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { MarkdownPreview } from './MarkdownPreview';

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full overflow-hidden border-border/60 shadow-lg shadow-black/5 bg-card/50 backdrop-blur-xl">
        <CardHeader className="pb-4 border-b border-border/50 bg-secondary/20">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">
                  {getReviewLabel(reviewNumber)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {t('scheduledDate')} {new Date(reviewDate).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}
                </span>
              </div>
              <CardTitle className="text-xl md:text-2xl font-semibold leading-tight">{question}</CardTitle>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-3">
            <Label htmlFor="recall" className="text-base font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              {t('recallPrompt')}
            </Label>
            <Textarea
              id="recall"
              placeholder={t('recallPlaceholder')}
              value={recallText}
              onChange={(e) => setRecallText(e.target.value)}
              rows={6}
              className="resize-none bg-background/50 focus:bg-background transition-colors border-border/60 text-base rounded-xl p-4 focus:ring-indigo-500/20 focus:border-indigo-500/50"
            />
          </div>

          <div className="flex items-center justify-between border-t border-border/50 pt-6">
             <Button
              variant={showAnswer ? "ghost" : "default"}
              onClick={() => setShowAnswer(!showAnswer)}
              className={`gap-2 transition-all duration-300 ${!showAnswer ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 w-full sm:w-auto' : 'text-muted-foreground hover:text-foreground'}`}
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

          <AnimatePresence>
            {showAnswer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="bg-secondary/30 rounded-xl p-6 border border-border/50 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t('correctAnswer')}</h3>
                  </div>
                  
                  <MarkdownPreview content={answer} className="prose-sm" />

                  {recallText.trim() && (
                    <div className="pt-4 mt-4 border-t border-border/40">
                      <Button
                        variant="outline"
                        onClick={handleAnalyze}
                        disabled={analyzing}
                        className="w-full gap-2 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                      >
                        <GitCompare className="h-4 w-4" />
                        {analyzing ? t('analyzing') : t('compareAnalysis')}
                      </Button>
                    </div>
                  )}
                </div>

                {analysisResult && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 bg-blue-50/80 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 p-6 rounded-xl backdrop-blur-sm"
                  >
                    <h4 className="text-sm font-semibold mb-4 text-blue-900 dark:text-blue-100 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      {t('analysisResult')}
                    </h4>
                    <MarkdownPreview content={analysisResult} className="prose-sm" />
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        
        <AnimatePresence>
          {showAnswer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CardFooter className="bg-secondary/10 border-t border-border/50 p-4">
                <Button 
                  onClick={handleComplete} 
                  disabled={completing} 
                  className="w-full gap-2 h-12 text-base font-medium bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  {completing ? t('marking') : t('markAsReviewed')}
                </Button>
              </CardFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
