import { Button } from "@/components/ui/button"
import { Star, Download, Calendar, User, Package } from "lucide-react"

interface ProductSidebarProps {
  author: string
  category: string
  subcategory?: string
  createdAt: string
  downloads: number
  version: string
  rating: number
  reviewsCount: number
  price: number
  originalPrice?: number
  demoUrl?: string
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
}: ProductSidebarProps) {
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0

  return (
    <div className="sticky top-6 space-y-4">
      <div className="rounded-2xl bg-card/50 backdrop-blur-sm ring-1 ring-foreground/10 p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= Math.round(rating) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/30"
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-medium">
            {rating.toFixed(1)} ({reviewsCount})
          </span>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4" />
            <span className="text-foreground font-medium">{author}</span>
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
            <span>{new Date(createdAt).toLocaleDateString("ru-RU")}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Download className="h-4 w-4" />
            <span>{downloads.toLocaleString("ru-RU")} скачиваний</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>Версия {version}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-card/50 backdrop-blur-sm ring-1 ring-foreground/10 p-5">
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{price} ₽</span>
            {originalPrice && (
              <>
                <span className="text-sm text-muted-foreground line-through">{originalPrice} ₽</span>
                <span className="text-sm font-medium text-destructive">-{discount}%</span>
              </>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Button
            size="lg"
            className="w-full cursor-pointer border-primary/40 hover:bg-primary/10 hover:border-primary hover:shadow-[0_0_16px_rgba(16,185,129,0.3)] transition-all bg-primary/5 border text-foreground"
          >
            Купить сейчас
          </Button>
          {demoUrl && (
            <Button
              variant="outline"
              size="lg"
              className="w-full cursor-pointer border-primary/40 hover:bg-primary/10 hover:border-primary hover:shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all bg-transparent"
              asChild
            >
              <a href={demoUrl} target="_blank" rel="noopener noreferrer">
                Посмотреть демо
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
