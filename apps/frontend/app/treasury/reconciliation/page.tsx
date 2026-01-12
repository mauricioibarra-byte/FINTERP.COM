"use client"

import { useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Sparkles, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import Link from "next/link"

// Mock Bank Data since we don't have a Bank Feed API yet
const MOCK_BANK_TRANSACTIONS = [
    { id: 'bt-1', date: '2024-01-15', description: 'Payment from Client A', amount: 1500.00, type: 'CREDIT' },
    { id: 'bt-2', date: '2024-01-16', description: 'AWS Web Services', amount: -250.00, type: 'DEBIT' },
    { id: 'bt-3', date: '2024-01-18', description: 'Office Supplies Depot', amount: -65.20, type: 'DEBIT' },
]

export default function ReconciliationPage() {
    const [selectedTx, setSelectedTx] = useState<any>(null)
    const [suggestions, setSuggestions] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [reconciledIds, setReconciledIds] = useState<string[]>([])

    const handleSelectTx = async (tx: any) => {
        setSelectedTx(tx)
        setLoading(true)
        setSuggestions([])

        try {
            // Call the Smart Matcher API
            // Note: Since we are using MOCK bank data, we might not get real matches unless DB has matching amounts.
            // For DEMO purposes, we will fetch 'suggestions' but if empty, we might simulate one.

            // In a real scenario:
            // const res = await api.post('/reconciliation/run-auto-match', { bankTransactionId: tx.id })

            // SIMULATION for Demo:
            await new Promise(r => setTimeout(r, 800)) // Fake network delay

            if (tx.amount > 0) {
                setSuggestions([
                    {
                        id: 'sug-1',
                        confidenceScore: 95,
                        matchReason: 'Exact amount match + Client Name match',
                        invoice: { invoiceNumber: 'INV-2024-001', customer: { name: 'Client A' }, totalAmount: 1500.00 }
                    }
                ])
            } else if (tx.amount === -250.00) {
                setSuggestions([
                    {
                        id: 'sug-2',
                        confidenceScore: 80,
                        matchReason: 'Recurring amount',
                        invoice: { invoiceNumber: 'BILL-AWS-JAN', vendor: { name: 'Amazon Web Services' }, totalAmount: 250.00 }
                    }
                ])
            } else {
                setSuggestions([])
            }

        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleConfirmMatch = () => {
        if (!selectedTx) return
        setReconciledIds([...reconciledIds, selectedTx.id])
        setSelectedTx(null)
        setSuggestions([])
    }

    return (
        <div className="flex h-screen flex-col bg-zinc-950 text-white p-8 pt-20">
            <div className="max-w-6xl mx-auto w-full space-y-8">
                <div>
                    <Link href="/treasury" className="text-zinc-400 hover:text-white flex items-center mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                    </Link>
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold tracking-tight">Smart Reconciliation</h1>
                        <Badge variant="outline" className="border-emerald-800 text-emerald-400 bg-emerald-950/30 px-3 py-1">
                            <Sparkles className="mr-2 h-3 w-3" /> AI Matcher Active
                        </Badge>
                    </div>
                    <p className="text-zinc-400">Match imports from <strong>Main Operating Account</strong>.</p>
                </div>

                <div className="grid grid-cols-12 gap-6 h-[600px]">
                    {/* Left: Bank Feed */}
                    <div className="col-span-4 space-y-4 overflow-y-auto pr-2">
                        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Bank Feed</h2>
                        {MOCK_BANK_TRANSACTIONS.filter(tx => !reconciledIds.includes(tx.id)).map(tx => (
                            <div
                                key={tx.id}
                                onClick={() => handleSelectTx(tx)}
                                className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedTx?.id === tx.id
                                        ? 'bg-indigo-900/20 border-indigo-500'
                                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-zinc-300 font-medium">{tx.description}</span>
                                    <span className={tx.amount > 0 ? 'text-emerald-400' : 'text-zinc-300'}>
                                        {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                                    </span>
                                </div>
                                <div className="text-xs text-zinc-500">{tx.date}</div>
                            </div>
                        ))}
                        {MOCK_BANK_TRANSACTIONS.every(tx => reconciledIds.includes(tx.id)) && (
                            <div className="text-center py-10 text-zinc-500">
                                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-emerald-600" />
                                All caught up!
                            </div>
                        )}
                    </div>

                    {/* Right: Work Area */}
                    <div className="col-span-8 bg-zinc-900/50 rounded-xl border border-zinc-800 p-8 flex flex-col items-center justify-center relative">
                        {!selectedTx && (
                            <div className="text-center text-zinc-500">
                                <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p>Select a transaction from the left to start matching.</p>
                            </div>
                        )}

                        {selectedTx && loading && (
                            <div className="text-center text-zinc-400 animate-pulse">
                                <Sparkles className="h-8 w-8 mx-auto mb-4 text-indigo-500" />
                                <p>Analyzing patterns...</p>
                            </div>
                        )}

                        {selectedTx && !loading && (
                            <div className="w-full max-w-lg space-y-6">
                                <div className="text-center mb-8">
                                    <h3 className="text-xl font-bold text-zinc-200">Match Found</h3>
                                    <p className="text-zinc-400">Our AI suggests this corresponds to:</p>
                                </div>

                                {suggestions.length > 0 ? (
                                    suggestions.map(sug => (
                                        <Card key={sug.id} className="bg-zinc-900 border-zinc-700 border-l-4 border-l-emerald-500">
                                            <CardContent className="pt-6">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <div className="font-bold text-lg text-zinc-200">{sug.invoice.invoiceNumber}</div>
                                                        <div className="text-zinc-400">{sug.invoice.customer?.name || sug.invoice.vendor?.name}</div>
                                                    </div>
                                                    <Badge className="bg-emerald-900 text-emerald-200 hover:bg-emerald-900">{sug.confidenceScore}% Confidence</Badge>
                                                </div>
                                                <div className="text-sm text-zinc-500 mb-4 bg-zinc-950/50 p-2 rounded">
                                                    Reason: {sug.matchReason}
                                                </div>
                                                <div className="flex justify-between items-center pt-2 border-t border-zinc-800">
                                                    <span className="font-mono text-lg">{sug.invoice.totalAmount.toFixed(2)}</span>
                                                    <Button onClick={handleConfirmMatch} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                                        Confirm Match
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="text-center">
                                        <XCircle className="h-10 w-10 mx-auto text-zinc-600 mb-4" />
                                        <p className="text-zinc-400 mb-4">No high-confidence matches found.</p>
                                        <Button variant="outline">Create Manual Journal Entry</Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
