"use client";

import { useEffect, useState } from "react";
import { ModuleHeader } from "@/components/ui/module-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Calculator, RefreshCw, Archive } from "lucide-react";
import { AssetForm } from "@/components/assets/asset-form";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function AssetsPage() {
    const [assets, setAssets] = useState<any[]>([]);
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchAssets = async () => {
        try {
            // Mock data for now until API is connected via proxy/cors
            // const res = await fetch("http://localhost:3001/assets");
            // const data = await res.json();
            // setAssets(data);

            // Temporary Mock
            setAssets([
                { id: 1, code: "FA-001", name: "MacBook Pro M3", cost: 2500, bookValue: 2200, status: "ACTIVE" },
                { id: 2, code: "FA-002", name: "Office Desk", cost: 500, bookValue: 450, status: "ACTIVE" },
            ]);
            setMetrics({
                totalAssets: 2,
                totalCost: 3000,
                currentBookValue: 2650,
                totalDepreciation: 350
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssets();
    }, []);

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Fixed Assets</h2>
                    <p className="text-muted-foreground">Manage lifecycle, depreciation, and disposal of assets.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Calculator className="mr-2 h-4 w-4" />
                        Run Depreciation
                    </Button>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Asset
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>Add New Fixed Asset</DialogTitle>
                                <DialogDescription>Register a new asset into the system. Cost will be capitalized immediately.</DialogDescription>
                            </DialogHeader>
                            <AssetForm onSuccess={() => fetchAssets()} />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                        <Archive className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.totalAssets || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Acquisition Cost</CardTitle>
                        <div className="text-muted-foreground text-xs">$</div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${metrics?.totalCost?.toLocaleString() || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Book Value</CardTitle>
                        <div className="text-green-500 text-xs">Active</div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${metrics?.currentBookValue?.toLocaleString() || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Accum. Depreciation</CardTitle>
                        <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${metrics?.totalDepreciation?.toLocaleString() || 0}</div>
                    </CardContent>
                </Card>
            </div>

            {/* List */}
            <Card>
                <CardHeader>
                    <CardTitle>Asset Registry</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 border-b">
                                <tr className="text-left">
                                    <th className="p-4 font-medium">Code</th>
                                    <th className="p-4 font-medium">Name</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium text-right">Cost</th>
                                    <th className="p-4 font-medium text-right">Book Value</th>
                                    <th className="p-4 font-medium hidden md:table-cell">Location</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assets.map((asset) => (
                                    <tr key={asset.id} className="border-b last:border-0 hover:bg-muted/20">
                                        <td className="p-4 font-medium">{asset.code || asset.assetCode}</td>
                                        <td className="p-4">{asset.name}</td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-500/10 text-green-500 hover:bg-green-500/20">
                                                {asset.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">${asset.cost || asset.acquisitionCost}</td>
                                        <td className="p-4 text-right">${asset.bookValue}</td>
                                        <td className="p-4 hidden md:table-cell text-muted-foreground">-</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
