import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface KpiCardProps {
    title: string
    value: string
    trend?: string
    trendUp?: boolean
    icon: LucideIcon
}

export function KpiCard({ title, value, trend, trendUp, icon: Icon }: KpiCardProps) {
    return (
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-violet-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-white">{value}</div>
                {trend && (
                    <p className={`text-xs ${trendUp ? 'text-green-500' : 'text-red-500'} mt-1`}>
                        {trendUp ? '↑' : '↓'} {trend} from last month
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
