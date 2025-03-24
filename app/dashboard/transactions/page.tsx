import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { TransactionList } from "@/components/transaction-list"
import { TransactionCreateButton } from "@/components/transaction-create-button"
import { getAllTransactions } from "@/lib/data"

export default async function TransactionsPage() {
  const transactions = await getAllTransactions()

  return (
    <DashboardShell>
      <DashboardHeader heading="Transactions" text="View and manage money transactions">
        <TransactionCreateButton />
      </DashboardHeader>
      <TransactionList transactions={transactions} />
    </DashboardShell>
  )
}

