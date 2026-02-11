import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAgroProcessors = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("agroProcessors").collect();
    },
});

export const addAgroProcessor = mutation({
    args: {
        name: v.string(),
        businessName: v.string(),
        address: v.string(),
        contact: v.string(),
        commodities: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("agroProcessors", args);
    },
});

export const updateAgroProcessor = mutation({
    args: {
        id: v.id("agroProcessors"),
        name: v.string(),
        businessName: v.string(),
        address: v.string(),
        contact: v.string(),
        commodities: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...rest } = args;
        await ctx.db.patch(id, rest);
    },
});

export const deleteAgroProcessor = mutation({
    args: { id: v.id("agroProcessors") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
