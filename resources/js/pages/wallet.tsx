import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserSidebar } from '@/components/user-sidebar';
import { AlertModal } from '@/components/alert-modal';
import {
    AlertCircle,
    ArrowDownLeft,
    ArrowUpRight,
    Calendar,
    CheckCircle2,
    CreditCard,
    TrendingDown,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Transaction {
    id: number;
    uuid: string;
    type: 'deposit' | 'withdraw';
    amount: number;
    confirmed: boolean;
    created_at: string;
    meta?: {
        description?: string;
        admin_user_name?: string;
    };
}

interface PageProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            avatar: string;
            wallet?: { balance: number };
        };
    };
    transactions: {
        data: Transaction[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: {
        total_deposits: number;
        total_withdrawals: number;
        transaction_count: number;
    };
}

interface PaymentMethod {
    id: string;
    name: string;
    icon: string;
    description: string;
}

const paymentMethods: PaymentMethod[] = [
    { id: 'card', name: '', icon: '💳', description: '' },
    {
        id: 'yoomoney',
        name: '',
        icon: '💰',
        description: '',
    },
];

export default function WalletPage({ auth, transactions, stats }: PageProps) {
    const { t } = useTranslation(['common', 'wallet', 'products']);

    // Get translated payment methods
    const translatedPaymentMethods = paymentMethods.map(method => ({
        ...method,
        name: method.id === 'card' ? t('wallet.method_sbp_name') : t('wallet.method_yookassa_name'),
        description: method.id === 'card' ? t('wallet.method_sbp_description') : t('wallet.method_yookassa_description'),
    }));

    const [amount, setAmount] = useState('');
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [topUpSuccessOpen, setTopUpSuccessOpen] = useState(false);
    const [topUpDetails, setTopUpDetails] = useState({ amount: '', method: '' });

    const balance = (auth.user.wallet?.balance || 0) / 100;

    const handleTopUp = async () => {
        if (!amount || !selectedMethod) return;

        setIsProcessing(true);

        try {
            const response = await fetch('/wallet/top-up/initiate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                }),
            });

            const result = await response.json();

            if (result.success && result.confirmation_url) {
                // Redirect to YooKassa payment page
                window.location.href = result.confirmation_url;
            } else {
                // Show error message
                alert(result.error || 'Failed to initiate payment');
                setIsProcessing(false);
            }
        } catch (error) {
            console.error('Payment initiation error:', error);
            alert('Failed to initiate payment. Please try again.');
            setIsProcessing(false);
        }
    };

    const isAmountValid = amount && Number.parseFloat(amount) >= 100;
    const canProceed = isAmountValid && selectedMethod;

    const formatBalance = (balance: number) => {
        return `₽${balance.toFixed(2)}`;
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('ru-RU', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="flex gap-6">
            <div className="w-64 shrink-0">
                <UserSidebar />
            </div>

            <div className="flex-1 space-y-6">
                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border bg-card/50 p-6 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
                                <Wallet className="h-6 w-6 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Текущий баланс
                                </p>
                                <p className="text-2xl font-bold">
                                    {formatBalance(balance)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border bg-card/50 p-6 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                                <TrendingUp className="h-6 w-6 text-green-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Всего пополнений
                                </p>
                                <p className="text-2xl font-bold text-green-600">
                                    {formatBalance(stats.total_deposits)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border bg-card/50 p-6 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10">
                                <TrendingDown className="h-6 w-6 text-red-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Всего списаний
                                </p>
                                <p className="text-2xl font-bold text-red-600">
                                    {formatBalance(stats.total_withdrawals)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top-up Form */}
                <div className="space-y-6 rounded-2xl border bg-card/50 p-6 backdrop-blur-sm">
                    <div>
                        <h2 className="text-xl font-bold">Пополнить баланс</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Минимальная сумма пополнения 100 ₽
                        </p>
                    </div>

                    <div className="h-px bg-border" />

                    <div className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Сумма пополнения
                            </label>
                            <Input
                                type="number"
                                placeholder="Введите сумму"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="text-lg"
                                min="100"
                            />
                            {amount && Number.parseFloat(amount) < 100 && (
                                <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                                    <AlertCircle className="h-3 w-3" />
                                    Минимальная сумма 100 ₽
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Способ оплаты{' '}
                                {!isAmountValid && (
                                    <span className="text-muted-foreground">
                                        (сначала введите сумму)
                                    </span>
                                )}
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {translatedPaymentMethods.map((method) => (
                                    <button
                                        key={method.id}
                                        onClick={() =>
                                            isAmountValid &&
                                            setSelectedMethod(method.id)
                                        }
                                        disabled={!isAmountValid}
                                        className={`rounded-xl border p-4 text-left transition-all ${
                                            !isAmountValid
                                                ? 'cursor-not-allowed opacity-50'
                                                : selectedMethod === method.id
                                                  ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                                                  : 'hover:border-primary/50 hover:bg-muted/50'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="text-2xl">
                                                {method.icon}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium">
                                                    {method.name}
                                                </p>
                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                    {method.description}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Button
                            onClick={handleTopUp}
                            disabled={!canProceed || isProcessing}
                            className="w-full"
                            size="lg"
                        >
                            <Wallet className="mr-2 h-4 w-4" />
                            {isProcessing ? 'Обработка...' : 'Пополнить баланс'}
                        </Button>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="rounded-2xl border bg-card/50 p-6 backdrop-blur-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold">История операций</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Всего операций: {stats.transaction_count}
                            </p>
                        </div>
                    </div>

                    {transactions.data.length === 0 ? (
                        <div className="rounded-2xl border bg-card/50 p-12 text-center backdrop-blur-sm">
                            <p className="text-muted-foreground">
                                История операций пуста
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {transactions.data.map((transaction) => (
                                <div
                                    key={transaction.id}
                                    className="rounded-2xl border bg-card/50 p-5 backdrop-blur-sm transition-all hover:ring-1 hover:ring-primary/20"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex flex-1 gap-4">
                                            <div className="shrink-0">
                                                <div
                                                    className={`flex h-12 w-12 items-center justify-center rounded-lg border ${
                                                        transaction.type === 'deposit'
                                                            ? 'bg-green-500/10 border-green-500/20'
                                                            : 'bg-red-500/10 border-red-500/20'
                                                    }`}
                                                >
                                                    {transaction.type === 'deposit' ? (
                                                        <ArrowDownLeft className="h-6 w-6 text-green-500" />
                                                    ) : (
                                                        <ArrowUpRight className="h-6 w-6 text-red-500" />
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <h3
                                                        className={`text-lg font-semibold ${
                                                            transaction.type === 'deposit'
                                                                ? 'text-green-600'
                                                                : 'text-red-600'
                                                        }`}
                                                    >

                                                        {transaction.type === 'deposit' ? '+' : '-'}
                                                        {formatBalance(Math.abs(transaction.amount) / 100)}
                                                    </h3>

                                                </div>

                                                {transaction.meta?.description && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {transaction.meta.description}
                                                    </p>
                                                )}

                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>{formatDate(transaction.created_at)}</span>
                                                    </div>
                                                    <span>•</span>
                                                    <span>ID: #{transaction.id}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <AlertModal
                open={topUpSuccessOpen}
                onOpenChange={setTopUpSuccessOpen}
                title="Пополнение начато"
                description={`Вы будете перенаправлены на страницу оплаты для завершения пополнения на ${topUpDetails.amount} ₽ через ${topUpDetails.method}.`}
                type="success"
                buttonText="OK"
            />
        </div>
    );
}
