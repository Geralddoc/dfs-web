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
