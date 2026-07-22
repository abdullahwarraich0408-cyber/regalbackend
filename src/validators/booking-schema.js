import { z } from "zod";

export const venueTypes = ["Indoor", "Outdoor", "Both"];
export const contactMethods = ["Email", "Phone", "WhatsApp"];
export const decorServices = [
  "Backdrop",
  "Balloon decor",
  "Table styling",
  "Floral arrangements",
  "Full event styling",
  "Entrance styling",
  "Stage or focal-point decor",
];
export const budgetRanges = [
  "Under £500",
  "£500 – £1,500",
  "£1,500 – £3,000",
  "£3,000 – £6,000",
  "£6,000+",
  "Not sure yet",
];

export const bookingSchema = z
  .object({
    eventType: z
      .string()
      .trim()
      .min(1, { message: "Please select an event type" })
      .max(80),
    preferredDate: z
      .string()
      .min(1, { message: "Please choose a preferred date" }),
    alternativeDate: z.string().optional().default(""),
    eventLocation: z
      .string()
      .trim()
      .min(2, { message: "Please share the venue or location" })
      .max(160),
    area: z.string().trim().max(120).optional().default(""),
    guestCount: z.string().trim().max(20).optional().default(""),
    venueType: z.enum(venueTypes).optional(),
    setupTime: z.string().trim().max(120).optional().default(""),
    theme: z.string().trim().max(200).optional().default(""),
    servicesNeeded: z.array(z.enum(decorServices)).default([]),
    budgetRange: z.enum(budgetRanges).optional(),
    inspirationNotes: z.string().trim().max(1500).optional().default(""),
    fullName: z
      .string()
      .trim()
      .min(2, { message: "Please share your full name" })
      .max(120),
    email: z
      .string()
      .trim()
      .email({ message: "Please enter a valid email" })
      .max(200)
      .optional()
      .or(z.literal("")),
    phone: z.string().trim().max(40).optional().default(""),
    preferredContactMethod: z.enum(contactMethods, {
      message: "Choose a preferred contact method",
    }),
    message: z.string().trim().max(1500).optional().default(""),
    consent: z
      .boolean()
      .refine((value) => value === true, {
        message: "Please confirm consent to proceed",
      }),
  })
  .refine(
    (data) =>
      Boolean(data.email && data.email.length > 0) ||
      Boolean(data.phone && data.phone.length > 0),
    {
      message: "Please provide either an email or a phone number",
      path: ["email"],
    }
  );
