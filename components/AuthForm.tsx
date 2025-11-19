'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useRouter as useIntlRouter } from '../i18n';
import { LanguageSwitcher } from './LanguageSwitcher';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export function AuthForm() {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const t = useTranslations();
  const router = useIntlRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success(t('loginSuccess'));
      router.push({ pathname: '/' });
    } catch (error: any) {
      if (error.message && error.message.includes('Registration successful')) {
        toast.success(t('autoRegisterSuccess') || 'Account created and logged in successfully!');
        router.push({ pathname: '/' });
      } else {
        toast.error(error.message || t('loginFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp(email, password);
      toast.success(t('signupSuccess'));
      router.push({ pathname: '/' });
    } catch (error: any) {
      toast.error(error.message || t('signupFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground relative overflow-hidden p-4 sm:p-8">
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-400/10 blur-[120px] dark:bg-purple-900/20" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/10 blur-[120px] dark:bg-blue-900/20" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-5xl flex flex-col md:flex-row bg-card/60 backdrop-blur-xl rounded-[2rem] border border-white/20 shadow-2xl shadow-black/5 overflow-hidden relative z-10"
      >
        {/* Left side: Introduction */}
        <div className="md:w-1/2 p-8 md:p-12 bg-gradient-to-br from-indigo-600 to-purple-700 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-lg font-medium tracking-wide opacity-90">{t('appName')}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {t('welcome')}
            </h1>
            <p className="text-lg text-indigo-100 leading-relaxed mb-8">
              {t('introduction')}
            </p>
          </div>

          <ul className="space-y-4 relative z-10">
            {[1, 2, 3, 4].map((i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-3 text-indigo-50"
              >
                <CheckCircle2 className="w-5 h-5 text-indigo-300" />
                <span className="text-base">{t(`features.${i}`)}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Right side: Form */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white/50 dark:bg-zinc-900/50">
          <div className="flex justify-end mb-8">
            <LanguageSwitcher />
          </div>

          <div className="max-w-sm mx-auto w-full">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 h-12 p-1 bg-secondary/60 rounded-xl">
                <TabsTrigger value="signin" className="rounded-lg font-medium transition-all data-[state=active]:shadow-sm">{t('login')}</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-lg font-medium transition-all data-[state=active]:shadow-sm">{t('register')}</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-6 mt-0">
                <form onSubmit={handleSignIn} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-sm font-medium text-muted-foreground ml-1">{t('email')}</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder={t('emailPlaceholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 rounded-xl bg-background/50 border-border/60 focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-sm font-medium text-muted-foreground ml-1">{t('password')}</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder={t('passwordPlaceholder')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 rounded-xl bg-background/50 border-border/60 focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200" disabled={loading}>
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span className="flex items-center gap-2">
                        {t('login')} <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-6 mt-0">
                <form onSubmit={handleSignUp} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium text-muted-foreground ml-1">{t('email')}</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder={t('emailPlaceholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 rounded-xl bg-background/50 border-border/60 focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium text-muted-foreground ml-1">{t('password')}</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder={t('passwordPlaceholder')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="h-12 rounded-xl bg-background/50 border-border/60 focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200" disabled={loading}>
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span className="flex items-center gap-2">
                        {t('register')} <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
