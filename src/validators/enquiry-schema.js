import { z } from "zod";

export const enquirySchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(40),
  eventType: z.string().trim().min(1).max(80),
  eventDate: z.string().trim().min(1).max(32),
  source: z.string().trim().max(40).optional().default("website"),
});

export const enquiryStatusSchema = z.object({
  status: z.enum(["new", "contacted", "converted", "declined"]),
});
