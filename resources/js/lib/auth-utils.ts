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
