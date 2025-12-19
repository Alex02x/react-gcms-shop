import type React from 'react';

import { getCsrfToken } from '@/lib/auth-utils';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AuthResponse, ErrorResponse } from '@/types/auth';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface AuthModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
    const { t } = useTranslation('auth');
    const [step, setStep] = useState<'email' | 'code'>('email');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resendCooldown, setResendCooldown] = useState(0);

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(
                () => setResendCooldown(resendCooldown - 1),
                1000,
            );
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/auth/send-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({ email }),
            });

            const data: AuthResponse | ErrorResponse = await response.json();

            if (!response.ok) {
                const errorData = data as ErrorResponse;
                if (errorData.errors?.email) {
                    setError(errorData.errors.email[0]);
                } else {
                    setError(
                        errorData.message ||
                            t('errors.send_code_failed'),
                    );
                }
                return;
            }

            setStep('code');
            setResendCooldown(60);
        } catch (err) {
            setError(t('errors.connection_error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleCodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/auth/verify-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({ email, code }),
            });

            const data: AuthResponse | ErrorResponse = await response.json();

            if (!response.ok) {
                const errorData = data as ErrorResponse;
                if (errorData.errors?.code) {
                    setError(errorData.errors.code[0]);
                } else {
                    setError(
                        errorData.message ||
                            t('errors.verify_code_failed'),
                    );
                }
                return;
            }

            router.reload();
            onOpenChange(false);
            setTimeout(() => {
                setStep('email');
                setEmail('');
                setCode('');
                setError(null);
            }, 300);
        } catch (err) {
            setError(t('errors.connection_error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (resendCooldown > 0) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/auth/send-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({ email }),
            });

            const data: AuthResponse | ErrorResponse = await response.json();

            if (!response.ok) {
                const errorData = data as ErrorResponse;
                setError(
                    errorData.message ||
                        t('errors.send_code_failed'),
                );
            } else {
                setResendCooldown(60);
            }
        } catch (err) {
            setError(t('errors.connection_error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = (open: boolean) => {
        if (isLoading) return;
        onOpenChange(open);
        if (!open) {
            setTimeout(() => {
                setStep('email');
                setEmail('');
                setCode('');
                setError(null);
            }, 300);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                {step === 'email' ? (
                    <>
                        <DialogHeader>
                            <DialogTitle>{t('modal.email_step_title')}</DialogTitle>
                            <DialogDescription>
                                {t('modal.email_step_description')}
                            </DialogDescription>
                        </DialogHeader>
                        <form
                            onSubmit={handleEmailSubmit}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="email">{t('modal.email_label')}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="example@mail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="bg-background/50"
                                    autoComplete="email"
                                />
                                {error && (
                                    <p className="text-sm text-red-500">
                                        {error}
                                    </p>
                                )}
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? t('modal.sending') : t('modal.send_code')}
                            </Button>
                        </form>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>{t('modal.code_step_title')}</DialogTitle>
                            <DialogDescription>
                                {t('modal.code_step_description', { email })}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCodeSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="code">{t('modal.code_label')}</Label>
                                <Input
                                    id="code"
                                    type="text"
                                    placeholder="123456"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="bg-background/50"
                                    maxLength={6}
                                    pattern="[0-9]{6}"
                                    autoFocus
                                />
                                {error && (
                                    <p className="text-sm text-red-500">
                                        {error}
                                    </p>
                                )}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleResendCode}
                                    disabled={isLoading || resendCooldown > 0}
                                    className="mt-2 h-8 text-xs text-muted-foreground hover:text-primary"
                                >
                                    {resendCooldown > 0
                                        ? t('modal.resend_code_timer', { seconds: resendCooldown })
                                        : t('modal.resend_code')}
                                </Button>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1 bg-transparent"
                                    onClick={() => setStep('email')}
                                    disabled={isLoading}
                                >
                                    {t('modal.back')}
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    disabled={isLoading}
                                >
                                    {isLoading ? t('modal.verifying') : t('modal.verify')}
                                </Button>
                            </div>
                        </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
