"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge" // Assuming Badge exists or generic span
import { CheckCircle2, XCircle, FileText, Building2 } from "lucide-react"

interface ApprovalRequest {
    id: string
    status: string
    createdAt: string
    instance: {
        id: string
        definition: { name: string; entityType: string }
        purchaseInvoice?: {
            invoiceNumber: string
            totalAmount: string
            vendor: { name: string }
        }
        salesInvoice?: {
            invoiceNumber: string
            totalAmount: string
            customer: { name: string }
        }
    }
}

export default function ApprovalsPage() {
    const [requests, setRequests] = useState<ApprovalRequest[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadRequests()
    }, [])

    async function loadRequests() {
        try {
            const data = await api.get('/workflows/pending')
            setRequests(data)
        } catch (e) {
            console.error("Failed to load approvals", e)
        } finally {
            setLoading(false)
        }
    }

    async function handleAction(id: string, action: 'approve' | 'reject') {
        const comment = prompt(`Enter comment to ${action.toUpperCase()}:`, action === 'approve' ? 'Approved via Dashboard' : 'Rejected');
        if (comment === null) return;

        try {
            await api.post(`/workflows/${id}/${action}`, { comment })
            // Optimistic remove
            setRequests(prev => prev.filter(r => r.id !== id))
        } catch (e: any) {
            alert(`Action failed: ${e.message}`)
        }
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-white">Approvals Inbox</h1>
                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                    <span>{requests.length} Pending Requests</span>
                </div>
            </div>

            {loading ? (
                <div className="text-zinc-500">Loading tasks...</div>
            ) : requests.length === 0 ? (
                <div className="p-12 border border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-500">
                    <CheckCircle2 className="w-12 h-12 mb-4 opacity-50" />
                    <p>All caught up! No pending approvals.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {requests.map((req) => {
                        const isAP = req.instance.definition.entityType === 'PURCHASE_INVOICE';
                        const invoice = isAP ? req.instance.purchaseInvoice : req.instance.salesInvoice;
                        const counterparty = isAP ? req.instance.purchaseInvoice?.vendor : req.instance.salesInvoice?.customer;

                        return (
                            <Card key={req.id} className="bg-zinc-950 border-zinc-800 hover:border-zinc-700 transition-colors">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="outline" className="mb-2 border-zinc-700 text-zinc-400">
                                            {req.instance.definition.name}
                                        </Badge>
                                        <span className="text-xs text-zinc-600 font-mono">
                                            {new Date(req.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-zinc-500" />
                                        {counterparty?.name || 'Unknown Entity'}
                                    </CardTitle>
                                    <CardDescription className="font-mono text-emerald-400 pt-1">
                                        {invoice?.totalAmount ? `$${Number(invoice.totalAmount).toLocaleString()}` : 'N/A'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="text-sm text-zinc-400 space-y-2">
                                    <div className="flex justify-between">
                                        <span>Invoice #</span>
                                        <span className="text-zinc-300 font-mono">{invoice?.invoiceNumber || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Type</span>
                                        <span className="text-zinc-300">{isAP ? 'Accounts Payable' : 'Accounts Receivable'}</span>
                                    </div>
                                </CardContent>
                                <CardFooter className="gap-3 pt-2">
                                    <Button
                                        variant="destructive"
                                        className="flex-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 border-transparent"
                                        onClick={() => handleAction(req.id, 'reject')}
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Reject
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        className="flex-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-transparent"
                                        onClick={() => handleAction(req.id, 'approve')}
                                    >
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Approve
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
