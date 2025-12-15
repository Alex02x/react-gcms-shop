"use client"

import { useEffect, useState } from "react"
import { UserSidebar } from "@/components/user-sidebar"
import { Calendar, CreditCard, CheckCircle2, Wallet, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Payment {
  id: string
  amount: number
  method: string
  status: "completed" | "pending" | "failed"
  date: string
  transactionId: string
}

interface PaymentMethod {
  id: string
  name: string
  icon: string
  description: string
}

const paymentMethods: PaymentMethod[] = [
  { id: "card", name: "СБП", icon: "💳", description: "Быстрое пополнение" },
  { id: "yoomoney", name: "ЮКасса", icon: "💰", description: "Российские карты" },
]

export default function WalletPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [amount, setAmount] = useState("")
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [balance] = useState(1250) // Mock balance

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

  const handleTopUp = async () => {
    if (!amount || !selectedMethod) return

    setIsProcessing(true)

    // TODO: Replace with actual Laravel API call
    // const response = await fetch('/api/user/wallet/topup', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ amount: parseFloat(amount), method: selectedMethod })
    // })

    // Mock processing
    setTimeout(() => {
      setIsProcessing(false)
      setAmount("")
      setSelectedMethod(null)
      // Redirect to payment gateway or show success
      alert(`Пополнение на ${amount} ₽ через ${paymentMethods.find((m) => m.id === selectedMethod)?.name}`)
    }, 1000)
  }

  const isAmountValid = amount && Number.parseFloat(amount) >= 100
  const canProceed = isAmountValid && selectedMethod

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

      <div className="flex-1 space-y-6">
        {/* Balance and Top-up Form */}
        <div className="rounded-2xl border bg-card/50 backdrop-blur-sm p-6 space-y-6">
          {/* Header with Balance */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Мой кошелек</h1>
              <p className="text-sm text-muted-foreground mt-1">Пополните баланс и управляйте финансами</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Текущий баланс</p>
              <p className="text-3xl font-bold text-emerald-500">{balance} ₽</p>
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Top-up Form */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Сумма пополнения</label>
              <Input
                type="number"
                placeholder="Минимум 100 ₽"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-lg"
                min="100"
              />
              {amount && Number.parseFloat(amount) < 100 && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Минимальная сумма пополнения 100 ₽
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Способ оплаты {!isAmountValid && <span className="text-muted-foreground">(введите сумму)</span>}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => isAmountValid && setSelectedMethod(method.id)}
                    disabled={!isAmountValid}
                    className={`rounded-xl border p-4 text-left transition-all ${
                      !isAmountValid
                        ? "opacity-50 cursor-not-allowed"
                        : selectedMethod === method.id
                          ? "bg-primary/10 border-primary ring-2 ring-primary/20"
                          : "hover:bg-muted/50 hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{method.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{method.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{method.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={handleTopUp} disabled={!canProceed || isProcessing} className="w-full" size="lg">
              <Wallet className="h-4 w-4 mr-2" />
              {isProcessing ? "Обработка..." : "Пополнить баланс"}
            </Button>
          </div>
        </div>

        {/* Payment History */}
        <div className="rounded-2xl border bg-card/50 backdrop-blur-sm p-6">
          <h2 className="text-xl font-bold mb-4">История пополнений</h2>

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
    </div>
  )
}
