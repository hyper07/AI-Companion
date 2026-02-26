import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const saveConversationTurn = internalMutation({
  args: {
    patientId: v.any(),
    content: v.any(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("conversations", {
          patientId: args.patientId,
          caregiverId: "system",
          role: "patient",
          content: args.content,
        });
        return {
          ...args,
          id
    , _id: id    };
  },
});