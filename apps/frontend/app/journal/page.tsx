"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { HyperGrid } from "@/components/hyper-grid/data-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { api } from "@/lib/api"

type JournalEntry = {
    id: string
    glAccount: string
    documentNumber: string
    amountCompany: number
    currencyCompany: string
    postingDate: string
}

export const columns: ColumnDef<JournalEntry>[] = [
    {
        accessorKey: "postingDate",
        header: "Date",
        cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString()
    },
    {
        accessorKey: "glAccount",
        header: "GL Account",
    },
    {
        accessorKey: "documentNumber",
        header: "Document #",
    },
    {
        accessorKey: "amountCompany",
        header: "Amount",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amountCompany")) || 0
            const currency = row.original.currencyCompany || 'USD'
            return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount)
        }
    },
]

export default function JournalPage() {
    const [data, setData] = React.useState<JournalEntry[]>([])
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await api.get('/finance/journal-entries')
                setData(result)
            } catch (error) {
                console.error("Failed to fetch journal entries", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    return (
        <div className="flex h-screen flex-col bg-zinc-950 text-white p-8 pt-20">
            <div className="max-w-7xl mx-auto w-full space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Universal Journal</h1>
                        <p className="text-zinc-400">Total Record of all financial transactions.</p>
                    </div>
                    {/* <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Plus className="mr-2 h-4 w-4" /> Add Manual Entry
                    </Button> */}
                </div>

                {loading ? (
                    <div className="text-zinc-400">Loading Journal...</div>
                ) : (
                    <HyperGrid columns={columns} data={data} />
                )}
            </div>
        </div>
    )
}
