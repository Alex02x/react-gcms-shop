export function parsePrice(price: string | number): number {
    if (typeof price === 'number') {
        return price;
    }
    return parseFloat(price);
}

export function formatPrice(price: number): string {
    return `${price} ₽`;
}
