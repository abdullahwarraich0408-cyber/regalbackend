import { Router } from "express";
import {
  fetchInstagramFeed,
  fetchInstagramMedia,
  getCachedInstagramFeed,
  getPostByShortcode,
} from "../services/instagram-feed.js";

const router = Router();

router.get("/feed", async (_req, res) => {
  try {
    const feed = await fetchInstagramFeed();
    return res.json(feed);
  } catch (error) {
    const cached = getCachedInstagramFeed();

    if (cached.posts.length > 0) {
      return res.json({
        ...cached,
        stale: true,
        error: error instanceof Error ? error.message : "Instagram feed unavailable",
      });
    }

    return res.status(503).json({
      error: error instanceof Error ? error.message : "Instagram feed unavailable",
      posts: [],
    });
  }
});

router.get("/media/:shortcode", async (req, res) => {
  try {
    if (getPostByShortcode(req.params.shortcode) === null) {
      await fetchInstagramFeed();
    }

    const post = getPostByShortcode(req.params.shortcode);
    if (!post?.sourceImageUrl) {
      return res.status(404).json({ error: "Media not found" });
    }

    const { buffer, contentType } = await fetchInstagramMedia(post.sourceImageUrl);

    res.set("Content-Type", contentType);
    res.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
    return res.send(buffer);
  } catch (error) {
    return res.status(502).json({
      error: error instanceof Error ? error.message : "Could not load Instagram media",
    });
  }
});

router.get("/video/:shortcode", async (req, res) => {
  try {
    if (getPostByShortcode(req.params.shortcode) === null) {
      await fetchInstagramFeed();
    }

    const post = getPostByShortcode(req.params.shortcode);
    if (!post?.sourceVideoUrl) {
      return res.status(404).json({ error: "Video not found" });
    }

    const { buffer, contentType } = await fetchInstagramMedia(post.sourceVideoUrl);

    res.set("Content-Type", contentType.includes("video") ? contentType : "video/mp4");
    res.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
    res.set("Accept-Ranges", "bytes");
    return res.send(buffer);
  } catch (error) {
    return res.status(502).json({
      error: error instanceof Error ? error.message : "Could not load Instagram video",
    });
  }
});

export default router;
