import type React from "react"
import Link from "next/link"
import { DashboardNav } from "@/components/dashboard-nav"
import { getAuthSession } from "@/app/api/auth/[...nextauth]/options"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getAuthSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex gap-6 md:gap-10 justify-between">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="hidden font-bold sm:inline-block">Money Manager</span>
            </Link>
          </div>
          <span className="hidden font-bold sm:inline-block">
            Hello {session.user.name}
          </span>
        </div>
      </header>
      <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr]">
        <aside className="hidden w-[200px] flex-col md:flex">
          <DashboardNav />
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden">{children}</main>
      </div>
    </div>
  )
}

