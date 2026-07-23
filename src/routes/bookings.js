import { Router } from "express";
import { z } from "zod";
import { bookingSchema } from "../validators/booking-schema.js";
import { bookingStorage } from "../storage/booking-storage.js";
import { eventTypeStorage } from "../storage/event-type-storage.js";
import {
  sendBookingConfirmationToCustomer,
  sendBookingNotificationToAdmin,
} from "../services/email.js";

const router = Router();

const bookingStatuses = ["new", "contacted", "quoted", "confirmed", "declined"];

const statusSchema = z.object({
  status: z.enum(bookingStatuses),
});

router.get("/", async (_req, res) => {
  const bookings = await bookingStorage.findAll();
  return res.json({ bookings });
});

router.get("/:id", async (req, res) => {
  const booking = await bookingStorage.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }
  return res.json({ booking });
});

router.post("/", async (req, res) => {
  const parsed = bookingSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Please review the highlighted fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    });
  }

  const eventType = await eventTypeStorage.findByName(parsed.data.eventType);
  if (!eventType || !eventType.published) {
    return res.status(400).json({
      error: "Please review the highlighted fields and try again.",
      fieldErrors: {
        eventType: ["Please select a valid published event type"],
      },
    });
  }

  const record = await bookingStorage.create(parsed.data);

  // Send emails (non-blocking — don't fail the request if email fails)
  Promise.all([
    sendBookingConfirmationToCustomer(record),
    sendBookingNotificationToAdmin(record),
  ]).catch((err) => {
    console.error("[email] failed to send booking emails:", err.message);
  });

  return res.status(201).json({
    id: record.id,
    status: record.status,
  });
});

router.patch("/:id", async (req, res) => {
  const parsed = statusSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid status value",
      fieldErrors: parsed.error.flatten().fieldErrors,
    });
  }

  const booking = await bookingStorage.updateStatus(req.params.id, parsed.data.status);
  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }

  return res.json({ booking });
});

export default router;
