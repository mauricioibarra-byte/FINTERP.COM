"use client";

import { useEffect } from "react";
import { useNavigationStore } from "@/lib/stores/navigation-store";
import { CarouselMenu } from "@/components/ui/carousel-menu";
import {
    FileText,
    PieChart,
    Users,
    Receipt,
    CreditCard,
    Landmark,
    Calculator,
    ScrollText,
    TrendingUp,
    Wallet
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function FinancialsDashboard() {
    const { setContext } = useNavigationStore();

    useEffect(() => {
        setContext('financials');
    }, [setContext]);

    // KPI Mock Data
    const kpis = [
        { title: "Cash Position", value: "$ 124.5M", change: "+4.5%", trend: "up" },
        { title: "Open Invoices", value: "$ 45.2M", change: "-1.2%", trend: "down" },
        { title: "Net Profit (YTD)", value: "$ 89.1M", change: "+12.3%", trend: "up" },
        { title: "Working Capital", value: "$ 32.8M", change: "+0.8%", trend: "neutral" },
    ];

    return (
        <div className="flex flex-col h-full space-y-8 p-8 animate-in fade-in duration-500">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Financials Overview</h1>
                <p className="text-muted-foreground mt-2">Manage your General Ledger, Payables, Receivables, and Treasury.</p>
            </div>

            {/* KPI Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {kpis.map((kpi) => (
                    <Card key={kpi.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {kpi.title}
                            </CardTitle>
                            {kpi.trend === 'up' ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{kpi.value}</div>
                            <p className="text-xs text-muted-foreground">
                                {kpi.change} from last month
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Navigation Carousels */}
            <div>
                <CarouselMenu
                    title="Core Accounting"
                    items={[
                        { title: "Journal", icon: <FileText className="w-6 h-6 text-blue-500" />, color: "bg-blue-500/10", href: "/journal" },
                        { title: "Chart of Accounts", icon: <ScrollText className="w-6 h-6 text-indigo-500" />, color: "bg-indigo-500/10", href: "/financials/coa" },
                        { title: "Payables", icon: <CreditCard className="w-6 h-6 text-red-500" />, color: "bg-red-500/10", href: "/financials/payables" },
                        { title: "Receivables", icon: <Wallet className="w-6 h-6 text-emerald-500" />, color: "bg-emerald-500/10", href: "/financials/receivables" },
                        { title: "Fixed Assets", icon: <Landmark className="w-6 h-6 text-amber-500" />, color: "bg-amber-500/10", href: "/financials/assets" },
                        { title: "Budgeting", icon: <Calculator className="w-6 h-6 text-pink-500" />, color: "bg-pink-500/10", href: "/financials/budget" },
                        { title: "Taxes (SII)", icon: <FileText className="w-6 h-6 text-teal-500" />, color: "bg-teal-500/10", href: "/financials/taxes" },
                        { title: "Reports", icon: <PieChart className="w-6 h-6 text-violet-500" />, color: "bg-violet-500/10", href: "/reports" },
                    ]}
                />

                <CarouselMenu
                    title="Payables & Receivables"
                    items={[
                        { title: "Invoices", description: "Create & Manage Bills", icon: <Receipt className="h-6 w-6" />, href: "/invoices", color: "bg-emerald-500" },
                        { title: "Business Partners", description: "Customers & Vendors", icon: <Users className="h-6 w-6" />, href: "/partners", color: "bg-teal-500" },
                        { title: "Payments", description: "Process Transactions", icon: <CreditCard className="h-6 w-6" />, href: "/payments", color: "bg-cyan-500" },
                    ]}
                    className="mt-4"
                />

                <CarouselMenu
                    title="Treasury"
                    items={[
                        { title: "Bank Reconciliation", description: "Smart Matcher", icon: <Landmark className="h-6 w-6" />, href: "/treasury", color: "bg-amber-500" },
                    ]}
                    className="mt-4"
                />
            </div>

        </div>
    );
}
