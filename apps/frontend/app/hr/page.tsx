import { CarouselMenu } from "@/components/ui/carousel-menu";
import { Users, FileText, Calendar, DollarSign } from "lucide-react";

export default function HRDashboard() {
    const menuItems = [
        { title: "Employees", icon: <Users className="w-6 h-6 text-pink-500" />, color: "bg-pink-500/10", href: "/hr/employees" },
        { title: "Payroll", icon: <DollarSign className="w-6 h-6 text-green-500" />, color: "bg-green-500/10", href: "/hr/payroll" },
        { title: "Contracts", icon: <FileText className="w-6 h-6 text-blue-500" />, color: "bg-blue-500/10", href: "/hr/contracts" },
    ];

    return (
        <div className="container mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-4 md:grid-cols-3">
                {/* Placeholder KPIs */}
                <div className="p-6 rounded-xl bg-card border shadow-sm"><div className="text-sm font-medium text-muted-foreground">Total Headcount</div><div className="text-2xl font-bold">84</div></div>
                <div className="p-6 rounded-xl bg-card border shadow-sm"><div className="text-sm font-medium text-muted-foreground">Payroll Run</div><div className="text-2xl font-bold">Next: Jan 30</div></div>
                <div className="p-6 rounded-xl bg-card border shadow-sm"><div className="text-sm font-medium text-muted-foreground">Open Roles</div><div className="text-2xl font-bold">3</div></div>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-semibold tracking-tight">HR Modules</h2>
                <CarouselMenu items={menuItems} />
            </div>
        </div>
    );
}
