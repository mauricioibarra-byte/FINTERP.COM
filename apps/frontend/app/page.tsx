import { BentoGrid, BentoGridItem } from "@/components/bento-grid";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Activity, CreditCard, Plus } from "lucide-react";
import Link from "next/link";

// Force dynamic to ensure we always fetch fresh data

async function getFinancialData() {
  try {
    // Attempt to fetch from Backend (assuming standard port 3000 or 3001)
    // In production this would be an ENV variable
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const res = await fetch(`${apiUrl}/reporting/balance-sheet/fast?period=CURRENT`, {
      cache: 'no-store',
      next: { revalidate: 0 }
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error("Failed to fetch financial data", e);
    return null;
  }
}

export default async function Home() {
  const data = await getFinancialData();

  // Unwrap data or use Fallback/Mock if backend is offline
  const assets = data?.data?.assets || 0;
  const liabilities = data?.data?.liabilities || 0;

  // Format currency
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-white p-8 pt-20">
      <div className="max-w-7xl mx-auto w-full space-y-8">

        {/* Header */}
        <div className="flex justify-between items-center animate-in fade-in slide-in-from-top-4 duration-700">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-zinc-400">Welcome back, Chief Financial Officer.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-zinc-800 hover:bg-zinc-800">
              Export Report
            </Button>
            <Button className="bg-violet-600 hover:bg-violet-700 text-white">
              <Plus className="mr-2 h-4 w-4" /> New Invoice
            </Button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <KpiCard
            title="Total Assets"
            value={fmt(assets)}
            trend="+12.5%"
            trendUp={true}
            icon={DollarSign}
          />
          <KpiCard
            title="Liabilities"
            value={fmt(liabilities)}
            trend="-2.1%"
            trendUp={true}
            icon={CreditCard}
          />
          <KpiCard
            title="Net Revenue"
            value={fmt(assets - liabilities)}
            trend="+8.2%"
            trendUp={true}
            icon={TrendingUp}
          />
          <KpiCard
            title="System Health"
            value="98.2%"
            trend="Stable"
            trendUp={true}
            icon={Activity}
          />
        </div>

        {/* Bento Grid Main Area */}
        <BentoGrid className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          <BentoGridItem
            title="Real-Time Cash Flow"
            description="Visualizing inflow/outflow trends."
            header={<div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-violet-500/20 to-zinc-900 border border-violet-500/20" />}
            icon={<TrendingUp className="h-4 w-4 text-neutral-500" />}
            className="md:col-span-2"
          />
          <Link href="/journal" className="md:col-span-1 cursor-pointer">
            <BentoGridItem
              title="Recent Transactions (HyperGrid)"
              description="Click to edit in Excel-mode."
              header={<div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50 cursor-pointer hover:border-violet-500/50 transition-colors" />}
              icon={<CreditCard className="h-4 w-4 text-neutral-500" />}
              className=""
            />
          </Link>
          <BentoGridItem
            title="Smart Reconciliation"
            description="3 Pending Suggestions found by AI."
            header={<div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-emerald-500/10 to-zinc-900 border border-emerald-500/20" />}
            icon={<Activity className="h-4 w-4 text-neutral-500" />}
            className="md:col-span-1"
          />
          <BentoGridItem
            title="Audit Log Stream"
            description="Immutable verifiable chain."
            header={<div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-blue-500/10 to-zinc-900 border border-blue-500/20" />}
            icon={<Activity className="h-4 w-4 text-neutral-500" />}
            className="md:col-span-2"
          />
        </BentoGrid>

      </div>
    </div>
  );
}
