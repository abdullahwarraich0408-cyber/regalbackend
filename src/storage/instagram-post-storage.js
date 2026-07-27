import { pool } from "../db/pool.js";
import {
  inputToColumns,
  rowToInstagramPost,
  toFeedPost,
} from "../db/instagram-post-mapper.js";
import { demoInstagramPosts } from "../data/demo-instagram-posts.js";

function extractShortcode(postUrl = "") {
  const match = postUrl.match(/\/(p|reel)\/([^/?#]+)/);
  return match?.[2] ?? "";
}

class InstagramPostStorage {
  sortItems(items) {
    return [...items].sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }
      return a.id.localeCompare(b.id);
    });
  }

  async findAll({ publishedOnly = false } = {}) {
    const query = publishedOnly
      ? "SELECT * FROM instagram_posts WHERE published = 1 ORDER BY sort_order ASC, created_at DESC"
      : "SELECT * FROM instagram_posts ORDER BY sort_order ASC, created_at DESC";

    const [rows] = await pool.query(query);
    return this.sortItems(rows.map(rowToInstagramPost));
  }

  async findById(id) {
    const [rows] = await pool.query("SELECT * FROM instagram_posts WHERE id = ?", [id]);
    return rows[0] ? rowToInstagramPost(rows[0]) : null;
  }

  async create(input) {
    const id = crypto.randomUUID();
    const next = { ...input };

    if (!next.shortcode && next.postUrl) {
      next.shortcode = extractShortcode(next.postUrl);
    }
    if (!next.shortcode) {
      next.shortcode = id.replace(/-/g, "").slice(0, 12);
    }

    const columns = inputToColumns(next);

    await pool.execute(
      `INSERT INTO instagram_posts (
        id, caption, image_url, video_url, post_url, shortcode,
        likes, is_video, is_reel, published, sort_order
      ) VALUES (
        :id, :caption, :image_url, :video_url, :post_url, :shortcode,
        :likes, :is_video, :is_reel, :published, :sort_order
      )`,
      { id, ...columns }
    );

    return this.findById(id);
  }

  async update(id, input) {
    const current = await this.findById(id);
    if (!current) {
      return null;
    }

    const merged = {
      caption: input.caption ?? current.caption,
      imageUrl: input.imageUrl ?? current.imageUrl,
      videoUrl: input.videoUrl ?? current.videoUrl,
      postUrl: input.postUrl ?? current.postUrl,
      shortcode: input.shortcode ?? current.shortcode,
      likes: input.likes ?? current.likes,
      isVideo: input.isVideo ?? current.isVideo,
      isReel: input.isReel ?? current.isReel,
      published: input.published ?? current.published,
      sortOrder: input.sortOrder ?? current.sortOrder,
    };

    if (!merged.shortcode && merged.postUrl) {
      merged.shortcode = extractShortcode(merged.postUrl);
    }

    const columns = inputToColumns(merged);

    await pool.execute(
      `UPDATE instagram_posts
       SET caption = :caption, image_url = :image_url, video_url = :video_url,
           post_url = :post_url, shortcode = :shortcode, likes = :likes,
           is_video = :is_video, is_reel = :is_reel, published = :published,
           sort_order = :sort_order
       WHERE id = :id`,
      { id, ...columns }
    );

    return this.findById(id);
  }

  async remove(id) {
    const [result] = await pool.execute("DELETE FROM instagram_posts WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  async clearAll() {
    await pool.query("DELETE FROM instagram_posts");
    return true;
  }

  async seedDemo() {
    await this.clearAll();

    const created = [];
    for (const item of demoInstagramPosts) {
      created.push(await this.create(item));
    }

    return { ok: true, items: created };
  }

  async toFeedResponse() {
    const items = await this.findAll({ publishedOnly: true });
    const username = process.env.INSTAGRAM_USERNAME || "regal.knot.events";
    const followerCount = Number(process.env.INSTAGRAM_FOLLOWER_COUNT || 2840);

    return {
      posts: items.map(toFeedPost),
      username,
      followerCount,
      fetchedAt: Date.now(),
      source: "manual",
    };
  }
}

export const instagramPostStorage = new InstagramPostStorage();
