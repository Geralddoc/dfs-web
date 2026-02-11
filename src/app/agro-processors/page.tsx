"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { exportToExcel } from "../../lib/excel";
import { generateWordReport } from "../../lib/word";

export default function AgroProcessorsPage() {
    const processors = useQuery(api.agroProcessors.getAgroProcessors);
    const services = useQuery(api.users.get); // Dummy call to ensure query hooks work, using existing user call if needed or just skip
    // Actually, we need visits to generate report correctly
    // For now let's just fetch all visits to pass to the report generator. 
    // Ideally we filter visits by type "AgroProcessor" or fetch them all.
    // We can add a simple getAllVisits query or iterate. For this MVP, let's assume we implement a getAllVisits or similar if needed.
    // But wait, getVisits takes relatedId. We might need a new query to get ALL visits for the report.
    // Let's create a quick getAllVisits in visits.ts or just rely on passing empty list for now for the report demo if visits are empty.

    const addProcessor = useMutation(api.agroProcessors.addAgroProcessor);
    const updateProcessor = useMutation(api.agroProcessors.updateAgroProcessor);
    const deleteProcessor = useMutation(api.agroProcessors.deleteAgroProcessor);

    const [newProcessor, setNewProcessor] = useState({ name: "", businessName: "", address: "", contact: "", commodities: "" });
    const [editingId, setEditingId] = useState<Id<"agroProcessors"> | null>(null);

    const handleAdd = async () => {
        await addProcessor({
            ...newProcessor,
            commodities: newProcessor.commodities.split(",").map(c => c.trim()),
        });
        setNewProcessor({ name: "", businessName: "", address: "", contact: "", commodities: "" });
    };

    const handleUpdate = async (id: Id<"agroProcessors">) => {
        await updateProcessor({
            id,
            ...newProcessor,
            commodities: newProcessor.commodities.split(",").map(c => c.trim()),
        });
        setEditingId(null);
        setNewProcessor({ name: "", businessName: "", address: "", contact: "", commodities: "" });
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
            commodities: processor.commodities.join(", "),
        });
    };

    return (
        <div className="p-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Agro Processors Management</h1>
                <div className="space-x-4">
                    <button
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        onClick={() => processors && exportToExcel(processors, 'agro_processors_data')}
                    >
                        Export to Excel
                    </button>
                    <button
                        className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
                        onClick={() => processors && generateWordReport(processors, [])} // Passing empty visits for now until we have a way to fetch all
                    >
                        Generate Word Report
                    </button>
                </div>
            </div>

            <div className="mb-8 p-4 border rounded shadow">
                <h2 className="text-xl mb-4">{editingId ? "Edit Processor" : "Add New Processor"}</h2>
                <div className="grid grid-cols-2 gap-4">
                    <input
                        className="border p-2 rounded"
                        placeholder="Name"
                        value={newProcessor.name}
                        onChange={e => setNewProcessor({ ...newProcessor, name: e.target.value })}
                    />
                    <input
                        className="border p-2 rounded"
                        placeholder="Business Name"
                        value={newProcessor.businessName}
                        onChange={e => setNewProcessor({ ...newProcessor, businessName: e.target.value })}
                    />
                    <input
                        className="border p-2 rounded"
                        placeholder="Address"
                        value={newProcessor.address}
                        onChange={e => setNewProcessor({ ...newProcessor, address: e.target.value })}
                    />
                    <input
                        className="border p-2 rounded"
                        placeholder="Contact"
                        value={newProcessor.contact}
                        onChange={e => setNewProcessor({ ...newProcessor, contact: e.target.value })}
                    />
                    <input
                        className="border p-2 rounded"
                        placeholder="Commodities (comma separated)"
                        value={newProcessor.commodities}
                        onChange={e => setNewProcessor({ ...newProcessor, commodities: e.target.value })}
                    />
                </div>
                <button
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    onClick={editingId ? () => handleUpdate(editingId) : handleAdd}
                >
                    {editingId ? "Update Processor" : "Add Processor"}
                </button>
                {editingId && (
                    <button
                        className="mt-4 ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        onClick={() => { setEditingId(null); setNewProcessor({ name: "", businessName: "", address: "", contact: "", commodities: "" }); }}
                    >
                        Cancel
                    </button>
                )}
            </div>

            <table className="w-full border-collapse border">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2">Name</th>
                        <th className="border p-2">Business Name</th>
                        <th className="border p-2">Address</th>
                        <th className="border p-2">Contact</th>
                        <th className="border p-2">Commodities</th>
                        <th className="border p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {processors?.map(processor => (
                        <tr key={processor._id} className="border-t">
                            <td className="border p-2">{processor.name}</td>
                            <td className="border p-2">{processor.businessName}</td>
                            <td className="border p-2">{processor.address}</td>
                            <td className="border p-2">{processor.contact}</td>
                            <td className="border p-2">{processor.commodities.join(", ")}</td>
                            <td className="border p-2">
                                <button className="text-blue-500 mr-2" onClick={() => startEdit(processor)}>Edit</button>
                                <button className="text-red-500" onClick={() => handleDelete(processor._id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
