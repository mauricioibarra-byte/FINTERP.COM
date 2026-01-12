"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Landmark, ArrowRight, Wallet, History } from "lucide-react"
import Link from "next/link"
import { CashFlowChart } from "@/components/treasury/cash-flow-chart"

export default function TreasuryPage() {
    return (
        <div className="flex h-screen flex-col bg-zinc-950 text-white p-8 pt-20">
            <div className="max-w-6xl mx-auto w-full space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Treasury Management</h1>
                        <p className="text-zinc-400">Monitor cash position and reconcile bank accounts.</p>
                    </div>
                    {/* <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        <Plus className="mr-2 h-4 w-4" /> Add Bank Account
                    </Button> */}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-400">Total Cash Position</CardTitle>
                            <Wallet className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-zinc-100">$2,340,500.00</div>
                            <p className="text-xs text-zinc-500">Across all activated accounts</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-400">Pending Reconciliations</CardTitle>
                            <History className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-zinc-100">12 Item(s)</div>
                            <p className="text-xs text-zinc-500">Requires attention</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-8">
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-zinc-200">Cash Flow Forecast (30 Days)</CardTitle>
                            <CardDescription className="text-zinc-500">Projected balance based on AP/AR</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CashFlowWrapper />
                        </CardContent>
                    </Card>
                </div>

                <h2 className="text-xl font-semibold text-zinc-200 mt-8">Bank Accounts</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-zinc-200">Main Operating Account</CardTitle>
                                    <CardDescription className="text-zinc-500">Chase Bank •••• 4242</CardDescription>
                                </div>
                                <Landmark className="h-8 w-8 text-zinc-700" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center mt-4">
                                <div className="text-sm text-zinc-400">Last synced: 2 hours ago</div>
                                <Link href="/treasury/reconciliation">
                                    <Button size="sm" className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
                                        Reconcile <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors opacity-50">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-zinc-200">Payroll Account</CardTitle>
                                    <CardDescription className="text-zinc-500">Wells Fargo •••• 9988</CardDescription>
                                </div>
                                <Landmark className="h-8 w-8 text-zinc-700" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center mt-4">
                                <div className="text-sm text-zinc-400">Last synced: 1 day ago</div>
                                <Button size="sm" variant="outline" disabled>Up to date</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

function CashFlowWrapper() {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        api.get('/treasury/cash-flow-forecast?days=30').then(res => {
            if (res.projection) setData(res.projection);
        }).catch(err => console.error(err));
    }, []);

    return (
        <div className="h-[300px] w-full">
            <CashFlowChart data={data} height={300} />
        </div>
    );
}


