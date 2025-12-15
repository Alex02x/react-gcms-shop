import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import { ImageSlider } from "./image-slider"

interface ProductCardProps {
  title: string
  description: string
  price: number
  originalPrice?: number
  rating: number
  images: string[]
  category?: string
  subcategory?: string
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
}: ProductCardProps) {
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0

  return (
    <Card className="group overflow-hidden rounded-2xl bg-card/50 backdrop-blur-sm transition-shadow hover:shadow-lg hover:shadow-primary/5 ring-1 ring-foreground/10 border-0 pt-0 pb-0 gap-1">
      <div className="relative">
        <ImageSlider images={images} alt={title} />
        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-lg bg-background/90 px-2 py-1 text-xs font-medium backdrop-blur z-10">
          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
          <span>{rating.toFixed(1)}</span>
        </div>
        {discount > 0 && (
          <Badge className="absolute left-2 top-2 rounded-lg bg-destructive text-destructive-foreground z-10">
            -{discount}%
          </Badge>
        )}
      </div>
      <CardContent className="p-3">
        {(category || subcategory) && (
          <div className="mb-1 text-xs text-muted-foreground/60 flex items-center gap-1">
            {category && <span>{category}</span>}
            {category && subcategory && <span>→</span>}
            {subcategory && <span>{subcategory}</span>}
          </div>
        )}
        <h3 className="mb-1.5 line-clamp-1 text-sm font-semibold">{title}</h3>
        <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">{description}</p>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold">{price} ₽</span>
            {originalPrice && <span className="text-xs text-muted-foreground line-through">{originalPrice} ₽</span>}
          </div>
          <Button
            size="sm"
            variant="outline"
            className="cursor-pointer border-primary/40 hover:bg-primary/10 hover:border-primary hover:shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all bg-transparent"
            asChild
          >
            <a href={`/product/${Math.random().toString(36).substring(7)}`}>К товару</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
