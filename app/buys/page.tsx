"use client"

import { useEffect, useState } from "react"
import { UserSidebar } from "@/components/user-sidebar"
import { PurchaseCard } from "@/components/purchase-card"

interface Purchase {
  id: string
  title: string
  category: string
  subcategory?: string
  purchaseDate: string
  downloadUrl?: string
  image?: string
}

export default function BuysPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TODO: Replace with actual Laravel API call
    // const fetchPurchases = async () => {
    //   const response = await fetch('/api/user/purchases')
    //   const data = await response.json()
    //   setPurchases(data)
    //   setIsLoading(false)
    // }
    // fetchPurchases()

    // Mock data for demonstration
    setTimeout(() => {
      setPurchases([
        {
          id: "1",
          title: "Система достижений",
          category: "GameCMS",
          subcategory: "Модули",
          purchaseDate: "15.12.2024",
          downloadUrl: "/downloads/achievements.zip",
          image: "/game-dashboard-interface.jpg",
        },
        {
          id: "2",
          title: "Расширенная статистика",
          category: "GameCMS",
          subcategory: "Модули",
          purchaseDate: "10.12.2024",
          downloadUrl: "/downloads/stats.zip",
          image: "/seo-analytics.jpg",
        },
        {
          id: "3",
          title: "Темная тема Premium",
          category: "GameCMS",
          subcategory: "Темы",
          purchaseDate: "05.12.2024",
          downloadUrl: "/downloads/dark-theme.zip",
          image: "/admin-dashboard-dark.jpg",
        },
      ])
      setIsLoading(false)
    }, 500)
  }, [])

  return (
    <div className="flex gap-6">
      <div className="w-64 shrink-0">
        <UserSidebar />
      </div>

      <div className="flex-1 space-y-4">
        <div className="rounded-2xl border bg-card/50 backdrop-blur-sm p-6">
          <h1 className="text-2xl font-bold">Мои покупки</h1>
          <p className="text-sm text-muted-foreground mt-1">Все ваши приобретенные модули и темы</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 rounded-2xl border bg-card/50 backdrop-blur-sm animate-pulse" />
            ))}
          </div>
        ) : purchases.length === 0 ? (
          <div className="rounded-2xl border bg-card/50 backdrop-blur-sm p-12 text-center">
            <p className="text-muted-foreground">У вас пока нет покупок</p>
          </div>
        ) : (
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <PurchaseCard key={purchase.id} {...purchase} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
