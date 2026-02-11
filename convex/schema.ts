import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";


export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.string(), // "admin", "moderator", "user"
    status: v.string(), // "active", "pending", "inactive", "suspended"
    joined: v.string(),
  }).index("by_email", ["email"]),

  farmers: defineTable({
    name: v.string(),
    address: v.string(),
    contact: v.string(),
    commodities: v.array(v.string()), // Array of commodities
  }),

  agroProcessors: defineTable({
    name: v.string(),
    businessName: v.string(),
    address: v.string(),
    contact: v.string(),
    commodities: v.array(v.string()),
  }),

  visits: defineTable({
    relatedId: v.string(), // ID of Farmer or AgroProcessor
    type: v.string(), // "Farmer" or "AgroProcessor"
    // For simplicity in Convex, we can use v.string() for ID if we want to mix, or use separate tables.
    // Let's use string for relatedId to allow flexibility or specifically 2 visit tables.
    // Actually, let's keep it simple: One visits table, stores ID as string to support both, or 2 separate visit tables.
    // Let's go with v.string() for relatedId to support both for now, or use a specific schema design.
    // Better yet, let's just use v.string() for relatedId for now to be flexible.
    date: v.string(),
    remarks: v.string(),
  }).index("by_relatedId", ["relatedId"]),
});
