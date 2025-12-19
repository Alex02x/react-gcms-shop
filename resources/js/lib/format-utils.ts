export function parsePrice(price: string | number): number {
    if (typeof price === 'number') {
        return price;
    }
    return parseFloat(price);
}

export function formatPrice(price: number, locale: string = 'ru-RU'): string {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(price);
}

export function formatNumber(num: number, locale: string = 'ru-RU'): string {
    return new Intl.NumberFormat(locale).format(num);
}

export function formatDate(date: Date | string, locale: string = 'ru-RU'): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(dateObj);
}
