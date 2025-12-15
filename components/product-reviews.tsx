"use client"

import { useState, useEffect } from "react"
import { Star, ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Review {
  id: string
  author: string
  rating: number
  comment: string
  createdAt: string
  likes: number
}

interface ProductReviewsProps {
  productId: string
  rating: number
  reviewsCount: number
}

// Mock data - в будущем заменить на API запрос
const getReviews = async (productId: string) => {
  await new Promise((resolve) => setTimeout(resolve, 300))

  return [
    {
      id: "1",
      author: "Александр К.",
      rating: 5,
      comment: "Отличный модуль! Все работает как надо, документация понятная. Установил за 5 минут. Рекомендую всем!",
      createdAt: "2024-12-10",
      likes: 12,
    },
    {
      id: "2",
      author: "Мария С.",
      rating: 4,
      comment: "Хороший функционал, но хотелось бы больше настроек для кастомизации интерфейса.",
      createdAt: "2024-12-08",
      likes: 7,
    },
    {
      id: "3",
      author: "Дмитрий П.",
      rating: 5,
      comment: "Просто бомба! Поддержка отвечает быстро, все проблемы решаются моментально.",
      createdAt: "2024-12-05",
      likes: 15,
    },
  ]
}

export function ProductReviews({ productId, rating, reviewsCount }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadReviews = async () => {
      setIsLoading(true)
      const data = await getReviews(productId)
      setReviews(data)
      setIsLoading(false)
    }

    loadReviews()
  }, [productId])

  return (
    <div className="rounded-2xl bg-card/50 backdrop-blur-sm ring-1 ring-foreground/10 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Отзывы</h2>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(rating) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {rating.toFixed(1)} из 5 ({reviewsCount} отзывов)
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          className="cursor-pointer border-primary/40 hover:bg-primary/10 hover:border-primary hover:shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all bg-transparent"
        >
          Написать отзыв
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-lg bg-muted/30 p-4">
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/20 text-primary">{review.author.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{review.author}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${
                              star <= review.rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString("ru-RU")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
            </div>
          ))}
          
        </div>
      )}
    </div>
  )
}
