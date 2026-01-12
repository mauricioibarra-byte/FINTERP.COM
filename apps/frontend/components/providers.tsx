"use client"

import { useAuthStore } from "@/lib/auth-store"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { CommandMenu } from "@/components/command-menu"
import { Dock } from "@/components/dock"
import { CopilotDrawer } from "@/components/copilot/copilot-drawer"

export function Providers({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const { isAuthenticated } = useAuthStore()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true)
    }, [])

    useEffect(() => {
        if (mounted && !isAuthenticated() && pathname !== '/login') {
            router.push('/login')
        }
    }, [mounted, isAuthenticated, pathname, router])

    if (!mounted) return null

    return (
        <>
            {isAuthenticated() && <CommandMenu />}
            {isAuthenticated() && <Dock />}
            {isAuthenticated() && <CopilotDrawer />}
            {children}
        </>
    )
}
