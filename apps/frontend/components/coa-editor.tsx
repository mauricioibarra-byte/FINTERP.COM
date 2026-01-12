"use client"

import { useEffect, useState, useMemo } from "react"
import { api } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronDown, Plus, Save } from "lucide-react"

// A custom TreeGrid component simpler than tanstack for this specific hierarchy case
export function CoaHyperGrid() {
    const [accounts, setAccounts] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [expanded, setExpanded] = useState<Record<string, boolean>>({})

    const loadData = async () => {
        setLoading(true)
        try {
            const data = await api.get('/finance/gl-accounts')
            // Add a sort by code
            const sorted = data.sort((a: any, b: any) => a.accountCode.localeCompare(b.accountCode))
            setAccounts(sorted)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const toggleExpand = (id: string) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
    }

    // Build tree
    const treeData = useMemo(() => {
        const map: Record<string, any> = {}
        const roots: any[] = []

        // initializing
        accounts.forEach(acc => {
            map[acc.accountCode] = { ...acc, children: [] }
        })

        // connecting
        accounts.forEach(acc => {
            if (acc.parentId && map[acc.parentId]) {
                map[acc.parentId].children.push(map[acc.accountCode])
            } else {
                roots.push(map[acc.accountCode])
            }
        })
        return roots
    }, [accounts])

    const Row = ({ node, depth = 0 }: { node: any, depth?: number }) => {
        const hasChildren = node.children && node.children.length > 0
        const isExpanded = expanded[node.accountCode]

        return (
            <>
                <div className="group flex items-center border-b border-zinc-800/50 hover:bg-zinc-900 px-2 py-1 text-sm bg-zinc-950">
                    {/* Indentation & Toggle */}
                    <div className="flex items-center w-[300px]" style={{ paddingLeft: `${depth * 20}px` }}>
                        <button
                            onClick={() => toggleExpand(node.accountCode)}
                            className={`mr-2 p-0.5 rounded hover:bg-zinc-800 ${hasChildren ? 'visible' : 'invisible'}`}
                        >
                            {isExpanded ? <ChevronDown className="w-3 h-3 text-zinc-500" /> : <ChevronRight className="w-3 h-3 text-zinc-500" />}
                        </button>
                        <span className="font-mono text-zinc-400 mr-2 text-xs">{node.accountCode}</span>
                        <input
                            className="bg-transparent text-zinc-200 focus:outline-none w-full font-medium"
                            defaultValue={node.description}
                        />
                    </div>

                    {/* Metadata Columns */}
                    <div className="w-[100px]">
                        <Badge variant="outline" className="text-[10px] h-5 border-zinc-700 text-zinc-500">{node.accountType}</Badge>
                    </div>

                    <div className="w-[150px] text-xs text-zinc-500 truncate">
                        {node.financialStatementLine || '-'}
                    </div>

                    {/* Actions */}
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-zinc-500 hover:text-white">
                            <Plus className="w-3 h-3" />
                        </Button>
                    </div>
                </div>

                {hasChildren && isExpanded && (
                    <div className="border-l border-zinc-800 ml-4">
                        {node.children.map((child: any) => (
                            <Row key={child.accountCode} node={child} depth={depth + 1} />
                        ))}
                    </div>
                )}
            </>
        )
    }

    return (
        <div className="w-full border border-zinc-800 rounded bg-zinc-950 flex flex-col h-[500px]">
            {/* Header */}
            <div className="flex items-center bg-zinc-900 border-b border-zinc-800 px-2 py-2 text-xs font-medium text-zinc-500">
                <div className="w-[300px] pl-6">Account</div>
                <div className="w-[100px]">Type</div>
                <div className="w-[150px]">FS Line</div>
                <div className="ml-auto">Actions</div>
            </div>

            {/* Body */}
            <div className="overflow-auto flex-1">
                {loading && <div className="p-4 text-center text-zinc-500 text-sm">Loading Chart of Accounts...</div>}
                {!loading && accounts.length === 0 && <div className="p-4 text-center text-zinc-500 text-sm">No accounts found. Use Excel Upload to import data.</div>}

                {treeData.map(node => (
                    <Row key={node.accountCode} node={node} />
                ))}
            </div>
        </div>
    )
}
