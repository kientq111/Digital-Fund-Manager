"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { createTransaction, getAllUsersBasic } from "@/lib/actions"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function TransactionCreateButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState("")
  const [transactionType, setTransactionType] = useState("add")
  const [amount, setAmount] = useState("")
  const [reason, setReason] = useState("")

  // Fetch users when dialog opens
  const handleOpenChange = async (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen && users.length === 0) {
      try {
        const fetchedUsers = await getAllUsersBasic()
        setUsers(fetchedUsers)
      } catch (error) {
        toast({
          title: "Failed to load users",
          description: "Could not load user list. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsLoading(true)

    try {
      // Convert amount to number and apply negative sign if subtracting
      const numericAmount = Number.parseFloat(amount)
      const finalAmount = transactionType === "add" ? numericAmount : -numericAmount

      await createTransaction({
        userId: selectedUser,
        amount: finalAmount,
        reason,
      })

      toast({
        title: "Transaction created",
        description: "Transaction has been processed successfully.",
      })
      setOpen(false)
      router.refresh()
      // Reset form
      setSelectedUser("")
      setTransactionType("add")
      setAmount("")
      setReason("")
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Failed to process transaction. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Transaction</DialogTitle>
          <DialogDescription>Add or subtract money from a user account.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="user">User</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser} required>
                <SelectTrigger id="user">
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Transaction Type</Label>
              <RadioGroup value={transactionType} onValueChange={setTransactionType} className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="add" id="add" />
                  <Label htmlFor="add" className="font-normal">
                    Add Money
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="subtract" id="subtract" />
                  <Label htmlFor="subtract" className="font-normal">
                    Subtract Money
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (VND)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100000"
                min="0"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={transactionType === "add" ? "Bonus, refund, etc." : "Fee, penalty, etc."}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Processing..." : "Process Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

