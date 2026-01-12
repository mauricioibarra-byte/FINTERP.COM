"use client"

import * as React from "react"
import { Command } from "cmdk"
import { Search, Calculator, Receipt, Users, CreditCard, LayoutDashboard } from "lucide-react"

import { useRouter } from "next/navigation"

export function CommandMenu() {
    const [open, setOpen] = React.useState(false)
    const router = useRouter()

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false)
        command()
    }, [])

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    return (
        <Command.Dialog
            open={open}
            onOpenChange={setOpen}
            label="Global Command Menu"
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[640px] bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-2 z-[9999] backdrop-blur-xl bg-opacity-90 animate-in fade-in zoom-in-95 duration-200"
        >
            <div className="flex items-center border-b border-zinc-800 px-3 pb-2">
                <Search className="w-5 h-5 text-zinc-500 mr-2" />
                <Command.Input
                    placeholder="What do you need? (e.g. 'New Invoice')"
                    className="w-full bg-transparent border-none text-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-0"
                />
            </div>

            <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden pt-2">
                <Command.Empty className="py-6 text-center text-sm text-zinc-500">
                    No results found.
                </Command.Empty>

                <Command.Group heading="Finance" className="text-zinc-400 text-xs font-semibold px-2 mb-2">
                    <Item icon={Receipt} onSelect={() => runCommand(() => router.push('/invoices/new'))}>New Purchase Invoice</Item>
                    <Item icon={Calculator} onSelect={() => runCommand(() => router.push('/reports/balance-sheet'))}>View Balance Sheet</Item>
                    <Item icon={CreditCard} onSelect={() => runCommand(() => router.push('/cards'))}>Manage Corporate Cards</Item>
                    <Item icon={LayoutDashboard} onSelect={() => runCommand(() => router.push('/approvals'))}>Approvals Inbox</Item>
                </Command.Group>

                <Command.Group heading="Admin" className="text-zinc-400 text-xs font-semibold px-2 mb-2">
                    <Item icon={Users} onSelect={() => runCommand(() => router.push('/users'))}>Manage Users</Item>
                    <Item icon={LayoutDashboard} onSelect={() => runCommand(() => router.push('/audit'))}>Audit Trail</Item>
                    <Item icon={LayoutDashboard} onSelect={() => runCommand(() => router.push('/system'))}>System Status</Item>
                </Command.Group>
            </Command.List>
        </Command.Dialog>
    )
}

function Item({ children, icon: Icon, onSelect }: any) {
    return (
        <Command.Item
            onSelect={onSelect}
            className="flex items-center px-3 py-2 text-sm text-zinc-300 rounded-md cursor-pointer hover:bg-zinc-800 hover:text-white transition-colors aria-selected:bg-zinc-800 aria-selected:text-white"
        >
            {Icon && <Icon className="w-4 h-4 mr-3 text-zinc-500" />}
            {children}
        </Command.Item>
    )
}
