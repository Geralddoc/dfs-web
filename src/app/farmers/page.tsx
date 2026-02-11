"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";

export default function FarmersPage() {
    const farmers = useQuery(api.farmers.getFarmers);
    const addFarmer = useMutation(api.farmers.addFarmer);
    const updateFarmer = useMutation(api.farmers.updateFarmer);
    const deleteFarmer = useMutation(api.farmers.deleteFarmer);

    const [newFarmer, setNewFarmer] = useState({ name: "", address: "", contact: "", commodities: "" });
    const [editingId, setEditingId] = useState<Id<"farmers"> | null>(null);

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


    const [showAgroProcessorForm, setShowAgroProcessorForm] = useState(false);
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

    return (
        <div className="p-10">
            <h1 className="text-3xl font-bold mb-6">Farmers Management</h1>

            {showAgroProcessorForm ? (
                <div className="mb-8 p-4 border rounded shadow bg-gray-50">
                    <h2 className="text-xl mb-4">Add Agro Processor</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <input className="border p-2 rounded" placeholder="Name" value={newProcessor.name} onChange={e => setNewProcessor({ ...newProcessor, name: e.target.value })} />
                        <input className="border p-2 rounded" placeholder="Business Name" value={newProcessor.businessName} onChange={e => setNewProcessor({ ...newProcessor, businessName: e.target.value })} />
                        <input className="border p-2 rounded" placeholder="Address" value={newProcessor.address} onChange={e => setNewProcessor({ ...newProcessor, address: e.target.value })} />
                        <input className="border p-2 rounded" placeholder="District" value={newProcessor.district} onChange={e => setNewProcessor({ ...newProcessor, district: e.target.value })} />
                        <input className="border p-2 rounded" placeholder="Contact" value={newProcessor.contact} onChange={e => setNewProcessor({ ...newProcessor, contact: e.target.value })} />
                        <input className="border p-2 rounded" placeholder="Commodities (comma separated)" value={newProcessor.commodities} onChange={e => setNewProcessor({ ...newProcessor, commodities: e.target.value })} />
                        <input type="date" className="border p-2 rounded" placeholder="Date of Visit" value={newProcessor.date} onChange={e => setNewProcessor({ ...newProcessor, date: e.target.value })} />
                        <input className="border p-2 rounded" placeholder="Remarks" value={newProcessor.remarks} onChange={e => setNewProcessor({ ...newProcessor, remarks: e.target.value })} />
                    </div>
                    <div className="mt-4 space-x-2">
                        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={handleAddAgroProcessor}>Save Agro Processor</button>
                        <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600" onClick={() => setShowAgroProcessorForm(false)}>Cancel</button>
                    </div>
                </div>
            ) : (
                <div className="mb-8 p-4 border rounded shadow">
                    <h2 className="text-xl mb-4">{editingId ? "Edit Farmer" : "Add New Farmer"}</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            className="border p-2 rounded"
                            placeholder="Name"
                            value={newFarmer.name}
                            onChange={e => setNewFarmer({ ...newFarmer, name: e.target.value })}
                        />
                        <input
                            className="border p-2 rounded"
                            placeholder="Address"
                            value={newFarmer.address}
                            onChange={e => setNewFarmer({ ...newFarmer, address: e.target.value })}
                        />
                        <input
                            className="border p-2 rounded"
                            placeholder="Contact"
                            value={newFarmer.contact}
                            onChange={e => setNewFarmer({ ...newFarmer, contact: e.target.value })}
                        />
                        <input
                            className="border p-2 rounded"
                            placeholder="Commodities (comma separated)"
                            value={newFarmer.commodities}
                            onChange={e => setNewFarmer({ ...newFarmer, commodities: e.target.value })}
                        />
                    </div>
                    <div className="mt-4 flex space-x-4">
                        <button
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            onClick={editingId ? () => handleUpdate(editingId) : handleAdd}
                        >
                            {editingId ? "Update Farmer" : "Add Farmer"}
                        </button>
                        {!editingId && (
                            <button
                                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                                onClick={() => setShowAgroProcessorForm(true)}
                            >
                                Add Agro Processor
                            </button>
                        )}
                    </div>
                    {editingId && (
                        <button
                            className="mt-4 ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                            onClick={() => { setEditingId(null); setNewFarmer({ name: "", address: "", contact: "", commodities: "" }); }}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            )}

            <table className="w-full border-collapse border">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2">Name</th>
                        <th className="border p-2">Address</th>
                        <th className="border p-2">Contact</th>
                        <th className="border p-2">Commodities</th>
                        <th className="border p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {farmers?.map(farmer => (
                        <tr key={farmer._id} className="border-t">
                            <td className="border p-2">{farmer.name}</td>
                            <td className="border p-2">{farmer.address}</td>
                            <td className="border p-2">{farmer.contact}</td>
                            <td className="border p-2">{farmer.commodities.join(", ")}</td>
                            <td className="border p-2">
                                <button className="text-blue-500 mr-2" onClick={() => startEdit(farmer)}>Edit</button>
                                <button className="text-red-500" onClick={() => handleDelete(farmer._id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
