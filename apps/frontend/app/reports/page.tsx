"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, PieChart, TrendingUp, DollarSign } from "lucide-react"

export default function ReportsPage() {
    const [balanceSheet, setBalanceSheet] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchReport = async () => {
            try {
                // Fetch dynamic balance sheet
                const data = await api.get('/reporting/balance-sheet/fast?period=CURRENT')
                setBalanceSheet(data.data)
            } catch (error) {
                console.error("Failed to fetch report", error)
            } finally {
                setLoading(false)
            }
        }
        fetchReport()
    }, [])

    if (loading) return <div className="text-zinc-400 p-8">Generating Financial Report...</div>

    const assets = balanceSheet?.assets || 0
    const liabilities = balanceSheet?.liabilities || 0
    const equity = assets - liabilities

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
    }

    return (
        <div className="flex h-screen flex-col bg-zinc-950 text-white p-8 pt-20 overflow-y-auto">
            <div className="max-w-6xl mx-auto w-full space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
                        <p className="text-zinc-400">Real-time view of your organization's financial health.</p>
                    </div>
                    <Button variant="outline" className="border-zinc-800 hover:bg-zinc-800">
                        <Download className="mr-2 h-4 w-4" /> Export PDF
                    </Button>
                </div>

                {/* Dashboard Grid */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-400">Total Assets</CardTitle>
                            <DollarSign className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-zinc-100">{formatCurrency(assets)}</div>
                            <p className="text-xs text-zinc-500">+20.1% from last month</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-400">Total Liabilities</CardTitle>
                            <TrendingUp className="h-4 w-4 text-rose-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-zinc-100">{formatCurrency(liabilities)}</div>
                            <p className="text-xs text-zinc-500">+1.2% from last month</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-400">Owner's Equity</CardTitle>
                            <PieChart className="h-4 w-4 text-violet-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-zinc-100">{formatCurrency(equity)}</div>
                            <p className="text-xs text-zinc-500">Calculated (Assets - Liabilities)</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Detailed View */}
                <Card className="bg-zinc-900 border-zinc-800 col-span-3">
                    <CardHeader>
                        <CardTitle className="text-zinc-200">Balance Sheet Breakdown</CardTitle>
                        <CardDescription className="text-zinc-500">
                            As of {new Date().toLocaleDateString()}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-lg font-semibold text-emerald-400 mb-4 border-b border-zinc-800 pb-2">Assets</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-zinc-300 hover:bg-zinc-800/50 p-2 rounded">
                                        <span>Current Assets (Cash, AR, Inventory)</span>
                                        <span className="font-mono">{formatCurrency(assets)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-zinc-500 font-bold border-t border-zinc-800 pt-2 mt-2">
                                        <span>Total Assets</span>
                                        <span>{formatCurrency(assets)}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-rose-400 mb-4 border-b border-zinc-800 pb-2">Liabilities & Equity</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-zinc-300 hover:bg-zinc-800/50 p-2 rounded">
                                        <span>Current Liabilities (AP, Short-term Debt)</span>
                                        <span className="font-mono">{formatCurrency(liabilities)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-zinc-300 hover:bg-zinc-800/50 p-2 rounded">
                                        <span>Owner's Equity (Retained Earnings)</span>
                                        <span className="font-mono">{formatCurrency(equity)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-zinc-500 font-bold border-t border-zinc-800 pt-2 mt-2">
                                        <span>Total Liabilities & Equity</span>
                                        <span>{formatCurrency(liabilities + equity)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
