import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { Star } from 'lucide-react';
import { ImageSlider } from './image-slider';

interface ProductCardProps {
    title: string;
    description: string;
    price: number;
    originalPrice?: number;
    rating: number;
    images: string[];
    category?: string;
    subcategory?: string;
    slug: string;
}

export function ProductCard({
    title,
    description,
    price,
    originalPrice,
    rating,
    images,
    category,
    subcategory,
    slug,
}: ProductCardProps) {
    const discount = originalPrice
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0;

    return (
        <Card className="group gap-1 overflow-hidden rounded-2xl border-0 bg-card/50 pt-0 pb-0 ring-1 ring-foreground/10 backdrop-blur-sm transition-shadow hover:shadow-lg hover:shadow-primary/5">
            <div className="relative">
                <ImageSlider images={images} alt={title} />
                {rating > 0 && (
                    <div className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-lg bg-background/90 px-2 py-1 text-xs font-medium backdrop-blur">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span>{rating.toFixed(1)}</span>
                    </div>
                )}
                {discount > 0 && (
                    <Badge className="absolute top-2 left-2 z-10 rounded-lg bg-destructive text-destructive-foreground">
                        -{discount}%
                    </Badge>
                )}
            </div>
            <CardContent className="p-3">
                {(category || subcategory) && (
                    <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground/60">
                        {category && <span>{category}</span>}
                        {category && subcategory && <span>→</span>}
                        {subcategory && <span>{subcategory}</span>}
                    </div>
                )}
                <h3 className="mb-1.5 line-clamp-1 text-sm font-semibold">
                    {title}
                </h3>
                <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">
                    {description}
                </p>
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-bold">{price} ₽</span>
                        {originalPrice && (
                            <span className="text-xs text-muted-foreground line-through">
                                {originalPrice} ₽
                            </span>
                        )}
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        className="cursor-pointer border-primary/40 bg-transparent transition-all hover:border-primary hover:bg-primary/10 hover:shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                        asChild
                    >
                        <Link href={`/products/${slug}`}>К товару</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
