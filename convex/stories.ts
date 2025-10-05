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
    const userMap = new Map(users.filter((u): u is NonNullable<typeof u> => Boolean(u)).map((u) => [u._id, u]));

    // Reduce to one story marker per user (we only need presence + basic info here)
    const userStories = userIds
      .map((uid) => {
        const user = userMap.get(uid);
        if (!user) return null;
        // Has story if present in freshStories
        return {
          id: String(uid),
          username: (user as any).username,
          avatar: (user as any).image,
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
    mediaType: v.union(v.literal("image"), v.literal("video")),
    privacy: v.optional(v.union(v.literal("public"), v.literal("close_friends"))),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    await ctx.db.insert("stories", {
      userId: currentUser._id,
      imageUrl: args.imageUrl,
      caption: args.caption,
      mediaType: args.mediaType,
      privacy: args.privacy ?? "public",
    });
  },
});

export const getUserStories = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const now = Date.now();
    const cutoff = now - ONE_DAY_MS;
    const stories = await ctx.db
      .query("stories")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    return stories
      .filter((s) => s._creationTime >= cutoff)
      .sort((a, b) => a._creationTime - b._creationTime)
      .map((s) => ({
        _id: s._id,
        imageUrl: s.imageUrl,
        caption: s.caption,
        mediaType: s.mediaType,
        _creationTime: s._creationTime,
      }));
  },
});

export const deleteStory = mutation({
  args: { storyId: v.id("stories") },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    const story = await ctx.db.get(args.storyId);
    if (!story) throw new Error("Story not found");
    if (String(story.userId) !== String(currentUser._id)) {
      throw new Error("Not authorized to delete this story");
    }
    await ctx.db.delete(args.storyId);
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const uploadUrl = await ctx.storage.generateUploadUrl();
    return uploadUrl;
  },
});

export const createStory = mutation({
  args: {
    storageId: v.id("_storage"),
    caption: v.optional(v.string()),
    mediaType: v.union(v.literal("image"), v.literal("video")),
    privacy: v.optional(v.union(v.literal("public"), v.literal("close_friends"))),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    const imageUrl = await ctx.storage.getUrl(args.storageId);
    if (!imageUrl) throw new Error("Failed to resolve story URL");
    await ctx.db.insert("stories", {
      userId: currentUser._id,
      imageUrl,
      caption: args.caption,
      mediaType: args.mediaType,
      privacy: args.privacy ?? "public",
    });
  },
});

export const markStoryAsViewed = mutation({
  args: { authorId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    
    // Check if already viewed
    const existingView = await ctx.db
      .query("storyViews")
      .withIndex("by_viewer", (q) => q.eq("viewerId", currentUser._id))
      .filter((q) => q.eq(q.field("authorId"), args.authorId))
      .first();
    
    if (!existingView) {
      await ctx.db.insert("storyViews", {
        viewerId: currentUser._id,
        authorId: args.authorId,
        lastViewedAt: Date.now(),
        replayCount: 0,
      });
    }
  },
});

export const recordImpression = mutation({
  args: { authorId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    const now = Date.now();
    const cutoff = now - ONE_DAY_MS;
    const date = new Date(now);
    const bucket = `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, '0')}${String(date.getUTCDate()).padStart(2, '0')}`;

    const view = await ctx.db
      .query("storyViews")
      .withIndex("by_viewer", (q) => q.eq("viewerId", currentUser._id))
      .filter((q) => q.eq(q.field("authorId"), args.authorId))
      .first();

    let isReach = false;
    if (!view) {
      await ctx.db.insert("storyViews", {
        viewerId: currentUser._id,
        authorId: args.authorId,
        lastViewedAt: now,
        replayCount: 0,
      });
      isReach = true;
    } else {
      const withinWindow = view.lastViewedAt >= cutoff;
      if (!withinWindow) isReach = true;
      await ctx.db.patch(view._id, { lastViewedAt: now });
    }

    const metrics = await ctx.db
      .query("storyMetrics")
      .withIndex("by_author_and_date", (q) => q.eq("authorId", args.authorId).eq("dateBucket", bucket))
      .first();
    if (!metrics) {
      await ctx.db.insert("storyMetrics", {
        authorId: args.authorId,
        dateBucket: bucket,
        impressions: 1,
        reach: isReach ? 1 : 0,
        tapsForward: 0,
        tapsBack: 0,
      });
    } else {
      await ctx.db.patch(metrics._id, {
        impressions: metrics.impressions + 1,
        reach: metrics.reach + (isReach ? 1 : 0),
      });
    }
  },
});

