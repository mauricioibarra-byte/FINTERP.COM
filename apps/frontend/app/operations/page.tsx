import { CarouselMenu } from "@/components/ui/carousel-menu";
import { Package, Truck, Boxes, BarChart } from "lucide-react";

export default function OperationsDashboard() {
    const menuItems = [
        { title: "Inventory", icon: <Boxes className="w-6 h-6 text-orange-500" />, color: "bg-orange-500/10", href: "/operations/inventory" },
        { title: "Logistics", icon: <Truck className="w-6 h-6 text-blue-500" />, color: "bg-blue-500/10", href: "/operations/logistics" },
        { title: "Procurement", icon: <Package className="w-6 h-6 text-emerald-500" />, color: "bg-emerald-500/10", href: "/operations/procurement" },
    ];

    return (
        <div className="container mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-4 md:grid-cols-3">
                {/* Placeholder KPIs */}
                <div className="p-6 rounded-xl bg-card border shadow-sm"><div className="text-sm font-medium text-muted-foreground">Open Orders</div><div className="text-2xl font-bold">142</div></div>
                <div className="p-6 rounded-xl bg-card border shadow-sm"><div className="text-sm font-medium text-muted-foreground">Stock Value</div><div className="text-2xl font-bold">$1.2M</div></div>
                <div className="p-6 rounded-xl bg-card border shadow-sm"><div className="text-sm font-medium text-muted-foreground">Pending Shipments</div><div className="text-2xl font-bold">8</div></div>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-semibold tracking-tight">Operations Modules</h2>
                <CarouselMenu items={menuItems} />
            </div>
        </div>
    );
}
