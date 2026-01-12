"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { X } from "lucide-react"

export function NewAccountDialog({ onAccountCreated }: { onAccountCreated: () => void }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        accountCode: "",
        description: "",
        accountType: "ASSET",
        parentId: "",
        financialStatementLine: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            // Simple manual validation or default level
            const level = formData.parentId ? 2 : 1;

            await api.post('/finance/gl-accounts', {
                ...formData,
                parentId: formData.parentId || undefined,
                level
            })
            setOpen(false)
            onAccountCreated()
            setFormData({ accountCode: "", description: "", accountType: "ASSET", parentId: "", financialStatementLine: "" })
        } catch (error) {
            console.error("Failed to create account", error)
            alert("Failed to create account")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Button
                size="sm"
                variant="outline"
                className="border-zinc-700 text-zinc-300"
                onClick={() => setOpen(true)}
            >
                New Account
            </Button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="absolute right-4 top-4 text-zinc-400 hover:text-white transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        <h2 className="text-lg font-semibold text-zinc-100 mb-1">Create GL Account</h2>
                        <p className="text-sm text-zinc-500 mb-6">Add a new account to your General Ledger.</p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="code" className="text-zinc-400 text-xs uppercase tracking-wider">Code</Label>
                                <Input
                                    id="code"
                                    value={formData.accountCode}
                                    onChange={(e) => setFormData({ ...formData, accountCode: e.target.value })}
                                    className="bg-zinc-950 border-zinc-800 focus:border-indigo-500 text-zinc-200"
                                    placeholder="e.g. 111000"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="desc" className="text-zinc-400 text-xs uppercase tracking-wider">Description</Label>
                                <Input
                                    id="desc"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="bg-zinc-950 border-zinc-800 focus:border-indigo-500 text-zinc-200"
                                    placeholder="e.g. Cash in Bank"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type" className="text-zinc-400 text-xs uppercase tracking-wider">Account Type</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.accountType}
                                    onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                                >
                                    <option value="ASSET">Asset</option>
                                    <option value="LIABILITY">Liability</option>
                                    <option value="EQUITY">Equity</option>
                                    <option value="REVENUE">Revenue</option>
                                    <option value="EXPENSE">Expense</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="parent" className="text-zinc-400 text-xs uppercase tracking-wider">Parent Code</Label>
                                    <Input
                                        id="parent"
                                        value={formData.parentId}
                                        onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                                        className="bg-zinc-950 border-zinc-800 text-zinc-200"
                                        placeholder="Optional"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fsline" className="text-zinc-400 text-xs uppercase tracking-wider">FS Line</Label>
                                    <Input
                                        id="fsline"
                                        value={formData.financialStatementLine}
                                        onChange={(e) => setFormData({ ...formData, financialStatementLine: e.target.value })}
                                        className="bg-zinc-950 border-zinc-800 text-zinc-200"
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 gap-3">
                                <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-zinc-400 hover:text-white">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                    {loading ? "Creating..." : "Create Account"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
