"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import {
    ChevronRight
} from "lucide-react";

interface CarouselMenuItem {
    title: string;
    description?: string;
    icon: React.ReactNode;
    href: string;
    color?: string; // e.g. "bg-blue-500"
}

interface CarouselMenuProps {
    title?: string;
    items: CarouselMenuItem[];
    className?: string;
}

export function CarouselMenu({ title, items, className }: CarouselMenuProps) {
    return (
        <div className={cn("w-full py-4", className)}>
            {title && <h3 className="text-lg font-semibold mb-4 px-1">{title}</h3>}
            <ScrollArea className="w-full whitespace-nowrap pb-4">
                <div className="flex w-max space-x-4 p-1">
                    {items.map((item) => (
                        <Link href={item.href} key={item.title} className="group">
                            <Card className="w-[200px] h-[140px] hover:shadow-lg transition-all duration-300 border-muted hover:border-primary/50 relative overflow-hidden">
                                {/* Colored Stripe */}
                                <div className={cn("h-1 w-full absolute top-0 left-0", item.color || "bg-primary")} />

                                <CardContent className="p-5 flex flex-col justify-between h-full">
                                    <div className="flex justify-between items-start">
                                        <div className={cn("p-2 rounded-lg bg-muted text-foreground group-hover:scale-110 transition-transform duration-300")}>
                                            {item.icon}
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity -mr-2" />
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-sm truncate">{item.title}</h4>
                                        {item.description && (
                                            <p className="text-xs text-muted-foreground truncate mt-1">{item.description}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    )
}
