import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface TelegramSettings {
    bot_token: string;
    channel_id: string;
    channel_link: string;
}

interface PageProps {
    settings: TelegramSettings | null;
}

export default function TelegramSettings({ settings }: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        bot_token: settings?.bot_token || '',
        channel_id: settings?.channel_id || '',
        channel_link: settings?.channel_link || '',
    });

    const [testResult, setTestResult] = useState<{
        success: boolean;
        message: string;
    } | null>(null);
    const [isTesting, setIsTesting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setTestResult(null);
        post('/admin/telegram/settings', {
            preserveScroll: true,
            onSuccess: () => {
                setTestResult({
                    success: true,
                    message: 'Telegram settings saved successfully!',
                });
            },
        });
    };

    const handleTestConnection = async () => {
        setIsTesting(true);
        setTestResult(null);

        try {
            const response = await fetch('/admin/telegram/test-connection', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    bot_token: data.bot_token,
                    channel_id: data.channel_id,
                }),
            });

            const result = await response.json();

            setTestResult({
                success: result.success,
                message: result.message,
            });
        } catch (error) {
            setTestResult({
                success: false,
                message: 'Failed to test connection. Please try again.',
            });
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <AdminLayout title="Telegram Settings">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Telegram Integration Settings</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Configure your Telegram bot and channel for user verification
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Bot Token */}
                    <div className="rounded-lg border bg-card p-6">
                        <h2 className="mb-4 text-lg font-semibold">Bot Configuration</h2>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="bot_token">
                                    Bot Token<span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="bot_token"
                                    type="text"
                                    value={data.bot_token}
                                    onChange={(e) => setData('bot_token', e.target.value)}
                                    placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                                    className="mt-2 bg-background"
                                    required
                                />
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Get your bot token from{' '}
                                    <a
                                        href="https://t.me/BotFather"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline"
                                    >
                                        @BotFather
                                    </a>
                                </p>
                                {errors.bot_token && (
                                    <p className="mt-1 flex items-center gap-1 text-sm text-destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.bot_token}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Channel Configuration */}
                    <div className="rounded-lg border bg-card p-6">
                        <h2 className="mb-4 text-lg font-semibold">Channel Configuration</h2>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="channel_id">
                                    Channel ID<span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="channel_id"
                                    type="text"
                                    value={data.channel_id}
                                    onChange={(e) => setData('channel_id', e.target.value)}
                                    placeholder="-1001234567890 or @channelname"
                                    className="mt-2 bg-background"
                                    required
                                />
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Use numeric ID (e.g., -1001234567890) or username (e.g., @mychannel)
                                </p>
                                {errors.channel_id && (
                                    <p className="mt-1 flex items-center gap-1 text-sm text-destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.channel_id}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="channel_link">
                                    Channel Link<span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="channel_link"
                                    type="url"
                                    value={data.channel_link}
                                    onChange={(e) => setData('channel_link', e.target.value)}
                                    placeholder="https://t.me/mychannel"
                                    className="mt-2 bg-background"
                                    required
                                />
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Public link to your Telegram channel
                                </p>
                                {errors.channel_link && (
                                    <p className="mt-1 flex items-center gap-1 text-sm text-destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.channel_link}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Test Connection */}
                    <div className="rounded-lg border bg-card p-6">
                        <h2 className="mb-4 text-lg font-semibold">Test Connection</h2>
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Test your bot configuration before saving. This will verify that your bot can
                                access the Telegram API and check channel membership.
                            </p>
                            <Button
                                type="button"
                                onClick={handleTestConnection}
                                disabled={
                                    isTesting || !data.bot_token || !data.channel_id
                                }
                                variant="outline"
                            >
                                {isTesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Test Connection
                            </Button>

                            {testResult && (
                                <div
                                    className={`flex items-start gap-2 rounded-lg border p-4 ${
                                        testResult.success
                                            ? 'border-green-500/20 bg-green-500/5'
                                            : 'border-destructive/20 bg-destructive/5'
                                    }`}
                                >
                                    {testResult.success ? (
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    ) : (
                                        <AlertCircle className="h-5 w-5 text-destructive" />
                                    )}
                                    <div className="flex-1">
                                        <p
                                            className={`text-sm font-medium ${
                                                testResult.success
                                                    ? 'text-green-600'
                                                    : 'text-destructive'
                                            }`}
                                        >
                                            {testResult.message}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Setup Instructions */}
                    <div className="rounded-lg border bg-card p-6">
                        <h2 className="mb-4 text-lg font-semibold">Setup Instructions</h2>
                        <ol className="list-decimal list-inside space-y-3 text-sm">
                            <li>
                                Create a bot using{' '}
                                <a
                                    href="https://t.me/BotFather"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                >
                                    @BotFather
                                </a>{' '}
                                on Telegram
                            </li>
                            <li>Copy the bot token and paste it in the "Bot Token" field above</li>
                            <li>Add your bot as an administrator to your Telegram channel</li>
                            <li>
                                Get your channel ID using{' '}
                                <a
                                    href="https://t.me/username_to_id_bot"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                >
                                    @username_to_id_bot
                                </a>{' '}
                                or similar tools
                            </li>
                            <li>Enter your channel's public link (e.g., https://t.me/mychannel)</li>
                            <li>Click "Test Connection" to verify the configuration</li>
                            <li>Click "Save Settings" to apply the changes</li>
                        </ol>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end gap-4">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="px-8"
                        >
                            {processing ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
