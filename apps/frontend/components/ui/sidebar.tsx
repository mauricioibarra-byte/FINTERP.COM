"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    LayoutDashboard,
    Wallet,
    Package,
    Users,
    Settings,
    PieChart,
    Menu,
    ChevronLeft,
    ChevronRight,
    Landmark,
    FileText,
    CreditCard,
    Receipt
} from "lucide-react";
import { useNavigationStore, AppContext } from "@/lib/stores/navigation-store";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();
    const { activeContext, setContext, isSidebarCollapsed, toggleSidebar } = useNavigationStore();

    const handleContextChange = (context: AppContext) => {
        setContext(context);
        // Optional: Auto-redirect to module landing page
    };

    return (
        <div className={cn("flex h-screen bg-background border-r", className)}>

            {/* 1. Context Bar (Far Left - Always Visible) */}
            <div className="w-[60px] flex flex-col items-center py-4 border-r bg-muted/40 gap-4">
                <div className="mb-4">
                    {/* Logo Placeholder */}
                    <div className="h-8 w-8 bg-primary rounded-full" />
                </div>

                <ContextButton
                    icon={<LayoutDashboard className="h-5 w-5" />}
                    label="Dashboard"
                    isActive={activeContext === 'dashboard'}
                    onClick={() => handleContextChange('dashboard')}
                />
                <ContextButton
                    icon={<Wallet className="h-5 w-5" />}
                    label="Financials"
                    isActive={activeContext === 'financials'}
                    onClick={() => handleContextChange('financials')}
                />
                <ContextButton
                    icon={<Package className="h-5 w-5" />}
                    label="Operations"
                    isActive={activeContext === 'operations'}
                    onClick={() => handleContextChange('operations')}
                />
                <ContextButton
                    icon={<Users className="h-5 w-5" />}
                    label="HR"
                    isActive={activeContext === 'hr'}
                    onClick={() => handleContextChange('hr')}
                />
                <ContextButton
                    icon={<Settings className="h-5 w-5" />}
                    label="Settings"
                    isActive={activeContext === 'settings'}
                    onClick={() => handleContextChange('settings')}
                />
            </div>

            {/* 2. Module Menu (Collapsible) */}
            <div className={cn(
                "flex flex-col transition-all duration-300 overflow-hidden",
                isSidebarCollapsed ? "w-0" : "w-64"
            )}>
                <div className="flex items-center justify-between p-4 border-b h-[60px]">
                    <h2 className="font-semibold text-lg capitalize">{activeContext}</h2>
                    <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </div>

                <ScrollArea className="flex-1 px-3 py-4">
                    {renderModuleMenu(activeContext, pathname)}
                </ScrollArea>
            </div>

            {/* Toggle Button when Collapsed */}
            {isSidebarCollapsed && (
                <div className="absolute left-[60px] top-4 z-50">
                    <Button variant="outline" size="icon" className="h-6 w-6 rounded-r-lg border-l-0" onClick={toggleSidebar}>
                        <ChevronRight className="h-3 w-3" />
                    </Button>
                </div>
            )}

        </div>
    );
}

function ContextButton({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "p-2 rounded-xl transition-all duration-200 group relative flex flex-col items-center justify-center gap-1 w-12 h-12",
                isActive ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
            title={label}
        >
            {icon}
            {/* <span className="text-[9px] font-medium opacity-0 group-hover:opacity-100 absolute -bottom-3 bg-popover px-1 rounded shadow-sm transition-opacity delay-100 z-50">{label}</span> */}
        </button>
    )
}

function renderModuleMenu(context: AppContext, pathname: string) {
    if (context === 'financials') {
        return (
            <div className="space-y-1">
                <MenuHeading>General Ledger</MenuHeading>
                <MenuItem href="/journal" icon={<FileText />} active={pathname === '/journal'}>Journal Entries</MenuItem>
                <MenuItem href="/reports" icon={<PieChart />} active={pathname === '/reports'}>Reports</MenuItem>

                <MenuHeading>Payables & Receivables</MenuHeading>
                <MenuItem href="/invoices" icon={<Receipt />} active={pathname === '/invoices'}>Invoicing</MenuItem>
                <MenuItem href="/partners" icon={<Users />} active={pathname === '/partners'}>Partners</MenuItem>
                <MenuItem href="/payments" icon={<CreditCard />} active={pathname === '/payments'}>Payments</MenuItem>

                <MenuHeading>Treasury</MenuHeading>
                <MenuItem href="/treasury" icon={<Landmark />} active={pathname.startsWith('/treasury')}>Bank Reconciliation</MenuItem>
            </div>
        )
    }

    if (context === 'settings') {
        return (
            <div className="space-y-1">
                <MenuHeading>Company</MenuHeading>
                <MenuItem href="/settings" icon={<Settings />} active={pathname === '/settings'}>Details</MenuItem>
                <MenuItem href="/audit" icon={<FileText />} active={pathname === '/audit'}>Audit Log</MenuItem>
            </div>
        )
    }

    if (context === 'dashboard') {
        return (
            <div className="p-4 text-sm text-muted-foreground text-center">
                Select a module to view its menu.
            </div>
        )
    }

    return (
        <div className="p-4 text-sm text-muted-foreground text-center">
            {context} module not implemented yet.
        </div>
    )
}

function MenuHeading({ children }: { children: React.ReactNode }) {
    return <h3 className="mb-2 mt-4 px-2 text-xs font-semibold text-muted-foreground tracking-wider uppercase">{children}</h3>
}

function MenuItem({ href, icon, children, active }: { href: string, icon: React.ReactNode, children: React.ReactNode, active: boolean }) {
    return (
        <Link href={href}>
            <Button variant={active ? "secondary" : "ghost"} className="w-full justify-start gap-3 mb-1">
                {/* Clone icon with distinct style if needed */}
                <span className="h-4 w-4">{icon}</span>
                {children}
            </Button>
        </Link>
    )
}
