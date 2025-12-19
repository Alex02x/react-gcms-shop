import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useForm } from '@inertiajs/react';
import { AlertCircle, CheckCircle, Copy, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface PaymentSettings {
    shop_id: string;
    secret_key: string;
    secret_key_set: boolean;
    enabled: boolean;
    min_amount: number;
    currency: string;
    is_configured: boolean;
}

interface RecentPayment {
    id: number;
    user_name: string;
    user_email: string;
    amount: number;
    currency: string;
    status: string;
    payment_method_type: string | null;
    created_at: string;
    formatted_amount: string;
}

interface PageProps {
    settings: PaymentSettings;
    recentPayments: RecentPayment[];
    webhookUrl: string;
}

export default function PaymentSettings({ settings, recentPayments, webhookUrl }: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        shop_id: settings?.shop_id || '',
        secret_key: settings?.secret_key || '',
        enabled: settings?.enabled || false,
        min_amount: settings?.min_amount || 100,
        currency: settings?.currency || 'RUB',
    });

    const [testResult, setTestResult] = useState<{
        success: boolean;
        message: string;
    } | null>(null);
    const [isTesting, setIsTesting] = useState(false);
    const [webhookCopied, setWebhookCopied] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setTestResult(null);
        post('/admin/payment/settings', {
            preserveScroll: true,
            onSuccess: () => {
                setTestResult({
                    success: true,
                    message: 'Payment settings saved successfully!',
                });
            },
            onError: () => {
                setTestResult({
                    success: false,
                    message: 'Failed to save settings. Please check the form.',
                });
            },
        });
    };

    const handleTestConnection = async () => {
        setIsTesting(true);
        setTestResult(null);

        try {
            const response = await fetch('/admin/payment/test-connection', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    shop_id: data.shop_id,
                    secret_key: data.secret_key,
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

    const copyWebhookUrl = () => {
        navigator.clipboard.writeText(webhookUrl);
        setWebhookCopied(true);
        setTimeout(() => setWebhookCopied(false), 2000);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'succeeded':
                return 'text-green-600 bg-green-100';
            case 'pending':
                return 'text-yellow-600 bg-yellow-100';
            case 'processing':
                return 'text-blue-600 bg-blue-100';
            case 'canceled':
                return 'text-gray-600 bg-gray-100';
            case 'failed':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <AdminLayout title="Payment Settings">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Payment Settings</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Configure YooKassa payment gateway for balance top-ups
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* YooKassa Credentials */}
                    <div className="rounded-lg border bg-card p-6">
                        <h2 className="mb-4 text-lg font-semibold">YooKassa Credentials</h2>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="shop_id">
                                    Shop ID<span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="shop_id"
                                    type="text"
                                    value={data.shop_id}
                                    onChange={(e) => setData('shop_id', e.target.value)}
                                    placeholder="123456"
                                    className="mt-2 bg-background"
                                    required
                                />
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Your YooKassa merchant shop identifier
                                </p>
                                {errors.shop_id && (
                                    <p className="mt-1 flex items-center gap-1 text-sm text-destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.shop_id}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="secret_key">
                                    Secret Key<span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="secret_key"
                                    type="password"
                                    value={data.secret_key}
                                    onChange={(e) => setData('secret_key', e.target.value)}
                                    placeholder={settings.secret_key_set ? '••••••••••••' : 'Enter secret key'}
                                    className="mt-2 bg-background"
                                />
                                <p className="mt-1 text-xs text-muted-foreground">
                                    YooKassa API secret key for authentication
                                </p>
                                {errors.secret_key && (
                                    <p className="mt-1 flex items-center gap-1 text-sm text-destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.secret_key}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Payment Configuration */}
                    <div className="rounded-lg border bg-card p-6">
                        <h2 className="mb-4 text-lg font-semibold">Payment Configuration</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="enabled">Enable YooKassa</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Allow users to top up their balance via YooKassa
                                    </p>
                                </div>
                                <Switch
                                    id="enabled"
                                    checked={data.enabled}
                                    onCheckedChange={(checked) => setData('enabled', checked)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="min_amount">
                                    Minimum Top-Up Amount<span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="min_amount"
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    value={data.min_amount}
                                    onChange={(e) => setData('min_amount', parseFloat(e.target.value))}
                                    placeholder="100"
                                    className="mt-2 bg-background"
                                    required
                                />
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Minimum amount users can add to their balance (in {data.currency})
                                </p>
                                {errors.min_amount && (
                                    <p className="mt-1 flex items-center gap-1 text-sm text-destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.min_amount}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="currency">Currency</Label>
                                <Input
                                    id="currency"
                                    type="text"
                                    value={data.currency}
                                    onChange={(e) => setData('currency', e.target.value)}
                                    placeholder="RUB"
                                    className="mt-2 bg-background"
                                    maxLength={3}
                                    required
                                />
                                <p className="mt-1 text-xs text-muted-foreground">
                                    3-letter currency code (e.g., RUB, USD, EUR)
                                </p>
                                {errors.currency && (
                                    <p className="mt-1 flex items-center gap-1 text-sm text-destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.currency}
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
                                Test your YooKassa credentials before saving. This verifies that your
                                shop ID and secret key are valid.
                            </p>
                            <Button
                                type="button"
                                onClick={handleTestConnection}
                                disabled={isTesting || !data.shop_id || !data.secret_key}
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

                    {/* Webhook Configuration */}
                    <div className="rounded-lg border bg-card p-6">
                        <h2 className="mb-4 text-lg font-semibold">Webhook Configuration</h2>
                        <div className="space-y-4">
                            <div>
                                <Label>Webhook URL</Label>
                                <div className="mt-2 flex gap-2">
                                    <Input
                                        value={webhookUrl}
                                        readOnly
                                        className="bg-muted"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={copyWebhookUrl}
                                    >
                                        {webhookCopied ? (
                                            <CheckCircle className="h-4 w-4" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Copy this URL and add it to your YooKassa store settings
                                </p>
                            </div>

                            <div className="rounded-lg bg-muted p-4">
                                <h3 className="mb-2 font-medium">Setup Instructions</h3>
                                <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
                                    <li>Log in to your YooKassa dashboard</li>
                                    <li>Navigate to store settings</li>
                                    <li>Find "HTTP notifications" section</li>
                                    <li>Add the webhook URL above</li>
                                    <li>Enable events: payment.succeeded, payment.canceled</li>
                                    <li>Save the webhook configuration</li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end gap-4">
                        <Button type="submit" disabled={processing} className="px-8">
                            {processing ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </div>
                </form>

                {/* Recent Payments */}
                {recentPayments.length > 0 && (
                    <div className="rounded-lg border bg-card p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Recent Payments</h2>
                            <a
                                href="/admin/payment/payments"
                                className="text-sm text-primary hover:underline"
                            >
                                View All
                            </a>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b text-left text-sm text-muted-foreground">
                                        <th className="pb-3 font-medium">User</th>
                                        <th className="pb-3 font-medium">Amount</th>
                                        <th className="pb-3 font-medium">Status</th>
                                        <th className="pb-3 font-medium">Method</th>
                                        <th className="pb-3 font-medium">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentPayments.map((payment) => (
                                        <tr key={payment.id} className="border-b last:border-0">
                                            <td className="py-3">
                                                <div>
                                                    <p className="font-medium">{payment.user_name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {payment.user_email}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="py-3 font-medium">
                                                {payment.formatted_amount}
                                            </td>
                                            <td className="py-3">
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                                                        payment.status
                                                    )}`}
                                                >
                                                    {payment.status}
                                                </span>
                                            </td>
                                            <td className="py-3 text-sm text-muted-foreground">
                                                {payment.payment_method_type || 'N/A'}
                                            </td>
                                            <td className="py-3 text-sm text-muted-foreground">
                                                {payment.created_at}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
