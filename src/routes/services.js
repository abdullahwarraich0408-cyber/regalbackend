import { Router } from "express";
import { serviceSchema, serviceUpdateSchema, slugify } from "../validators/service-schema.js";
import { serviceStorage } from "../storage/service-storage.js";

const router = Router();

router.get("/", async (req, res) => {
  const publishedOnly = req.query.published === "true";
  const items = await serviceStorage.findAll({ publishedOnly });
  return res.json({ items });
});

router.post("/demo", async (_req, res) => {
  const result = await serviceStorage.seedDemo();

  if (!result.ok) {
    return res.status(409).json({ error: result.error });
  }

  return res.status(201).json({ items: result.items, count: result.items.length });
});

router.delete("/all", async (_req, res) => {
  await serviceStorage.clearAll();
  return res.status(204).send();
});

router.get("/:id", async (req, res) => {
  const item =
    (await serviceStorage.findById(req.params.id)) ??
    (await serviceStorage.findBySlug(req.params.id));

  if (!item) {
    return res.status(404).json({ error: "Service not found" });
  }

  return res.json({ item });
});

router.post("/", async (req, res) => {
  const parsed = serviceSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid service",
      fieldErrors: parsed.error.flatten().fieldErrors,
    });
  }

  const slug = parsed.data.slug || slugify(parsed.data.title);
  const existing = await serviceStorage.findBySlug(slug);
  if (existing) {
    return res.status(409).json({ error: "A service with this slug already exists" });
  }

  const item = await serviceStorage.create({ ...parsed.data, slug });
  return res.status(201).json({ item });
});

router.put("/:id", async (req, res) => {
  const parsed = serviceUpdateSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid service",
      fieldErrors: parsed.error.flatten().fieldErrors,
    });
  }

  if (parsed.data.slug || parsed.data.title) {
    const current = await serviceStorage.findById(req.params.id);
    const slug = parsed.data.slug || (parsed.data.title ? slugify(parsed.data.title) : current?.slug);
    const existing = slug ? await serviceStorage.findBySlug(slug) : null;
    if (existing && existing.id !== req.params.id) {
      return res.status(409).json({ error: "A service with this slug already exists" });
    }
  }

  const item = await serviceStorage.update(req.params.id, parsed.data);
  if (!item) {
    return res.status(404).json({ error: "Service not found" });
  }

  return res.json({ item });
});

router.delete("/:id", async (req, res) => {
  const removed = await serviceStorage.remove(req.params.id);
  if (!removed) {
    return res.status(404).json({ error: "Service not found" });
  }

  return res.status(204).send();
});

export default router;
