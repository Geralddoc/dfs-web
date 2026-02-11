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

    return (
        <div className="p-10">
            <h1 className="text-3xl font-bold mb-6">Farmers Management</h1>

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
                <button
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    onClick={editingId ? () => handleUpdate(editingId) : handleAdd}
                >
                    {editingId ? "Update Farmer" : "Add Farmer"}
                </button>
                {editingId && (
                    <button
                        className="mt-4 ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        onClick={() => { setEditingId(null); setNewFarmer({ name: "", address: "", contact: "", commodities: "" }); }}
                    >
                        Cancel
                    </button>
                )}
            </div>

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
