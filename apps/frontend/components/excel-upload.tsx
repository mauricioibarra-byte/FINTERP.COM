"use client"

import { useState } from "react"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"
import { Upload, FileSpreadsheet, Loader2, CheckCircle } from "lucide-react"
import { api } from "@/lib/api"


export function ExcelUpload({ onUploadComplete }: { onUploadComplete?: () => void }) {
    const [loading, setLoading] = useState(false)
    const [fileName, setFileName] = useState<string | null>(null)
    const [stats, setStats] = useState<{ processed: number } | null>(null)

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setFileName(file.name)
        setLoading(true)
        setStats(null)

        try {
            const data = await file.arrayBuffer()
            const workbook = XLSX.read(data)

            // Assume first sheet
            const worksheet = workbook.Sheets[workbook.SheetNames[0]]
            const jsonData = XLSX.utils.sheet_to_json(worksheet)

            // Map standard columns to our DB schema
            const mappedData = jsonData.map((row: any) => ({
                accountCode: String(row['Code'] || row['code'] || row['Account Code']),
                description: row['Description'] || row['description'] || row['Account Name'],
                accountType: (row['Type'] || row['type'] || 'ASSET').toUpperCase(),
                parentId: row['Parent'] ? String(row['Parent']) : null,
                level: row['Level'] ? Number(row['Level']) : 1,
                financialStatementLine: row['FS Line'] || null
            }))

            console.log("Uploading COA:", mappedData)

            // Batch upload (calling createGLAccount one by one for now, or new bulk endpoint)
            // For MVP, simple loop effectively
            let count = 0
            for (const account of mappedData) {
                try {
                    await api.post('/finance/gl-accounts', account)
                    count++
                } catch (err) {
                    console.error("Failed to upload account", account, err)
                }
            }

            setStats({ processed: count })
            if (onUploadComplete) onUploadComplete()

        } catch (error) {
            console.error("Error parsing excel", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-800 rounded-lg bg-zinc-900/50 hover:bg-zinc-900/80 transition-colors">
            <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
                id="excel-upload"
                disabled={loading}
            />

            {!fileName ? (
                <label htmlFor="excel-upload" className="cursor-pointer flex flex-col items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-zinc-300">Click to upload Chart of Accounts</p>
                        <p className="text-xs text-zinc-500">XLSX or CSV. Columns: Code, Description, Type, Parent</p>
                    </div>
                </label>
            ) : (
                <div className="flex flex-col items-center gap-2">
                    {loading ? (
                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                    ) : (
                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                    )}
                    <p className="text-sm text-zinc-200">{fileName}</p>
                    {stats && <p className="text-xs text-zinc-500">Succesfully processed {stats.processed} accounts.</p>}
                    <Button variant="ghost" size="sm" onClick={() => { setFileName(null); setStats(null); }} className="text-xs">
                        Upload Another
                    </Button>
                </div>
            )}
        </div>
    )
}
