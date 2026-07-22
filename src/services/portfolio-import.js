import { fetchInstagramFeed, getCachedInstagramFeed } from "../services/instagram-feed.js";
import { portfolioStorage } from "../storage/portfolio-storage.js";

function guessCategory(caption = "") {
  const lower = caption.toLowerCase();
  if (lower.includes("wedding") || lower.includes("bride") || lower.includes("groom")) {
    return "Weddings";
  }
  if (lower.includes("corporate") || lower.includes("brand") || lower.includes("awards")) {
    return "Corporate";
  }
  return "Private Events";
}

function titleFromCaption(caption = "", index = 0) {
  const firstLine = caption.split(/[\n#]/)[0].replace(/\s+/g, " ").trim();
  if (firstLine.length >= 8 && firstLine.length <= 160) {
    return firstLine;
  }
  return `Regal Knot event styling ${index + 1}`;
}

function extractShortcode(instagramUrl = "") {
  const match = instagramUrl.match(/\/(p|reel)\/([^/?#]+)/);
  return match?.[2] ?? "";
}

export async function importPortfolioFromInstagram({ limit = 6 } = {}) {
  let feed;

  let feedError = null;

  try {
    feed = await fetchInstagramFeed();
    feedError = feed.error ?? null;
  } catch (error) {
    feedError = error instanceof Error ? error.message : "Instagram feed unavailable.";
    feed = getCachedInstagramFeed();
  }

  if (!feed.posts?.length) {
    const username = process.env.INSTAGRAM_USERNAME || "regal.knot.events";
    return {
      ok: false,
      error:
        feedError ??
        `Instagram feed unavailable for @${username}. Instagram may be rate-limiting — wait a few minutes, confirm INSTAGRAM_USERNAME in backend/.env, or add images with Select image / URL.`,
    };
  }

  const existing = await portfolioStorage.findAll();
  const existingUrls = new Set(existing.map((item) => item.instagramUrl).filter(Boolean));
  const existingShortcodes = new Set(
    existing.map((item) => extractShortcode(item.instagramUrl)).filter(Boolean),
  );

  const max = Math.min(Math.max(limit, 1), 12);
  const created = [];

  for (const post of feed.posts.slice(0, max)) {
    if (existingUrls.has(post.url) || existingShortcodes.has(post.shortcode)) {
      continue;
    }

    const item = await portfolioStorage.create({
      title: titleFromCaption(post.caption, created.length),
      category: guessCategory(post.caption),
      imageUrl: `/api/instagram/media/${post.shortcode}`,
      gallery: [],
      clientName: "",
      description: (post.caption || "Styled by Regal Knot Events").slice(0, 500),
      highlights: [],
      instagramUrl: post.url,
      published: true,
      sortOrder: existing.length + created.length + 1,
    });

    created.push(item);
    existingUrls.add(post.url);
    existingShortcodes.add(post.shortcode);
  }

  if (created.length === 0) {
    return { ok: false, error: "No new Instagram posts to import (already in portfolio)." };
  }

  return { ok: true, items: created, count: created.length };
}
