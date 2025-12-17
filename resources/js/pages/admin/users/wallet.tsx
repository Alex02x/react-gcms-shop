import AdminLayout from '@/layouts/admin-layout';
import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

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

interface User {
    id: number;
    name: string;
    email: string;
    avatar: string;
    wallet?: { balance: number };
}

interface PageProps {
    user: User;
    transactions: {
        data: Transaction[];
        current_page: number;
        last_page: number;
    };
    stats: {
        total_deposits: number;
        total_withdrawals: number;
        transaction_count: number;
    };
}

export default function Wallet({ user, transactions, stats }: PageProps) {
    const formatBalance = (balance: number) => {
        return `₽${balance.toFixed(2)}`;
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AdminLayout title="Wallet Details">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href={`/admin/users/${user.id}/edit`}
                        className="rounded-md border p-2 hover:bg-accent"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="h-12 w-12 rounded-full"
                        />
                        <div>
                            <h1 className="text-2xl font-bold">{user.name}</h1>
                            <p className="text-sm text-muted-foreground">
                                {user.email}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border bg-card p-6">
                        <p className="text-sm text-muted-foreground">
                            Current Balance
                        </p>
                        <p className="text-3xl font-bold">
                            {formatBalance((user.wallet?.balance || 0) / 100)}
                        </p>
                    </div>
                    <div className="rounded-lg border bg-card p-6">
                        <p className="text-sm text-muted-foreground">
                            Total Deposits
                        </p>
                        <p className="text-3xl font-bold text-green-600">
                            {formatBalance(stats.total_deposits)}
                        </p>
                    </div>
                    <div className="rounded-lg border bg-card p-6">
                        <p className="text-sm text-muted-foreground">
                            Total Withdrawals
                        </p>
                        <p className="text-3xl font-bold text-red-600">
                            {formatBalance(stats.total_withdrawals)}
                        </p>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="rounded-lg border bg-card">
                    <div className="border-b p-4">
                        <h2 className="text-lg font-semibold">
                            Transaction History
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        ID
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Type
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Amount
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Description
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Admin
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {transactions.data.map((transaction) => (
                                    <tr
                                        key={transaction.id}
                                        className="hover:bg-muted/50"
                                    >
                                        <td className="px-4 py-3 font-mono text-sm">
                                            #{transaction.id}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                                    transaction.type ===
                                                    'deposit'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}
                                            >
                                                {transaction.type}
                                            </span>
                                        </td>
                                        <td
                                            className={`px-4 py-3 font-medium ${
                                                transaction.type === 'deposit'
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                            }`}
                                        >
                                            {transaction.type === 'deposit'
                                                ? '+'
                                                : '-'}
                                            {formatBalance(
                                                transaction.amount / 100,
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {transaction.meta?.description ||
                                                '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {transaction.meta
                                                ?.admin_user_name || '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                                    transaction.confirmed
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}
                                            >
                                                {transaction.confirmed
                                                    ? 'Confirmed'
                                                    : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">
                                            {formatDate(transaction.created_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
