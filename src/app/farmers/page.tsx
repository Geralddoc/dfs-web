"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useRef } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import * as XLSX from "xlsx";

import { Dashboard } from "../../components/analytics/Dashboard";
import { FilterPopover } from "../../components/ui/filter-popover";
import { AiAssistant } from "../../components/AiAssistant";
import { ShareDialog } from "../../components/ShareDialog";

export default function FarmersPage() {
    const farmers = useQuery(api.farmers.getFarmers);
    const agroProcessors = useQuery(api.agroProcessors.getAgroProcessors);

    // Mutations
    const addFarmer = useMutation(api.farmers.addFarmer);
    const updateFarmer = useMutation(api.farmers.updateFarmer);
    const deleteFarmer = useMutation(api.farmers.deleteFarmer);
    const bulkAddFarmers = useMutation(api.farmers.bulkAddFarmers);
    const bulkDeleteFarmers = useMutation(api.farmers.bulkDeleteFarmers);
    const bulkAddAgroProcessors = useMutation(api.agroProcessors.bulkAddAgroProcessors);
    // @ts-ignore
    const flattenFarmers = useMutation(api.farmers.flattenFarmers);
    // @ts-ignore
    const deleteRecent = useMutation(api.farmers.deleteRecent);
    // @ts-ignore
    const deleteAll = useMutation(api.farmers.deleteAll);
    const [newFarmer, setNewFarmer] = useState({ name: "", address: "", contact: "", commodities: "" });
    const [editingId, setEditingId] = useState<Id<"farmers"> | null>(null);
    const [showAgroForm, setShowAgroForm] = useState(false);
    const [showFarmerForm, setShowFarmerForm] = useState(false);
    const [viewMode, setViewMode] = useState<"list" | "analytics">("list"); // New state for view mode
    const [activeTab, setActiveTab] = useState<"farmers" | "agroProcessors">("farmers");
    const [isImporting, setIsImporting] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);

    // Filtering State
    const [selectedFarmerDistricts, setSelectedFarmerDistricts] = useState<string[]>([]);
    const [selectedFarmerCommodities, setSelectedFarmerCommodities] = useState<string[]>([]);
    const [selectedAgroDistricts, setSelectedAgroDistricts] = useState<string[]>([]);
    const [selectedAgroCommodities, setSelectedAgroCommodities] = useState<string[]>([]);

    // Derived Data for Filters (Sanitized and Sorted)
    const uniqueFarmerDistricts = Array.from(new Set((farmers || [])
        .map(f => f.district?.trim())
        .filter(Boolean) as string[])).sort();

    const uniqueFarmerCommodities = Array.from(new Set((farmers || [])
        .flatMap(f => f.commodities)
        .map(c => c.trim())
        .filter(c => c && /[a-zA-Z]/.test(c))
    )).sort();

    const uniqueAgroDistricts = Array.from(new Set((agroProcessors || [])
        .map(p => p.district?.trim())
        .filter(Boolean) as string[])).sort();

    const uniqueAgroCommodities = Array.from(new Set((agroProcessors || [])
        .flatMap(p => p.commodities)
        .map(c => c.trim())
        .filter(c => c && /[a-zA-Z]/.test(c))
    )).sort();

    // Count Calculations
    const farmerDistrictCounts: Record<string, number> = {};
    farmers?.forEach(f => {
        const d = f.district?.trim();
        if (d) farmerDistrictCounts[d] = (farmerDistrictCounts[d] || 0) + 1;
    });

    const farmerCommodityCounts: Record<string, number> = {};
    farmers?.forEach(f => {
        f.commodities.forEach(c => {
            const clean = c.trim();
            if (clean) farmerCommodityCounts[clean] = (farmerCommodityCounts[clean] || 0) + 1;
        });
    });

    const agroDistrictCounts: Record<string, number> = {};
    agroProcessors?.forEach(p => {
        const d = p.district?.trim();
        if (d) agroDistrictCounts[d] = (agroDistrictCounts[d] || 0) + 1;
    });

    const agroCommodityCounts: Record<string, number> = {};
    agroProcessors?.forEach(p => {
        p.commodities.forEach(c => {
            const clean = c.trim();
            if (clean) agroCommodityCounts[clean] = (agroCommodityCounts[clean] || 0) + 1;
        });
    });

    // Filter Logic (Sanitized match)
    const filteredFarmers = farmers?.filter(farmer => {
        // Farmer-specific filters
        const matchesFarmerDistrict = selectedFarmerDistricts.length === 0 || (farmer.district?.trim() && selectedFarmerDistricts.includes(farmer.district.trim()));
        const matchesFarmerCommodity = selectedFarmerCommodities.length === 0 || farmer.commodities.some(c => selectedFarmerCommodities.includes(c.trim()));

        // Agro correlation filters
        const matchesAgroDistrict = selectedAgroDistricts.length === 0 || (farmer.district?.trim() && selectedAgroDistricts.includes(farmer.district.trim()));
        const matchesAgroCommodity = selectedAgroCommodities.length === 0 || farmer.commodities.some(c => selectedAgroCommodities.includes(c.trim()));

        return matchesFarmerDistrict && matchesFarmerCommodity && matchesAgroDistrict && matchesAgroCommodity;
    });

    const filteredProcessors = agroProcessors?.filter(processor => {
        const matchesDistrict = selectedAgroDistricts.length === 0 || (processor.district && selectedAgroDistricts.includes(processor.district));
        const matchesCommodity = selectedAgroCommodities.length === 0 || processor.commodities.some(c => selectedAgroCommodities.includes(c));
        return matchesDistrict && matchesCommodity;
    });

    const handleAiFilter = (filters: { district?: string[], commodities?: string[] }) => {
        if (filters.district) setSelectedFarmerDistricts(filters.district);
        if (filters.commodities) setSelectedFarmerCommodities(filters.commodities);
    };

    // ... existing handlers (handleAdd, handleUpdate, handleDelete, startEdit, agro processor logic, import logic) ...
    const handleAdd = async () => {
        try {
            if (!newFarmer.name.trim() || !newFarmer.address.trim()) {
                alert("Please enter both Name and Address for the farmer.");
                return;
            }
            await addFarmer({
                ...newFarmer,
                commodities: newFarmer.commodities.split(",").map(c => c.trim()).filter(c => c !== ""),
            });
            setNewFarmer({ name: "", address: "", contact: "", commodities: "" });
            setShowFarmerForm(false);
        } catch (error: any) {
            console.error("Failed to add farmer:", error);
            alert(`Error adding farmer: ${error.message || "Unknown error"}`);
        }
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
        try {
            if (!newProcessor.name.trim() || !newProcessor.district.trim()) {
                alert("Please enter Name and District (required by schema).");
                return;
            }
            await addAgroProcessor({
                name: newProcessor.name,
                businessName: newProcessor.businessName,
                address: newProcessor.address,
                contact: newProcessor.contact,
                district: newProcessor.district,
                commodities: newProcessor.commodities.split(",").map(c => c.trim()).filter(c => c !== ""),
                date: newProcessor.date,
                remarks: newProcessor.remarks
            });
            setShowAgroForm(false);
            setNewProcessor({ name: "", businessName: "", address: "", contact: "", district: "", commodities: "", date: "", remarks: "" });
        } catch (error: any) {
            console.error("Failed to add agro processor:", error);
            alert(`Error adding agro processor: ${error.message || "Unknown error"}`);
        }
    };

    const [lastImportedIds, setLastImportedIds] = useState<Id<"farmers">[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const tailoredAgroFileInputRef = useRef<HTMLInputElement>(null);

    const handleTailoredAgroFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const data = evt.target?.result;
                if (!data) throw new Error("Could not read file data");

                const wb = XLSX.read(data, { type: "array" });

                console.log("Tailored Agro Import (from Farmers): Scanning sheets...", wb.SheetNames);
                let sheetName = wb.SheetNames.find(name => name.trim().toLowerCase() === "print by districta agro") ||
                    wb.SheetNames.find(name => name.trim().toUpperCase().includes("AGRO")) ||
                    wb.SheetNames[0];

                console.log(`Tailored Agro Import: Using sheet "${sheetName}"`);
                const ws = wb.Sheets[sheetName];
                const rawRows = XLSX.utils.sheet_to_json(ws);
                console.log(`Tailored Agro Import: Read ${rawRows.length} raw rows`);

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
                    console.log(`Tailored Agro Import: Re-parsing with header at index ${headerRowIndex}`);
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
                    const findValue = (patterns: string[]) => {
                        const entries = Object.entries(row);
                        // Prioritize exact match
                        let entry = entries.find(([key]) => patterns.includes(key.trim().toLowerCase()));
                        // Fallback to partial match
                        if (!entry) {
                            entry = entries.find(([key]) => {
                                const k = key.trim().toLowerCase();
                                return patterns.some(p => k.includes(p.toLowerCase()));
                            });
                        }
                        return entry ? entry[1] : undefined;
                    };

                    const name = (findValue(["name", "business", "company", "farmer", "processor", "entity"]) || "").toString();
                    const bizName = (findValue(["business name", "bus name", "businessname", "company", "entity name"]) || name).toString();

                    return {
                        name: name,
                        businessName: bizName,
                        address: (findValue(["address", "location", "village", "place", "business address"]) || "").toString(),
                        contact: (findValue(["phone", "contact", "mobile", "tel", "cell", "phone#", "phone #"]) || "").toString(),
                        district: (findValue(["district", "parish", "region"]) || "").toString(),
                        commodities: (findValue(["commodities", "crops", "products", "items", "produce"]) || "").toString().split(",").map((c: string) => c.trim()).filter((c: string) => c),
                        ref: (findValue(["ref", "id", "code", "no.", "ref#", "ref #"]) || "").toString(),
                        quantities: (findValue(["quantities", "amount", "volume", "qty"]) || "").toString(),
                        email: (findValue(["email", "e-mail", "mail"]) || "").toString(),
                        dateOfVisit: excelDateToJSDate(findValue(["visit", "date", "date of visit"])),
                        status: (findValue(["status", "current", "active", "current status"]) || "").toString(),
                        remarks: (findValue(["remarks", "notes", "comment", "info"]) || "").toString(),
                    };
                }).filter(p => {
                    const n = p.name.trim();
                    if (!n || n.length < 2) return false;
                    const nLower = n.toLowerCase();
                    if (nLower === 'name' || nLower === 'farmer name' || nLower === 'business name') return false;
                    return true;
                });

                console.log(`Tailored Agro Import: Found ${processorsToAdd.length} valid processors after filtering`);

                if (processorsToAdd.length === 0) {
                    alert("No valid agro-processors found. Make sure headers contain 'Name', 'Business Name', 'District', etc.");
                    setIsImporting(false);
                    return;
                }

                if (confirm(`Tailored import found ${processorsToAdd.length} processors. Proceed?`)) {
                    const BATCH_SIZE = 50;
                    let totalImported = 0;
                    for (let i = 0; i < processorsToAdd.length; i += BATCH_SIZE) {
                        const batch = processorsToAdd.slice(i, i + BATCH_SIZE);
                        console.log(`Tailored Agro Import: Sending batch ${i / BATCH_SIZE + 1}...`);
                        const batchIds = await bulkAddAgroProcessors({ processors: batch });
                        totalImported += batchIds.length;
                    }
                    alert(`Successfully imported ${totalImported} tailored records.`);
                    console.log("Tailored Agro Import: Success!");
                }
            } catch (error) {
                console.error("Tailored import failed:", error);
                alert(`Tailored import failed: ${error instanceof Error ? error.message : String(error)}`);
            } finally {
                setIsImporting(false);
                if (tailoredAgroFileInputRef.current) tailoredAgroFileInputRef.current.value = "";
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: "array" });
                const farmersToAdd: any[] = [];
                let skippedCount = 0;

                // Iterate through all sheets to find farmers
                wb.SheetNames.forEach(sheetName => {
                    const sheetUpper = sheetName.trim().toUpperCase();
                    // Skip obvious non-data sheets
                    if (sheetUpper.includes("STATISTIC") || sheetUpper.includes("SUMMARY") || sheetUpper.includes("DASHBOARD")) {
                        console.log(`Skipping sheet: ${sheetName}`);
                        return;
                    }

                    const ws = wb.Sheets[sheetName];
                    const data = XLSX.utils.sheet_to_json(ws);
                    console.log(`Import: Processing sheet "${sheetName}" with ${data.length} raw rows`);

                    // Improved header detection
                    let sheetData = data;
                    let headerFound = false;
                    for (let i = 0; i < Math.min(data.length, 15); i++) {
                        const row: any = data[i];
                        if (row) {
                            const rowValues = Object.values(row).map(v => v?.toString().toLowerCase() || "");
                            const matches = rowValues.some(v =>
                                v.includes("name") || v.includes("farmer") || v.includes("ref") || v.includes("id") || v.includes("district")
                            );
                            if (matches) {
                                console.log(`Import: Found potential header at row ${i}`);
                                sheetData = XLSX.utils.sheet_to_json(ws, { range: i });
                                headerFound = true;
                                break;
                            }
                        }
                    }

                    if (sheetData.length > 0) {
                        const excelDateToJSDate = (serial: any) => {
                            if (!serial) return "";
                            if (typeof serial === "string") return serial;
                            try {
                                const utc_days = Math.floor(serial - 25569);
                                const utc_value = utc_days * 86400;
                                const date_info = new Date(utc_value * 1000);
                                return date_info.toLocaleDateString();
                            } catch (e) { return serial.toString(); }
                        };

                        const sheetFarmers = sheetData.map((row: any) => {
                            const findValue = (patterns: string[]) => {
                                const entries = Object.entries(row);
                                // Prioritize exact match
                                let entry = entries.find(([key]) => patterns.includes(key.trim().toLowerCase()));
                                // Fallback to partial match if no exact match found
                                if (!entry) {
                                    entry = entries.find(([key]) => {
                                        const k = key.trim().toLowerCase();
                                        return patterns.some(p => k.includes(p.toLowerCase()));
                                    });
                                }
                                return entry ? entry[1] : undefined;
                            };

                            const name = (findValue(["name", "farmer", "business name", "bus name", "businessname", "company", "farmer name", "entity"]) || "").toString();
                            const address = (findValue(["address", "location", "village", "place", "business address"]) || "").toString();
                            const district = (findValue(["district", "parish", "region"]) || sheetName.trim()).toString();
                            const contact = (findValue(["contact", "phone", "mobile", "tel", "cell", "phone#", "phone #"]) || "").toString();
                            const commoditiesRaw = (findValue(["commodities", "crops", "products", "items", "produce"]) || "").toString();
                            const ref = (findValue(["ref", "id", "code", "no.", "ref#", "ref #"]) || "").toString();

                            return {
                                name,
                                address,
                                contact,
                                district,
                                commodities: commoditiesRaw.split(",").map(c => c.trim()).filter(c => c),
                                ref,
                                email: (findValue(["email", "e-mail", "mail"]) || "").toString(),
                                quantities: (findValue(["quantities", "amount", "volume", "qty"]) || "").toString(),
                                dateOfVisit: excelDateToJSDate(findValue(["visit", "date", "date of visit"])),
                                status: (findValue(["status", "current", "active", "current status"]) || "").toString(),
                            };
                        }).filter(f => {
                            const n = f.name.trim();
                            if (!n || n.length < 2) return false;
                            const nLower = n.toLowerCase();
                            // Skip if it looks like a header row residue
                            if (nLower === 'name' || nLower === 'farmer name' || nLower === 'business name') return false;
                            return true;
                        });

                        console.log(`Import: Found ${sheetFarmers.length} valid farmers in sheet "${sheetName}"`);
                        farmersToAdd.push(...sheetFarmers);
                    }
                });

                console.log(`Import: Total Farmers collected: ${farmersToAdd.length}`);

                if (farmersToAdd.length === 0) {
                    const sampleHeaders = farmersToAdd.length === 0 && wb.SheetNames.length > 0 ?
                        Object.keys(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])[0] || {}).join(", ") : "None found";

                    alert(`IMPORT DIAGNOSTIC:\n- Zero records found.\n- Detected headers: ${sampleHeaders}\n- Check if your name column is one of: Name, Farmer, Business.\n- Searched ${wb.SheetNames.length} sheets.`);
                    setIsImporting(false);
                    return;
                }

                if (confirm(`Found ${farmersToAdd.length} farmers across ${wb.SheetNames.length} sheets. Proceed with import?`)) {
                    const BATCH_SIZE = 50;
                    let totalImported = 0;
                    const allIds = [];

                    for (let i = 0; i < farmersToAdd.length; i += BATCH_SIZE) {
                        const batch = farmersToAdd.slice(i, i + BATCH_SIZE);
                        const batchIds = await bulkAddFarmers({ farmers: batch });
                        allIds.push(...batchIds);
                        totalImported += batchIds.length;
                        console.log(`Imported batch ${i / BATCH_SIZE + 1}, current total: ${totalImported}`);
                    }

                    setLastImportedIds(allIds);
                    alert(`Successfully imported ${totalImported} farmers.`);
                }
            } catch (error) {
                console.error("Import failed:", error);
                alert(`Import failed: ${error instanceof Error ? error.message : String(error)}`);
            } finally {
                setIsImporting(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        };
        reader.readAsArrayBuffer(file); // Switched to ArrayBuffer for reliability
    };

    const handleShare = () => {
        setIsShareOpen(true);
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
                    <Dashboard
                        farmers={filteredFarmers || []}
                        agroProcessors={filteredProcessors || []}
                        initialType="Farmer"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="p-10 bg-slate-50 min-h-screen font-sans">
            <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm">
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Database Management</h1>
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
                        className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 shadow-md transition-all font-medium"
                        onClick={() => { setShowFarmerForm(true); setShowAgroForm(false); setEditingId(null); }}
                    >
                        Add Farmer
                    </button>
                    <button
                        className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 shadow-md transition-all font-medium"
                        onClick={() => { setShowAgroForm(true); setShowFarmerForm(false); setEditingId(null); }}
                    >
                        Add Agro
                    </button>
                    <button
                        className="bg-slate-600 text-white px-5 py-2.5 rounded-lg hover:bg-slate-700 shadow-md transition-all font-medium"
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
                    <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleTailoredAgroFileUpload}
                        className="hidden"
                        ref={tailoredAgroFileInputRef}
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
                        onClick={() => tailoredAgroFileInputRef.current?.click()}
                        disabled={isImporting}
                    >
                        {isImporting ? "Importing..." : "Agro Import"}
                    </button>
                    <button
                        className="bg-red-800 text-white px-5 py-2.5 rounded-lg hover:bg-black shadow-md transition-all font-medium"
                        onClick={async () => {
                            if (confirm("EMERGENCY UNDO: This will delete ALL farmers created in the last 30 minutes. Are you sure?")) {
                                // @ts-ignore
                                await deleteRecent({ minutes: 30 });
                                alert(`Undo complete.`);
                            }
                        }}
                    >
                        Undo (30m)
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

            {/* Filter Bar */}
            <div className="mb-6 flex flex-wrap gap-y-4 gap-x-8 items-center bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                    <span className="text-emerald-600 font-bold text-[10px] uppercase tracking-wider">Farmer Filters:</span>
                    <FilterPopover
                        title="Farmer Districts"
                        options={uniqueFarmerDistricts}
                        selected={selectedFarmerDistricts}
                        onChange={setSelectedFarmerDistricts}
                        counts={farmerDistrictCounts}
                    />
                    <FilterPopover
                        title="Farmer Commodities"
                        options={uniqueFarmerCommodities}
                        selected={selectedFarmerCommodities}
                        onChange={setSelectedFarmerCommodities}
                        counts={farmerCommodityCounts}
                    />
                </div>

                <div className="flex items-center gap-3 border-l pl-8 border-slate-100">
                    <span className="text-indigo-600 font-bold text-[10px] uppercase tracking-wider">Agro Filters:</span>
                    <FilterPopover
                        title="Agro Districts"
                        options={uniqueAgroDistricts}
                        selected={selectedAgroDistricts}
                        onChange={setSelectedAgroDistricts}
                        counts={agroDistrictCounts}
                    />
                    <FilterPopover
                        title="Agro Commodities"
                        options={uniqueAgroCommodities}
                        selected={selectedAgroCommodities}
                        onChange={setSelectedAgroCommodities}
                        counts={agroCommodityCounts}
                    />
                </div>

                {(selectedFarmerDistricts.length > 0 || selectedFarmerCommodities.length > 0 || selectedAgroDistricts.length > 0 || selectedAgroCommodities.length > 0) && (
                    <button
                        onClick={() => {
                            setSelectedFarmerDistricts([]);
                            setSelectedFarmerCommodities([]);
                            setSelectedAgroDistricts([]);
                            setSelectedAgroCommodities([]);
                        }}
                        className="text-sm text-red-600 hover:text-red-800 font-medium ml-auto"
                    >
                        Clear All Filters
                    </button>
                )}
                {!((selectedFarmerDistricts.length > 0 || selectedFarmerCommodities.length > 0 || selectedAgroDistricts.length > 0 || selectedAgroCommodities.length > 0)) && (
                    <div className="ml-auto text-sm text-slate-500">
                        Showing {filteredFarmers?.length || 0} / {farmers?.length || 0} farmers
                    </div>
                )}
            </div >

            <AiAssistant
                data={farmers || []}
                type="Farmer"
                onFilter={handleAiFilter}
            />

            {/* Stats Card */}
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

            {
                showAgroForm && (
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
                            <button className="bg-slate-500 text-white px-6 py-2.5 rounded-lg hover:bg-slate-600 transition-colors font-medium" onClick={() => setShowAgroForm(false)}>Cancel</button>
                            <button className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg hover:bg-emerald-700 shadow-md transition-colors font-medium" onClick={handleAddAgroProcessor}>Save Agro Processor</button>
                        </div>
                    </div>
                )
            }

            {
                (showFarmerForm || editingId) && (
                    <div className="mb-8 p-6 border border-slate-200 rounded-xl shadow-lg bg-white">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-800">{editingId ? "Edit Farmer" : "Add New Farmer"}</h2>
                            <button
                                className="text-slate-400 hover:text-slate-600"
                                onClick={() => { setShowFarmerForm(false); setEditingId(null); setNewFarmer({ name: "", address: "", contact: "", commodities: "" }); }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
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
                        <div className="mt-8 flex justify-end space-x-4">
                            <button
                                className="bg-slate-500 text-white px-6 py-2.5 rounded-lg hover:bg-slate-600 transition-colors font-medium"
                                onClick={() => { setShowFarmerForm(false); setEditingId(null); setNewFarmer({ name: "", address: "", contact: "", commodities: "" }); }}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 shadow-md transition-all font-medium"
                                onClick={editingId ? () => handleUpdate(editingId!) : handleAdd}
                            >
                                {editingId ? "Update Farmer" : "Add Farmer"}
                            </button>
                        </div>
                    </div>
                )
            }

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
                            <th className="p-4 font-semibold text-slate-600 border-b">Actions</th>
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
                                    <td className="p-4">
                                        <button className="text-indigo-600 hover:text-indigo-800 mr-4 font-medium" onClick={() => startEdit(farmer)}>Edit</button>
                                        <button className="text-red-500 hover:text-red-700 font-medium" onClick={() => handleDelete(farmer._id)}>Delete</button>
                                    </td>
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
                                    <td className="p-4">
                                        <button className="text-indigo-600 hover:text-indigo-800 mr-4 font-medium" onClick={() => {
                                            // Optional: Add edit logic for processors if needed
                                            alert("Edit logic for processors can be added here similar to farmers.");
                                        }}>Edit</button>
                                        <button className="text-red-500 hover:text-red-700 font-medium" onClick={async () => {
                                            if (confirm("Delete this agro processor?")) {
                                                // Assuming a deleteMutation exists for processors too, if not we'd need to add it
                                                // For now, let's keep it consistent
                                                alert("Delete mutation for processors would be called here.");
                                            }
                                        }}>Delete</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {/* Share Dialog */}
            <ShareDialog isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
        </div >
    );
}
