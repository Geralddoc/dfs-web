import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getFarmers = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("farmers").collect();
    },
});

export const addFarmer = mutation({
    args: {
        name: v.string(),
        address: v.string(),
        contact: v.string(),
        commodities: v.array(v.string()),
        ref: v.optional(v.string()),
        email: v.optional(v.string()),
        district: v.optional(v.string()),
        quantities: v.optional(v.string()),
        dateOfVisit: v.optional(v.string()),
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("farmers", args);
    },
});

export const updateFarmer = mutation({
    args: {
        id: v.id("farmers"),
        name: v.string(),
        address: v.string(),
        contact: v.string(),
        commodities: v.array(v.string()),
        ref: v.optional(v.string()),
        email: v.optional(v.string()),
        district: v.optional(v.string()),
        quantities: v.optional(v.string()),
        dateOfVisit: v.optional(v.string()),
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...rest } = args;
        await ctx.db.patch(id, rest);
    },
});

export const deleteFarmer = mutation({
    args: { id: v.id("farmers") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});

export const bulkAddFarmers = mutation({
    args: {
        farmers: v.array(v.object({
            name: v.string(),
            address: v.string(),
            contact: v.string(),
            commodities: v.array(v.string()),
            ref: v.optional(v.string()),
            email: v.optional(v.string()),
            district: v.optional(v.string()),
            quantities: v.optional(v.string()),
            dateOfVisit: v.optional(v.string()),
            status: v.optional(v.string()),
        })),
    },
    handler: async (ctx, args) => {
        const ids = [];
        for (const farmer of args.farmers) {
            const id = await ctx.db.insert("farmers", farmer);
            ids.push(id);
        }
        return ids;
    },
});

export const bulkDeleteFarmers = mutation({
    args: { ids: v.array(v.id("farmers")) },
    handler: async (ctx, args) => {
        for (const id of args.ids) {
            await ctx.db.delete(id);
        }
    },
});
