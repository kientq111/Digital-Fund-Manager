import { db } from "@/lib/db"

export async function getSystemStats() {
  // Get total balance of all users
  const balanceAggregation = await db.user.aggregate({
    _sum: {
      balance: true,
    },
  })

  const totalBalance = balanceAggregation._sum.balance || 0

  // Get total users
  const totalUsers = await db.user.count()

  // Get total added and subtracted
  const positiveTransactions = await db.transaction.aggregate({
    where: {
      amount: {
        gt: 0,
      },
    },
    _sum: {
      amount: true,
    },
  })

  const negativeTransactions = await db.transaction.aggregate({
    where: {
      amount: {
        lt: 0,
      },
    },
    _sum: {
      amount: true,
    },
  })

  const totalAdded = positiveTransactions._sum.amount || 0
  const totalSubtracted = Math.abs(negativeTransactions._sum.amount || 0)

  // Get monthly data for the chart
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  sixMonthsAgo.setDate(1)
  sixMonthsAgo.setHours(0, 0, 0, 0)

  const monthlyTransactions = await db.transaction.findMany({
    where: {
      createdAt: {
        gte: sixMonthsAgo,
      },
    },
    select: {
      amount: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  })

  // Process monthly data
  const months = []
  for (let i = 0; i < 6; i++) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const monthName = date.toLocaleString("default", { month: "short" })
    months.unshift({
      month: date.getMonth(),
      year: date.getFullYear(),
      name: monthName,
      total: 0,
    })
  }

  // Group transactions by month
  monthlyTransactions.forEach((transaction) => {
    const transactionDate = new Date(transaction.createdAt)
    const month = transactionDate.getMonth()
    const year = transactionDate.getFullYear()

    const monthData = months.find((m) => m.month === month && m.year === year)
    if (monthData) {
      monthData.total += transaction.amount
    }
  })

  return {
    totalBalance,
    totalAdded,
    totalSubtracted,
    totalUsers,
    monthlyData: months.map((m) => ({
      name: m.name,
      total: m.total,
    })),
  }
}

export async function getAllUsers() {
  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      balance: true,
      createdAt: true,
    },
  })

  return users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    balance: user.balance,
    createdAt: user.createdAt.toISOString(),
  }))
}

export async function getAllTransactions() {
  const transactions = await db.transaction.findMany({
    include: {
      user: {
        select: {
          name: true,
        },
      },
      performer: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return transactions.map((transaction) => ({
    id: transaction.id,
    userId: transaction.userId,
    userName: transaction.user.name,
    amount: transaction.amount,
    reason: transaction.reason,
    performedBy: transaction.performedBy,
    performedByName: transaction.performer.name,
    createdAt: transaction.createdAt.toISOString(),
  }))
}

export async function getFinancialReports() {
  // Get total balance of all users
  const balanceAggregation = await db.user.aggregate({
    _sum: {
      balance: true,
    },
  })

  const totalBalance = balanceAggregation._sum.balance || 0

  // Get total users
  const totalUsers = await db.user.count()

  // Get total added and subtracted
  const positiveTransactions = await db.transaction.aggregate({
    where: {
      amount: {
        gt: 0,
      },
    },
    _sum: {
      amount: true,
    },
  })

  const negativeTransactions = await db.transaction.aggregate({
    where: {
      amount: {
        lt: 0,
      },
    },
    _sum: {
      amount: true,
    },
  })

  const totalAdded = positiveTransactions._sum.amount || 0
  const totalSubtracted = Math.abs(negativeTransactions._sum.amount || 0)

  // Get monthly data for the chart
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  sixMonthsAgo.setDate(1)
  sixMonthsAgo.setHours(0, 0, 0, 0)

  const monthlyTransactions = await db.transaction.findMany({
    where: {
      createdAt: {
        gte: sixMonthsAgo,
      },
    },
    select: {
      amount: true,
      createdAt: true,
    },
  })

  // Process monthly data
  const months = []
  for (let i = 0; i < 6; i++) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const monthName = date.toLocaleString("default", { month: "short" })
    months.unshift({
      month: date.getMonth(),
      year: date.getFullYear(),
      name: monthName,
      added: 0,
      subtracted: 0,
    })
  }

  // Group transactions by month
  monthlyTransactions.forEach((transaction) => {
    const transactionDate = new Date(transaction.createdAt)
    const month = transactionDate.getMonth()
    const year = transactionDate.getFullYear()

    const monthData = months.find((m) => m.month === month && m.year === year)
    if (monthData) {
      if (transaction.amount > 0) {
        monthData.added += transaction.amount
      } else {
        monthData.subtracted += Math.abs(transaction.amount)
      }
    }
  })

  // Get user balances for the chart
  const userBalances = await db.user.findMany({
    select: {
      name: true,
      balance: true,
    },
    orderBy: {
      balance: "desc",
    },
    take: 10,
  })

  return {
    totalBalance,
    totalAdded,
    totalUsers,
    totalSubtracted,
    monthlyData: months.map((m) => ({
      name: m.name,
      added: m.added,
      subtracted: m.subtracted,
    })),
    userBalances,
  }
}

