"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Loader2 } from "lucide-react";

export function AssetForm({ onSuccess }: { onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        assetCode: "",
        name: "",
        acquisitionDate: new Date().toISOString().split('T')[0],
        acquisitionCost: "",
        usefulLife: "36",
        residualValue: "0"
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Mock API Call
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log("Creating asset:", formData);
            onSuccess();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="code">Asset Code</Label>
                    <Input
                        id="code"
                        placeholder="e.g. FA-2024-001"
                        value={formData.assetCode}
                        onChange={e => setFormData({ ...formData, assetCode: e.target.value })}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="acquisitionDate">Acquisition Date</Label>
                    <Input
                        id="acquisitionDate"
                        type="date"
                        value={formData.acquisitionDate}
                        onChange={e => setFormData({ ...formData, acquisitionDate: e.target.value })}
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="name">Asset Name</Label>
                <Input
                    id="name"
                    placeholder="e.g. MacBook Pro M3 Max"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="cost">Acquisition Cost</Label>
                    <Input
                        id="cost"
                        type="number"
                        placeholder="0.00"
                        value={formData.acquisitionCost}
                        onChange={e => setFormData({ ...formData, acquisitionCost: e.target.value })}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="residual">Residual Value</Label>
                    <Input
                        id="residual"
                        type="number"
                        placeholder="0.00"
                        value={formData.residualValue}
                        onChange={e => setFormData({ ...formData, residualValue: e.target.value })}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="life">Useful Life (Months)</Label>
                    <Input
                        id="life"
                        type="number"
                        value={formData.usefulLife}
                        onChange={e => setFormData({ ...formData, usefulLife: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="method">Depreciation Method</Label>
                    <Select defaultValue="STRAIGHT_LINE">
                        <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="STRAIGHT_LINE">Straight Line</SelectItem>
                            <SelectItem value="ACCELERATED">Accelerated (Not impl)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Asset
                </Button>
            </div>
        </form>
    );
}
