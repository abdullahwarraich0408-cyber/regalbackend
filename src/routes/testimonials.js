import { Router } from "express";
import { testimonialSchema, testimonialUpdateSchema } from "../validators/testimonial-schema.js";
import { testimonialStorage } from "../storage/testimonial-storage.js";

const router = Router();

router.get("/", async (req, res) => {
  const publishedOnly = req.query.published === "true";
  const items = await testimonialStorage.findAll({ publishedOnly });
  return res.json({ items });
});

router.post("/demo", async (_req, res) => {
  const result = await testimonialStorage.seedDemo();

  if (!result.ok) {
    return res.status(409).json({ error: result.error });
  }

  return res.status(201).json({ items: result.items, count: result.items.length });
});

router.delete("/all", async (_req, res) => {
  await testimonialStorage.clearAll();
  return res.status(204).send();
});

router.get("/:id", async (req, res) => {
  const item = await testimonialStorage.findById(req.params.id);
  if (!item) {
    return res.status(404).json({ error: "Testimonial not found" });
  }
  return res.json({ item });
});

router.post("/", async (req, res) => {
  const parsed = testimonialSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid testimonial",
      fieldErrors: parsed.error.flatten().fieldErrors,
    });
  }

  const item = await testimonialStorage.create(parsed.data);
  return res.status(201).json({ item });
});

router.put("/:id", async (req, res) => {
  const parsed = testimonialUpdateSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid testimonial",
      fieldErrors: parsed.error.flatten().fieldErrors,
    });
  }

  const item = await testimonialStorage.update(req.params.id, parsed.data);
  if (!item) {
    return res.status(404).json({ error: "Testimonial not found" });
  }

  return res.json({ item });
});

router.delete("/:id", async (req, res) => {
  const removed = await testimonialStorage.remove(req.params.id);
  if (!removed) {
    return res.status(404).json({ error: "Testimonial not found" });
  }

  return res.status(204).send();
});

export default router;
