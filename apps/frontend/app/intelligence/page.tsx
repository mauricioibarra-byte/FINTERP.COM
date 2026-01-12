import { CarouselMenu } from "@/components/ui/carousel-menu";
import { Brain, TrendingUp, AlertTriangle } from "lucide-react";

export default function IntelligenceDashboard() {
    const menuItems = [
        { title: "CFO Copilot", icon: <Brain className="w-6 h-6 text-violet-500" />, color: "bg-violet-500/10", href: "/intelligence/copilot" },
        { title: "Forecasts", icon: <TrendingUp className="w-6 h-6 text-blue-500" />, color: "bg-blue-500/10", href: "/intelligence/forecasts" },
        { title: "Risk Radar", icon: <AlertTriangle className="w-6 h-6 text-red-500" />, color: "bg-red-500/10", href: "/intelligence/risk" },
    ];

    return (
        <div className="container mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-4 md:grid-cols-3">
                {/* Placeholder KPIs */}
                <div className="p-6 rounded-xl bg-card border shadow-sm"><div className="text-sm font-medium text-muted-foreground">Anomaly Score</div><div className="text-2xl font-bold text-green-500">Low</div></div>
                <div className="p-6 rounded-xl bg-card border shadow-sm"><div className="text-sm font-medium text-muted-foreground">Cash Runway</div><div className="text-2xl font-bold">14 Months</div></div>
                <div className="p-6 rounded-xl bg-card border shadow-sm"><div className="text-sm font-medium text-muted-foreground">AI Insights</div><div className="text-2xl font-bold">5 New</div></div>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-semibold tracking-tight">Intelligence Suite</h2>
                <CarouselMenu items={menuItems} />
            </div>
        </div>
    );
}
