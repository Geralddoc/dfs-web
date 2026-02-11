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
        lat: v.optional(v.number()),
        lng: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("farmers", args);
        await ctx.db.insert("auditLogs", {
            action: "create",
            table: "farmers",
            recordId: id,
            after: args,
            timestamp: new Date().toISOString(),
        });
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
        lat: v.optional(v.number()),
        lng: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { id, ...rest } = args;
        const before = await ctx.db.get(id);
        await ctx.db.patch(id, rest);
        await ctx.db.insert("auditLogs", {
            action: "update",
            table: "farmers",
            recordId: id,
            before,
            after: rest,
            timestamp: new Date().toISOString(),
        });
    },
});

export const deleteFarmer = mutation({
    args: { id: v.id("farmers") },
    handler: async (ctx, args) => {
        const before = await ctx.db.get(args.id);
        await ctx.db.delete(args.id);
        await ctx.db.insert("auditLogs", {
            action: "delete",
            table: "farmers",
            recordId: args.id,
            before,
            timestamp: new Date().toISOString(),
        });
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
            lat: v.optional(v.number()),
            lng: v.optional(v.number()),
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

export const searchFarmers = query({
    args: { query: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("farmers")
            .withSearchIndex("search_name", (q) => q.search("name", args.query))
            .collect();
    },
});

export const deleteRecent = mutation({
    args: { minutes: v.number() },
    handler: async (ctx, args) => {
        const threshold = Date.now() - (args.minutes * 60 * 1000);
        const recent = await ctx.db.query("farmers")
            .filter(q => q.gte(q.field("_creationTime"), threshold))
            .collect();

        for (const farmer of recent) {
            await ctx.db.delete(farmer._id);
        }
        return recent.length;
    },
});

export const deleteAll = mutation({
    args: {},
    handler: async (ctx) => {
        const all = await ctx.db.query("farmers").collect();
        for (const farmer of all) {
            await ctx.db.delete(farmer._id);
        }
        return all.length;
    },
});
