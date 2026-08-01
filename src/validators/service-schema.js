import { z } from "zod";
import { serviceIcons } from "../data/demo-services.js";

export function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const optionalSlug = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().min(2).max(80).optional()
);

const optionalImageUrl = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().max(2000).optional()
);

export const serviceSchema = z.object({
  slug: optionalSlug,
  title: z.string().trim().min(2).max(120),
  icon: z.enum(serviceIcons).default("sparkles"),
  bestFor: z.string().trim().min(2).max(120),
  shortDescription: z.string().trim().min(10).max(300),
  longDescription: z.string().trim().min(20).max(2000),
  highlights: z.array(z.string().trim().min(2).max(120)).default([]),
  imageUrl: optionalImageUrl,
  published: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export const serviceUpdateSchema = serviceSchema.partial();
