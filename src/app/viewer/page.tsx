"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import Link from "next/link";
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
                <div className="p-4 md:p-8">
                    <button
                        onClick={() => setViewMode("list")}
                        className="mb-6 bg-slate-200 text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-300 font-bold text-sm flex items-center gap-2 transition-all shadow-sm"
                    >
                        ← Back to Summary
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
        <div className="p-4 md:p-10 bg-slate-50 min-h-screen font-sans">
            {/* Header - Sleek & Private */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        Agricultural Data Summary
                    </h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-1 font-medium italic">Authorized View-Only Portal for Monitoring & Reporting</p>
                </div>
                <button
                    className="w-full md:w-auto bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all font-bold text-sm tracking-wide active:scale-95"
                    onClick={() => setViewMode("analytics")}
                >
                    GENERATE ANALYTICS
                </button>
            </div>

            {/* Smart Filters - Compact on Mobile */}
            <div className="mb-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mr-2 whitespace-nowrap">Explore by:</span>
                    <FilterPopover
                        title="Districts"
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
                </div>

                <div className="flex items-center justify-between md:ml-auto gap-4">
                    {(selectedDistricts.length > 0 || selectedCommodities.length > 0) && (
                        <button
                            onClick={() => { setSelectedDistricts([]); setSelectedCommodities([]); }}
                            className="text-xs text-red-500 hover:text-red-700 font-bold underline underline-offset-4"
                        >
                            Reset
                        </button>
                    )}
                    <div className="text-[10px] md:text-xs text-slate-400 font-bold bg-slate-50 px-3 py-1.5 rounded-full border">
                        {filteredFarmers?.length || 0} RECORDS FOUND
                    </div>
                </div>
            </div>

            <AiAssistant
                data={farmers || []}
                type="Farmer"
                onFilter={handleAiFilter}
            />

            {/* Status Overview Cards */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                    className={`p-5 rounded-2xl shadow-sm border transition-all cursor-pointer flex items-center justify-between ${activeTab === "farmers" ? "bg-emerald-50 border-emerald-200 ring-2 ring-emerald-500/20" : "bg-white border-slate-100 hover:border-emerald-200"}`}
                    onClick={() => setActiveTab("farmers")}
                >
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active Farmers</p>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">{farmers?.length || 0}</h2>
                    </div>
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${activeTab === "farmers" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" : "bg-emerald-50 text-emerald-600"}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                </div>

                <div
                    className={`p-5 rounded-2xl shadow-sm border transition-all cursor-pointer flex items-center justify-between ${activeTab === "agroProcessors" ? "bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/20" : "bg-white border-slate-100 hover:border-indigo-200"}`}
                    onClick={() => setActiveTab("agroProcessors")}
                >
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Agro Processors</p>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">{agroProcessors?.length || 0}</h2>
                    </div>
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${activeTab === "agroProcessors" ? "bg-indigo-500 text-white shadow-lg shadow-indigo-200" : "bg-indigo-50 text-indigo-600"}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                    {activeTab === "farmers" ? "Farmer Records" : "Processing Units"}
                </h3>
            </div>

            {/* Responsive Table / Card View */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                {/* Desktop View (Table) */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Ref</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Entity Name</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">District</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Commodities</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeTab === "farmers" ? (
                                filteredFarmers?.map(farmer => (
                                    <tr key={farmer._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 font-mono text-[10px] text-slate-400">{farmer.ref || "---"}</td>
                                        <td className="p-4 text-sm font-bold text-slate-700">{farmer.name}</td>
                                        <td className="p-4 text-xs font-medium text-slate-500">{farmer.district}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${farmer.status?.toLowerCase().includes("active") ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                                                {farmer.status || "REGISTERED"}
                                            </span>
                                        </td>
                                        <td className="p-4 text-[10px] font-medium text-slate-400 text-right">{farmer.commodities.slice(0, 3).join(", ")}{farmer.commodities.length > 3 ? "..." : ""}</td>
                                    </tr>
                                ))
                            ) : (
                                agroProcessors?.map(processor => (
                                    <tr key={processor._id} className="border-b border-slate-50 last:border-0 hover:bg-indigo-50/20 transition-colors">
                                        <td className="p-4 font-mono text-[10px] text-slate-400">{processor.ref || "---"}</td>
                                        <td className="p-4 text-sm font-bold text-slate-700">{processor.businessName || processor.name}</td>
                                        <td className="p-4 text-xs font-medium text-slate-500">{processor.district}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${processor.status?.toLowerCase().includes("active") ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"}`}>
                                                {processor.status || "IMPORTER"}
                                            </span>
                                        </td>
                                        <td className="p-4 text-[10px] font-medium text-slate-400 text-right">{processor.commodities.slice(0, 3).join(", ")}{processor.commodities.length > 3 ? "..." : ""}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View (Sleek) */}
                <div className="md:hidden divide-y divide-slate-100">
                    {activeTab === "farmers" ? (
                        filteredFarmers?.map(farmer => (
                            <div key={farmer._id} className="p-5 active:bg-slate-50 transition-colors">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-slate-400 tracking-tighter mb-1 font-mono uppercase">#{farmer.ref || "NEW"}</span>
                                        <h4 className="text-base font-black text-slate-800 tracking-tight leading-tight">{farmer.name}</h4>
                                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mt-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {farmer.district}
                                        </span>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ${farmer.status?.toLowerCase().includes("active") ? "bg-green-100 text-green-700" : "bg-slate-50 text-slate-400 border border-slate-100"}`}>
                                        {farmer.status || "REG"}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {farmer.commodities.slice(0, 4).map((c, i) => (
                                        <span key={i} className="bg-slate-50 text-slate-500 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">{c}</span>
                                    ))}
                                    {farmer.commodities.length > 4 && <span className="text-[8px] font-bold text-slate-300 ml-1">+{farmer.commodities.length - 4} MORE</span>}
                                </div>
                            </div>
                        ))
                    ) : (
                        agroProcessors?.map(processor => (
                            <div key={processor._id} className="p-5 active:bg-indigo-50/50 transition-colors">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-slate-400 tracking-tighter mb-1 font-mono uppercase">#{processor.ref || "AGRO"}</span>
                                        <h4 className="text-base font-black text-slate-800 tracking-tight leading-tight">{processor.businessName || processor.name}</h4>
                                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mt-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {processor.district}
                                        </span>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ${processor.status?.toLowerCase().includes("active") ? "bg-indigo-100 text-indigo-700" : "bg-slate-50 text-slate-400 border border-slate-100"}`}>
                                        {processor.status || "IMP"}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {processor.commodities.slice(0, 4).map((c, i) => (
                                        <span key={i} className="bg-indigo-50/50 text-indigo-600 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">{c}</span>
                                    ))}
                                    {processor.commodities.length > 4 && <span className="text-[8px] font-bold text-slate-300 ml-1">+{processor.commodities.length - 4} MORE</span>}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Empty State */}
            {((activeTab === "farmers" && filteredFarmers?.length === 0) || (activeTab === "agroProcessors" && agroProcessors?.length === 0)) && (
                <div className="text-center py-20 bg-white rounded-3xl mt-8 border-2 border-dashed border-slate-100">
                    <div className="mx-auto w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <p className="text-slate-400 font-bold text-sm">NO MATCHING RECORDS FOUND</p>
                    <p className="text-slate-300 text-[10px] mt-1 font-bold">Try adjusting your filters or active tab</p>
                </div>
            )}
        </div>
    );
}
