"use client"

import { useEffect, useState } from "react"
import { UserSidebar } from "@/components/user-sidebar"
import { Calendar, CreditCard, CheckCircle2 } from "lucide-react"

interface Payment {
  id: string
  amount: number
  method: string
  status: "completed" | "pending" | "failed"
  date: string
  transactionId: string
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TODO: Replace with actual Laravel API call
    // const fetchPayments = async () => {
    //   const response = await fetch('/api/user/payments')
    //   const data = await response.json()
    //   setPayments(data)
    //   setIsLoading(false)
    // }
    // fetchPayments()

    // Mock data for demonstration
    setTimeout(() => {
      setPayments([
        {
          id: "1",
          amount: 500,
          method: "Банковская карта",
          status: "completed",
          date: "15.12.2024 14:23",
          transactionId: "TXN-2024-001",
        },
        {
          id: "2",
          amount: 1000,
          method: "ЮMoney",
          status: "completed",
          date: "10.12.2024 10:15",
          transactionId: "TXN-2024-002",
        },
        {
          id: "3",
          amount: 250,
          method: "Банковская карта",
          status: "completed",
          date: "05.12.2024 18:45",
          transactionId: "TXN-2024-003",
        },
      ])
      setIsLoading(false)
    }, 500)
  }, [])

  const getStatusColor = (status: Payment["status"]) => {
    switch (status) {
      case "completed":
        return "text-emerald-500"
      case "pending":
        return "text-yellow-500"
      case "failed":
        return "text-red-500"
      default:
        return "text-muted-foreground"
    }
  }

  const getStatusText = (status: Payment["status"]) => {
    switch (status) {
      case "completed":
        return "Выполнено"
      case "pending":
        return "В обработке"
      case "failed":
        return "Отклонено"
      default:
        return status
    }
  }

  return (
    <div className="flex gap-6">
      <div className="w-64 shrink-0">
        <UserSidebar />
      </div>

      <div className="flex-1 space-y-4">
        <div className="rounded-2xl border bg-card/50 backdrop-blur-sm p-6">
          <h1 className="text-2xl font-bold">История пополнений</h1>
          <p className="text-sm text-muted-foreground mt-1">Все ваши транзакции и пополнения баланса</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl border bg-card/50 backdrop-blur-sm animate-pulse" />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="rounded-2xl border bg-card/50 backdrop-blur-sm p-12 text-center">
            <p className="text-muted-foreground">История пополнений пуста</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="rounded-2xl border bg-card/50 backdrop-blur-sm p-5 transition-all hover:ring-1 hover:ring-primary/20"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4 flex-1">
                    <div className="shrink-0">
                      <div className="h-12 w-12 rounded-lg border bg-primary/10 flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-primary" />
                      </div>
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{payment.amount} ₽</h3>
                        <div className={`flex items-center gap-1 text-sm ${getStatusColor(payment.status)}`}>
                          <CheckCircle2 className="h-4 w-4" />
                          <span>{getStatusText(payment.status)}</span>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground">{payment.method}</p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{payment.date}</span>
                        </div>
                        <span>•</span>
                        <span>ID: {payment.transactionId}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
