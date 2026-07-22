import { pool } from "../db/pool.js";
import { demoServices } from "../data/demo-services.js";
import { inputToColumns, rowToService } from "../db/service-mapper.js";
import { slugify } from "../validators/service-schema.js";

class ServiceStorage {
  sortItems(items) {
    return [...items].sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }
      return a.title.localeCompare(b.title);
    });
  }

  async findAll({ publishedOnly = false } = {}) {
    const query = publishedOnly
      ? "SELECT * FROM services WHERE published = 1 ORDER BY sort_order ASC, title ASC"
      : "SELECT * FROM services ORDER BY sort_order ASC, title ASC";

    const [rows] = await pool.query(query);
    return this.sortItems(rows.map(rowToService));
  }

  async findById(id) {
    const [rows] = await pool.query("SELECT * FROM services WHERE id = ?", [id]);
    return rows[0] ? rowToService(rows[0]) : null;
  }

  async findBySlug(slug) {
    const [rows] = await pool.query("SELECT * FROM services WHERE slug = ? LIMIT 1", [
      slug,
    ]);
    return rows[0] ? rowToService(rows[0]) : null;
  }

  async create(input) {
    const id = crypto.randomUUID();
    const slug = input.slug || slugify(input.title);
    const columns = inputToColumns({ ...input, slug });

    await pool.execute(
      `INSERT INTO services (
        id, slug, title, icon, best_for, short_description, long_description,
        highlights, published, sort_order
      ) VALUES (
        :id, :slug, :title, :icon, :best_for, :short_description, :long_description,
        :highlights, :published, :sort_order
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
      icon: input.icon ?? current.icon,
      bestFor: input.bestFor ?? current.bestFor,
      shortDescription: input.shortDescription ?? current.short,
      longDescription: input.longDescription ?? current.long,
      highlights: input.highlights ?? current.highlights,
      published: input.published ?? current.published,
      sortOrder: input.sortOrder ?? current.sortOrder,
    };

    const columns = inputToColumns(merged);

    await pool.execute(
      `UPDATE services
       SET slug = :slug, title = :title, icon = :icon, best_for = :best_for,
           short_description = :short_description, long_description = :long_description,
           highlights = :highlights, published = :published, sort_order = :sort_order
       WHERE id = :id`,
      { id, ...columns }
    );

    return this.findById(id);
  }

  async remove(id) {
    const [result] = await pool.execute("DELETE FROM services WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  async clearAll() {
    await pool.query("DELETE FROM services");
    return true;
  }

  async seedDemo() {
    const existing = await this.findAll();
    if (existing.length > 0) {
      return {
        ok: false,
        error: "Services already exist. Clear them first to load demo data.",
      };
    }

    const created = [];
    for (const item of demoServices) {
      created.push(await this.create(item));
    }

    return { ok: true, items: created };
  }
}

export const serviceStorage = new ServiceStorage();
