import { z } from "zod";

export const instagramPostSchema = z.object({
  caption: z.string().trim().min(1).max(2200),
  imageUrl: z.string().trim().min(1).max(2000),
  videoUrl: z.string().trim().max(2000).optional().or(z.literal("")),
  postUrl: z.string().trim().max(500).optional().or(z.literal("")),
  shortcode: z.string().trim().max(64).optional().or(z.literal("")),
  likes: z.number().int().min(0).default(0),
  isVideo: z.boolean().default(false),
  isReel: z.boolean().default(false),
  published: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export const instagramPostUpdateSchema = instagramPostSchema.partial();
