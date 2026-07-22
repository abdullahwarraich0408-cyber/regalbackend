import { pool } from "../db/pool.js";
import { inputToColumns, rowToTestimonial } from "../db/testimonial-mapper.js";
import { demoTestimonials } from "../data/demo-testimonials.js";

class TestimonialStorage {
  sortItems(items) {
    return [...items].sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }
      return a.name.localeCompare(b.name);
    });
  }

  async findAll({ publishedOnly = false } = {}) {
    const query = publishedOnly
      ? "SELECT * FROM testimonials WHERE published = 1 ORDER BY sort_order ASC, created_at DESC"
      : "SELECT * FROM testimonials ORDER BY sort_order ASC, created_at DESC";

    const [rows] = await pool.query(query);
    return this.sortItems(rows.map(rowToTestimonial));
  }

  async findById(id) {
    const [rows] = await pool.query("SELECT * FROM testimonials WHERE id = ?", [id]);
    return rows[0] ? rowToTestimonial(rows[0]) : null;
  }

  async create(input) {
    const id = crypto.randomUUID();
    const columns = inputToColumns(input);

    await pool.execute(
      `INSERT INTO testimonials (id, quote, name, event, rating, source, published, sort_order)
       VALUES (:id, :quote, :name, :event, :rating, :source, :published, :sort_order)`,
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
      quote: input.quote ?? current.quote,
      name: input.name ?? current.name,
      event: input.event ?? current.event,
      rating: input.rating ?? current.rating,
      source: input.source ?? current.source,
      published: input.published ?? current.published,
      sortOrder: input.sortOrder ?? current.sortOrder,
    };

    const columns = inputToColumns(merged);

    await pool.execute(
      `UPDATE testimonials
       SET quote = :quote, name = :name, event = :event, rating = :rating,
           source = :source, published = :published, sort_order = :sort_order
       WHERE id = :id`,
      { id, ...columns }
    );

    return this.findById(id);
  }

  async remove(id) {
    const [result] = await pool.execute("DELETE FROM testimonials WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  async clearAll() {
    await pool.query("DELETE FROM testimonials");
    return true;
  }

  async seedDemo() {
    const existing = await this.findAll();
    if (existing.length > 0) {
      return {
        ok: false,
        error: "Testimonials already exist. Clear them first to load demo data.",
      };
    }

    const created = [];
    for (const item of demoTestimonials) {
      created.push(await this.create(item));
    }

    return { ok: true, items: created };
  }
}

export const testimonialStorage = new TestimonialStorage();
