import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Schema matching src/app/farmers/page.tsx import logic
const processorSchema = {
    businessName: v.string(),
    contactPerson: v.optional(v.string()), // Made optional as per frontend default fallback
    location: v.string(),
    contactNumber: v.string(),
    processingCapacity: v.optional(v.string()),
    specialization: v.array(v.string()),
    certificationStatus: v.optional(v.string()),
    // Optional fields for flexibility and future proofing
    email: v.optional(v.string()),
    status: v.optional(v.string()),
    remarks: v.optional(v.string()),
};

export const get = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("agroProcessors").collect();
    },
});

export const create = mutation({
    args: processorSchema,
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("agroProcessors", args);
        return id;
    },
});

export const batchCreate = mutation({
    args: {
        processors: v.array(v.object(processorSchema)),
    },
    handler: async (ctx, args) => {
        const ids = [];
        for (const processor of args.processors) {
            const id = await ctx.db.insert("agroProcessors", processor);
            ids.push(id);
        }
        return ids;
    },
});

export const remove = mutation({
    args: { id: v.id("agroProcessors") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});

export const search = query({
    args: { query: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("agroProcessors")
            .withSearchIndex("search_name", (q) => q.search("businessName", args.query))
            .collect();
    },
});
