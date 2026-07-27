import { Router } from "express";
import {
  instagramPostSchema,
  instagramPostUpdateSchema,
} from "../validators/instagram-post-schema.js";
import { instagramPostStorage } from "../storage/instagram-post-storage.js";

const router = Router();

router.get("/", async (req, res) => {
  const publishedOnly = req.query.published === "true";
  const items = await instagramPostStorage.findAll({ publishedOnly });
  return res.json({ items });
});

router.post("/demo", async (_req, res) => {
  const result = await instagramPostStorage.seedDemo();

  if (!result.ok) {
    return res.status(409).json({ error: result.error });
  }

  return res.status(201).json({ items: result.items, count: result.items.length });
});

router.delete("/all", async (_req, res) => {
  await instagramPostStorage.clearAll();
  return res.status(204).send();
});

router.get("/:id", async (req, res) => {
  const item = await instagramPostStorage.findById(req.params.id);
  if (!item) {
    return res.status(404).json({ error: "Instagram post not found" });
  }
  return res.json({ item });
});

router.post("/", async (req, res) => {
  const parsed = instagramPostSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid Instagram post",
      fieldErrors: parsed.error.flatten().fieldErrors,
    });
  }

  const item = await instagramPostStorage.create(parsed.data);
  return res.status(201).json({ item });
});

router.put("/:id", async (req, res) => {
  const parsed = instagramPostUpdateSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid Instagram post",
      fieldErrors: parsed.error.flatten().fieldErrors,
    });
  }

  const item = await instagramPostStorage.update(req.params.id, parsed.data);
  if (!item) {
    return res.status(404).json({ error: "Instagram post not found" });
  }

  return res.json({ item });
});

router.delete("/:id", async (req, res) => {
  const removed = await instagramPostStorage.remove(req.params.id);
  if (!removed) {
    return res.status(404).json({ error: "Instagram post not found" });
  }

  return res.status(204).send();
});

export default router;
