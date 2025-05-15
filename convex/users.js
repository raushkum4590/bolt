import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const CreateUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    picture: v.string(),
    uid: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.query('users').filter((q) => q.eq(q.field('email'), args.email)).collect();
    console.log(user);
    if (user.length === 0) {
      const result = await ctx.db.insert('users', {
        name: args.name,
        email: args.email,
        picture: args.picture,
        uid: args.uid,
        token: 8000,
        dailyTokenLimit: 1000,
        lastTokenRefresh: new Date().toISOString()
      });
      console.log(result);
    }
  },
});


export const GetUser=query({
    args:{
        email:v.string()
    },
    handler:async(ctx,args)=>{
        const user=await ctx.db.query('users').filter((q)=>q.eq(q.field('email'),args.email)).collect();
        return user[0];
    }
})

export const UpdateToken=mutation({
  args:{
    token:v.number(),
    userId:v.id('users'),
    dailyTokensUsed:v.optional(v.number())
  },
  handler:async(ctx,args)=>{
    // Create update object with token
    const updateData = {
      token: args.token
    };

    // Add daily tokens used if provided
    if (args.dailyTokensUsed !== undefined) {
      updateData.dailyTokensUsed = args.dailyTokensUsed;
    }

    // Apply the update
    const result = await ctx.db.patch(args.userId, updateData);
    return result;
  }
});

// New mutation to update all users' tokens to 8000
export const UpdateAllUsersToken = mutation({
  args: {},
  handler: async (ctx) => {
    // Get all users
    const users = await ctx.db.query('users').collect();
    
    // Update each user's token to 8000
    const updates = [];
    for (const user of users) {
      updates.push(ctx.db.patch(user._id, {
        token: 100
      }));
    }
    
    // Wait for all updates to complete
    await Promise.all(updates);
    
    return { success: true, updatedCount: users.length };
  }
});

// New mutation to refresh daily tokens
export const RefreshDailyTokens = mutation({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    // Get the user
    const user = await ctx.db.get(args.userId);
    
    if (!user) {
      return { success: false, message: "User not found" };
    }
    
    const lastRefresh = new Date(user.lastTokenRefresh || new Date(0));
    const currentDate = new Date();
    
    // Check if it's a new day (compare dates without time)
    const isNewDay = lastRefresh.toDateString() !== currentDate.toDateString();
    
    if (isNewDay) {
      // Reset daily tokens and update last refresh date
      await ctx.db.patch(args.userId, {
        dailyTokensUsed: 0,
        lastTokenRefresh: currentDate.toISOString()
      });
      
      return { 
        success: true, 
        dailyTokensRefreshed: true,
        dailyTokenLimit: user.dailyTokenLimit || 1000
      };
    }
    
    return { 
      success: true, 
      dailyTokensRefreshed: false,
      dailyTokensUsed: user.dailyTokensUsed || 0,
      dailyTokenLimit: user.dailyTokenLimit || 1000
    };
  }
});