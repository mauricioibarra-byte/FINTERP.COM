"use client"

import { MotionValue, motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useRef } from "react"
import { AppWindow, CreditCard, FileText, LayoutDashboard, Settings, User, Users, Landmark, Wallet, Package, BarChart3 } from "lucide-react"
import Link from "next/link"
import { useLanguageStore } from "@/lib/i18n"
import { LanguageSelector } from "@/components/language-selector"

export function Dock() {
    let mouseX = useMotionValue(Infinity)
    const { t } = useLanguageStore()

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[50]">
            <motion.div
                onMouseMove={(e) => mouseX.set(e.pageX)}
                onMouseLeave={() => mouseX.set(Infinity)}
                className="flex h-16 items-end gap-4 rounded-2xl bg-zinc-900/80 px-4 pb-3 border border-zinc-800 backdrop-blur-md shadow-2xl"
            >
                {/* Global Dashboard */}
                <Link href="/"><AppIcon mouseX={mouseX} icon={LayoutDashboard} label="Dashboard" /></Link>

                <div className="w-[1px] h-10 bg-zinc-700/50 mx-1 self-center" />

                {/* Key Modules */}
                <Link href="/financials"><AppIcon mouseX={mouseX} icon={Wallet} label="Financials" /></Link>
                <Link href="/operations"><AppIcon mouseX={mouseX} icon={Package} label="Operations" /></Link>
                <Link href="/hr"><AppIcon mouseX={mouseX} icon={Users} label="Human Capital" /></Link>
                <Link href="/intelligence"><AppIcon mouseX={mouseX} icon={BarChart3} label="Intelligence" /></Link>

                <div className="w-[1px] h-10 bg-zinc-700/50 mx-1 self-center" />

                {/* System */}
                <Link href="/settings"><AppIcon mouseX={mouseX} icon={Settings} label="Settings" /></Link>

                <div className="self-center ml-2">
                    <LanguageSelector />
                </div>
            </motion.div>
        </div>
    )
}

function AppIcon({ mouseX, icon: Icon, label }: any) {
    let ref = useRef<HTMLDivElement>(null)

    let distance = useTransform(mouseX, (val: number) => {
        let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 }
        return val - bounds.x - bounds.width / 2
    })

    let widthSync = useTransform(distance, [-150, 0, 150], [40, 80, 40])
    let width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 })

    return (
        <motion.div
            ref={ref}
            style={{ width }}
            className="aspect-square w-10 rounded-full bg-zinc-800 border border-zinc-700/50 flex items-center justify-center relative group cursor-pointer hover:bg-zinc-700 transition-colors"
        >
            <Icon className="w-5 h-5 text-gray-300 group-hover:text-white" />

            {/* Tooltip */}
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-zinc-900 text-zinc-300 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-zinc-800">
                {label}
            </span>
        </motion.div>
    )
}
