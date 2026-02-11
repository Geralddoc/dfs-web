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
        // Extended fields to match import and Farmers schema
        date: v.optional(v.string()), // Kept for backward compatibility/visit logic
        dateOfVisit: v.optional(v.string()),
        status: v.optional(v.string()),
        remarks: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { date, ...data } = args;

        // Use dateOfVisit if provided, or date, or fallback
        const visitDate = args.dateOfVisit || date || new Date().toLocaleDateString();

        const processorData = {
            ...data,
            dateOfVisit: visitDate,
            type: "AgroProcessor",
        };

        const processorId = await ctx.db.insert("agroProcessors", processorData);

        // Also record as a visit if date or remarks exist, for history
        if (visitDate || args.remarks) {
            await ctx.db.insert("visits", {
                relatedId: processorId,
                type: "AgroProcessor",
                date: visitDate,
                remarks: args.remarks || "",
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
            district: v.string(),
            commodities: v.array(v.string()),
            ref: v.optional(v.string()),
            quantities: v.optional(v.string()),
            email: v.optional(v.string()),
            dateOfVisit: v.optional(v.string()),
            status: v.optional(v.string()),
            remarks: v.optional(v.string()),
            type: v.optional(v.string()),
        })),
    },
    handler: async (ctx, args) => {
        const ids = [];
        for (const processor of args.processors) {
            const { type, ...rest } = processor;
            const dataWithDefaults = {
                ...rest,
                type: type || "AgroProcessor",
                dateOfVisit: processor.dateOfVisit || new Date().toLocaleDateString(),
            };
            const id = await ctx.db.insert("agroProcessors", dataWithDefaults);
            ids.push(id);

            // Also record a visit for the import
            await ctx.db.insert("visits", {
                relatedId: id,
                type: "AgroProcessor",
                date: dataWithDefaults.dateOfVisit,
                remarks: processor.remarks || "Bulk Import",
            });
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

export const deleteRecent = mutation({
    args: { minutes: v.number() },
    handler: async (ctx, args) => {
        const threshold = Date.now() - (args.minutes * 60 * 1000);
        const recent = await ctx.db.query("agroProcessors")
            .filter(q => q.gte(q.field("_creationTime"), threshold))
            .collect();

        for (const processor of recent) {
            await ctx.db.delete(processor._id);
        }
        return recent.length;
    },
});

export const deleteAll = mutation({
    args: {},
    handler: async (ctx) => {
        const all = await ctx.db.query("agroProcessors").collect();
        for (const processor of all) {
            await ctx.db.delete(processor._id);
        }
        return all.length;
    },
});
