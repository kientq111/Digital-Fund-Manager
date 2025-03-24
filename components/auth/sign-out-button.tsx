"use client"

import { signOut } from "next-auth/react"
import { ReactNode } from "react"

interface SignOutButtonProps {
  children: ReactNode
}

export function SignOutButton({ children }: SignOutButtonProps) {
  return (
    <span
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="cursor-pointer"
    >
      {children}
    </span>
  )
}