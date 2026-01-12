"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, AlertTriangle } from "lucide-react"

interface AuditLog {
    id: string
    action: string
    entityType: string
    entityId: string
    currentHash: string
    previousHash: string | null
    createdAt: string
    actor?: { fullName: string }
}

export default function AuditPage() {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadLogs()
    }, [])

    async function loadLogs() {
        try {
            const data = await api.get('/audit')
            setLogs(data)
        } catch (e) {
            console.error("Failed to load audit logs", e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-white">Audit Trail</h1>
                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full text-sm border border-emerald-400/20">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Blockchain Integrity Active</span>
                </div>
            </div>

            <Card className="bg-zinc-950 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-zinc-400 font-medium">System Events</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                                <TableHead className="text-zinc-500">Timestamp</TableHead>
                                <TableHead className="text-zinc-500">Actor</TableHead>
                                <TableHead className="text-zinc-500">Action</TableHead>
                                <TableHead className="text-zinc-500">Entity</TableHead>
                                <TableHead className="text-zinc-500">Integrity Hash</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-zinc-500">
                                        Loading blockchain data...
                                    </TableCell>
                                </TableRow>
                            ) : logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-zinc-500">
                                        No audit records found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log) => (
                                    <TableRow key={log.id} className="border-zinc-800 hover:bg-zinc-900/50">
                                        <TableCell className="text-zinc-300 font-mono text-xs">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-zinc-300">
                                            {log.actor?.fullName || 'System'}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${log.action === 'CREATE' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                    log.action === 'UPDATE' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                        'bg-red-500/10 text-red-400 border-red-500/20'
                                                }`}>
                                                {log.action}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-zinc-400 text-sm">
                                            <div className="flex flex-col">
                                                <span className="text-zinc-300">{log.entityType}</span>
                                                <span className="text-xs font-mono text-zinc-600">{log.entityId}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-zinc-600 truncate max-w-[150px]" title={log.currentHash}>
                                            {log.currentHash.substring(0, 16)}...
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
