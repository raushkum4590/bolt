import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users:defineTable({
        name:v.string(),
        email:v.string(),
        picture:v.string(),
        uid:v.string(),
        token:v.optional(v.number()),
        dailyTokenLimit:v.optional(v.number()),
        dailyTokensUsed:v.optional(v.number()),
        lastTokenRefresh:v.optional(v.string())
    }),
    workspace:defineTable({
        messages:v.any(),
        fileData:v.optional(v.any()),
        user:v.id('users')
    })
})