import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/admin-layout';
import { useForm } from '@inertiajs/react';
import { DollarSign, Minus, Plus } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    avatar: string;
    roles: Array<{ id: number; name: string }>;
    wallet?: { balance: number };
}

interface Role {
    id: number;
    name: string;
}

interface PageProps {
    user: User;
    roles: Role[];
}

export default function Edit({ user, roles }: PageProps) {
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        avatar: user.avatar,
        roles: user.roles.map((r) => r.id),
    });

    const depositForm = useForm({
        amount: '',
        description: '',
    });

    const withdrawForm = useForm({
        amount: '',
        description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/users/${user.id}`);
    };

    const handleDeposit = (e: React.FormEvent) => {
        e.preventDefault();
        depositForm.post(`/admin/users/${user.id}/wallet/deposit`, {
            onSuccess: () => {
                setShowDepositModal(false);
                depositForm.reset();
            },
        });
    };

    const handleWithdraw = (e: React.FormEvent) => {
        e.preventDefault();
        withdrawForm.post(`/admin/users/${user.id}/wallet/withdraw`, {
            onSuccess: () => {
                setShowWithdrawModal(false);
                withdrawForm.reset();
            },
        });
    };

    const formatBalance = (balance?: number) => {
        if (!balance) return '₽0.00';
        return `₽${(balance / 100).toFixed(2)}`;
    };

    return (
        <AdminLayout title="Edit User">
            <div className="mx-auto max-w-4xl space-y-6">
                {/* User Info Form */}
                <div className="rounded-lg border bg-card p-6">
                    <h2 className="mb-4 text-xl font-semibold">
                        User Information
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                className="mt-1"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                className="mt-1"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="password">
                                Password (leave blank to keep current)
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label>Roles</Label>
                            <div className="mt-2 space-y-2">
                                {roles.map((role) => (
                                    <label
                                        key={role.id}
                                        className="flex items-center gap-2"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={data.roles.includes(
                                                role.id,
                                            )}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setData('roles', [
                                                        ...data.roles,
                                                        role.id,
                                                    ]);
                                                } else {
                                                    setData(
                                                        'roles',
                                                        data.roles.filter(
                                                            (r) =>
                                                                r !== role.id,
                                                        ),
                                                    );
                                                }
                                            }}
                                            className="rounded"
                                        />
                                        <span>{role.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <Button type="submit" disabled={processing}>
                            Save Changes
                        </Button>
                    </form>
                </div>

                {/* Wallet Panel */}
                <div className="rounded-lg border bg-card p-6">
                    <h2 className="mb-4 text-xl font-semibold">
                        Wallet Management
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Current Balance
                                </p>
                                <p className="text-2xl font-bold">
                                    {formatBalance(user.wallet?.balance)}
                                </p>
                            </div>
                            <DollarSign className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => setShowDepositModal(true)}
                                className="flex-1"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Funds
                            </Button>
                            <Button
                                onClick={() => setShowWithdrawModal(true)}
                                variant="outline"
                                className="flex-1"
                            >
                                <Minus className="mr-2 h-4 w-4" />
                                Deduct Funds
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Deposit Modal */}
            {showDepositModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-lg bg-card p-6">
                        <h3 className="mb-4 text-lg font-semibold">
                            Add Funds
                        </h3>
                        <form onSubmit={handleDeposit} className="space-y-4">
                            <div>
                                <Label htmlFor="deposit-amount">
                                    Amount (₽)
                                </Label>
                                <Input
                                    id="deposit-amount"
                                    type="number"
                                    step="0.01"
                                    value={depositForm.data.amount}
                                    onChange={(e) =>
                                        depositForm.setData(
                                            'amount',
                                            e.target.value,
                                        )
                                    }
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="deposit-description">
                                    Description (optional)
                                </Label>
                                <Input
                                    id="deposit-description"
                                    value={depositForm.data.description}
                                    onChange={(e) =>
                                        depositForm.setData(
                                            'description',
                                            e.target.value,
                                        )
                                    }
                                    className="mt-1"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="submit"
                                    disabled={depositForm.processing}
                                    className="flex-1"
                                >
                                    Confirm Deposit
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowDepositModal(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Withdraw Modal */}
            {showWithdrawModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-lg bg-card p-6">
                        <h3 className="mb-4 text-lg font-semibold">
                            Deduct Funds
                        </h3>
                        <form onSubmit={handleWithdraw} className="space-y-4">
                            <div>
                                <Label htmlFor="withdraw-amount">
                                    Amount (₽)
                                </Label>
                                <Input
                                    id="withdraw-amount"
                                    type="number"
                                    step="0.01"
                                    value={withdrawForm.data.amount}
                                    onChange={(e) =>
                                        withdrawForm.setData(
                                            'amount',
                                            e.target.value,
                                        )
                                    }
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="withdraw-description">
                                    Description (required)
                                </Label>
                                <Input
                                    id="withdraw-description"
                                    value={withdrawForm.data.description}
                                    onChange={(e) =>
                                        withdrawForm.setData(
                                            'description',
                                            e.target.value,
                                        )
                                    }
                                    className="mt-1"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="submit"
                                    disabled={withdrawForm.processing}
                                    className="flex-1"
                                >
                                    Confirm Withdrawal
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowWithdrawModal(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
