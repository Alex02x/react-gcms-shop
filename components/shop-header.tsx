import Link from "next/link"
import { Button } from "@/components/ui/button"

export function ShopHeader() {
  return (
    <header className="rounded-2xl border bg-card/50 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          {/* <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Store className="h-5 w-5 text-primary-foreground" />
          </div> */}
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

        <Button
          variant="outline"
          className="cursor-pointer border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all bg-transparent"
        >
          Войти
        </Button>
      </div>
    </header>
  )
}
