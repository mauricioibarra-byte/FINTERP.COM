"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Building2, UserSquare2 } from "lucide-react"
import Link from "next/link"

function PartnerList({ type }: { type: 'vendor' | 'customer' }) {
    const [partners, setPartners] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const endpoint = type === 'vendor' ? '/ap/vendors' : '/ar/customers'
                const data = await api.get(endpoint)
                setPartners(data)
            } catch (error) {
                console.error("Failed to fetch partners", error)
            } finally {
                setLoading(false)
            }
        }
        fetchPartners()
    }, [type])

    if (loading) return <div className="text-zinc-400">Loading directory...</div>

    if (partners.length === 0) {
        return (
            <div className="text-center py-12 border border-zinc-800 rounded-lg bg-zinc-900/50">
                <Building2 className="h-12 w-12 mx-auto text-zinc-600 mb-4" />
                <h3 className="text-lg font-medium text-zinc-200">No {type}s found</h3>
                <Link href={`/partners/new?type=${type}`}>
                    <Button variant="outline" className="mt-4">Register First {type === 'vendor' ? 'Vendor' : 'Customer'}</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-3">
            {partners.map((p) => (
                <Card key={p.id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
                    <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mr-4">
                            {type === 'vendor' ? <Building2 className="h-5 w-5 text-indigo-400" /> : <UserSquare2 className="h-5 w-5 text-emerald-400" />}
                        </div>
                        <div>
                            <CardTitle className="text-base text-zinc-100">{p.name}</CardTitle>
                            <CardDescription className="text-zinc-500">{type === 'vendor' ? p.vendorCode : p.customerCode}</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-zinc-400 mt-2">
                            <p>Tax ID: {p.taxId}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export default function PartnersPage() {
    return (
        <div className="flex h-screen flex-col bg-zinc-950 text-white p-8 pt-20">
            <div className="max-w-6xl mx-auto w-full space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Partners Directory</h1>
                        <p className="text-zinc-400">Manage your Vendors and Customers master data.</p>
                    </div>
                    <Link href="/partners/new">
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            <Plus className="mr-2 h-4 w-4" /> New Partner
                        </Button>
                    </Link>
                </div>

                <Tabs defaultValue="vendors" className="space-y-6">
                    <TabsList className="bg-zinc-900 border border-zinc-800">
                        <TabsTrigger value="vendors" className="data-[state=active]:bg-zinc-800">Vendors (AP)</TabsTrigger>
                        <TabsTrigger value="customers" className="data-[state=active]:bg-zinc-800">Customers (AR)</TabsTrigger>
                    </TabsList>

                    <TabsContent value="vendors" className="space-y-4">
                        <PartnerList type="vendor" />
                    </TabsContent>

                    <TabsContent value="customers" className="space-y-4">
                        <PartnerList type="customer" />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
