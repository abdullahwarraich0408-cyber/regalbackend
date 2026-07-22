import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_FILE = path.join(__dirname, "..", "data", "instagram-cache.json");

const INSTAGRAM_APP_ID = "936619743392459";
const DEFAULT_USERNAME = "regal.knot.events";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const STALE_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days when API is blocked

const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "X-IG-App-ID": INSTAGRAM_APP_ID,
  Accept: "*/*",
  Referer: "https://www.instagram.com/",
  "Accept-Language": "en-GB,en;q=0.9",
};

let cache = loadDiskCache() ?? {
  posts: [],
  username: DEFAULT_USERNAME,
  followerCount: 0,
  fetchedAt: 0,
};

function loadDiskCache() {
  try {
    if (!fs.existsSync(CACHE_FILE)) {
      return null;
    }

    const parsed = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
    if (!Array.isArray(parsed.posts)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function saveDiskCache(nextCache) {
  try {
    fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(nextCache, null, 2));
  } catch (error) {
    console.warn("[instagram] could not persist cache:", error instanceof Error ? error.message : error);
  }
}

function cleanCaption(text = "") {
  return text.replace(/\s+/g, " ").trim();
}

function getBestThumbnail(node) {
  const resources = node.thumbnail_resources;
  if (Array.isArray(resources) && resources.length > 0) {
    const best = [...resources].sort((a, b) => (b.config_width ?? 0) - (a.config_width ?? 0))[0];
    if (best?.src) {
      return best.src;
    }
  }

  if (node.is_video) {
    return node.thumbnail_src ?? node.display_url ?? "";
  }

  return node.display_url ?? node.thumbnail_src ?? "";
}

function isReel(node) {
  return (
    node.product_type === "clips" ||
    node.media_type === 2 ||
    (node.is_video && node.__typename === "GraphVideo")
  );
}

function mapPost(node) {
  const caption = cleanCaption(node.edge_media_to_caption?.edges?.[0]?.node?.text ?? "");
  const shortcode = node.shortcode;
  const sourceImageUrl = getBestThumbnail(node);
  const sourceVideoUrl = node.is_video && node.video_url ? node.video_url : "";
  const video = Boolean(node.is_video);
  const reel = isReel(node);

  return {
    id: node.id,
    shortcode,
    sourceImageUrl,
    sourceVideoUrl,
    caption: caption || (reel ? "Watch reel on Instagram" : "View on Instagram"),
    likes: node.edge_liked_by?.count ?? node.edge_media_preview_like?.count ?? 0,
    url: reel
      ? `https://www.instagram.com/reel/${shortcode}/`
      : `https://www.instagram.com/p/${shortcode}/`,
    isVideo: video,
    isReel: reel,
  };
}

function serializeFeed(feed, { stale = false, error = undefined } = {}) {
  return {
    posts: feed.posts.map((post) => ({
      id: post.id,
      shortcode: post.shortcode,
      imageUrl: `/api/instagram/media/${post.shortcode}`,
      videoUrl: post.sourceVideoUrl ? `/api/instagram/video/${post.shortcode}` : "",
      caption: post.caption,
      likes: post.likes,
      url: post.url,
      isVideo: post.isVideo,
      isReel: post.isReel,
    })),
    username: feed.username,
    followerCount: feed.followerCount,
    fetchedAt: feed.fetchedAt,
    ...(stale ? { stale: true } : {}),
    ...(error ? { error } : {}),
  };
}

function getResolvedUsername(username) {
  return username || process.env.INSTAGRAM_USERNAME || DEFAULT_USERNAME;
}

function isFresh(feed, username, maxAgeMs = CACHE_TTL_MS) {
  return (
    feed.posts.length > 0 &&
    feed.username === username &&
    Date.now() - feed.fetchedAt < maxAgeMs
  );
}

function staleFeedResponse(feed, error) {
  return serializeFeed(feed, { stale: true, error });
}

async function requestInstagramProfile(username) {
  const response = await fetch(
    `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`,
    { headers: FETCH_HEADERS }
  );

  return response;
}

export async function fetchInstagramFeed(username = getResolvedUsername()) {
  const resolvedUsername = getResolvedUsername(username);
  const now = Date.now();

  if (isFresh(cache, resolvedUsername)) {
    return serializeFeed(cache);
  }

  let response;

  try {
    response = await requestInstagramProfile(resolvedUsername);
  } catch (error) {
    if (cache.posts.length > 0 && now - cache.fetchedAt < STALE_CACHE_TTL_MS) {
      return staleFeedResponse(
        cache,
        error instanceof Error ? error.message : "Instagram feed unavailable"
      );
    }

    throw new Error(
      `Instagram feed unavailable. Check your network connection and INSTAGRAM_USERNAME (${resolvedUsername}).`
    );
  }

  if (response.status === 429) {
    if (cache.posts.length > 0) {
      return staleFeedResponse(
        cache,
        "Instagram is rate-limiting requests. Showing cached posts — try again in a few minutes."
      );
    }

    throw new Error(
      `Instagram is rate-limiting requests (429) for @${resolvedUsername}. Wait a few minutes and try again, or add images with Select image / URL.`
    );
  }

  if (!response.ok) {
    if (cache.posts.length > 0 && now - cache.fetchedAt < STALE_CACHE_TTL_MS) {
      return staleFeedResponse(cache, `Instagram feed unavailable (${response.status})`);
    }

    throw new Error(
      `Instagram feed unavailable (${response.status}) for @${resolvedUsername}. Check INSTAGRAM_USERNAME in backend/.env.`
    );
  }

  const data = await response.json();
  const user = data?.data?.user;

  if (!user) {
    throw new Error(`Instagram profile @${resolvedUsername} not found. Check INSTAGRAM_USERNAME in backend/.env.`);
  }

  const edges = user.edge_owner_to_timeline_media?.edges ?? [];
  const posts = edges
    .map(({ node }) => mapPost(node))
    .filter((post) => post.sourceImageUrl)
    .slice(0, 12);

  cache = {
    posts,
    username: user.username ?? resolvedUsername,
    followerCount: user.edge_followed_by?.count ?? 0,
    fetchedAt: now,
  };

  saveDiskCache(cache);

  return serializeFeed(cache);
}

export function getCachedInstagramFeed() {
  if (cache.posts.length > 0) {
    return serializeFeed(cache);
  }

  const diskCache = loadDiskCache();
  if (diskCache?.posts?.length) {
    cache = diskCache;
    return serializeFeed(cache);
  }

  return {
    posts: [],
    username: getResolvedUsername(),
    followerCount: 0,
    fetchedAt: 0,
  };
}

export function getPostByShortcode(shortcode) {
  return cache.posts.find((post) => post.shortcode === shortcode) ?? null;
}

export async function fetchInstagramMedia(sourceUrl) {
  const response = await fetch(sourceUrl, { headers: FETCH_HEADERS });

  if (!response.ok) {
    throw new Error(`Media unavailable (${response.status})`);
  }

  const contentType = response.headers.get("content-type") ?? "image/jpeg";
  const buffer = Buffer.from(await response.arrayBuffer());

  return { buffer, contentType };
}
