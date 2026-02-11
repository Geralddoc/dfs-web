"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useRef } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import * as XLSX from "xlsx";
import { exportToExcel } from "../../lib/excel";
import { generateWordReport } from "../../lib/word";

import { Dashboard } from "../../components/analytics/Dashboard";
import { FilterPopover } from "../../components/ui/filter-popover";
import { AiAssistant } from "../../components/AiAssistant";
import { ShareDialog } from "../../components/ShareDialog";

export default function AgroProcessorsPage() {
    const processors = useQuery(api.agroProcessors.getAgroProcessors);
    const farmers = useQuery(api.farmers.getFarmers);

    const addProcessor = useMutation(api.agroProcessors.addAgroProcessor);
    const updateProcessor = useMutation(api.agroProcessors.updateAgroProcessor);
    const deleteProcessor = useMutation(api.agroProcessors.deleteAgroProcessor);
    const bulkAddProcessors = useMutation(api.agroProcessors.bulkAddAgroProcessors);
    const bulkDeleteProcessors = useMutation(api.agroProcessors.bulkDeleteAgroProcessors);
    // @ts-ignore - API types might not represent new mutation immediately
    const deleteRecent = useMutation(api.agroProcessors.deleteRecent);
    // @ts-ignore
    const deleteAll = useMutation(api.agroProcessors.deleteAll);

    const [newProcessor, setNewProcessor] = useState({ name: "", businessName: "", address: "", contact: "", district: "", commodities: "" });
    const [editingId, setEditingId] = useState<Id<"agroProcessors"> | null>(null);
    const [viewMode, setViewMode] = useState<"list" | "analytics">("list"); // New state for view mode
    const [isImporting, setIsImporting] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);

    // Filtering State
    const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
    const [selectedCommodities, setSelectedCommodities] = useState<string[]>([]);

    // Derived Data for Filters
    const uniqueDistricts = Array.from(new Set((processors || []).map(p => p.district).filter(Boolean) as string[])).sort();
    const uniqueCommodities = Array.from(new Set((processors || []).flatMap(p => p.commodities)
        .map(c => c.trim())
        .filter(c => c && /[a-zA-Z]/.test(c))
    )).sort();

    // Filter Logic
    const filteredProcessors = processors?.filter(processor => {
        const matchesDistrict = selectedDistricts.length === 0 || (processor.district && selectedDistricts.includes(processor.district));
        const matchesCommodity = selectedCommodities.length === 0 || processor.commodities.some(c => selectedCommodities.includes(c));
        return matchesDistrict && matchesCommodity;
    });

    const handleAiFilter = (filters: { district?: string[], commodities?: string[] }) => {
        if (filters.district) setSelectedDistricts(filters.district);
        if (filters.commodities) setSelectedCommodities(filters.commodities);
    };

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
    const tailoredFileInputRef = useRef<HTMLInputElement>(null);

    const handleTailoredFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const data = evt.target?.result;
                if (!data) throw new Error("Could not read file data");

                const wb = XLSX.read(data, { type: "array" });

                console.log("Tailored Import: Scanning sheets...", wb.SheetNames);
                let sheetName = wb.SheetNames.find(name => name.trim().toLowerCase() === "print by districta agro") ||
                    wb.SheetNames.find(name => name.trim().toUpperCase().includes("AGRO")) ||
                    wb.SheetNames[0];

                console.log(`Tailored Import: Using sheet "${sheetName}"`);
                const ws = wb.Sheets[sheetName];
                const rawRows = XLSX.utils.sheet_to_json(ws);
                console.log(`Tailored Import: Read ${rawRows.length} raw rows`);

                let headerRowIndex = -1;
                if (rawRows.length > 0) {
                    for (let i = 0; i < Math.min(rawRows.length, 5); i++) {
                        const row: any = rawRows[i];
                        const keys = Object.keys(row);
                        if (keys.some(key => key.trim().toLowerCase().match(/^(no\.|ref|name|business|address|district|phone|email|commodit|quantit|date|status|remark)/i))) {
                            headerRowIndex = i;
                            break;
                        }
                    }
                }

                let sheetData = rawRows;
                if (headerRowIndex > 0) {
                    console.log(`Tailored Import: Re-parsing with header at index ${headerRowIndex}`);
                    sheetData = XLSX.utils.sheet_to_json(ws, { range: headerRowIndex });
                }

                const excelDateToJSDate = (serial: any) => {
                    if (!serial) return "";
                    if (typeof serial === "string") return serial;
                    try {
                        const utc_days = Math.floor(serial - 25569);
                        const utc_value = utc_days * 86400;
                        const date_info = new Date(utc_value * 1000);
                        return date_info.toLocaleDateString();
                    } catch (e) {
                        return serial.toString();
                    }
                };

                const processorsToAdd = sheetData.map((row: any) => {
                    const normalizedRow: any = {};
                    Object.keys(row).forEach(key => {
                        normalizedRow[key.trim().toLowerCase()] = row[key];
                    });

                    const name = (normalizedRow["business name"] || normalizedRow["businessname"] || normalizedRow["name"] || "").toString();

                    return {
                        name: name,
                        businessName: (normalizedRow["business name"] || normalizedRow["businessname"] || name).toString(),
                        address: (normalizedRow["business address"] || normalizedRow["address"] || "").toString(),
                        contact: (normalizedRow["phone#"] || normalizedRow["phone #"] || normalizedRow["contact"] || "").toString(),
                        district: (normalizedRow["district"] || "").toString(),
                        commodities: (normalizedRow["commodities"] || "").toString().split(",").map((c: string) => c.trim()).filter((c: string) => c),
                        ref: (normalizedRow["ref#"] || normalizedRow["ref"] || "").toString(),
                        quantities: (normalizedRow["quantities"] || "").toString(),
                        email: (normalizedRow["email"] || "").toString(),
                        dateOfVisit: excelDateToJSDate(normalizedRow["date of visit"]),
                        status: (normalizedRow["current status"] || normalizedRow["status"] || "").toString(),
                        remarks: (normalizedRow["remarks"] || "").toString(),
                    };
                }).filter(p => {
                    const nameStr = p.name ? p.name.toString().trim() : '';
                    return nameStr &&
                        nameStr.toLowerCase() !== 'name' &&
                        nameStr.toLowerCase() !== 'no.' &&
                        nameStr.toLowerCase() !== 'business name' &&
                        nameStr.length > 2;
                });

                console.log(`Tailored Import: Found ${processorsToAdd.length} valid processors after filtering`);

                if (processorsToAdd.length === 0) {
                    alert("No valid agro-processors found in the tailored import mapping.");
                    setIsImporting(false);
                    return;
                }

                if (confirm(`Tailored import found ${processorsToAdd.length} processors. Proceed?`)) {
                    const BATCH_SIZE = 50;
                    const allIds = [];
                    for (let i = 0; i < processorsToAdd.length; i += BATCH_SIZE) {
                        const batch = processorsToAdd.slice(i, i + BATCH_SIZE);
                        console.log(`Tailored Import: Sending batch ${i / BATCH_SIZE + 1}...`);
                        const batchIds = await bulkAddProcessors({ processors: batch });
                        allIds.push(...batchIds);
                    }
                    setLastImportedIds(allIds);
                    alert(`Successfully imported ${allIds.length} tailored records.`);
                    console.log("Tailored Import: Success!");
                }
            } catch (error) {
                console.error("Tailored import failed:", error);
                alert(`Tailored import failed: ${error instanceof Error ? error.message : String(error)}`);
            } finally {
                setIsImporting(false);
                if (tailoredFileInputRef.current) tailoredFileInputRef.current.value = "";
            }
        };
        reader.readAsArrayBuffer(file);
    };



    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: "binary" });

                console.log("Available sheets:", wb.SheetNames);

                // Try to find an Agro Processor sheet (case-insensitive)
                let sheetName = wb.SheetNames.find(name => name.trim().toUpperCase().includes("AGRO"));

                // If no agro sheet found, use the first sheet
                if (!sheetName) {
                    console.log("No 'AGRO' sheet found, using first sheet:", wb.SheetNames[0]);
                    sheetName = wb.SheetNames[0];
                }

                console.log("Using sheet:", sheetName);

                const ws = wb.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json(ws);

                console.log("Initial data read - first row keys:", data.length > 0 ? Object.keys(data[0] as object) : "No data");
                console.log("Total rows in initial read:", data.length);

                // Find header row index - check if keys look like proper headers
                let headerRowIndex = -1;
                if (data.length > 0) {
                    for (let i = 0; i < Math.min(data.length, 5); i++) {
                        const row: any = data[i];
                        const keys = Object.keys(row);
                        // Check if this row has proper header-like keys (not just numeric or single characters)
                        const hasProperHeaders = keys.some(key =>
                            key.trim().toLowerCase().match(/^(no\.|ref|name|business|address|district|phone|email|commodit|quantit|date|status|remark)/i)
                        );
                        if (hasProperHeaders) {
                            console.log(`Found potential header row at index ${i}, keys:`, keys);
                            headerRowIndex = i;
                            break;
                        }
                    }
                }

                // Re-read if we found a specific start row
                let sheetData = data;
                if (headerRowIndex > 0) {
                    console.log(`Re-reading from row ${headerRowIndex}`);
                    sheetData = XLSX.utils.sheet_to_json(ws, { range: headerRowIndex });
                }

                // Debugging
                if (sheetData.length > 0) {
                    console.log("Final headers found:", Object.keys(sheetData[0] as object));
                    console.log("Total records after header detection:", sheetData.length);
                    console.log("First record sample:", sheetData[0]);
                }

                const excelDateToJSDate = (serial: any) => {
                    if (!serial) return "";
                    if (typeof serial === "string") return serial;
                    const utc_days = Math.floor(serial - 25569);
                    const utc_value = utc_days * 86400;
                    const date_info = new Date(utc_value * 1000);
                    return date_info.toLocaleDateString();
                };

                let skippedCount = 0;
                const processorsToAdd = sheetData.map((row: any) => {
                    const normalizedRow: any = {};
                    Object.keys(row).forEach(key => {
                        normalizedRow[key.trim().toLowerCase()] = row[key];
                    });

                    const processor = {
                        name: normalizedRow["business name"] || normalizedRow["businessname"] || normalizedRow["name"] || "",
                        businessName: normalizedRow["business name"] || normalizedRow["businessname"] || normalizedRow["name"] || "",
                        address: normalizedRow["address"] || normalizedRow["business address"] || "",
                        contact: (normalizedRow["contact"] || normalizedRow["phone#"] || normalizedRow["phone #"] || "").toString(),
                        district: normalizedRow["district"] || "",
                        commodities: (normalizedRow["commodities"] || "").toString().split(",").map((c: string) => c.trim()).filter((c: string) => c),
                        // New fields
                        ref: (normalizedRow["ref#"] || normalizedRow["ref"] || "").toString(),
                        quantities: (normalizedRow["quantities"] || "").toString(),
                        email: (normalizedRow["email"] || "").toString(),
                        dateOfVisit: excelDateToJSDate(normalizedRow["date of visit"]),
                        status: normalizedRow["current status"] || normalizedRow["status"] || "",
                        remarks: normalizedRow["remarks"] || "",
                    };

                    // Diagnostic logging
                    if (processorsToAdd.length < 2) {
                        console.log("Sample processor:", {
                            name: processor.name,
                            businessName: processor.businessName,
                            ref: processor.ref,
                            rawName: normalizedRow["name"],
                            rawBusinessName: normalizedRow["business name"]
                        });
                    }

                    return processor;
                }).filter(p => {
                    // Only skip header rows or completely invalid names
                    const nameStr = p.name ? p.name.toString().trim() : '';
                    const isHeaderOrInvalid = !nameStr ||
                        nameStr.toLowerCase() === 'name' ||
                        nameStr.toLowerCase() === 'no.' ||
                        nameStr.toLowerCase() === 'business name';

                    if (isHeaderOrInvalid) {
                        if (processorsToAdd.length < 3) {
                            console.log("Rejected - header/invalid:", nameStr);
                        }
                        return false;
                    }

                    return true;
                });

                if (processorsToAdd.length === 0) {
                    if (skippedCount > 0) {
                        alert(`Found ${skippedCount} records, but they appear to be Farmers (based on Ref ID starting with 'F-' or 'FAR').\n\nPlease upload this file on the Farmers page.`);
                    } else {
                        alert(`No valid processors found. Headers detected: ${data.length > 0 ? Object.keys(data[0] as object).join(", ") : "None"}. Expected: Name, Business Name, Address, etc.`);
                    }
                    setIsImporting(false);
                    return;
                }

                if (confirm(`Found ${processorsToAdd.length} processors. Proceed with import? (Skipped ${skippedCount} likely Farmers)`)) {
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

    const handleShare = () => {
        setIsShareOpen(true);
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
                    <Dashboard
                        farmers={farmers || []}
                        agroProcessors={filteredProcessors || []}
                        initialType="AgroProcessor"
                    />
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
                        className="bg-purple-600 text-white px-5 py-2.5 rounded-lg hover:bg-purple-700 shadow-md transition-all font-medium flex items-center space-x-2"
                        onClick={handleShare}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        <span>Share View</span>
                    </button>
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

            {/* Filter Bar */}
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
                    Showing {filteredProcessors?.length || 0} / {processors?.length || 0} processors
                </div>
            </div>

            <AiAssistant
                data={processors || []}
                type="AgroProcessor"
                onFilter={handleAiFilter}
            />

            <div className="flex justify-end mb-4 space-x-2">
                <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                    className="hidden"
                    ref={fileInputRef}
                />
                <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleTailoredFileUpload}
                    className="hidden"
                    ref={tailoredFileInputRef}
                />
                <button
                    className={`text-white px-5 py-2.5 rounded-lg shadow-md transition-all font-medium ${isImporting ? "bg-emerald-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"}`}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImporting}
                >
                    {isImporting ? "Importing..." : "Import Farmer"}
                </button>
                <button
                    className={`text-white px-5 py-2.5 rounded-lg shadow-md transition-all font-medium ${isImporting ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}
                    onClick={() => tailoredFileInputRef.current?.click()}
                    disabled={isImporting}
                >
                    {isImporting ? "Importing..." : "Agro Import"}
                </button>
                {lastImportedIds.length > 0 && (
                    <button
                        className="bg-red-500 text-white px-5 py-2.5 rounded-lg hover:bg-red-600 shadow-md transition-all font-medium"
                        onClick={handleUndoImport}
                    >
                        Undo Import
                    </button>
                )}
                <button
                    className="bg-red-800 text-white px-5 py-2.5 rounded-lg hover:bg-black shadow-md transition-all font-medium"
                    onClick={async () => {
                        if (confirm("EMERGENCY UNDO: This will delete ALL processors created in the last 30 minutes. Are you sure?")) {
                            // @ts-ignore
                            const count = await deleteRecent({ minutes: 30 });
                            alert(`Deleted ${count} recent records.`);
                        }
                    }}
                >
                    Emergency Undo (Last 30m)
                </button>
                <button
                    className="bg-black text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 shadow-md transition-all font-medium ml-2"
                    onClick={async () => {
                        const confirmation = prompt("DANGER ZONE: This will delete ALL Agro Processors in the database. This cannot be undone.\n\nType 'DELETE' to confirm.");
                        if (confirmation === "DELETE") {
                            // @ts-ignore
                            await deleteAll();
                            alert("All data has been deleted.");
                        }
                    }}
                >
                    Delete All Data
                </button>
            </div>

            {/* Stats Card */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Total Processors</p>
                        <h2 className="text-3xl font-bold text-slate-800">{processors?.length || 0}</h2>
                    </div>
                    <div className="h-12 w-12 bg-indigo-50 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Total Farmers</p>
                        <h2 className="text-3xl font-bold text-slate-800">{farmers?.length || 0}</h2>
                    </div>
                    <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                </div>
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
                        {filteredProcessors?.map(processor => (
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
            {/* Share Dialog */}
            <ShareDialog isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
        </div >
    );

}
