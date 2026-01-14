import { Id } from "./_generated/dataModel";
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";
import { v } from "convex/values";

export const createUser = mutation({
  args: {
    username: v.string(),
    fullname: v.string(),
    image: v.string(),
    bio: v.optional(v.string()),
    email: v.string(),
    clerkId: v.string(),
  },

  handler: async (ctx, args) => {
    console.log("=== Creating user in Convex ===");
    console.log("Args:", args);

    try {
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
        .first();

      if (existingUser) {
        console.log("User already exists:", existingUser._id);
        return existingUser;
      }

      // create a user in db
      const userId = await ctx.db.insert("users", {
        username: args.username || args.email.split("@")[0],
        fullname: args.fullname || "Unknown User",
        email: args.email,
        bio: args.bio || "",
        image: args.image || "",
        clerkId: args.clerkId,
        followers: 0,
        following: 0,
        posts: 0,
      });

      console.log("User created successfully with ID:", userId);

      // Return the created user
      const createdUser = await ctx.db.get(userId);
      console.log("Created user data:", createdUser);

      return createdUser;
    } catch (error) {
      console.error("Error in createUser mutation:", error);
      throw error;
    }
  },
});

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    return user;
  },
});

export const updateProfile = mutation({
  args: {
    fullname: v.string(),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    await ctx.db.patch(currentUser._id, {
      fullname: args.fullname,
      bio: args.bio,
    });
  },
});

export async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");

  const currentUser = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .first();

  if (!currentUser) throw new Error("User not found");

  return currentUser;
}

export const getUserProfile = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) throw new Error("User not found");

    return user;
  },
});

export const isFollowing = query({
  args: { followingId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const follow = await ctx.db
      .query("follows")
      .withIndex("by_follower_and_following", (q) =>
        q.eq("followerId", currentUser._id).eq("followingId", args.followingId),
      )
      .first();

    return !!follow;
  },
});

export const respondToFollowRequest = mutation({
  args: { followerId: v.id("users"), approve: v.boolean() },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    const request = await ctx.db
      .query("followRequests")
      .withIndex("by_follower_and_following", (q) =>
        q.eq("followerId", args.followerId).eq("followingId", currentUser._id),
      )
      .first();
    if (!request) return;
    if (args.approve) {
      await ctx.db.insert("follows", {
        followerId: args.followerId,
        followingId: currentUser._id,
      });
      await updateFollowCounts(ctx, args.followerId, currentUser._id, true);
      await ctx.db.delete(request._id);
    } else {
      await ctx.db.delete(request._id);
    }
  },
});

export const getRelationshipData = query({
  args: { targetId: v.id("users") },
  handler: async (ctx, args) => {
    const me = await getAuthenticatedUser(ctx);
    const following = await ctx.db
      .query("follows")
      .withIndex("by_follower_and_following", (q) =>
        q.eq("followerId", me._id).eq("followingId", args.targetId),
      )
      .first();
    const followedBy = await ctx.db
      .query("follows")
      .withIndex("by_follower_and_following", (q) =>
        q.eq("followerId", args.targetId).eq("followingId", me._id),
      )
      .first();

    const pendingReq = await ctx.db
      .query("followRequests")
      .withIndex("by_follower_and_following", (q) =>
        q.eq("followerId", me._id).eq("followingId", args.targetId),
      )
      .first();
    const incomingReq = await ctx.db
      .query("followRequests")
      .withIndex("by_follower_and_following", (q) =>
        q.eq("followerId", args.targetId).eq("followingId", me._id),
      )
      .first();

    const followStatus = following ? "following" : "not_following";
    const mutualFollow = Boolean(following && followedBy);
    return { 
        followStatus, 
        mutualFollow,
        hasPendingRequest: !!pendingReq,
        hasIncomingRequest: !!incomingReq,
        isFollowingMe: !!followedBy,
    } as const;
  },
});

export const toggleFollow = mutation({
  args: { targetUserId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const existing = await ctx.db
      .query("follows")
      .withIndex("by_follower_and_following", (q) =>
        q
          .eq("followerId", currentUser._id)
          .eq("followingId", args.targetUserId),
      )
      .first();

    if (existing) {
      // unfollow
      await ctx.db.delete(existing._id);
      await updateFollowCounts(ctx, currentUser._id, args.targetUserId, false);
      return { success: true, newStatus: false } as const;
    } else {
      const target = await ctx.db.get(args.targetUserId);
      const requiresApproval = Boolean((target as any)?.private);

      if (requiresApproval) {
        // if already requested, short-circuit
        const existingReq = await ctx.db
          .query("followRequests")
          .withIndex("by_follower_and_following", (q) =>
            q
              .eq("followerId", currentUser._id)
              .eq("followingId", args.targetUserId),
          )
          .first();
        if (!existingReq) {
          await ctx.db.insert("followRequests", {
            followerId: currentUser._id,
            followingId: args.targetUserId,
            status: "pending",
            createdAt: Date.now(),
          });
          await ctx.db.insert("notifications", {
            receiverId: args.targetUserId,
            senderId: currentUser._id,
            type: "follow_request",
          });
        }
        return {
          success: true,
          newStatus: false,
          requiresApproval: true,
        } as const;
      }

      // follow immediately
      await ctx.db.insert("follows", {
        followerId: currentUser._id,
        followingId: args.targetUserId,
      });
      await updateFollowCounts(ctx, currentUser._id, args.targetUserId, true);

      // create a notification
      await ctx.db.insert("notifications", {
        receiverId: args.targetUserId,
        senderId: currentUser._id,
        type: "follow",
      });
      return { success: true, newStatus: true } as const;
    }
  },
});

async function updateFollowCounts(
  ctx: MutationCtx,
  followerId: Id<"users">,
  followingId: Id<"users">,
  isFollow: boolean,
) {
  const follower = await ctx.db.get(followerId);
  const following = await ctx.db.get(followingId);

  if (follower && following) {
    await ctx.db.patch(followerId, {
      following: follower.following + (isFollow ? 1 : -1),
    });
    await ctx.db.patch(followingId, {
      followers: following.followers + (isFollow ? 1 : -1),
    });
  }
}
