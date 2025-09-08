import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./user";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const getStories = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const cutoff = now - ONE_DAY_MS;

    const currentUser = await getAuthenticatedUser(ctx);

    // Fetch fresh stories (<=24h old)
    const freshStories = (await ctx.db.query("stories").collect()).filter(
      (s) => s._creationTime >= cutoff
    );

    if (freshStories.length === 0) return [];

    // Load involved users
    const userIds = Array.from(new Set(freshStories.map((s) => s.userId)));
    const users = await Promise.all(userIds.map((id) => ctx.db.get(id)));
    const userMap = new Map(users.filter(Boolean).map((u) => [u!._id, u!]));

    // Reduce to one story marker per user (we only need presence + basic info here)
    const userStories = userIds
      .map((uid) => {
        const user = userMap.get(uid);
        if (!user) return null;
        // Has story if present in freshStories
        return {
          id: String(uid),
          username: user.username,
          avatar: user.image,
          hasStory: true,
          latestTime:
            freshStories
              .filter((s) => s.userId === uid)
              .reduce((acc, s) => Math.max(acc, s._creationTime), 0) || 0,
        };
      })
      .filter(Boolean) as Array<{ id: string; username: string; avatar: string; hasStory: boolean; latestTime: number }>;

    // Sort: current user first, then by latestTime desc
    userStories.sort((a, b) => {
      if (a.id === String(currentUser._id)) return -1;
      if (b.id === String(currentUser._id)) return 1;
      return b.latestTime - a.latestTime;
    });

    // Return without latestTime (UI doesn't use it)
    return userStories.map(({ latestTime, ...rest }) => rest);
  },
});

export const addStory = mutation({
  args: {
    imageUrl: v.string(),
    caption: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    await ctx.db.insert("stories", {
      userId: currentUser._id,
      imageUrl: args.imageUrl,
      caption: args.caption,
    });
  },
});


