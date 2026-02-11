"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useRef } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import * as XLSX from "xlsx";

import { Dashboard } from "../../components/analytics/Dashboard";

export default function FarmersPage() {
    const farmers = useQuery(api.farmers.getFarmers);
    // ... existing hooks ...
    const addFarmer = useMutation(api.farmers.addFarmer);
    const updateFarmer = useMutation(api.farmers.updateFarmer);
    const deleteFarmer = useMutation(api.farmers.deleteFarmer);
    const bulkAddFarmers = useMutation(api.farmers.bulkAddFarmers);
    const bulkDeleteFarmers = useMutation(api.farmers.bulkDeleteFarmers);

    const [newFarmer, setNewFarmer] = useState({ name: "", address: "", contact: "", commodities: "" });
    const [editingId, setEditingId] = useState<Id<"farmers"> | null>(null);
    const [showAgroProcessorForm, setShowAgroProcessorForm] = useState(false);
    const [viewMode, setViewMode] = useState<"list" | "analytics">("list"); // New state for view mode
    const [isImporting, setIsImporting] = useState(false);

    // ... existing handlers (handleAdd, handleUpdate, handleDelete, startEdit, agro processor logic, import logic) ...
    const handleAdd = async () => {
        await addFarmer({
            ...newFarmer,
            commodities: newFarmer.commodities.split(",").map(c => c.trim()),
        });
        setNewFarmer({ name: "", address: "", contact: "", commodities: "" });
    };

    const handleUpdate = async (id: Id<"farmers">) => {
        await updateFarmer({
            id,
            ...newFarmer,
            commodities: newFarmer.commodities.split(",").map(c => c.trim()),
        });
        setEditingId(null);
        setNewFarmer({ name: "", address: "", contact: "", commodities: "" });
    };

    const handleDelete = async (id: Id<"farmers">) => {
        await deleteFarmer({ id });
    };

    const startEdit = (farmer: any) => {
        setEditingId(farmer._id);
        setNewFarmer({
            name: farmer.name,
            address: farmer.address,
            contact: farmer.contact,
            commodities: farmer.commodities.join(", "),
        });
    };

    const addAgroProcessor = useMutation(api.agroProcessors.addAgroProcessor);
    const [newProcessor, setNewProcessor] = useState({
        name: "", businessName: "", address: "", contact: "", district: "", commodities: "", date: "", remarks: ""
    });

    const handleAddAgroProcessor = async () => {
        await addAgroProcessor({
            name: newProcessor.name,
            businessName: newProcessor.businessName,
            address: newProcessor.address,
            contact: newProcessor.contact,
            district: newProcessor.district,
            commodities: newProcessor.commodities.split(",").map(c => c.trim()),
            date: newProcessor.date,
            remarks: newProcessor.remarks
        });
        setShowAgroProcessorForm(false);
        setNewProcessor({ name: "", businessName: "", address: "", contact: "", district: "", commodities: "", date: "", remarks: "" });
    };

    const [lastImportedIds, setLastImportedIds] = useState<Id<"farmers">[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: "binary" });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                // Debugging: Log headers found
                if (data.length > 0) {
                    const headers = Object.keys(data[0] as object);
                    console.log("Headers found:", headers);
                }

                const farmersToAdd: any[] = [];

                // Iterate through all sheets to find farmers
                wb.SheetNames.forEach(sheetName => {
                    // Skip Agro Processor and Statistics sheets
                    if (sheetName.trim().toUpperCase().includes("AGRO") || sheetName.trim().toLowerCase().includes("statistic")) {
                        return;
                    }

                    const ws = wb.Sheets[sheetName];
                    const data = XLSX.utils.sheet_to_json(ws);

                    if (data.length > 0) {
                        const excelDateToJSDate = (serial: any) => {
                            if (!serial) return "";
                            if (typeof serial === "string") return serial;
                            // Excel serial date to JS Date
                            const utc_days = Math.floor(serial - 25569);
                            const utc_value = utc_days * 86400;
                            const date_info = new Date(utc_value * 1000);
                            return date_info.toLocaleDateString();
                        };

                        const sheetFarmers = data.map((row: any) => {
                            const normalizedRow: any = {};
                            Object.keys(row).forEach(key => {
                                normalizedRow[key.trim().toLowerCase()] = row[key];
                            });

                            return {
                                name: normalizedRow["name"] || normalizedRow["name "] || "",
                                address: normalizedRow["address"] || "",
                                contact: (normalizedRow["contact"] || normalizedRow["phone #"] || "").toString(),
                                commodities: (normalizedRow["commodities"] || "").toString().split(",").map((c: string) => c.trim()).filter((c: string) => c),
                                // New fields
                                ref: (normalizedRow["ref#"] || normalizedRow["ref"] || "").toString(),
                                email: (normalizedRow["email"] || "").toString(),
                                district: normalizedRow["district"] || sheetName.trim(),
                                quantities: (normalizedRow["quantities"] || "").toString(),
                                dateOfVisit: excelDateToJSDate(normalizedRow["date of visit"]),
                                status: normalizedRow["current status"] || "",
                            };
                        }).filter(f => f.name);

                        farmersToAdd.push(...sheetFarmers);
                    }
                });

                if (farmersToAdd.length === 0) {
                    alert(`No valid farmers found. Headers detected: ${data.length > 0 ? Object.keys(data[0] as object).join(", ") : "None"}. Expected: Name, Address, Contact, Commodities.`);
                    setIsImporting(false);
                    return;
                }

                if (confirm(`Found ${farmersToAdd.length} farmers. Proceed with import? (This may take a moment)`)) {
                    // Batching to avoid timeouts
                    const BATCH_SIZE = 50;
                    const batches = [];
                    for (let i = 0; i < farmersToAdd.length; i += BATCH_SIZE) {
                        batches.push(farmersToAdd.slice(i, i + BATCH_SIZE));
                    }

                    let totalImported = 0;
                    const allIds = [];

                    for (let i = 0; i < batches.length; i++) {
                        // Optional: Update UI with progress if we had a progress bar, for now just wait
                        const batchIds = await bulkAddFarmers({ farmers: batches[i] });
                        allIds.push(...batchIds);
                        totalImported += batchIds.length;
                    }

                    setLastImportedIds(allIds);
                    alert(`Successfully imported ${totalImported} farmers in ${batches.length} batches.`);
                }
            } catch (error) {
                console.error("Import failed:", error);
                alert(`Import failed: ${(error as any).message || "Unknown error"}`);
            } finally {
                setIsImporting(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleUndoImport = async () => {
        if (lastImportedIds.length === 0) return;
        if (confirm("Are you sure you want to undo the last import?")) {
            await bulkDeleteFarmers({ ids: lastImportedIds });
            setLastImportedIds([]);
            alert("Import undone.");
        }
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
                    <Dashboard data={farmers || []} type="Farmer" />
                </div>
            </div>
        );
    }

    return (
        <div className="p-10 bg-slate-50 min-h-screen font-sans">
            <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm">
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Farmers Management</h1>
                <div className="space-x-4 flex items-center">
                    <button
                        className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 shadow-md transition-all font-medium"
                        onClick={() => setViewMode("analytics")}
                    >
                        View Analytics
                    </button>
                    <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleFileUpload}
                        className="hidden"
                        ref={fileInputRef}
                    />
                    <button
                        className={`text-white px-5 py-2.5 rounded-lg shadow-md transition-all font-medium ${isImporting ? "bg-emerald-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"}`}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isImporting}
                    >
                        {isImporting ? "Importing..." : "Import Excel"}
                    </button>
                    {lastImportedIds.length > 0 && (
                        <button
                            className="bg-red-500 text-white px-5 py-2.5 rounded-lg hover:bg-red-600 shadow-md transition-all font-medium"
                            onClick={handleUndoImport}
                        >
                            Undo Import
                        </button>
                    )}
                </div>
            </div>

            {showAgroProcessorForm ? (
                <div className="mb-8 p-6 border border-slate-200 rounded-xl shadow-lg bg-white">
                    <h2 className="text-2xl font-bold mb-6 text-slate-800">Add Agro Processor</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input className="border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Name" value={newProcessor.name} onChange={e => setNewProcessor({ ...newProcessor, name: e.target.value })} />
                        <input className="border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Business Name" value={newProcessor.businessName} onChange={e => setNewProcessor({ ...newProcessor, businessName: e.target.value })} />
                        <input className="border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Address" value={newProcessor.address} onChange={e => setNewProcessor({ ...newProcessor, address: e.target.value })} />
                        <input className="border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="District" value={newProcessor.district} onChange={e => setNewProcessor({ ...newProcessor, district: e.target.value })} />
                        <input className="border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Contact" value={newProcessor.contact} onChange={e => setNewProcessor({ ...newProcessor, contact: e.target.value })} />
                        <input className="border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Commodities (comma separated)" value={newProcessor.commodities} onChange={e => setNewProcessor({ ...newProcessor, commodities: e.target.value })} />
                        <input type="date" className="border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Date of Visit" value={newProcessor.date} onChange={e => setNewProcessor({ ...newProcessor, date: e.target.value })} />
                        <textarea className="border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none md:col-span-2" placeholder="Remarks" value={newProcessor.remarks} onChange={e => setNewProcessor({ ...newProcessor, remarks: e.target.value })} />
                    </div>
                    <div className="mt-8 space-x-4 flex justify-end">
                        <button className="bg-slate-500 text-white px-6 py-2.5 rounded-lg hover:bg-slate-600 transition-colors font-medium" onClick={() => setShowAgroProcessorForm(false)}>Cancel</button>
                        <button className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg hover:bg-emerald-700 shadow-md transition-colors font-medium" onClick={handleAddAgroProcessor}>Save Agro Processor</button>
                    </div>
                </div>
            ) : (
                <div className="mb-8 p-6 border border-slate-200 rounded-xl shadow-lg bg-white">
                    <h2 className="text-2xl font-bold mb-6 text-slate-800">{editingId ? "Edit Farmer" : "Add New Farmer"}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input
                            className="border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Name"
                            value={newFarmer.name}
                            onChange={e => setNewFarmer({ ...newFarmer, name: e.target.value })}
                        />
                        <input
                            className="border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Address"
                            value={newFarmer.address}
                            onChange={e => setNewFarmer({ ...newFarmer, address: e.target.value })}
                        />
                        <input
                            className="border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Contact"
                            value={newFarmer.contact}
                            onChange={e => setNewFarmer({ ...newFarmer, contact: e.target.value })}
                        />
                        <input
                            className="border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Commodities (comma separated)"
                            value={newFarmer.commodities}
                            onChange={e => setNewFarmer({ ...newFarmer, commodities: e.target.value })}
                        />
                    </div>
                    <div className="mt-8 flex justify-between items-center">
                        <div className="space-x-4">
                            {!editingId && (
                                <button
                                    className="bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 shadow-md transition-all font-medium"
                                    onClick={() => setShowAgroProcessorForm(true)}
                                >
                                    Add Agro Processor
                                </button>
                            )}
                        </div>
                        <div className="space-x-4">
                            {editingId && (
                                <button
                                    className="bg-slate-500 text-white px-6 py-2.5 rounded-lg hover:bg-slate-600 transition-colors font-medium"
                                    onClick={() => { setEditingId(null); setNewFarmer({ name: "", address: "", contact: "", commodities: "" }); }}
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 shadow-md transition-all font-medium"
                                onClick={editingId ? () => handleUpdate(editingId) : handleAdd}
                            >
                                {editingId ? "Update Farmer" : "Add Farmer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                            <th className="p-4 font-semibold text-slate-600 border-b">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {farmers?.map(farmer => (
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
                                <td className="p-4">
                                    <button className="text-indigo-600 hover:text-indigo-800 mr-4 font-medium" onClick={() => startEdit(farmer)}>Edit</button>
                                    <button className="text-red-500 hover:text-red-700 font-medium" onClick={() => handleDelete(farmer._id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

}
