"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plus, CreditCard, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default function PaymentsPage() {
    const [payments, setPayments] = useState<any[]>([])
    // NOTE: Backend 'findAll' returns empty array for MVP.
    // In a real scenario, this would list Journal Entries with source='PAYMENT'
    const [loading, setLoading] = useState(false)

    return (
        <div className="flex h-screen flex-col bg-zinc-950 text-white p-8 pt-20">
            <div className="max-w-6xl mx-auto w-full space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
                        <p className="text-zinc-400">Manage outgoing payments and incoming collections.</p>
                    </div>
                    <Link href="/payments/new">
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            <Plus className="mr-2 h-4 w-4" /> New Transaction
                        </Button>
                    </Link>
                </div>

                <div className="text-center py-12 border border-zinc-800 rounded-lg bg-zinc-900/50">
                    <CreditCard className="h-12 w-12 mx-auto text-zinc-600 mb-4" />
                    <h3 className="text-lg font-medium text-zinc-200">Payment History</h3>
                    <p className="text-zinc-500 mb-4">
                        Payments are recorded directly in the <Link href="/journal" className="text-indigo-400 hover:underline">Universal Journal</Link>.
                    </p>
                    <Link href="/payments/new">
                        <Button variant="outline">Process a Payment</Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
