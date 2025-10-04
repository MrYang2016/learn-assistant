'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, CircleCheck as CheckCircle2 } from 'lucide-react';

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
    const labels = ['首次复习', '第二次复习', '第三次复习', '第四次复习'];
    return labels[num - 1] || `第${num}次复习`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-xl flex-1">{question}</CardTitle>
          <Badge variant="secondary">{getReviewLabel(reviewNumber)}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          计划日期：{new Date(reviewDate).toLocaleDateString('zh-CN')}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="recall">写下你的回忆：</Label>
          <Textarea
            id="recall"
            placeholder="在这里输入你能回忆起的内容..."
            value={recallText}
            onChange={(e) => setRecallText(e.target.value)}
            rows={6}
            className="resize-none"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-sm font-medium">
            {showAnswer ? '正确答案：' : '完成回忆后，点击查看正确答案'}
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
                隐藏答案
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                查看答案
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
            {completing ? '标记中...' : '标记为已复习'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
