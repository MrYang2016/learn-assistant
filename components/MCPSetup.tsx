'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Copy, Check, ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
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
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          {t('mcp.title')}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t('mcp.description')}
        </p>
      </div>

      {/* MCP Endpoint URL */}
      <Card>
        <CardHeader>
          <CardTitle>{t('mcp.endpointTitle')}</CardTitle>
          <CardDescription>{t('mcp.endpointDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input
              value={mcpUrl}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(mcpUrl)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Key Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('mcp.apiKeyTitle')}</CardTitle>
              <CardDescription>{t('mcp.apiKeyDescription')}</CardDescription>
            </div>
            {apiKeys.length === 0 && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setNewPlainKey(null)}>
                    <Plus className="h-4 w-4 mr-2" />
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
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                          {t('apiKeys.warning')}
                        </p>
                        <div className="bg-white dark:bg-gray-800 rounded p-3 font-mono text-sm break-all">
                          {newPlainKey}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => copyToClipboard(newPlainKey)}
                          className="flex-1"
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
                          className="flex-1"
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
                        >
                          {t('cancel')}
                        </Button>
                        <Button onClick={handleCreateApiKey} disabled={creating}>
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
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">{t('mcp.noApiKey')}</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('mcp.createApiKey')}
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-2">
                {t('mcp.usingApiKey')}: <span className="font-mono">{firstApiKey?.key_name}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {t('mcp.apiKeyHint')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cursor Configuration Example */}
      {displayApiKey && (
        <Card>
          <CardHeader>
            <CardTitle>{t('mcp.configTitle')}</CardTitle>
            <CardDescription>{t('mcp.configDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted rounded-lg p-4">
              <pre className="text-sm font-mono overflow-x-auto">
                <code>{getCursorConfig(displayApiKey)}</code>
              </pre>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => copyToClipboard(getCursorConfig(displayApiKey))}
                className="flex-1"
              >
                {copiedConfig ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    {t('mcp.copied')}
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
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
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {t('mcp.viewConfigPath')}
              </Button>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>{t('mcp.step1')}</strong> {t('mcp.step1Description')}
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200 mt-2">
                <strong>{t('mcp.step2')}</strong> {t('mcp.step2Description')}
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200 mt-2">
                <strong>{t('mcp.step3')}</strong> {t('mcp.step3Description')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!displayApiKey && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg font-medium mb-2">{t('mcp.createApiKeyFirst')}</p>
            <p className="text-sm text-muted-foreground mb-4">
              {t('mcp.createApiKeyFirstDescription')}
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('mcp.createApiKey')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

