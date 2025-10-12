'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useRouter as useIntlRouter } from '../i18n';
import { LanguageSwitcher } from './LanguageSwitcher';

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
      // 检查是否是自动注册的情况
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fafafa] to-gray-100 p-4">
      <div className="w-full max-w-4xl flex flex-col md:flex-row bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Left side: Introduction */}
        <div className="md:w-1/2 p-8 bg-gradient-to-br from-gray-700 to-gray-500 text-white flex flex-col justify-center">
          <h1 className="text-3xl font-bold mb-4">{t('appName')}</h1>
          <p className="mb-6 opacity-90">{t('introduction')}</p>
          <ul className="space-y-3">
            <li className="flex items-center gap-2">✅ {t('features.1')}</li>
            <li className="flex items-center gap-2">✅ {t('features.2')}</li>
            <li className="flex items-center gap-2">✅ {t('features.3')}</li>
            <li className="flex items-center gap-2">✅ {t('features.4')}</li>
          </ul>
        </div>
        {/* Right side: Form */}
        <div className="md:w-1/2 p-8">
          <h2 className="text-2xl font-bold mb-2 text-center">{t('welcome')}</h2>
          <p className="text-center text-muted-foreground mb-6">{t('welcomeDescription')}</p>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">{t('login')}</TabsTrigger>
              <TabsTrigger value="signup">{t('register')}</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">{t('email')}</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">{t('password')}</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder={t('passwordPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                  />
                </div>
                <Button type="submit" className="w-full bg-gray-600 hover:bg-gray-700" disabled={loading}>
                  {loading ? t('loggingIn') : t('login')}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">{t('email')}</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">{t('password')}</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder={t('passwordPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                  />
                </div>
                <Button type="submit" className="w-full bg-gray-600 hover:bg-gray-700" disabled={loading}>
                  {loading ? t('registering') : t('register')}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
    </div>
  );
}
