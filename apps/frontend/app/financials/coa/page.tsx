"use client";

import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CoaHyperGrid } from "@/components/coa-editor";
import { ExcelUpload } from "@/components/excel-upload";
import { NewAccountDialog } from "@/components/new-account-dialog";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ChartOfAccountsPage() {
    return (
        <div className="flex h-screen flex-col p-8 pt-6 space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/financials">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Chart of Accounts</h1>
                    <p className="text-muted-foreground">Manage your General Ledger accounts hierarchy.</p>
                </div>
            </div>

            <Card className="flex-1 border-0 shadow-none bg-transparent">
                <CardHeader className="px-0 flex flex-row items-center justify-between space-y-0 pb-6">
                    <div>
                        {/* Header content moved to top level */}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                                if (confirm("Load sample Chart of Accounts? This will upsert data.")) {
                                    await api.post('/finance/gl-accounts/seed', {});
                                    window.location.reload();
                                }
                            }}
                        >
                            Load Template
                        </Button>
                        <NewAccountDialog onAccountCreated={() => window.location.reload()} />
                    </div>
                </CardHeader>
                <CardContent className="px-0 space-y-6">
                    <div className="rounded-md border bg-card">
                        <CoaHyperGrid />
                    </div>

                    <div className="pt-4 border-t">
                        <h4 className="text-sm font-medium text-muted-foreground mb-4">Bulk Import</h4>
                        <ExcelUpload onUploadComplete={() => window.location.reload()} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
