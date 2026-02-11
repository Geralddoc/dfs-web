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
    ref: v.optional(v.string()), // REF#
    email: v.optional(v.string()), // EMAIL
    district: v.optional(v.string()), // DISTRICT
    quantities: v.optional(v.string()), // QUANTITIES
    dateOfVisit: v.optional(v.string()), // DATE OF VISIT
    status: v.optional(v.string()), // CURRENT STATUS
  }),

  agroProcessors: defineTable({
    name: v.string(),
    businessName: v.optional(v.string()),
    address: v.string(),
    contact: v.string(),
    district: v.string(),
    commodities: v.array(v.string()),
    ref: v.optional(v.string()), // REF#
    quantities: v.optional(v.string()), // QUANTITIES
    email: v.optional(v.string()),
    dateOfVisit: v.optional(v.string()), // DATE OF VISIT
    status: v.optional(v.string()), // CURRENT STATUS
    remarks: v.optional(v.string()), // REMARKS
    type: v.optional(v.string()), // "AgroProcessor" - useful for mixed queries
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
