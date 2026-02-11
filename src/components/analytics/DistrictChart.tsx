"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function DistrictChart({ data }: { data: { name: string; value: number }[] }) {
    if (!data || data.length === 0) return <div>No data available</div>;

    return (
        <div className="h-64 w-full">
            <h3 className="text-lg font-semibold mb-4 text-center">District Distribution</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" name="Processors" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
