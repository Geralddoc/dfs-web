"use client";

import { CommodityChart } from "./CommodityChart";
import { DistrictChart } from "./DistrictChart";

interface DashboardProps {
    data: any[];
    type: "Farmer" | "AgroProcessor";
}

export function Dashboard({ data, type }: DashboardProps) {
    // Process data for charts
    const commodityData = processCommodities(data);
    const districtData = type === "AgroProcessor" ? processDistricts(data) : [];

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-500">
                    <h2 className="text-xl font-bold mb-2 text-slate-800">Total {type}s</h2>
                    <p className="text-4xl font-bold text-indigo-600">{data.length}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-teal-500">
                    <h2 className="text-xl font-bold mb-2 text-slate-800">Unique Commodities</h2>
                    <p className="text-4xl font-bold text-teal-600">{commodityData.length}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <CommodityChart data={commodityData} />
                </div>
                {type === "AgroProcessor" && (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <DistrictChart data={districtData} />
                    </div>
                )}
            </div>
        </div>
    );
}

function processCommodities(data: any[]) {
    const counts: Record<string, number> = {};
    data.forEach(item => {
        item.commodities.forEach((c: string) => {
            const clean = c.trim();
            if (clean) counts[clean] = (counts[clean] || 0) + 1;
        });
    });
    return Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10); // Top 10
}

function processDistricts(data: any[]) {
    const counts: Record<string, number> = {};
    data.forEach(item => {
        if (item.district) {
            const clean = item.district.trim();
            if (clean) counts[clean] = (counts[clean] || 0) + 1;
        }
    });
    return Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
}
