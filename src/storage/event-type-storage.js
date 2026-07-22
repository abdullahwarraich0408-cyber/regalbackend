import { pool } from "../db/pool.js";
import { demoEventTypes } from "../data/demo-event-types.js";
import { inputToColumns, rowToEventType } from "../db/event-type-mapper.js";

class EventTypeStorage {
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
      ? "SELECT * FROM event_types WHERE published = 1 ORDER BY sort_order ASC, name ASC"
      : "SELECT * FROM event_types ORDER BY sort_order ASC, name ASC";

    const [rows] = await pool.query(query);
    return this.sortItems(rows.map(rowToEventType));
  }

  async findById(id) {
    const [rows] = await pool.query("SELECT * FROM event_types WHERE id = ?", [id]);
    return rows[0] ? rowToEventType(rows[0]) : null;
  }

  async findByName(name) {
    const [rows] = await pool.query(
      "SELECT * FROM event_types WHERE name = ? LIMIT 1",
      [name]
    );
    return rows[0] ? rowToEventType(rows[0]) : null;
  }

  async create(input) {
    const id = crypto.randomUUID();
    const columns = inputToColumns(input);

    await pool.execute(
      `INSERT INTO event_types (id, name, icon, published, sort_order)
       VALUES (:id, :name, :icon, :published, :sort_order)`,
      { id, ...columns }
    );

    return this.findById(id);
  }

  async update(id, input) {
    const current = await this.findById(id);
    if (!current) {
      return null;
    }

    const columns = inputToColumns({ ...current, ...input });

    await pool.execute(
      `UPDATE event_types
       SET name = :name, icon = :icon, published = :published, sort_order = :sort_order
       WHERE id = :id`,
      { id, ...columns }
    );

    return this.findById(id);
  }

  async remove(id) {
    const [result] = await pool.execute("DELETE FROM event_types WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  async clearAll() {
    await pool.query("DELETE FROM event_types");
    return true;
  }

  async seedDemo() {
    const existing = await this.findAll();
    if (existing.length > 0) {
      return {
        ok: false,
        error: "Event types already exist. Clear them first to load demo data.",
      };
    }

    const created = [];
    for (const item of demoEventTypes) {
      created.push(await this.create(item));
    }

    return { ok: true, items: created };
  }
}

export const eventTypeStorage = new EventTypeStorage();
