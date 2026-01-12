"use client"

import {
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"

const data = [
    {
        date: "Jan 1",
        revenue: 2000,
        expenses: 1200,
    },
    {
        date: "Jan 8",
        revenue: 3000,
        expenses: 1500,
    },
    {
        date: "Jan 15",
        revenue: 4500,
        expenses: 2000,
    },
    {
        date: "Jan 22",
        revenue: 3200,
        expenses: 1800,
    },
    {
        date: "Jan 29",
        revenue: 5000,
        expenses: 2500,
    },
]

interface CashFlowChartProps {
    data?: any[];
    height?: number;
}

export function CashFlowChart({ data: propsData, height = 350 }: CashFlowChartProps) {
    const chartData = propsData || data;
    return (
        <ResponsiveContainer width="100%" height={height}>
            <LineChart data={chartData}>
                <XAxis
                    dataKey="date"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                />
                <Tooltip />
                <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#adfa1d"
                    strokeWidth={2}
                    activeDot={{
                        r: 8,
                        style: { fill: "#adfa1d" },
                    }}
                />
                <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="#ea384c"
                    strokeWidth={2}
                    activeDot={{
                        r: 8,
                        style: { fill: "#ea384c" },
                    }}
                />
            </LineChart>
        </ResponsiveContainer>
    )
}
