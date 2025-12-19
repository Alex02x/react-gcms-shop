import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserSidebar } from '@/components/user-sidebar';
import { ConfirmationModal } from '@/components/confirmation-modal';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Bell, Key, Mail, User, MessageCircle, Copy, ExternalLink, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { router } from '@inertiajs/react';

export default function SettingsPage() {
    const { t } = useTranslation(['common', 'telegram', 'products']);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        username: 'user@example.com',
        email: 'user@example.com',
        notifications: true,
    });

    // Telegram state
    const [telegramLinked, setTelegramLinked] = useState(false);
    const [telegramUsername, setTelegramUsername] = useState<string | null>(null);
    const [telegramLinkedAt, setTelegramLinkedAt] = useState<string | null>(null);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [verificationToken, setVerificationToken] = useState<string | null>(null);
    const [botUsername, setBotUsername] = useState<string | null>(null);
    const [botLink, setBotLink] = useState<string | null>(null);
    const [timeRemaining, setTimeRemaining] = useState(900); // 15 minutes
    const [isGenerating, setIsGenerating] = useState(false);
    const [isUnlinking, setIsUnlinking] = useState(false);
    const [copied, setCopied] = useState(false);
    const [unlinkConfirmOpen, setUnlinkConfirmOpen] = useState(false);

    // Check Telegram status on mount
    useEffect(() => {
        checkTelegramStatus();
    }, []);

    // Timer for verification code
    useEffect(() => {
        if (showLinkModal && timeRemaining > 0) {
            const timer = setInterval(() => {
                setTimeRemaining(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [showLinkModal, timeRemaining]);

    // Poll for link status while modal is open
    useEffect(() => {
        if (showLinkModal) {
            const pollInterval = setInterval(() => {
                checkTelegramStatus();
            }, 3000);
            return () => clearInterval(pollInterval);
        }
    }, [showLinkModal]);

    const checkTelegramStatus = async () => {
        try {
            const response = await fetch('/telegram/status');
            const data = await response.json();
            setTelegramLinked(data.linked);
            setTelegramUsername(data.telegram_username);
            setTelegramLinkedAt(data.telegram_linked_at);

            if (data.linked && showLinkModal) {
                setShowLinkModal(false);
            }
        } catch (error) {
            console.error('Failed to check Telegram status:', error);
        }
    };

    const handleGenerateToken = async () => {
        setIsGenerating(true);
        try {
            const response = await fetch('/telegram/generate-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            const data = await response.json();

            if (data.success) {
                setVerificationToken(data.token);
                setBotUsername(data.bot_username);
                setBotLink(data.bot_link);
                setTimeRemaining(900);
                setShowLinkModal(true);
            }
        } catch (error) {
            console.error('Failed to generate token:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleUnlinkTelegram = async () => {
        setUnlinkConfirmOpen(true);
    };

    const confirmUnlinkTelegram = async () => {

        setIsUnlinking(true);
        try {
            const response = await fetch('/telegram/unlink', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                setTelegramLinked(false);
                setTelegramUsername(null);
                setTelegramLinkedAt(null);
            }
        } catch (error) {
            console.error('Failed to unlink Telegram:', error);
        } finally {
            setIsUnlinking(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSave = async () => {
        setIsSaving(true);

        // TODO: Replace with actual Laravel API call
        // const response = await fetch('/api/user/settings', {
        //   method: 'PUT',
        //   body: JSON.stringify(formData)
        // })

        setTimeout(() => {
            setIsSaving(false);
            console.log('[v0] Settings saved:', formData);
        }, 1000);
    };

    return (
        <div className="flex gap-6">
            <div className="w-64 shrink-0">
                <UserSidebar />
            </div>

            <div className="flex-1 space-y-4">
                <div className="rounded-2xl border bg-card/50 p-6 backdrop-blur-sm">
                    <h1 className="text-2xl font-bold">{t('settings.page_title')}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {t('settings.page_description')}
                    </p>
                </div>

                <div className="space-y-6 rounded-2xl border bg-card/50 p-6 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <MessageCircle className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">Привязка TELEGRAM</h2>
                    </div>

                    <div className="space-y-4">
                        {!telegramLinked ? (
                            <div className="rounded-lg bg-background/50 p-4">
                                <div className="mb-4">
                                    <p className="font-medium">Не привязан</p>
                                    <p className="text-sm text-muted-foreground">
                                        Привяжите свой телеграм-аккаунт для того чтобы скачивать бесплатные товары
                                    </p>
                                </div>
                                <Button
                                    onClick={handleGenerateToken}
                                    disabled={isGenerating}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                    {isGenerating ? 'Генерирую...' : 'Привязать'}
                                </Button>
                            </div>
                        ) : (
                            <div className="rounded-lg bg-background/50 p-4">
                                <div className="mb-4">
                                    <p className="font-medium text-green-600">Привязан</p>
                                    <p className="text-sm text-muted-foreground">
                                        @{telegramUsername}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Привязан {telegramLinkedAt ? new Date(telegramLinkedAt).toLocaleDateString() : ''}
                                    </p>
                                </div>
                                <Button
                                    onClick={handleUnlinkTelegram}
                                    disabled={isUnlinking}
                                    variant="outline"
                                    className="border-destructive text-destructive hover:bg-destructive/10"
                                >
                                    {isUnlinking ? 'Отвязываем...' : 'Отвязать аккаунт'}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>



            </div>

            {/* Telegram Link Modal */}
            <Dialog open={showLinkModal} onOpenChange={setShowLinkModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Привязка Telegram аккаунта</DialogTitle>
                        <DialogDescription>
                            Отправьте этот код нашему боту для привязки вашего аккаунта
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="rounded-lg border bg-muted/50 p-4">
                            <p className="mb-2 text-sm font-medium">Шаг 1: Откройте телеграм бота</p>
                            <a
                                href={botLink || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-primary hover:underline"
                            >
                                <ExternalLink className="h-4 w-4" />
                                Откройте @{botUsername}
                            </a>
                        </div>

                        <div className="rounded-lg border bg-muted/50 p-4">
                            <p className="mb-2 text-sm font-medium">Шаг 2: Отправьте этот код</p>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 rounded bg-background px-3 py-2 font-mono text-sm">
                                    {verificationToken}
                                </code>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(verificationToken || '')}
                                >
                                    {copied ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                            <p className="text-sm text-muted-foreground">
                                Осталось времени: <span className="font-medium text-foreground">{formatTime(timeRemaining)}</span>
                            </p>
                            <p className="mt-2 text-xs text-muted-foreground">
                                Это окно автоматически закроется, когда вы привяжете аккаунт.
                            </p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <ConfirmationModal
                open={unlinkConfirmOpen}
                onOpenChange={setUnlinkConfirmOpen}
                onConfirm={confirmUnlinkTelegram}
                title="Отвязать аккаунт Telegram?"
                description="Вы можете потерять доступ к продуктам, требующим подписки на канал"
                confirmText="Удалить"
                cancelText="Отмена"
                variant="destructive"
                isLoading={isUnlinking}
            />
        </div>
    );
}
