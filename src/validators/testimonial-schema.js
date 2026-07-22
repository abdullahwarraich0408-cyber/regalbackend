import { z } from "zod";

export const testimonialSchema = z.object({
  quote: z.string().trim().min(10).max(2000),
  name: z.string().trim().min(1).max(120),
  event: z.string().trim().min(1).max(120),
  rating: z.number().int().min(1).max(5).default(5),
  source: z.enum(["client", "google"]).default("client"),
  published: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export const testimonialUpdateSchema = testimonialSchema.partial();
