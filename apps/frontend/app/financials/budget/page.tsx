"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

export default function BudgetPage() {
    const [accounts, setAccounts] = useState<any[]>([]);
    const [budgets, setBudgets] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState(new Date().getFullYear());
    const { toast } = useToast();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Mocking getting accounts and current budgets
            // In real app, we would fetch existing budgets for the 'year'
            const accs = await api.get('/finance/gl-accounts');
            // Filter only expense/revenue accounts usually
            setAccounts(accs.sort((a: any, b: any) => a.accountCode.localeCompare(b.accountCode)));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleBudgetChange = (accountId: string, month: number, value: string) => {
        const key = `${accountId}-${year}-${String(month).padStart(2, '0')}`;
        setBudgets(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
    };

    const saveBudgets = async () => {
        const payload = Object.entries(budgets).map(([key, amount]) => {
            const [glAccountId, yearStr, monthStr] = key.split('-');
            return {
                glAccountId,
                period: `${yearStr}-${monthStr}`,
                amount
            };
        });

        try {
            await api.post('/finance/budgets', payload);
            toast({ title: "Budgets Saved", description: "Your financial targets have been updated." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to save budgets.", variant: "destructive" });
        }
    };

    return (
        <div className="flex flex-col h-full p-8 space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/financials">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Budgeting & Control</h1>
                        <p className="text-muted-foreground">Set monthly financial targets per account.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-xl font-bold text-zinc-500">{year}</div>
                    <Button onClick={saveBudgets} className="bg-indigo-600 hover:bg-indigo-700">
                        <Save className="mr-2 h-4 w-4" /> Save Changes
                    </Button>
                </div>
            </div>

            <Card className="border-zinc-800 bg-zinc-900/50">
                <CardHeader>
                    <CardTitle>Operating Budget</CardTitle>
                    <CardDescription>Enter values for operating expenses and revenues.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-zinc-800 overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                                    <TableHead className="w-[300px] text-zinc-400">Account</TableHead>
                                    {[...Array(12)].map((_, i) => (
                                        <TableHead key={i} className="min-w-[120px] text-zinc-400 text-right">
                                            {new Date(0, i).toLocaleString('default', { month: 'short' })}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {accounts.map((acc) => (
                                    <TableRow key={acc.accountCode} className="border-zinc-800 hover:bg-zinc-800/50">
                                        <TableCell className="font-medium text-zinc-300">
                                            <div className="flex flex-col">
                                                <span>{acc.description}</span>
                                                <span className="text-xs text-zinc-500">{acc.accountCode}</span>
                                            </div>
                                        </TableCell>
                                        {[...Array(12)].map((_, i) => (
                                            <TableCell key={i}>
                                                <Input
                                                    type="number"
                                                    className="bg-zinc-950 border-zinc-700 text-right h-8"
                                                    placeholder="0.00"
                                                    onChange={(e) => handleBudgetChange(acc.accountCode, i + 1, e.target.value)}
                                                />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
