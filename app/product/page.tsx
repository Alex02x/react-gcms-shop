"use client"

import { useEffect, useState } from "react"
import { ProductHero } from "@/components/product-hero"
import { ProductImageGallery } from "@/components/product-image-gallery"
import { ProductSidebar } from "@/components/product-sidebar"
import { ProductDescription } from "@/components/product-description"
import { ProductReviews } from "@/components/product-reviews"


const EXAMPLE_PRODUCT = {
  id: "1",
  title: "RCON SHOP - магазин RCON",
  category: "GameCMS",
  subcategory: "Модули",
  images: [
   "https://tpl-market.ru/public/uploads/images/product/screenshots/3vcmJ7SyQWfE.jpg",
   "https://tpl-market.ru/public/uploads/images/product/screenshots/T2pU7BFbdC41.jpg",
   "https://tpl-market.ru/public/uploads/images/product/screenshots/QHZcColFy6NX.jpg",
  ],
  description: `тестовое описание 123`,
  author: "grStas (Станислав Грачев)",
  version: "2.1.4",
  downloads: 1284,
  createdAt: "2024-12-01",
  price: 550,
  originalPrice: 800,
  rating: 4.8,
  reviewsCount: 3,
  demoUrl: "https://demo.example.com",
}

// Пример: const getProductData = async (id: string) => {
//   const response = await fetch(`/api/products/${id}`)
//   return response.json()
// }

export default function ProductPage() {
  const [product, setProduct] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadProduct = async () => {
      setIsLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 500))
      setProduct(EXAMPLE_PRODUCT)
      setIsLoading(false)
    }

    loadProduct()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Товар не найден</p>
      </div>
    )
  }

  return (
    <>
      <ProductHero title={product.title} category={product.category} subcategory={product.subcategory} />

      <div className="flex gap-6">
        <main className="flex-1 space-y-6">
          <ProductImageGallery images={product.images} title={product.title} />
          <ProductDescription content={product.description} />
          <ProductReviews productId={product.id} rating={product.rating} reviewsCount={product.reviewsCount} />
        </main>

        <aside className="hidden w-80 lg:block">
          <ProductSidebar
            author={product.author}
            category={product.category}
            subcategory={product.subcategory}
            createdAt={product.createdAt}
            downloads={product.downloads}
            version={product.version}
            rating={product.rating}
            reviewsCount={product.reviewsCount}
            price={product.price}
            originalPrice={product.originalPrice}
            demoUrl={product.demoUrl}
          />
        </aside>
      </div>
    </>
  )
}
