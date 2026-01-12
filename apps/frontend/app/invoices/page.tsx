"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Users, FileText } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

function InvoiceList({ type }: { type: 'ap' | 'ar' }) {
    const [invoices, setInvoices] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                // Fetch from correct endpoint
                const endpoint = type === 'ap' ? '/ap/invoices' : '/ar/invoices'
                const data = await api.get(endpoint)
                setInvoices(data)
            } catch (error) {
                console.error("Failed to fetch invoices", error)
            } finally {
                setLoading(false)
            }
        }
        fetchInvoices()
    }, [type])

    if (loading) return <div className="text-zinc-400">Loading invoices...</div>

    if (invoices.length === 0) {
        return (
            <div className="text-center py-12 border border-zinc-800 rounded-lg bg-zinc-900/50">
                <FileText className="h-12 w-12 mx-auto text-zinc-600 mb-4" />
                <h3 className="text-lg font-medium text-zinc-200">No invoices found</h3>
                <p className="text-zinc-500 mb-4">Get started by creating your first {type === 'ap' ? 'Purchase' : 'Sales'} Invoice.</p>
                <Link href={`/invoices/new?type=${type}`}>
                    <Button variant="outline">Create Initial Invoice</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-4 border border-zinc-800 rounded-lg bg-zinc-900/50 hover:bg-zinc-900 transition-colors">
                    <div className="flex items-center space-x-4">
                        <div className="bg-zinc-800 p-2 rounded-full">
                            <FileText className="h-5 w-5 text-zinc-400" />
                        </div>
                        <div>
                            <p className="font-medium text-zinc-200">{inv.invoiceNumber}</p>
                            <p className="text-sm text-zinc-500">
                                {type === 'ap' ? inv.vendor?.name : inv.customer?.name} • Due {new Date(inv.dueDate).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-6">
                        <Badge variant={inv.status === 'POSTED' ? 'default' : 'secondary'} className={inv.status === 'POSTED' ? 'bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25' : ''}>
                            {inv.status}
                        </Badge>
                        <span className="font-medium text-zinc-200 w-24 text-right">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: inv.currency }).format(Number(inv.totalAmount))}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default function InvoicesPage() {
    return (
        <div className="flex h-screen flex-col bg-zinc-950 text-white p-8 pt-20">
            <div className="max-w-6xl mx-auto w-full space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
                        <p className="text-zinc-400">Manage your Accounts Payable and Receivable.</p>
                    </div>
                    <Link href="/invoices/new">
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            <Plus className="mr-2 h-4 w-4" /> New Invoice
                        </Button>
                    </Link>
                </div>

                <Tabs defaultValue="ar" className="space-y-6">
                    <TabsList className="bg-zinc-900 border border-zinc-800">
                        <TabsTrigger value="ar" className="data-[state=active]:bg-zinc-800">Sales (AR)</TabsTrigger>
                        <TabsTrigger value="ap" className="data-[state=active]:bg-zinc-800">Purchases (AP)</TabsTrigger>
                    </TabsList>

                    <TabsContent value="ar" className="space-y-4">
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-zinc-200">Sales Invoices</CardTitle>
                                <CardDescription className="text-zinc-500">Invoices sent to customers.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <InvoiceList type="ar" />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="ap" className="space-y-4">
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-zinc-200">Purchase Invoices</CardTitle>
                                <CardDescription className="text-zinc-500">Bills received from vendors.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <InvoiceList type="ap" />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
