import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserSidebar } from '@/components/user-sidebar';
import { Bell, Key, Mail, User } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        username: 'user@example.com',
        email: 'user@example.com',
        notifications: true,
    });

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
                    <h1 className="text-2xl font-bold">Настройки профиля</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Управление вашим аккаунтом и предпочтениями
                    </p>
                </div>

                {/* Profile Information */}
                <div className="space-y-6 rounded-2xl border bg-card/50 p-6 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">
                            Информация профиля
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            email: e.target.value,
                                        })
                                    }
                                    className="bg-background/50"
                                />
                                <Button
                                    variant="outline"
                                    className="border-primary/30 bg-transparent"
                                >
                                    <Mail className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Ваш email используется для входа и получения
                                уведомлений
                            </p>
                        </div>
                    </div>
                </div>

                {/* Security */}
                <div className="space-y-6 rounded-2xl border bg-card/50 p-6 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <Key className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">Безопасность</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg bg-background/50 p-4">
                            <div>
                                <p className="font-medium">Изменить пароль</p>
                                <p className="text-sm text-muted-foreground">
                                    Обновите пароль для вашей учетной записи
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                className="border-primary/30 bg-transparent"
                            >
                                Изменить
                            </Button>
                        </div>

                        <div className="flex items-center justify-between rounded-lg bg-background/50 p-4">
                            <div>
                                <p className="font-medium">
                                    Двухфакторная аутентификация
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Дополнительная защита вашего аккаунта
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                className="border-primary/30 bg-transparent"
                            >
                                Включить
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="space-y-6 rounded-2xl border bg-card/50 p-6 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <Bell className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">Уведомления</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg bg-background/50 p-4">
                            <div>
                                <p className="font-medium">Email уведомления</p>
                                <p className="text-sm text-muted-foreground">
                                    Получать уведомления о новых товарах и
                                    акциях
                                </p>
                            </div>
                            <button
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    formData.notifications
                                        ? 'bg-primary'
                                        : 'bg-muted'
                                }`}
                                onClick={() =>
                                    setFormData({
                                        ...formData,
                                        notifications: !formData.notifications,
                                    })
                                }
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        formData.notifications
                                            ? 'translate-x-6'
                                            : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-primary px-8 text-primary-foreground hover:bg-primary/90"
                    >
                        {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
