"use client"

import { use, useEffect, useState } from "react"
import { ProductHero } from "@/components/product-hero"
import { ProductImageGallery } from "@/components/product-image-gallery"
import { ProductSidebar } from "@/components/product-sidebar"
import { ProductDescription } from "@/components/product-description"
import { ProductReviews } from "@/components/product-reviews"

// Mock data - в будущем заменить на API запрос
const getProductData = async (id: string) => {
  // Имитация задержки API
  await new Promise((resolve) => setTimeout(resolve, 500))

  return {
    id,
    title: "Премиум модуль администрирования",
    category: "GameCMS",
    subcategory: "Модули",
    images: [
      "/game-dashboard-interface.jpg",
      "/ui-components-kit.jpg",
      "/admin-dashboard-dark.jpg",
      "/ecommerce-shopping.png",
      "/seo-analytics.jpg",
    ],
    description: `# Описание модуля

Этот **премиум модуль** предоставляет полнофункциональную систему администрирования для вашего проекта.

## Основные возможности

- 🎨 Современный интерфейс с темной темой
- 📊 Расширенная аналитика и статистика
- 👥 Управление пользователями и правами доступа
- 🔧 Гибкие настройки конфигурации
- 📝 Система логирования действий
- 🔐 Продвинутая система безопасности

## Технические характеристики

- Совместимость с последними версиями GameCMS
- Оптимизированный код для высокой производительности
- Адаптивный дизайн для всех устройств
- Подробная документация и примеры использования

## Установка

1. Загрузите архив с модулем
2. Распакуйте в директорию \`modules/\`
3. Активируйте в панели администратора
4. Настройте параметры в конфигурации`,
    author: "DevStudio",
    version: "2.1.4",
    downloads: 1284,
    createdAt: "2024-12-01",
    price: 2499,
    originalPrice: 3999,
    rating: 4.8,
    reviewsCount: 87,
    demoUrl: "https://demo.example.com",
  }
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [product, setProduct] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadProduct = async () => {
      setIsLoading(true)
      const data = await getProductData(id)
      setProduct(data)
      setIsLoading(false)
    }

    loadProduct()
  }, [id])

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
