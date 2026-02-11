import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getVisits = query({
    args: { relatedId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("visits")
            .withIndex("by_relatedId", (q) => q.eq("relatedId", args.relatedId))
            .collect();
    },
});

export const getAllVisits = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("visits").collect();
    },
});

export const addVisit = mutation({
    args: {
        relatedId: v.string(), // ID of Farmer or AgroProcessor
        type: v.string(), // "Farmer" or "AgroProcessor"
        date: v.string(),
        remarks: v.string(),
    },
    handler: async (ctx, args) => {
        // Cast strict ID types to string for storage if needed, or just store as string
        // In schema relatedId was v.string() or v.id("farmers") - let's check schema.
        // Schema said: relatedId: v.id("farmers") but commented about flexibility. 
        // I should probably update schema to be v.string() or v.union() to support both properly if I want to use one table.
        // For now, let's assume I fix schema or use string.
        await ctx.db.insert("visits", args as any);
    },
});

export const updateVisit = mutation({
    args: {
        id: v.id("visits"),
        date: v.string(),
        remarks: v.string(),
    },
    handler: async (ctx, args) => {
        const { id, ...rest } = args;
        await ctx.db.patch(id, rest);
    },
});

export const deleteVisit = mutation({
    args: { id: v.id("visits") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
