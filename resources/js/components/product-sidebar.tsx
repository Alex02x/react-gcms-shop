import { Button } from '@/components/ui/button';
import { Calendar, Download, Package, Star, User } from 'lucide-react';
import { ProductVersionHistory } from '@/components/product-version-history';

interface ProductSidebarProps {
    author: string;
    category: string;
    subcategory?: string;
    createdAt: string;
    downloads: number;
    version: string;
    rating: number;
    reviewsCount: number;
    price: number;
    originalPrice?: number;
    demoUrl?: string;
    versions?: Array<{
        version_number: string;
        version_name: string;
        download_count: number;
        is_latest: boolean;
        created_at: string;
    }>;
}

export function ProductSidebar({
    author,
    category,
    subcategory,
    createdAt,
    downloads,
    version,
    rating,
    reviewsCount,
    price,
    originalPrice,
    demoUrl,
    versions,
}: ProductSidebarProps) {
    const discount = originalPrice
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0;

    return (
        <div className="sticky top-6 space-y-4">

            <div className="rounded-2xl bg-card/50 p-5 ring-1 ring-foreground/10 backdrop-blur-sm">
                <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">{price} ₽</span>
                        {originalPrice && (
                            <>
                                <span className="text-sm text-muted-foreground line-through">
                                    {originalPrice} ₽
                                </span>
                                <span className="text-sm font-medium text-destructive">
                                    -{discount}%
                                </span>
                            </>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <Button
                        size="lg"
                        className="w-full cursor-pointer border border-primary/40 bg-primary/5 text-foreground transition-all hover:border-primary hover:bg-primary/10 hover:shadow-[0_0_16px_rgba(16,185,129,0.3)]"
                    >
                        Купить сейчас
                    </Button>
                    {demoUrl && (
                        <Button
                            variant="outline"
                            size="lg"
                            className="w-full cursor-pointer border-primary/40 bg-transparent transition-all hover:border-primary hover:bg-primary/10 hover:shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                            asChild
                        >
                            <a
                                href={demoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Посмотреть демо
                            </a>
                        </Button>
                    )}
                </div>
            </div>

            <div className="rounded-2xl bg-card/50 p-5 ring-1 ring-foreground/10 backdrop-blur-sm">
                <div className="mb-4 flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`h-5 w-5 ${
                                    star <= Math.round(rating)
                                        ? 'fill-yellow-500 text-yellow-500'
                                        : 'text-muted-foreground/30'
                                }`}
                            />
                        ))}
                    </div>
                    <span className="text-sm font-medium">
                        {rating.toFixed(1)} ({reviewsCount > 0 ? reviewsCount.toString() : 'Нет отзывов'})
                    </span>
                </div>

                <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span className="font-medium text-foreground">
                            {author}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Package className="h-4 w-4" />
                        <span>
                            {category}
                            {subcategory && ` → ${subcategory}`}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                            {new Date(createdAt).toLocaleDateString('ru-RU')}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Download className="h-4 w-4" />
                        <span>
                            {downloads.toLocaleString('ru-RU')} скачиваний
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Package className="h-4 w-4" />
                        <span>Версия {version}</span>
                    </div>
                </div>
            </div>

           {versions && versions.length > 0 && <ProductVersionHistory versions={versions} />}

        </div>
    );
}
