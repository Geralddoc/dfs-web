"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useRef } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import * as XLSX from "xlsx";
import { exportToExcel } from "../../lib/excel";
import { generateWordReport } from "../../lib/word";

import { Dashboard } from "../../components/analytics/Dashboard";

export default function AgroProcessorsPage() {
    const processors = useQuery(api.agroProcessors.getAgroProcessors);

    const addProcessor = useMutation(api.agroProcessors.addAgroProcessor);
    const updateProcessor = useMutation(api.agroProcessors.updateAgroProcessor);
    const deleteProcessor = useMutation(api.agroProcessors.deleteAgroProcessor);
    const bulkAddProcessors = useMutation(api.agroProcessors.bulkAddAgroProcessors);
    const bulkDeleteProcessors = useMutation(api.agroProcessors.bulkDeleteAgroProcessors);

    const [newProcessor, setNewProcessor] = useState({ name: "", businessName: "", address: "", contact: "", district: "", commodities: "" });
    const [editingId, setEditingId] = useState<Id<"agroProcessors"> | null>(null);
    const [viewMode, setViewMode] = useState<"list" | "analytics">("list"); // New state for view mode

    const handleAdd = async () => {
        await addProcessor({
            ...newProcessor,
            commodities: newProcessor.commodities.split(",").map(c => c.trim()),
        });
        setNewProcessor({ name: "", businessName: "", address: "", contact: "", district: "", commodities: "" });
    };

    const handleUpdate = async (id: Id<"agroProcessors">) => {
        await updateProcessor({
            id,
            ...newProcessor,
            commodities: newProcessor.commodities.split(",").map(c => c.trim()),
        });
        setEditingId(null);
        setNewProcessor({ name: "", businessName: "", address: "", contact: "", district: "", commodities: "" });
    };

    const handleDelete = async (id: Id<"agroProcessors">) => {
        await deleteProcessor({ id });
    };

    const startEdit = (processor: any) => {
        setEditingId(processor._id);
        setNewProcessor({
            name: processor.name,
            businessName: processor.businessName,
            address: processor.address,
            contact: processor.contact,
            district: processor.district || "",
            commodities: processor.commodities.join(", "),
        });
    };

    const [lastImportedIds, setLastImportedIds] = useState<Id<"agroProcessors">[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isImporting, setIsImporting] = useState(false);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: "binary" });
                // Find the Agro Processor sheet (case-insensitive)
                const sheetName = wb.SheetNames.find(name => name.trim().toUpperCase().includes("AGRO"));
                if (!sheetName) {
                    alert("Could not find 'AGRO-PROCESSOR' sheet in the file.");
                    setIsImporting(false);
                    return;
                }

                const ws = wb.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json(ws);

                // Find header row index
                let headerRowIndex = -1;
                if (data.length > 0) {
                    for (let i = 0; i < Math.min(data.length, 5); i++) {
                        const row: any = data[i];
                        if (row && Object.values(row).some((cell: any) => cell && cell.toString().trim().toLowerCase().includes("name"))) {
                            headerRowIndex = i;
                            break;
                        }
                    }
                }

                // Re-read if we found a specific start row
                let sheetData = data;
                if (headerRowIndex > -1) {
                    sheetData = XLSX.utils.sheet_to_json(ws, { range: headerRowIndex });
                }

                // Debugging
                if (sheetData.length > 0) {
                    console.log("Headers found:", Object.keys(sheetData[0] as object));
                }

                const excelDateToJSDate = (serial: any) => {
                    if (!serial) return "";
                    if (typeof serial === "string") return serial;
                    const utc_days = Math.floor(serial - 25569);
                    const utc_value = utc_days * 86400;
                    const date_info = new Date(utc_value * 1000);
                    return date_info.toLocaleDateString();
                };

                const processorsToAdd = sheetData.map((row: any) => {
                    const normalizedRow: any = {};
                    Object.keys(row).forEach(key => {
                        normalizedRow[key.trim().toLowerCase()] = row[key];
                    });

                    return {
                        name: normalizedRow["name"] || "",
                        businessName: normalizedRow["business name"] || normalizedRow["businessname"] || "",
                        address: normalizedRow["address"] || normalizedRow["business address"] || "",
                        contact: (normalizedRow["contact"] || normalizedRow["phone#"] || normalizedRow["phone #"] || "").toString(),
                        district: normalizedRow["district"] || "",
                        commodities: (normalizedRow["commodities"] || "").toString().split(",").map((c: string) => c.trim()).filter((c: string) => c),
                        // New fields
                        ref: (normalizedRow["ref#"] || normalizedRow["ref"] || "").toString(),
                        quantities: (normalizedRow["quantities"] || "").toString(),
                        email: (normalizedRow["email"] || "").toString(),
                        date: excelDateToJSDate(normalizedRow["date of visit"]),
                        remarks: normalizedRow["remarks"] || "",
                    };
                }).filter(p => p.name && p.name.toLowerCase() !== "name");

                if (processorsToAdd.length === 0) {
                    alert(`No valid processors found. Headers detected: ${data.length > 0 ? Object.keys(data[0] as object).join(", ") : "None"}. Expected: Name, Business Name, Address, etc.`);
                    setIsImporting(false);
                    return;
                }

                if (confirm(`Found ${processorsToAdd.length} processors. Proceed with import?`)) {
                    const BATCH_SIZE = 50;
                    const batches = [];
                    for (let i = 0; i < processorsToAdd.length; i += BATCH_SIZE) {
                        batches.push(processorsToAdd.slice(i, i + BATCH_SIZE));
                    }

                    let totalImported = 0;
                    const allIds = [];

                    for (let i = 0; i < batches.length; i++) {
                        const batchIds = await bulkAddProcessors({ processors: batches[i] });
                        allIds.push(...batchIds);
                        totalImported += batchIds.length;
                    }

                    setLastImportedIds(allIds);
                    alert(`Successfully imported ${totalImported} agro-processors in ${batches.length} batches.`);
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
            await bulkDeleteProcessors({ ids: lastImportedIds });
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
                    <Dashboard data={processors || []} type="AgroProcessor" />
                </div>
            </div>
        );
    }

    return (
        <div className="p-10 bg-slate-50 min-h-screen font-sans">
            <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm">
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Agro Processors Management</h1>
                <div className="space-x-4 flex items-center">
                    <button
                        className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 shadow-md transition-all font-medium"
                        onClick={() => setViewMode("analytics")}
                    >
                        View Analytics
                    </button>
                    <button
                        className="bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 shadow-md transition-all font-medium"
                        onClick={() => processors && exportToExcel(processors, 'agro_processors_data')}
                    >
                        Export Excel
                    </button>
                    <button
                        className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 shadow-md transition-all font-medium"
                        onClick={() => processors && generateWordReport(processors, [])}
                    >
                        Generate Report
                    </button>
                </div>
            </div>

            <div className="flex justify-end mb-4 space-x-2">
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

            <div className="mb-8 p-6 border border-slate-200 rounded-xl shadow-lg bg-white">
                <h2 className="text-2xl font-bold mb-6 text-slate-800">{editingId ? "Edit Processor" : "Add New Processor"}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input
                        className="border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Name"
                        value={newProcessor.name}
                        onChange={e => setNewProcessor({ ...newProcessor, name: e.target.value })}
                    />
                    <input
                        className="border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Business Name"
                        value={newProcessor.businessName}
                        onChange={e => setNewProcessor({ ...newProcessor, businessName: e.target.value })}
                    />
                    <input
                        className="border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Address"
                        value={newProcessor.address}
                        onChange={e => setNewProcessor({ ...newProcessor, address: e.target.value })}
                    />
                    <input
                        className="border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="District"
                        value={newProcessor.district}
                        onChange={e => setNewProcessor({ ...newProcessor, district: e.target.value })}
                    />
                    <input
                        className="border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Contact"
                        value={newProcessor.contact}
                        onChange={e => setNewProcessor({ ...newProcessor, contact: e.target.value })}
                    />
                    <input
                        className="border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Commodities (comma separated)"
                        value={newProcessor.commodities}
                        onChange={e => setNewProcessor({ ...newProcessor, commodities: e.target.value })}
                    />
                </div>
                <div className="mt-8 flex justify-between items-center">
                    <button
                        className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 shadow-md transition-all font-medium"
                        onClick={editingId ? () => handleUpdate(editingId) : handleAdd}
                    >
                        {editingId ? "Update Processor" : "Add Processor"}
                    </button>
                    {editingId && (
                        <button
                            className="bg-slate-500 text-white px-6 py-2.5 rounded-lg hover:bg-slate-600 transition-colors font-medium"
                            onClick={() => { setEditingId(null); setNewProcessor({ name: "", businessName: "", address: "", contact: "", district: "", commodities: "" }); }}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-slate-100 text-left">
                            <th className="p-4 font-semibold text-slate-600 border-b">Ref</th>
                            <th className="p-4 font-semibold text-slate-600 border-b">Name</th>
                            <th className="p-4 font-semibold text-slate-600 border-b">Business</th>
                            <th className="p-4 font-semibold text-slate-600 border-b">District</th>
                            <th className="p-4 font-semibold text-slate-600 border-b">Contact</th>
                            <th className="p-4 font-semibold text-slate-600 border-b">Commodities</th>
                            <th className="p-4 font-semibold text-slate-600 border-b">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {processors?.map(processor => (
                            <tr key={processor._id} className="border-b hover:bg-slate-50 transition-colors">
                                <td className="p-4 text-slate-700 font-mono text-xs">{processor.ref}</td>
                                <td className="p-4 text-slate-700 font-medium">{processor.name}</td>
                                <td className="p-4 text-slate-700">{processor.businessName}</td>
                                <td className="p-4 text-slate-700">{processor.district}</td>
                                <td className="p-4 text-slate-700">{processor.contact}</td>
                                <td className="p-4 text-slate-700">{processor.commodities.slice(0, 3).join(", ")}{processor.commodities.length > 3 ? "..." : ""}</td>
                                <td className="p-4">
                                    <button className="text-indigo-600 hover:text-indigo-800 mr-4 font-medium" onClick={() => startEdit(processor)}>Edit</button>
                                    <button className="text-red-500 hover:text-red-700 font-medium" onClick={() => handleDelete(processor._id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

}
