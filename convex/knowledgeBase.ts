import { internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const loadPatientKB = internalQuery({
  args: { patientId: v.any() },
  handler: async (ctx, args) => {
    return await ctx.db.query("knowledgeBase")
       
          .filter((q) => q.eq(q.field("patientId"), args.patientId))
       .collect();
  },
});