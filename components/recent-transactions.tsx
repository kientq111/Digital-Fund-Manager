"use client"

import { useEffect, useState } from "react"
import { getRecentTransactions } from "@/lib/actions"
import { format } from "date-fns"
import { ArrowDown, ArrowUp } from "lucide-react"

type Transaction = {
  id: string
  userName: string
  amount: number
  reason: string
  createdAt: string
}

export function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const data = await getRecentTransactions()
        setTransactions(data)
      } catch (error) {
        console.error("Failed to fetch recent transactions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  if (isLoading) {
    return <div className="text-center py-4">Loading recent transactions...</div>
  }

  if (transactions.length === 0) {
    return <div className="text-center py-4">No recent transactions found.</div>
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            <div className={`p-2 rounded-full ${transaction.amount >= 0 ? "bg-green-100" : "bg-red-100"}`}>
              {transaction.amount >= 0 ? (
                <ArrowUp className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDown className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium leading-none">
                {transaction.userName} - {transaction.reason}
              </p>
              <p className="text-sm text-muted-foreground">{format(new Date(transaction.createdAt), "PPP")}</p>
            </div>
          </div>
          <div className={`font-medium ${transaction.amount >= 0 ? "text-green-500" : "text-red-500"}`}>
            {transaction.amount >= 0 ? "+" : ""}
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(transaction.amount)}
          </div>
        </div>
      ))}
    </div>
  )
}

