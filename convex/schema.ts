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
    lat: v.optional(v.number()), // Latitude for mapping
    lng: v.optional(v.number()), // Longitude for mapping
  }).searchIndex("search_name", {
    searchField: "name",
  }).searchIndex("search_district", {
    searchField: "district",
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
    type: v.optional(v.string()), // "AgroProcessor"
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
  }).searchIndex("search_name", {
    searchField: "name",
  }).searchIndex("search_business", {
    searchField: "businessName",
  }),

  supplyChain: defineTable({
    farmerId: v.id("farmers"),
    processorId: v.id("agroProcessors"),
    commodity: v.string(),
    volume: v.optional(v.string()),
    date: v.string(),
  }).index("by_farmer", ["farmerId"]).index("by_processor", ["processorId"]),

  auditLogs: defineTable({
    userId: v.optional(v.id("users")),
    action: v.string(), // "create", "update", "delete"
    table: v.string(),
    recordId: v.string(),
    before: v.optional(v.any()),
    after: v.optional(v.any()),
    timestamp: v.string(),
  }).index("by_record", ["recordId"]),

  visits: defineTable({
    relatedId: v.string(), // ID of Farmer or AgroProcessor
    type: v.string(), // "Farmer" or "AgroProcessor"
    date: v.string(),
    remarks: v.string(),
  }).index("by_relatedId", ["relatedId"]),
});
