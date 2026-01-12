"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Bell,
    Search,
    User,
    ChevronRight,
    HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

export function ModuleHeader() {
    const pathname = usePathname();

    // Determine Module Title based on path
    let moduleTitle = "Dashboard";
    let breadcrumb = "Overview";

    if (pathname.includes('/financials')) {
        moduleTitle = "Financials";
        if (pathname.includes('/journal')) breadcrumb = "General Ledger > Journal";
        else if (pathname.includes('/invoices')) breadcrumb = "Payables > Invoices";
        else breadcrumb = "Dashboard";
    } else if (pathname.includes('/operations')) {
        moduleTitle = "Operations";
    } else if (pathname.includes('/hr')) {
        moduleTitle = "Human Capital";
    } else if (pathname.includes('/settings')) {
        moduleTitle = "Settings";
    }

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center px-6 gap-4">

                {/* 1. Module Identity */}
                <div className="flex items-center gap-2 font-semibold">
                    <span className="text-lg">{moduleTitle}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground font-normal">{breadcrumb}</span>
                </div>

                {/* 2. Global Search (Contextual) */}
                <div className="ml-auto flex items-center flex-1 max-w-md">
                    <div className="relative w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder={`Search in ${moduleTitle}...`}
                            className="pl-8 bg-muted/40 focus-visible:bg-background rounded-xl border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary"
                        />
                    </div>
                </div>

                {/* 3. Actions & Profile */}
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-muted-foreground">
                        <HelpCircle className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground relative">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full" />
                    </Button>
                    <div className="w-px h-6 bg-border mx-1" />
                    <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary hover:ring-offset-2 transition-all">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>MC</AvatarFallback>
                    </Avatar>
                </div>

            </div>
        </header>
    );
}
