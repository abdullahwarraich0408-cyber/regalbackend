import { Router } from "express";
import {
  eventTypeSchema,
  eventTypeUpdateSchema,
} from "../validators/event-type-schema.js";
import { eventTypeStorage } from "../storage/event-type-storage.js";

const router = Router();

router.get("/", async (req, res) => {
  const publishedOnly = req.query.published === "true";
  const items = await eventTypeStorage.findAll({ publishedOnly });
  return res.json({ items });
});

router.post("/demo", async (_req, res) => {
  const result = await eventTypeStorage.seedDemo();

  if (!result.ok) {
    return res.status(409).json({ error: result.error });
  }

  return res.status(201).json({ items: result.items, count: result.items.length });
});

router.delete("/all", async (_req, res) => {
  await eventTypeStorage.clearAll();
  return res.status(204).send();
});

router.get("/:id", async (req, res) => {
  const item = await eventTypeStorage.findById(req.params.id);
  if (!item) {
    return res.status(404).json({ error: "Event type not found" });
  }
  return res.json({ item });
});

router.post("/", async (req, res) => {
  const parsed = eventTypeSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid event type",
      fieldErrors: parsed.error.flatten().fieldErrors,
    });
  }

  const existing = await eventTypeStorage.findByName(parsed.data.name);
  if (existing) {
    return res.status(409).json({ error: "An event type with this name already exists" });
  }

  const item = await eventTypeStorage.create(parsed.data);
  return res.status(201).json({ item });
});

router.put("/:id", async (req, res) => {
  const parsed = eventTypeUpdateSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid event type",
      fieldErrors: parsed.error.flatten().fieldErrors,
    });
  }

  if (parsed.data.name) {
    const existing = await eventTypeStorage.findByName(parsed.data.name);
    if (existing && existing.id !== req.params.id) {
      return res.status(409).json({ error: "An event type with this name already exists" });
    }
  }

  const item = await eventTypeStorage.update(req.params.id, parsed.data);
  if (!item) {
    return res.status(404).json({ error: "Event type not found" });
  }

  return res.json({ item });
});

router.delete("/:id", async (req, res) => {
  const removed = await eventTypeStorage.remove(req.params.id);
  if (!removed) {
    return res.status(404).json({ error: "Event type not found" });
  }

  return res.status(204).send();
});

export default router;
