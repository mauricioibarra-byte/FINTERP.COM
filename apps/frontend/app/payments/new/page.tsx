"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default function NewPaymentPage() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [type, setType] = useState<'AP' | 'AR'>('AP') // AP = Pay Vendor, AR = Collect from Customer
    const [invoices, setInvoices] = useState<any[]>([])
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        amount: "",
        paymentMethod: "TRANSFER",
        reference: ""
    })

    // Fetch Invoices based on Type
    useEffect(() => {
        const fetchInvoices = async () => {
            setLoading(true)
            try {
                // We fetch all invoices.
                // In a real app we'd filter by status='POSTED' or 'PENDING_PAYMENT' on the backend.
                // For MVP we filter client-side.
                const endpoint = type === 'AP' ? '/ap/invoices' : '/ar/invoices'
                const data = await api.get(endpoint)
                // Filter only unpaid/posted invoices
                const unpaid = data.filter((inv: any) => inv.status === 'POSTED' || inv.status === 'PARTIAL')
                setInvoices(unpaid)
                setSelectedInvoice(null)
            } catch (error) {
                console.error("Failed to fetch invoices", error)
            } finally {
                setLoading(false)
            }
        }
        fetchInvoices()
    }, [type])

    const handleSelectInvoice = (inv: any) => {
        setSelectedInvoice(inv)
        setFormData({ ...formData, amount: inv.totalAmount }) // Default to full amount
        setStep(2)
    }

    const handleSubmit = async () => {
        if (!selectedInvoice) return
        setLoading(true)
        try {
            await api.post('/payments', {
                invoiceId: selectedInvoice.id,
                type: type,
                amount: Number(formData.amount),
                currency: selectedInvoice.currency,
                paymentMethod: formData.paymentMethod,
                reference: formData.reference
            })
            router.push('/payments')
        } catch (error) {
            console.error("Payment failed", error)
            alert("Payment failed")
            setLoading(false)
        }
    }

    return (
        <div className="flex h-screen flex-col bg-zinc-950 text-white p-8 pt-20">
            <div className="max-w-2xl mx-auto w-full space-y-8">
                <div>
                    <Link href="/payments" className="text-zinc-400 hover:text-white flex items-center mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Payments
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">Process {type === 'AP' ? 'Payment' : 'Collection'}</h1>
                </div>

                <div className="flex space-x-2 mb-4">
                    <Button
                        variant={type === 'AP' ? 'default' : 'outline'}
                        onClick={() => { setType('AP'); setStep(1); }}
                        className={type === 'AP' ? 'bg-rose-600 hover:bg-rose-700' : 'border-zinc-700'}
                    >
                        Pay Vendor (AP)
                    </Button>
                    <Button
                        variant={type === 'AR' ? 'default' : 'outline'}
                        onClick={() => { setType('AR'); setStep(1); }}
                        className={type === 'AR' ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-zinc-700'}
                    >
                        Collect from Customer (AR)
                    </Button>
                </div>

                {step === 1 && (
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-zinc-200">Select Invoice to {type === 'AP' ? 'Pay' : 'Collect'}</CardTitle>
                            <CardDescription className="text-zinc-500">Only Posted invoices are shown.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {loading && <div className="text-zinc-500">Loading invoices...</div>}
                            {!loading && invoices.length === 0 && <div className="text-zinc-500">No pending invoices found.</div>}

                            {invoices.map((inv) => (
                                <div
                                    key={inv.id}
                                    className="flex items-center justify-between p-4 border border-zinc-800 rounded-lg hover:bg-zinc-800 cursor-pointer transition-colors"
                                    onClick={() => handleSelectInvoice(inv)}
                                >
                                    <div>
                                        <p className="font-medium text-zinc-200">{inv.invoiceNumber}</p>
                                        <p className="text-sm text-zinc-500">
                                            {type === 'AP' ? inv.vendor?.name : inv.customer?.name} • Due {new Date(inv.dueDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-zinc-200">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: inv.currency }).format(Number(inv.totalAmount))}
                                        </p>
                                        <Badge variant="outline" className="border-zinc-700 text-zinc-400">{inv.status}</Badge>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {step === 2 && selectedInvoice && (
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-zinc-200">Payment Details</CardTitle>
                            <CardDescription className="text-zinc-500">
                                {type === 'AP' ? 'Paying' : 'Collecting'} invoice {selectedInvoice.invoiceNumber}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-zinc-300">Amount</Label>
                                    <Input
                                        type="number"
                                        className="bg-zinc-950 border-zinc-700 text-zinc-200 text-lg font-bold"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-zinc-300">Method</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:outline-none"
                                        value={formData.paymentMethod}
                                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                    >
                                        <option value="TRANSFER">Bank Transfer</option>
                                        <option value="CASH">Cash</option>
                                        <option value="CHECK">Check</option>
                                        <option value="WEBPAY">WebPay</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-zinc-300">Reference / Note</Label>
                                <Input
                                    className="bg-zinc-950 border-zinc-700 text-zinc-200"
                                    placeholder="e.g. Transaction ID 12345"
                                    value={formData.reference}
                                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-between pt-4">
                                <Button variant="ghost" onClick={() => setStep(1)} className="text-zinc-400 hover:text-white">
                                    Change Invoice
                                </Button>
                                <Button onClick={handleSubmit} className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading}>
                                    {loading ? 'Processing...' : (
                                        <>
                                            <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm {type === 'AP' ? 'Payment' : 'Collection'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
