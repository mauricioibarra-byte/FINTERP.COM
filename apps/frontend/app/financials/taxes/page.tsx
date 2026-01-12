"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

interface F29Summary {
    ventasNetas: number;
    debitoFiscal: number;
    creditoFiscal: number;
    retencionHonorarios: number;
    ppm: number;
    totalPayable: number;
    remanente: number;
}

export default function TaxPage() {
    const [summary, setSummary] = useState<F29Summary | null>(null);
    const [period, setPeriod] = useState(format(new Date(), "yyyy-MM")); // Default to current month
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        loadData();
    }, [period]);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await api.get(`/sii/tax/f29?period=${period}`);
            if (data && data.summary) {
                setSummary(data.summary);
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to load tax data.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val);
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
                        <h1 className="text-3xl font-bold tracking-tight">Tax Compliance</h1>
                        <p className="text-muted-foreground">Manage F29 declarations and Honorarios.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Period:</span>
                        <input
                            type="month"
                            className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm"
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="border-indigo-600 text-indigo-400 hover:bg-indigo-900/20">
                        <FileText className="mr-2 h-4 w-4" /> Declare F29
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* F29 Preview */}
                <Card className="border-zinc-800 bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>Formulario 29 Preview</span>
                            <Badge variant={summary && summary.totalPayable > 0 ? "default" : "secondary"}>
                                {summary && summary.totalPayable > 0 ? "PAYABLE" : "NO PAYMENT"}
                            </Badge>
                        </CardTitle>
                        <CardDescription>Auto-calculated based on DTEs and Honorarios.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading && <div className="text-center py-8">Calculating...</div>}
                        {!loading && summary && (
                            <div className="space-y-4">
                                <div className="flex justify-between py-2 border-b border-zinc-800">
                                    <span className="text-zinc-400">Debito Fiscal (Sales VAT)</span>
                                    <span className="font-mono font-medium text-red-400">+ {formatCurrency(summary.debitoFiscal)}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-zinc-800">
                                    <span className="text-zinc-400">Credito Fiscal (Purchase VAT)</span>
                                    <span className="font-mono font-medium text-green-400">- {formatCurrency(summary.creditoFiscal)}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-zinc-800">
                                    <span className="text-zinc-400">PPM (1.5% of Net Sales)</span>
                                    <span className="font-mono font-medium text-red-400">+ {formatCurrency(summary.ppm)}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-zinc-800">
                                    <span className="text-zinc-400">Retención Honorarios (13.75%)</span>
                                    <span className="font-mono font-medium text-red-400">+ {formatCurrency(summary.retencionHonorarios)}</span>
                                </div>

                                <div className="flex justify-between pt-4 mt-2">
                                    <span className="text-lg font-bold">Total Payable</span>
                                    <span className="text-xl font-bold text-indigo-400">{formatCurrency(summary.totalPayable)}</span>
                                </div>
                                {summary.remanente > 0 && (
                                    <div className="flex justify-between py-1 text-sm">
                                        <span className="text-zinc-500">Remanente Next Month</span>
                                        <span className="font-mono text-zinc-500">{formatCurrency(summary.remanente)}</span>
                                    </div>
                                )}
                            </div>
                        )}
                        {!loading && !summary && <div className="text-center py-8 text-muted-foreground">No data found for this period.</div>}
                    </CardContent>
                </Card>

                {/* Compliance Status */}
                <Card className="border-zinc-800 bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle>Compliance Status</CardTitle>
                        <CardDescription>Fiscal obligations overview.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                <CheckCircle className="w-6 h-6 text-emerald-500 mt-1" />
                                <div>
                                    <h4 className="font-semibold text-emerald-400">Up to Date</h4>
                                    <p className="text-sm text-emerald-200/70">All previous monthly declarations (F29) have been submitted to SII.</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Upcoming Deadlines</h4>
                                <div className="bg-zinc-950 p-4 rounded-md border border-zinc-800 flex justify-between items-center">
                                    <div>
                                        <div className="font-medium text-white">F29 Declaration</div>
                                        <div className="text-xs text-zinc-500">Period: {period}</div>
                                    </div>
                                    <Badge variant="outline" className="border-amber-500 text-amber-500">Due: {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 20).toLocaleDateString()}</Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
