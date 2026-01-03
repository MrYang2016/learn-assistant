'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Save, Eye, Code, Calendar } from 'lucide-react';
import { useRouter } from '@/i18n';
import { MarkdownPreview } from './MarkdownPreview';

interface KnowledgePointEditorProps {
  initialQuestion?: string;
  initialAnswer?: string;
  initialIsInReviewPlan?: boolean;
  onSave: (question: string, answer: string, isInReviewPlan: boolean) => Promise<void>;
  isEditing?: boolean;
}

export function KnowledgePointEditor({
  initialQuestion = '',
  initialAnswer = '',
  initialIsInReviewPlan = true,
  onSave,
  isEditing = false,
}: KnowledgePointEditorProps) {
  const [question, setQuestion] = useState(initialQuestion);
  const [answer, setAnswer] = useState(initialAnswer);
  const [isInReviewPlan, setIsInReviewPlan] = useState(initialIsInReviewPlan);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const t = useTranslations();
  const router = useRouter();

  useEffect(() => {
    setQuestion(initialQuestion);
    setAnswer(initialAnswer);
    setIsInReviewPlan(initialIsInReviewPlan);
  }, [initialQuestion, initialAnswer, initialIsInReviewPlan]);

  const handleSave = async () => {
    if (!question.trim() || !answer.trim()) return;

    setLoading(true);
    try {
      await onSave(question, answer, isInReviewPlan);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('cancel')}
              </Button>
              <div>
                <h1 className="text-xl font-bold">
                  {isEditing ? t('editKnowledgePoint') : t('addKnowledgePoint')}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isEditing ? t('editDescription') : t('addDescription')}
                </p>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={loading || !question.trim() || !answer.trim()}
              className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg hover:shadow-xl"
            >
              <Save className="h-4 w-4" />
              {loading ? t('saving') : t('save')}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            {/* <CardTitle className="text-2xl">
              {isEditing ? t('editKnowledgePoint') : t('createNewKnowledgePoint')}
            </CardTitle>
            <CardDescription>
              {t('fillKnowledgePointDetails')}
            </CardDescription> */}
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Question Field */}
            <div className="space-y-3">
              <Label htmlFor="question" className="text-base font-semibold">
                {t('question')}
              </Label>
              <Input
                id="question"
                placeholder={t('questionPlaceholder')}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="text-base h-12"
              />
              <p className="text-sm text-muted-foreground">
                {t('questionHint')}
              </p>
            </div>

            {/* Answer Field with Markdown Support */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="answer" className="text-base font-semibold">
                  {t('answer')}
                </Label>
                <span className="text-xs text-muted-foreground">
                  {t('markdownSupported')}
                </span>
              </div>

              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'edit' | 'preview')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-2">
                  <TabsTrigger value="edit" className="gap-2">
                    <Code className="h-4 w-4" />
                    {t('editMode')}
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="gap-2">
                    <Eye className="h-4 w-4" />
                    {t('previewMode')}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="edit" className="mt-0">
                  <Textarea
                    id="answer"
                    placeholder={t('answerPlaceholderMarkdown')}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    rows={20}
                    className="resize-y min-h-[400px] text-base leading-relaxed font-mono"
                  />
                </TabsContent>

                <TabsContent value="preview" className="mt-0">
                  <div className="border rounded-md p-4 min-h-[400px] bg-muted/30">
                    {answer.trim() ? (
                      <MarkdownPreview content={answer} />
                    ) : (
                      <p className="text-muted-foreground text-center py-20">
                        {t('noContentToPreview')}
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <p className="text-sm text-muted-foreground">
                {t('answerHintMarkdown')}
              </p>
            </div>

            {/* Review Plan Toggle */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="review-plan" className="text-base font-semibold cursor-pointer">
                      {t('reviewPlan')}
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isInReviewPlan ? t('reviewPlanEnabledHint') : t('reviewPlanDisabledHint')}
                  </p>
                </div>
                <Switch
                  id="review-plan"
                  checked={isInReviewPlan}
                  onCheckedChange={setIsInReviewPlan}
                />
              </div>
            </div>

            {/* Action Buttons - Mobile */}
            <div className="flex gap-3 pt-4 md:hidden">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
                className="flex-1"
              >
                {t('cancel')}
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading || !question.trim() || !answer.trim()}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
              >
                {loading ? t('saving') : t('save')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
