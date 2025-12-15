"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShoppingBag, CreditCard, Settings } from "lucide-react"

const menuItems = [
  {
    title: "Мои покупки",
    href: "/buys",
    icon: ShoppingBag,
  },
  {
    title: "История пополнений",
    href: "/payments",
    icon: CreditCard,
  },
  {
    title: "Настройки профиля",
    href: "/settings",
    icon: Settings,
  },
]

export function UserSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-full space-y-2 rounded-2xl border bg-card/50 backdrop-blur-sm p-4">
      <h2 className="px-3 py-2 text-sm font-semibold text-muted-foreground">Личный кабинет</h2>
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
