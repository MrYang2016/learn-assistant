'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Copy, Check, ExternalLink, Settings, Server } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  createApiKey,
  getAllApiKeys,
  ApiKey,
} from '@/lib/api-key-service';

export function MCPSetup() {
  const { user, accessToken, refreshToken } = useAuth();
  const t = useTranslations();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('MCP');
  const [creating, setCreating] = useState(false);
  const [newPlainKey, setNewPlainKey] = useState<string | null>(null);
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [mcpUrl, setMcpUrl] = useState('');

  // Get MCP URL from current location
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/api/mcp/sse`;
      setMcpUrl(url);
    }
  }, []);

  // Common API call wrapper with token refresh
  const apiCall = async <T,>(apiFunction: () => Promise<T>): Promise<T> => {
    try {
      return await apiFunction();
    } catch (error: any) {
      if (error.message?.includes('认证已过期') || error.message?.includes('401')) {
        console.log('🔄 Authentication error detected, attempting token refresh...');
        const refreshSuccess = await refreshToken();
        if (refreshSuccess) {
          console.log('✅ Token refreshed, retrying API call...');
          return await apiFunction();
        }
        throw error;
      }
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      loadApiKeys();
    }
  }, [user]);

  const loadApiKeys = async () => {
    if (!user || !accessToken) return;
    
    setLoading(false);
    try {
      const keys = await apiCall(() => getAllApiKeys(user.id, accessToken));
      setApiKeys(keys);
    } catch (error) {
      console.error('Load API keys error:', error);
      // Don't show error toast, just use empty array
      setApiKeys([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error(t('apiKeys.nameRequired'));
      return;
    }

    if (!accessToken) {
      toast.error(t('apiKeys.authRequired'));
      return;
    }

    setCreating(true);
    try {
      const { apiKey, plainKey } = await apiCall(() => createApiKey(newKeyName.trim(), accessToken));
      setApiKeys([apiKey, ...apiKeys]);
      setNewPlainKey(plainKey);
      setNewKeyName('MCP');
      toast.success(t('apiKeys.created'));
      // Don't close dialog immediately, let user see the new key
    } catch (error) {
      console.error('Create API key error:', error);
      toast.error(t('apiKeys.createFailed'));
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t('mcp.configCopied'));
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  const getCursorConfig = (apiKey: string) => {
    return `{
  "mcpServers": {
    "learn-assistant": {
      "url": "${mcpUrl}",
      "headers": {
        "Authorization": "Bearer ${apiKey}"
      }
    }
  }
}`;
  };

  const firstApiKey = apiKeys.length > 0 ? apiKeys[0] : null;
  const displayApiKey = newPlainKey || (firstApiKey ? firstApiKey.api_key : null);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Server className="h-6 w-6 text-primary" />
          {t('mcp.title')}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t('mcp.description')}
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-1">
        {/* MCP Endpoint URL */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-500" />
                {t('mcp.endpointTitle')}
              </CardTitle>
              <CardDescription>{t('mcp.endpointDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-xl border border-border/50">
                <Input
                  value={mcpUrl}
                  readOnly
                  className="font-mono text-sm border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(mcpUrl)}
                  className="rounded-lg hover:bg-background shadow-sm"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* API Key Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border/60 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t('mcp.apiKeyTitle')}</CardTitle>
                  <CardDescription>{t('mcp.apiKeyDescription')}</CardDescription>
                </div>
                {apiKeys.length === 0 && (
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setNewPlainKey(null)} className="gap-2 rounded-xl shadow-lg shadow-primary/20">
                        <Plus className="h-4 w-4" />
                        {t('mcp.createApiKey')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t('apiKeys.createTitle')}</DialogTitle>
                        <DialogDescription>{t('apiKeys.createDescription')}</DialogDescription>
                      </DialogHeader>
                      {newPlainKey ? (
                        <div className="space-y-4">
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                              {t('apiKeys.warning')}
                            </p>
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 font-mono text-sm break-all border border-border/50">
                              {newPlainKey}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => copyToClipboard(newPlainKey)}
                              className="flex-1 rounded-xl"
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              {t('apiKeys.copy')}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setDialogOpen(false);
                                loadApiKeys();
                                // Keep newPlainKey so the config example remains visible
                              }}
                              className="flex-1 rounded-xl"
                            >
                              {t('apiKeys.close')}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="key-name">{t('apiKeys.keyName')}</Label>
                            <Input
                              id="key-name"
                              value={newKeyName}
                              onChange={(e) => setNewKeyName(e.target.value)}
                              placeholder={t('apiKeys.keyNamePlaceholder')}
                              className="rounded-xl mt-1.5"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !creating) {
                                  handleCreateApiKey();
                                }
                              }}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setDialogOpen(false);
                                setNewKeyName('MCP');
                              }}
                              className="rounded-xl"
                            >
                              {t('cancel')}
                            </Button>
                            <Button onClick={handleCreateApiKey} disabled={creating} className="rounded-xl">
                              {creating ? t('apiKeys.creating') : t('apiKeys.create')}
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {apiKeys.length === 0 ? (
                <div className="text-center py-8 bg-muted/20 rounded-xl border border-dashed border-border/60">
                  <p className="text-muted-foreground mb-4">{t('mcp.noApiKey')}</p>
                  <Button onClick={() => setDialogOpen(true)} variant="secondary" className="rounded-xl">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('mcp.createApiKey')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 bg-muted/30 p-4 rounded-xl border border-border/40">
                  <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    {t('mcp.usingApiKey')}: <span className="font-mono bg-background px-1.5 py-0.5 rounded text-foreground font-medium">{firstApiKey?.key_name}</span>
                  </p>
                  <p className="text-xs text-muted-foreground opacity-80 pl-6">
                    {t('mcp.apiKeyHint')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Cursor Configuration Example */}
        {displayApiKey && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/60 shadow-sm overflow-hidden">
              <CardHeader className="bg-secondary/10 border-b border-border/40">
                <CardTitle>{t('mcp.configTitle')}</CardTitle>
                <CardDescription>{t('mcp.configDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="bg-[#1e1e1e] text-gray-300 rounded-xl p-4 shadow-inner border border-black/10 relative group">
                  <pre className="text-sm font-mono overflow-x-auto">
                    <code>{getCursorConfig(displayApiKey)}</code>
                  </pre>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => copyToClipboard(getCursorConfig(displayApiKey))}
                    className="absolute top-2 right-2 text-gray-400 hover:text-white hover:bg-white/10"
                  >
                    {copiedConfig ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => copyToClipboard(getCursorConfig(displayApiKey))}
                    className="flex-1 rounded-xl gap-2"
                  >
                    {copiedConfig ? (
                      <>
                        <Check className="h-4 w-4" />
                        {t('mcp.copied')}
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        {t('mcp.copyConfig')}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Detect platform based on user agent
                      const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
                      const isWindows = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('WIN') >= 0;
                      
                      const configPath = isMac
                        ? '~/Library/Application Support/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json'
                        : isWindows
                        ? '%APPDATA%\\Cursor\\User\\globalStorage\\saoudrizwan.claude-dev\\settings\\cline_mcp_settings.json'
                        : '~/.config/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json';
                      toast.info(t('mcp.configPath', { path: configPath }));
                    }}
                    className="flex-1 rounded-xl gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {t('mcp.viewConfigPath')}
                  </Button>
                </div>

                <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200/50 dark:border-blue-800/30 rounded-xl p-5 space-y-3">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                    <Server className="w-4 h-4" />
                    Setup Instructions
                  </h4>
                  <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                    <p className="flex gap-2">
                      <span className="font-bold min-w-[1.5rem] h-6 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center text-xs">1</span>
                      <span>{t('mcp.step1')} {t('mcp.step1Description')}</span>
                    </p>
                    <p className="flex gap-2">
                      <span className="font-bold min-w-[1.5rem] h-6 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center text-xs">2</span>
                      <span>{t('mcp.step2')} {t('mcp.step2Description')}</span>
                    </p>
                    <p className="flex gap-2">
                      <span className="font-bold min-w-[1.5rem] h-6 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center text-xs">3</span>
                      <span>{t('mcp.step3')} {t('mcp.step3Description')}</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {!displayApiKey && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/60 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-lg font-medium mb-2">{t('mcp.createApiKeyFirst')}</p>
                <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
                  {t('mcp.createApiKeyFirstDescription')}
                </p>
                <Button onClick={() => setDialogOpen(true)} className="rounded-xl shadow-lg shadow-primary/20">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('mcp.createApiKey')}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

