import { z } from "zod";
import { portfolioCategories } from "../data/seed-portfolio.js";

const defaultPalette = ["oklch(0.95 0.03 85)", "oklch(0.82 0.08 70)"];

export const portfolioSchema = z.object({
  slug: z.string().trim().max(120).optional(),
  title: z.string().trim().min(2).max(160),
  category: z.enum(portfolioCategories),
  imageUrl: z.string().trim().optional().or(z.literal("")),
  gallery: z.array(z.string().trim()).max(5).default([]),
  videos: z.array(z.string().trim()).max(2).default([]),
  clientName: z.string().trim().max(120).optional().default(""),
  description: z.string().trim().max(5000).optional().default(""),
  highlights: z.array(z.string().trim()).default([]),
  instagramUrl: z.string().trim().optional().or(z.literal("")),
  palette: z.tuple([z.string(), z.string()]).optional().default(defaultPalette),
  published: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export const portfolioUpdateSchema = portfolioSchema.partial();
