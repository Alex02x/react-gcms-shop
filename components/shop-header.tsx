"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AuthModal } from "@/components/auth-modal"
import { ThemeToggle } from "@/components/theme-toggle"
import { User } from "lucide-react"

export function ShopHeader() {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  return (
    <>
      <header className="rounded-2xl border bg-card/50 backdrop-blur-sm">
        <div className="flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-semibold">GameCMS.su</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              Главная
            </Link>
            <Link
              href="/rules"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Правила
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link href="/buys">
                <Button
                  variant="outline"
                  className="cursor-pointer border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all bg-transparent gap-2"
                >
                  <User className="h-4 w-4" />
                  Личный кабинет
                </Button>
              </Link>
            ) : (
              <Button
                variant="outline"
                className="cursor-pointer border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all bg-transparent"
                onClick={() => setAuthModalOpen(true)}
              >
                Войти
              </Button>
            )}
          </div>
        </div>
      </header>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  )
}
