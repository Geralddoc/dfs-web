"use client";

import { useState } from "react";
import { CommodityChart } from "./CommodityChart";
import { DistrictChart } from "./DistrictChart";

interface DashboardProps {
    farmers: any[];
    agroProcessors: any[];
    initialType?: "Farmer" | "AgroProcessor";
}

export function Dashboard({ farmers, agroProcessors, initialType = "Farmer" }: DashboardProps) {
    const [activeTab, setActiveTab] = useState<"farmers" | "agroProcessors">(initialType === "Farmer" ? "farmers" : "agroProcessors");

    const currentData = activeTab === "farmers" ? farmers : agroProcessors;
    const typeLabel = activeTab === "farmers" ? "Farmer" : "Agro Processor";

    // Process data for charts and tables
    const commodityData = processCommodities(currentData);
    const districtData = processDistricts(currentData);

    const totalCount = currentData.length;

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            {/* Tab Switcher */}
            <div className="flex space-x-4 mb-8 bg-white p-2 rounded-xl shadow-sm border border-slate-200 w-fit">
                <button
                    onClick={() => setActiveTab("farmers")}
                    className={`px-6 py-2.5 rounded-lg font-medium transition-all ${activeTab === "farmers" ? "bg-emerald-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-100"}`}
                >
                    Farmer Analytics
                </button>
                <button
                    onClick={() => setActiveTab("agroProcessors")}
                    className={`px-6 py-2.5 rounded-lg font-medium transition-all ${activeTab === "agroProcessors" ? "bg-indigo-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-100"}`}
                >
                    Agro Processor Analytics
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${activeTab === "farmers" ? "border-emerald-500" : "border-indigo-500"}`}>
                    <h2 className="text-xl font-bold mb-2 text-slate-800">Total {typeLabel}s</h2>
                    <p className={`text-4xl font-bold ${activeTab === "farmers" ? "text-emerald-600" : "text-indigo-600"}`}>{totalCount}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-teal-500">
                    <h2 className="text-xl font-bold mb-2 text-slate-800">Unique Commodities</h2>
                    <p className="text-4xl font-bold text-teal-600">{commodityData.length}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
                    <h3 className="text-lg font-bold mb-4 text-slate-800">Top 10 Commodities</h3>
                    <CommodityChart data={commodityData} />
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
                    <h3 className="text-lg font-bold mb-4 text-slate-800">District Distribution</h3>
                    <DistrictChart data={districtData} />
                </div>
            </div>

            {/* Statistical Summary Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Commodities Table */}
                <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 p-4 border-b border-slate-200">
                        <h3 className="font-bold text-slate-800">Top Commodities Summary</h3>
                    </div>
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-slate-50 text-slate-600">
                                <th className="p-3 font-semibold border-b">Commodity</th>
                                <th className="p-3 font-semibold border-b">Count</th>
                                <th className="p-3 font-semibold border-b">Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {commodityData.map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 border-b border-slate-100 last:border-0">
                                    <td className="p-3 text-slate-700 font-medium">{item.name}</td>
                                    <td className="p-3 text-slate-600">{item.value}</td>
                                    <td className="p-3 text-slate-500">
                                        {totalCount > 0 ? ((item.value / totalCount) * 100).toFixed(1) : 0}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Top Districts Table */}
                <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 p-4 border-b border-slate-200">
                        <h3 className="font-bold text-slate-800">District Distribution Summary</h3>
                    </div>
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-slate-50 text-slate-600">
                                <th className="p-3 font-semibold border-b">District</th>
                                <th className="p-3 font-semibold border-b">Count</th>
                                <th className="p-3 font-semibold border-b">Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {districtData.slice(0, 10).map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 border-b border-slate-100 last:border-0">
                                    <td className="p-3 text-slate-700 font-medium">{item.name}</td>
                                    <td className="p-3 text-slate-600">{item.value}</td>
                                    <td className="p-3 text-slate-500">
                                        {totalCount > 0 ? ((item.value / totalCount) * 100).toFixed(1) : 0}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function processCommodities(data: any[]) {
    const counts: Record<string, number> = {};
    data.forEach(item => {
        const commodities = Array.isArray(item.commodities) ? item.commodities : [];
        commodities.forEach((c: string) => {
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
