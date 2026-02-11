import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getSupplyChain = query({
    args: { processorId: v.optional(v.id("agroProcessors")), farmerId: v.optional(v.id("farmers")) },
    handler: async (ctx, args) => {
        if (args.processorId) {
            return await ctx.db
                .query("supplyChain")
                .withIndex("by_processor", (q) => q.eq("processorId", args.processorId!))
                .collect();
        }
        if (args.farmerId) {
            return await ctx.db
                .query("supplyChain")
                .withIndex("by_farmer", (q) => q.eq("farmerId", args.farmerId!))
                .collect();
        }
        return await ctx.db.query("supplyChain").collect();
    },
});

export const linkFarmerToProcessor = mutation({
    args: {
        farmerId: v.id("farmers"),
        processorId: v.id("agroProcessors"),
        commodity: v.string(),
        volume: v.optional(v.string()),
        date: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("supplyChain", args);
    },
});

export const getAuditLogs = query({
    args: { recordId: v.optional(v.string()) },
    handler: async (ctx, args) => {
        if (args.recordId) {
            return await ctx.db
                .query("auditLogs")
                .withIndex("by_record", (q) => q.eq("recordId", args.recordId!))
                .collect();
        }
        return await ctx.db.query("auditLogs").order("desc").take(100);
    },
});

export const createAuditLog = mutation({
    args: {
        action: v.string(),
        table: v.string(),
        recordId: v.string(),
        before: v.optional(v.any()),
        after: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("auditLogs", {
            ...args,
            timestamp: new Date().toISOString(),
        });
    },
});
