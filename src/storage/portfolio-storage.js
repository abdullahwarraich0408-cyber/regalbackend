import { pool } from "../db/pool.js";
import { demoPortfolioItems } from "../data/seed-portfolio.js";
import { inputToColumns, rowToPortfolio } from "../db/portfolio-mapper.js";

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

class PortfolioStorage {
  sortItems(items) {
    return [...items].sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async findAll({ publishedOnly = false } = {}) {
    const query = publishedOnly
      ? "SELECT * FROM portfolio WHERE published = 1 ORDER BY sort_order ASC, created_at DESC"
      : "SELECT * FROM portfolio ORDER BY sort_order ASC, created_at DESC";

    const [rows] = await pool.query(query);
    return this.sortItems(rows.map(rowToPortfolio));
  }

  async findById(id) {
    const [rows] = await pool.query("SELECT * FROM portfolio WHERE id = ?", [id]);
    return rows[0] ? rowToPortfolio(rows[0]) : null;
  }

  async findBySlug(slug) {
    const [rows] = await pool.query("SELECT * FROM portfolio WHERE slug = ? LIMIT 1", [slug]);
    return rows[0] ? rowToPortfolio(rows[0]) : null;
  }

  async create(input) {
    const id = crypto.randomUUID();
    const slug = input.slug || slugify(input.title);
    const columns = inputToColumns({ ...input, slug });

    await pool.execute(
      `INSERT INTO portfolio (
        id, slug, title, category, cover_image_url, gallery, videos, client_name,
        description, highlights, instagram_url, palette, published, sort_order
      ) VALUES (
        :id, :slug, :title, :category, :cover_image_url, :gallery, :videos, :client_name,
        :description, :highlights, :instagram_url, :palette, :published, :sort_order
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
      slug: input.slug ?? current.slug,
      title: input.title ?? current.title,
      category: input.category ?? current.category,
      imageUrl: input.imageUrl ?? current.imageUrl,
      gallery: input.gallery ?? current.gallery,
      videos: input.videos ?? current.videos,
      clientName: input.clientName ?? current.clientName,
      description: input.description ?? current.description,
      highlights: input.highlights ?? current.highlights,
      instagramUrl: input.instagramUrl ?? current.instagramUrl,
      palette: input.palette ?? current.palette,
      published: input.published ?? current.published,
      sortOrder: input.sortOrder ?? current.sortOrder,
    };

    const columns = inputToColumns(merged);

    await pool.execute(
      `UPDATE portfolio
       SET slug = :slug, title = :title, category = :category,
           cover_image_url = :cover_image_url, gallery = :gallery, videos = :videos,
           client_name = :client_name, description = :description,
           highlights = :highlights, instagram_url = :instagram_url,
           palette = :palette, published = :published, sort_order = :sort_order
       WHERE id = :id`,
      { id, ...columns }
    );

    return this.findById(id);
  }

  async remove(id) {
    const [result] = await pool.execute("DELETE FROM portfolio WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  async clearAll() {
    await pool.query("DELETE FROM portfolio");
    return true;
  }

  async seedDemo() {
    const existing = await this.findAll();
    if (existing.length > 0) {
      return {
        ok: false,
        error: "Portfolio already has items. Clear them first to load demo data.",
      };
    }

    const created = [];
    for (const item of demoPortfolioItems) {
      created.push(await this.create(item));
    }

    return { ok: true, items: created };
  }
}

export const portfolioStorage = new PortfolioStorage();
