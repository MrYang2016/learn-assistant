'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Key, Copy, Trash2, Edit2, Eye, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  createApiKey,
  getAllApiKeys,
  updateApiKey,
  deleteApiKey,
  ApiKey,
  generateApiKey,
  getApiKeyPrefix,
} from '@/lib/api-key-service';

export function ApiKeyManagement() {
  const { user, accessToken, refreshToken } = useAuth();
  const t = useTranslations();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [creating, setCreating] = useState(false);
  const [newPlainKey, setNewPlainKey] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

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
    
    setLoading(true);
    try {
      const keys = await apiCall(() => getAllApiKeys(user.id, accessToken));
      setApiKeys(keys);
    } catch (error) {
      console.error('Load API keys error:', error);
      toast.error(t('apiKeys.loadFailed'));
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
      setNewKeyName('');
      toast.success(t('apiKeys.created'));
    } catch (error) {
      console.error('Create API key error:', error);
      toast.error(t('apiKeys.createFailed'));
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteApiKey = async (id: string) => {
    if (!accessToken) return;

    try {
      await apiCall(() => deleteApiKey(id, accessToken));
      setApiKeys(apiKeys.filter(key => key.id !== id));
      toast.success(t('apiKeys.deleted'));
    } catch (error) {
      console.error('Delete API key error:', error);
      toast.error(t('apiKeys.deleteFailed'));
    }
  };

  const handleUpdateApiKey = async (id: string) => {
    if (!editingName.trim()) {
      toast.error(t('apiKeys.nameRequired'));
      return;
    }

    if (!accessToken) return;

    try {
      const updated = await apiCall(() => updateApiKey(id, editingName.trim(), accessToken));
      setApiKeys(apiKeys.map(key => key.id === id ? updated : key));
      setEditingId(null);
      setEditingName('');
      toast.success(t('apiKeys.updated'));
    } catch (error) {
      console.error('Update API key error:', error);
      toast.error(t('apiKeys.updateFailed'));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t('apiKeys.copied'));
  };

  const toggleReveal = (id: string) => {
    const newRevealed = new Set(revealedKeys);
    if (newRevealed.has(id)) {
      newRevealed.delete(id);
    } else {
      newRevealed.add(id);
    }
    setRevealedKeys(newRevealed);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Key className="h-6 w-6" />
            {t('apiKeys.title')}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t('apiKeys.description')}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setNewPlainKey(null)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('apiKeys.create')}
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
                      setNewPlainKey(null);
                      setDialogOpen(false);
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
                      setNewKeyName('');
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
      </div>

      {apiKeys.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Key className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">{t('apiKeys.noKeys')}</p>
            <p className="text-sm text-muted-foreground mb-4">
              {t('apiKeys.noKeysDescription')}
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('apiKeys.create')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {apiKeys.map((apiKey) => (
            <Card key={apiKey.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {editingId === apiKey.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleUpdateApiKey(apiKey.id);
                            } else if (e.key === 'Escape') {
                              setEditingId(null);
                              setEditingName('');
                            }
                          }}
                          className="flex-1"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          onClick={() => handleUpdateApiKey(apiKey.id)}
                        >
                          {t('save')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingId(null);
                            setEditingName('');
                          }}
                        >
                          {t('cancel')}
                        </Button>
                      </div>
                    ) : (
                      <CardTitle className="flex items-center gap-2">
                        {apiKey.key_name}
                      </CardTitle>
                    )}
                    <CardDescription className="mt-1">
                      {t('apiKeys.prefix')}: {apiKey.prefix}...
                      {apiKey.last_used_at && (
                        <span className="ml-4">
                          {t('apiKeys.lastUsed')}: {formatDate(apiKey.last_used_at)}
                        </span>
                      )}
                      <span className="ml-4">
                        {t('createdAt')} {formatDate(apiKey.created_at)}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(apiKey.id);
                        setEditingName(apiKey.key_name);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('apiKeys.deleteTitle')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('apiKeys.deleteDescription')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteApiKey(apiKey.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {t('apiKeys.delete')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted rounded-lg p-3 font-mono text-sm">
                    {revealedKeys.has(apiKey.id) ? (
                      <span className="break-all">{apiKey.api_key}</span>
                    ) : (
                      <span>{apiKey.prefix}...</span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleReveal(apiKey.id)}
                  >
                    {revealedKeys.has(apiKey.id) ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(revealedKeys.has(apiKey.id) ? apiKey.api_key : `${apiKey.prefix}...`)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

