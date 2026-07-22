import { z } from "zod";
import { eventTypeIcons } from "../data/demo-event-types.js";

export const eventTypeSchema = z.object({
  name: z.string().trim().min(2).max(80),
  icon: z.enum(eventTypeIcons).default("sparkles"),
  published: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export const eventTypeUpdateSchema = eventTypeSchema.partial();
