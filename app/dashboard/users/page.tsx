import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { UserList } from "@/components/user-list"
import { UserCreateButton } from "@/components/user-create-button"
import { getAllUsers } from "@/lib/data"

export default async function UsersPage() {
  const users = await getAllUsers()

  return (
    <DashboardShell>
      <DashboardHeader heading="User Management" text="Manage users and their balances">
        <UserCreateButton />
      </DashboardHeader>
      <UserList users={users} />
    </DashboardShell>
  )
}

