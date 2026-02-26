import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  // Keep existing tables and add:
  patients: defineTable({
       name: v.string(),
       caregiverId: v.string(),
       birthYear: v.optional(v.number()),
       notes: v.optional(v.string()),
  }),
  knowledgeBase: defineTable({
       patientId: v.string(),
       caregiverId: v.string(),
       category: v.string(),
       question: v.string(),
       answer: v.string(),
  }),
  familyMembers: defineTable({
       patientId: v.string(),
       caregiverId: v.string(),
       name: v.string(),
       relationship: v.string(),
       voiceId: v.string(),
       greetingScript: v.string(),
       avatarEmoji: v.optional(v.string()),
  }),
  conversations: defineTable({
       patientId: v.string(),
       caregiverId: v.string(),
       role: v.string(),
       content: v.string(),
  }),
  alerts: defineTable({
       patientId: v.string(),
       caregiverId: v.string(),
       triggerMessage: v.string(),
       distressReason: v.string(),
       resolved: v.boolean(),
  }),
});