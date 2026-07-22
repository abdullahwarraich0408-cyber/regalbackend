import { Router } from "express";
import { portfolioSchema, portfolioUpdateSchema } from "../validators/portfolio-schema.js";
import { portfolioStorage } from "../storage/portfolio-storage.js";
import { importPortfolioFromInstagram } from "../services/portfolio-import.js";

const router = Router();

router.get("/", async (req, res) => {
  const publishedOnly = req.query.published === "true";
  const items = await portfolioStorage.findAll({ publishedOnly });
  return res.json({ items });
});

router.post("/demo", async (_req, res) => {
  const result = await portfolioStorage.seedDemo();

  if (!result.ok) {
    return res.status(409).json({ error: result.error });
  }

  return res.status(201).json({ items: result.items, count: result.items.length });
});

router.delete("/all", async (_req, res) => {
  await portfolioStorage.clearAll();
  return res.status(204).send();
});

router.post("/import-instagram", async (req, res) => {
  const limit = Number(req.body?.limit) || 6;
  const result = await importPortfolioFromInstagram({ limit });

  if (!result.ok) {
    return res.status(result.error?.includes("unavailable") ? 503 : 409).json({
      error: result.error,
    });
  }

  return res.status(201).json({ items: result.items, count: result.count });
});

router.get("/:id", async (req, res) => {
  const item =
    (await portfolioStorage.findById(req.params.id)) ??
    (await portfolioStorage.findBySlug(req.params.id));
  if (!item) {
    return res.status(404).json({ error: "Portfolio item not found" });
  }
  return res.json({ item });
});

router.post("/", async (req, res) => {
  const parsed = portfolioSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid portfolio item",
      fieldErrors: parsed.error.flatten().fieldErrors,
    });
  }

  const item = await portfolioStorage.create(parsed.data);
  return res.status(201).json({ item });
});

router.put("/:id", async (req, res) => {
  const parsed = portfolioUpdateSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid portfolio item",
      fieldErrors: parsed.error.flatten().fieldErrors,
    });
  }

  const item = await portfolioStorage.update(req.params.id, parsed.data);
  if (!item) {
    return res.status(404).json({ error: "Portfolio item not found" });
  }

  return res.json({ item });
});

router.delete("/:id", async (req, res) => {
  const removed = await portfolioStorage.remove(req.params.id);
  if (!removed) {
    return res.status(404).json({ error: "Portfolio item not found" });
  }

  return res.status(204).send();
});

export default router;
