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
        businessName: v.optional(v.string()),
        address: v.string(),
        contact: v.string(),
        district: v.string(),
        commodities: v.array(v.string()),
        ref: v.optional(v.string()),
        quantities: v.optional(v.string()),
        email: v.optional(v.string()),
        // Optional initial visit data
        date: v.optional(v.string()),
        remarks: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { date, remarks, ...processorData } = args;
        const processorId = await ctx.db.insert("agroProcessors", processorData);

        if (date || remarks) {
            await ctx.db.insert("visits", {
                relatedId: processorId,
                type: "AgroProcessor",
                date: date || new Date().toISOString(),
                remarks: remarks || "",
            });
        }
    },
});

export const updateAgroProcessor = mutation({
    args: {
        id: v.id("agroProcessors"),
        name: v.string(),
        businessName: v.optional(v.string()),
        address: v.string(),
        contact: v.string(),
        district: v.string(),
        commodities: v.array(v.string()),
        ref: v.optional(v.string()),
        quantities: v.optional(v.string()),
        email: v.optional(v.string()),
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

export const bulkAddAgroProcessors = mutation({
    args: {
        processors: v.array(v.object({
            name: v.string(),
            businessName: v.optional(v.string()),
            address: v.string(),
            contact: v.string(),
            district: v.string(), // Ensure schema field is present
            commodities: v.array(v.string()),
            ref: v.optional(v.string()),
            quantities: v.optional(v.string()),
            email: v.optional(v.string()),
        })),
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

export const bulkDeleteAgroProcessors = mutation({
    args: { ids: v.array(v.id("agroProcessors")) },
    handler: async (ctx, args) => {
        for (const id of args.ids) {
            await ctx.db.delete(id);
        }
    },
});
