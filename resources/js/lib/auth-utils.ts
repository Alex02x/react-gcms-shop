import { usePage } from '@inertiajs/react';
import type { PageProps } from '@/types/auth';

export function getCsrfToken(): string {
    const token = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute('content');
    return token || '';
}

export function hasPermission(
    permissions: string[],
    required: string[],
): boolean {
    return required.some((permission) => permissions.includes(permission));
}

export function useAuth() {
    const { auth } = usePage<PageProps>().props;
    return {
        user: auth.user,
        permissions: auth.permissions || [],
    };
}
