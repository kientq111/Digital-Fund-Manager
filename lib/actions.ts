"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import { hash } from "crypto";

export async function createUser(data: {
  name: string;
  email: string;
  role: "admin" | "member";
}) {
  // Check if email already exists
  const existingUser = await db.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error("Email already exists");
  }

  const defaultHashPassword = await bcrypt.hash('12345678', 10);

  await db.user.create({
    data: {
      name: data.name,
      email: data.email,
      role: data.role,
      balance: 0,
      password: defaultHashPassword,
    },
  });

  revalidatePath("/dashboard/users");
}

export async function updateUser(
  userId: string,
  data: {
    name: string;
    email: string;
    role: "admin" | "member";
    balance: number;
  }
) {
  // Check if email already exists for another user
  const existingUser = await db.user.findFirst({
    where: {
      email: data.email,
      NOT: {
        id: userId,
      },
    },
  });

  if (existingUser) {
    throw new Error("Email already exists");
  }

  await db.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      email: data.email,
      role: data.role,
      balance: data.balance,
    },
  });

  revalidatePath("/dashboard/users");
}

export async function deleteUser(userId: string) {
  await db.user.delete({
    where: { id: userId },
  });

  revalidatePath("/dashboard/users");
}

export async function createTransaction(data: {
  userId: string;
  amount: number;
  reason: string;
}) {
  // Get the first admin user to set as performer
  const adminUser = await db.user.findFirst({
    where: { role: "admin" },
  });

  if (!adminUser) {
    throw new Error("No admin user found to perform transaction");
  }

  // Use a transaction to ensure data consistency
  await db.$transaction(async (tx) => {
    // Create the transaction record
    await tx.transaction.create({
      data: {
        userId: data.userId,
        amount: data.amount,
        reason: data.reason,
        performedBy: adminUser.id,
      },
    });

    // Update the user's balance
    await tx.user.update({
      where: { id: data.userId },
      data: {
        balance: {
          increment: data.amount,
        },
      },
    });
  });

  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard");
}

export async function getAllUsersBasic() {
  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return users;
}

export async function getRecentTransactions() {
  const transactions = await db.transaction.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  return transactions.map((transaction) => ({
    id: transaction.id,
    amount: transaction.amount,
    reason: transaction.reason,
    createdAt: transaction.createdAt.toISOString(),
    userName: transaction.user.name,
  }));
}

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  const existingUser = await db.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  await db.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
    },
  });

  revalidatePath("/login");
}
