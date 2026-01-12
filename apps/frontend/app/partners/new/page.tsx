"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

export default function CreatePartnerPage() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Default to vendor, but allow override
    const initialType = searchParams.get("type") === 'customer' ? 'customer' : 'vendor'
    const [type, setType] = useState<'vendor' | 'customer'>(initialType)

    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        taxId: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const endpoint = type === 'vendor' ? '/ap/vendors' : '/ar/customers'
            // Map generic fields to specific DTO fields
            const payload = type === 'vendor'
                ? { vendorCode: formData.code, name: formData.name, taxId: formData.taxId }
                : { customerCode: formData.code, name: formData.name, taxId: formData.taxId }

            await api.post(endpoint, payload)
            router.push('/partners')
        } catch (error) {
            console.error(`Failed to create ${type}`, error)
            alert(`Failed to create ${type}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex h-screen flex-col bg-zinc-950 text-white p-8 pt-20">
            <div className="max-w-2xl mx-auto w-full space-y-8">
                <div>
                    <Link href="/partners" className="text-zinc-400 hover:text-white flex items-center mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Directory
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">Register New Partner</h1>
                </div>

                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-zinc-200">Partner Information</CardTitle>
                        <CardDescription className="text-zinc-500">Create a new Vendor or Customer profile.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">

                            <div className="space-y-2">
                                <Label className="text-zinc-300">Partner Type</Label>
                                <div className="flex space-x-4">
                                    <Button
                                        type="button"
                                        variant={type === 'vendor' ? 'default' : 'outline'}
                                        onClick={() => setType('vendor')}
                                        className={type === 'vendor' ? 'bg-indigo-600' : 'border-zinc-700 text-zinc-400'}
                                    >
                                        Vendor (AP)
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={type === 'customer' ? 'default' : 'outline'}
                                        onClick={() => setType('customer')}
                                        className={type === 'customer' ? 'bg-emerald-600' : 'border-zinc-700 text-zinc-400'}
                                    >
                                        Customer (AR)
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-zinc-300">Name</Label>
                                <Input
                                    className="bg-zinc-950 border-zinc-700 text-zinc-200"
                                    placeholder={type === 'vendor' ? "e.g. Acme Corp" : "e.g. John Doe"}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-zinc-300">Code (ID)</Label>
                                    <Input
                                        className="bg-zinc-950 border-zinc-700 text-zinc-200"
                                        placeholder={type === 'vendor' ? "V001" : "C001"}
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-zinc-300">Tax ID</Label>
                                    <Input
                                        className="bg-zinc-950 border-zinc-700 text-zinc-200"
                                        placeholder="Tax ID / RUT"
                                        value={formData.taxId}
                                        onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button type="submit" className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200" disabled={loading}>
                                    {loading ? 'Saving...' : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" /> Save Partner
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