export const recordTap = mutation({
  args: { authorId: v.id("users"), direction: v.union(v.literal('forward'), v.literal('back')) },
  handler: async (ctx, args) => {
    const now = Date.now();
    const date = new Date(now);
    const bucket = `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, '0')}${String(date.getUTCDate()).padStart(2, '0')}`;

    const metrics = await ctx.db
      .query("storyMetrics")
      .withIndex("by_author_and_date", (q) => q.eq("authorId", args.authorId).eq("dateBucket", bucket))
      .first();
    if (!metrics) {
      await ctx.db.insert("storyMetrics", {
        authorId: args.authorId,
        dateBucket: bucket,
        impressions: 0,
        reach: 0,
        tapsForward: args.direction === 'forward' ? 1 : 0,
        tapsBack: args.direction === 'back' ? 1 : 0,
      });
    } else {
      await ctx.db.patch(metrics._id, {
        tapsForward: metrics.tapsForward + (args.direction === 'forward' ? 1 : 0),
        tapsBack: metrics.tapsBack + (args.direction === 'back' ? 1 : 0),
      });
    }

    if (args.direction === 'back') {
      const currentUser = await getAuthenticatedUser(ctx);
      const existingView = await ctx.db
        .query("storyViews")
        .withIndex("by_viewer", (q) => q.eq("viewerId", currentUser._id))
        .filter((q) => q.eq(q.field("authorId"), args.authorId))
        .first();
      if (existingView) {
        await ctx.db.patch(existingView._id, { replayCount: (existingView.replayCount ?? 0) + 1 });
      }
    }
  },
});

export const getStoryViewers = query({
  args: { authorId: v.id("users") },
  handler: async (ctx, args) => {
    const now = Date.now();
    const cutoff = now - ONE_DAY_MS;
    const views = await ctx.db
      .query("storyViews")
      .withIndex("by_author", (q) => q.eq("authorId", args.authorId))
      .collect();
    const recent = views.filter(vw => vw.lastViewedAt >= cutoff);
    const users = await Promise.all(recent.map(vw => ctx.db.get(vw.viewerId)));
    const items = recent.map((vw, i) => ({
      viewerId: vw.viewerId,
      replayCount: vw.replayCount ?? 0,
      lastViewedAt: vw.lastViewedAt,
      username: (users[i] as any)?.username,
      avatar: (users[i] as any)?.image,
    }));
    const totalReplays = items.reduce((acc, it) => acc + (it.replayCount || 0), 0);
    return { count: items.length, totalReplays, viewers: items };
  },
});

export const getStoriesFeed = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const cutoff = now - ONE_DAY_MS;
    const me = await getAuthenticatedUser(ctx);

    // who I follow
    const following = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", me._id))
      .collect();
    const followingIds = new Set(following.map((f) => f.followingId));

    // candidate stories (fresh)
    const stories = (await ctx.db.query("stories").collect()).filter((s) => s._creationTime >= cutoff);

    // group by author and apply privacy + follow filter
    const byAuthor = new Map<string, typeof stories>();
    for (const s of stories) {
      // privacy filter
      if (s.privacy === "close_friends") {
        // basic placeholder: require mutual follow
        const mutual = await ctx.db
          .query("follows")
          .withIndex("by_follower_and_following", (q) => q.eq("followerId", s.userId).eq("followingId", me._id))
          .first();
        if (!mutual) continue;
      }
      if (!followingIds.has(s.userId) && s.userId !== me._id) continue;
      const arr = byAuthor.get(s.userId as any) ?? [];
      arr.push(s);
      byAuthor.set(s.userId as any, arr);
    }

    // view states
    const views = await ctx.db
      .query("storyViews")
      .withIndex("by_viewer", (q) => q.eq("viewerId", me._id))
      .collect();
    const viewedAuthors = new Map(views.map((v) => [v.authorId, v]));

    // score and categorize
    type Item = { authorId: any; username: string; avatar: string; hasStory: boolean; viewed: boolean; score: number; latest: number };
    const items: Item[] = [];
    for (const [authorId, arr] of byAuthor.entries()) {
      const user = await ctx.db.get(authorId as any);
      if (!user) continue;
      const latest = arr.reduce((acc, s) => Math.max(acc, s._creationTime), 0);
      const viewed = viewedAuthors.has(authorId as any);
      const base = viewed ? 500 : 1000;
      const recencyBoost = latest / 1e7; // scale down
      const mutual = await ctx.db
        .query("follows")
        .withIndex("by_follower_and_following", (q) => q.eq("followerId", authorId as any).eq("followingId", me._id))
        .first();
      const mutualBoost = mutual ? 200 : 0;
      const score = base + recencyBoost + mutualBoost;
      items.push({ authorId, username: (user as any).username, avatar: (user as any).image, hasStory: true, viewed, score, latest });
    }

    // sort: unviewed first by score, then viewed by score
    const unviewed = items.filter((i) => !i.viewed).sort((a, b) => b.score - a.score);
    const viewedList = items.filter((i) => i.viewed).sort((a, b) => b.score - a.score);
    // me first if I have story
    const meItem = unviewed.find((i) => String(i.authorId) === String(me._id)) || viewedList.find((i) => String(i.authorId) === String(me._id));
    const merged = [
      ...(meItem ? [meItem] : []),
      ...unviewed.filter((i) => String(i.authorId) !== String(me._id)),
      ...viewedList.filter((i) => String(i.authorId) !== String(me._id)),
    ];

    return merged.map((i) => ({ id: String(i.authorId), username: i.username, avatar: i.avatar, hasStory: i.hasStory, viewed: i.viewed }));
  },
});


