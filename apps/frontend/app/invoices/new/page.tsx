"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

export default function CreateInvoicePage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const type = searchParams.get("type") || "ar" // 'ap' or 'ar'

    const [partners, setPartners] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        partnerId: "",
        invoiceNumber: "",
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        totalAmount: "",
        currency: "USD",
        companyCode: "COMP01", // Default
        revenueAccount: "410000" // Default for AR
    })

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const endpoint = type === 'ap' ? '/ap/vendors' : '/ar/customers'
                const data = await api.get(endpoint)
                setPartners(data)
            } catch (error) {
                console.error("Failed to fetch partners", error)
            }
        }
        fetchPartners()
    }, [type])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const endpoint = type === 'ap' ? '/ap/invoices' : '/ar/invoices'
            const payload = {
                ...formData,
                [type === 'ap' ? 'vendorId' : 'customerId']: formData.partnerId,
                totalAmount: Number(formData.totalAmount)
            }

            await api.post(endpoint, payload)
            router.push('/invoices') // Redirect to list
        } catch (error) {
            console.error("Failed to create invoice", error)
            alert("Failed to create invoice")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex h-screen flex-col bg-zinc-950 text-white p-8 pt-20">
            <div className="max-w-2xl mx-auto w-full space-y-8">
                <div>
                    <Link href="/invoices" className="text-zinc-400 hover:text-white flex items-center mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Invoices
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">Create {type === 'ap' ? 'Purchase' : 'Sales'} Invoice</h1>
                </div>

                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-zinc-200">Invoice Details</CardTitle>
                        <CardDescription className="text-zinc-500">Enter the invoice information below.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">

                            <div className="space-y-2">
                                <Label className="text-zinc-300">
                                    {type === 'ap' ? 'Vendor' : 'Customer'}
                                </Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={formData.partnerId}
                                    onChange={(e) => setFormData({ ...formData, partnerId: e.target.value })}
                                    required
                                >
                                    <option value="">Select {type === 'ap' ? 'Vendor' : 'Customer'}</option>
                                    {partners.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} ({type === 'ap' ? p.vendorCode : p.customerCode})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-zinc-300">Invoice Number</Label>
                                    <Input
                                        className="bg-zinc-950 border-zinc-700 text-zinc-200"
                                        value={formData.invoiceNumber}
                                        onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-zinc-300">Currency</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={formData.currency}
                                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                    >
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                        <option value="CLP">CLP</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-zinc-300">Issue Date</Label>
                                    <Input
                                        type="date"
                                        className="bg-zinc-950 border-zinc-700 text-zinc-200"
                                        value={formData.issueDate}
                                        onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-zinc-300">Due Date</Label>
                                    <Input
                                        type="date"
                                        className="bg-zinc-950 border-zinc-700 text-zinc-200"
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-zinc-300">Total Amount</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    className="bg-zinc-950 border-zinc-700 text-zinc-200 text-lg font-medium"
                                    value={formData.totalAmount}
                                    onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="pt-4">
                                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading}>
                                    {loading ? 'Creating...' : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" /> Create Invoice
                                        </>
                                    )}
                                </Button>
                            </div>

                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
