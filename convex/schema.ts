import { defineSchema, defineTable} from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        username: v.string (),
        fullname: v.string (), 
        email: v.string(),
        bio: v.optional(v.string()),
        image: v.string(),
        followers : v.number(),
        following: v.number(),
        posts: v.number(),
        clerkId: v.string(),
        private: v.optional(v.boolean()),
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        followersCount: v.optional(v.number()),
        followingCount: v.optional(v.number()),
    }).index("by_clerk_id" , ["clerkId"]),
    posts: defineTable({
        userId: v.id("users"),
        imageUrl: v.string(),
        storageId: v.id("_storage"),
        caption: v.optional(v.string()),
        likes: v.number(),
        comments: v.number(),
    }).index("by_user" , ["userId"]),

    likes: defineTable({
        userId: v.id("users"),
        postId: v.id("posts"),
    }).index("by_post",["postId"])
    .index("by_user_and_post", ["userId","postId" ]),

    comments: defineTable({
        userId: v.id("users"),
        postId: v.id("posts"),
        content: v.string(),
    }).index("by_post", ["postId"]),

    follows: defineTable({
        followerId: v.id("users"),
        followingId: v.id("users"),
    }).index("by_follower", ["followerId"])
    .index("by_following", ["followingId"])
    .index("by_follower_and_following", ["followerId","followingId"]),

    notifications: defineTable({
        receiverId: v.id("users"),
        senderId: v.id("users"),
        type: v.union(v.literal("like"), v.literal("comment"), v.literal("follow")),
        postId: v.optional(v.id("posts")),
        commentId: v.optional(v.id("comments")),
    }).index("by_receiver", ["receiverId"]),

    bookmarks: defineTable({
        userId: v.id("users"),
        postId: v.id("posts"),
    }).index("by_user", ["userId"])
    .index("by_post", ["postId"])
    .index("by_user_and_post", ["userId","postId"]),

    stories: defineTable({
        userId: v.id("users"),
        imageUrl: v.string(),
        caption: v.optional(v.string()),
        mediaType: v.union(v.literal("image"), v.literal("video")),
        privacy: v.optional(v.union(v.literal("public"), v.literal("close_friends"))),
    }).index("by_user", ["userId"]),

    storyViews: defineTable({
        viewerId: v.id("users"),
        authorId: v.id("users"),
        lastViewedAt: v.number(),
        replayCount: v.optional(v.number()),
    }).index("by_viewer", ["viewerId"]).index("by_author", ["authorId"]).index("by_viewer_and_author", ["viewerId","authorId"]),

    storyMetrics: defineTable({
        authorId: v.id("users"),
        dateBucket: v.string(),
        impressions: v.number(),
        reach: v.number(),
        tapsForward: v.number(),
        tapsBack: v.number(),
    }).index("by_author_and_date", ["authorId","dateBucket"]),

    followRequests: defineTable({
        followerId: v.id("users"),
        followingId: v.id("users"),
        status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
        createdAt: v.number(),
    }).index("by_follower_and_following", ["followerId","followingId"]).index("by_following", ["followingId"]),
})