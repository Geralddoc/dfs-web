"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { Dashboard } from "../../components/analytics/Dashboard";
import { FilterPopover } from "../../components/ui/filter-popover";
import { AiAssistant } from "../../components/AiAssistant";

export default function ViewerPage() {
    const farmers = useQuery(api.farmers.getFarmers);
    const agroProcessors = useQuery(api.agroProcessors.getAgroProcessors);

    const [viewMode, setViewMode] = useState<"list" | "analytics">("list");
    const [activeTab, setActiveTab] = useState<"farmers" | "agroProcessors">("farmers");

    // Filtering State
    const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
    const [selectedCommodities, setSelectedCommodities] = useState<string[]>([]);

    // Derived Data for Filters
    const uniqueDistricts = Array.from(new Set((farmers || []).map(f => f.district).filter(Boolean) as string[])).sort();
    const uniqueCommodities = Array.from(new Set((farmers || []).flatMap(f => f.commodities)
        .map(c => c.trim())
        .filter(c => c && /[a-zA-Z]/.test(c))
    )).sort();

    // Filter Logic
    const filteredFarmers = farmers?.filter(farmer => {
        const matchesDistrict = selectedDistricts.length === 0 || (farmer.district && selectedDistricts.includes(farmer.district));
        const matchesCommodity = selectedCommodities.length === 0 || farmer.commodities.some(c => selectedCommodities.includes(c));
        return matchesDistrict && matchesCommodity;
    });

    const handleAiFilter = (filters: { district?: string[], commodities?: string[] }) => {
        if (filters.district) setSelectedDistricts(filters.district);
        if (filters.commodities) setSelectedCommodities(filters.commodities);
    };

    if (viewMode === "analytics") {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="p-8">
                    <button
                        onClick={() => setViewMode("list")}
                        className="mb-4 bg-slate-200 text-slate-800 px-4 py-2 rounded hover:bg-slate-300 font-medium"
                    >
                        ← Back to List
                    </button>
                    <Dashboard
                        farmers={filteredFarmers || []}
                        agroProcessors={agroProcessors || []}
                        initialType="Farmer"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="p-10 bg-slate-50 min-h-screen font-sans">
            <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Database Viewer</h1>
                    <p className="text-slate-500 text-sm mt-1">Limited access: Read-only visibility for monitoring and analytics.</p>
                </div>
                <div className="space-x-4 flex items-center">
                    <button
                        className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 shadow-md transition-all font-medium"
                        onClick={() => setViewMode("analytics")}
                    >
                        View Analytics
                    </button>
                </div>
            </div>

            <div className="mb-6 flex flex-wrap gap-4 items-center bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <span className="text-slate-500 font-medium text-sm">Filter by:</span>
                <FilterPopover
                    title="District"
                    options={uniqueDistricts}
                    selected={selectedDistricts}
                    onChange={setSelectedDistricts}
                />
                <FilterPopover
                    title="Commodities"
                    options={uniqueCommodities}
                    selected={selectedCommodities}
                    onChange={setSelectedCommodities}
                />

                {(selectedDistricts.length > 0 || selectedCommodities.length > 0) && (
                    <button
                        onClick={() => { setSelectedDistricts([]); setSelectedCommodities([]); }}
                        className="text-sm text-red-600 hover:text-red-800 font-medium ml-auto"
                    >
                        Clear Filters
                    </button>
                )}
                <div className="ml-auto text-sm text-slate-500">
                    Showing {filteredFarmers?.length || 0} / {farmers?.length || 0} farmers
                </div>
            </div>

            <AiAssistant
                data={farmers || []}
                type="Farmer"
                onFilter={handleAiFilter}
            />

            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div
                    className={`p-6 rounded-xl shadow-sm border transition-all cursor-pointer flex items-center justify-between ${activeTab === "farmers" ? "bg-emerald-50 border-emerald-200 ring-2 ring-emerald-500 ring-offset-2" : "bg-white border-slate-200 hover:border-emerald-300"}`}
                    onClick={() => setActiveTab("farmers")}
                >
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Total Farmers</p>
                        <h2 className="text-3xl font-bold text-slate-800">{farmers?.length || 0}</h2>
                    </div>
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${activeTab === "farmers" ? "bg-emerald-200" : "bg-emerald-50"}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                </div>

                <div
                    className={`p-6 rounded-xl shadow-sm border transition-all cursor-pointer flex items-center justify-between ${activeTab === "agroProcessors" ? "bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500 ring-offset-2" : "bg-white border-slate-200 hover:border-indigo-300"}`}
                    onClick={() => setActiveTab("agroProcessors")}
                >
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Total Agro Processors</p>
                        <h2 className="text-3xl font-bold text-slate-800">{agroProcessors?.length || 0}</h2>
                    </div>
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${activeTab === "agroProcessors" ? "bg-indigo-200" : "bg-indigo-50"}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="mb-4 flex items-center space-x-2">
                <h3 className="text-lg font-bold text-slate-800">
                    {activeTab === "farmers" ? "Farmers List" : "Agro Processors List"}
                </h3>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-200 text-slate-600 uppercase tracking-wider">
                    {activeTab === "farmers" ? "Farmers" : "Agro Processors"}
                </span>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-slate-100 text-left">
                            <th className="p-4 font-semibold text-slate-600 border-b">Ref</th>
                            <th className="p-4 font-semibold text-slate-600 border-b">Name</th>
                            <th className="p-4 font-semibold text-slate-600 border-b">District</th>
                            <th className="p-4 font-semibold text-slate-600 border-b">Address</th>
                            <th className="p-4 font-semibold text-slate-600 border-b">Contact</th>
                            <th className="p-4 font-semibold text-slate-600 border-b">Status</th>
                            <th className="p-4 font-semibold text-slate-600 border-b">Commodities</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeTab === "farmers" ? (
                            filteredFarmers?.map(farmer => (
                                <tr key={farmer._id} className="border-b hover:bg-slate-50 transition-colors">
                                    <td className="p-4 text-slate-700 font-mono text-xs">{farmer.ref}</td>
                                    <td className="p-4 text-slate-700 font-medium">{farmer.name}</td>
                                    <td className="p-4 text-slate-700">{farmer.district}</td>
                                    <td className="p-4 text-slate-700">{farmer.address}</td>
                                    <td className="p-4 text-slate-700">{farmer.contact}</td>
                                    <td className="p-4 text-slate-700 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs ${farmer.status?.toLowerCase().includes("active") ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                                            {farmer.status || "-"}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-700">{farmer.commodities.slice(0, 3).join(", ")}{farmer.commodities.length > 3 ? "..." : ""}</td>
                                </tr>
                            ))
                        ) : (
                            agroProcessors?.map(processor => (
                                <tr key={processor._id} className="border-b hover:bg-indigo-50 transition-colors">
                                    <td className="p-4 text-slate-700 font-mono text-xs">{processor.ref || "-"}</td>
                                    <td className="p-4 text-slate-700 font-medium">{processor.businessName || processor.name}</td>
                                    <td className="p-4 text-slate-700">{processor.district}</td>
                                    <td className="p-4 text-slate-700">{processor.address}</td>
                                    <td className="p-4 text-slate-700">{processor.contact}</td>
                                    <td className="p-4 text-slate-700 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs ${processor.status?.toLowerCase().includes("active") ? "bg-indigo-100 text-indigo-800" : "bg-gray-100 text-gray-800"}`}>
                                            {processor.status || "Importer"}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-700">{processor.commodities.slice(0, 3).join(", ")}{processor.commodities.length > 3 ? "..." : ""}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
