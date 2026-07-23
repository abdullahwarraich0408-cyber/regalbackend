import { Router } from "express";
import { enquirySchema, enquiryStatusSchema } from "../validators/enquiry-schema.js";
import { enquiryStorage } from "../storage/enquiry-storage.js";
import { sendEnquiryNotificationToAdmin } from "../services/email.js";

const router = Router();

router.get("/", async (_req, res) => {
  const enquiries = await enquiryStorage.findAll();
  return res.json({ enquiries });
});

router.get("/:id", async (req, res) => {
  const enquiry = await enquiryStorage.findById(req.params.id);
  if (!enquiry) {
    return res.status(404).json({ error: "Enquiry not found" });
  }
  return res.json({ enquiry });
});

router.post("/", async (req, res) => {
  const parsed = enquirySchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Please check your details and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    });
  }

  const record = await enquiryStorage.create(parsed.data);

  // Notify admin (non-blocking)
  sendEnquiryNotificationToAdmin(record).catch((err) => {
    console.error("[email] failed to send enquiry notification:", err.message);
  });

  return res.status(201).json({
    id: record.id,
    status: record.status,
  });
});

router.patch("/:id", async (req, res) => {
  const parsed = enquiryStatusSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid status value",
      fieldErrors: parsed.error.flatten().fieldErrors,
    });
  }

  const enquiry = await enquiryStorage.updateStatus(req.params.id, parsed.data.status);
  if (!enquiry) {
    return res.status(404).json({ error: "Enquiry not found" });
  }

  return res.json({ enquiry });
});

export default router;
