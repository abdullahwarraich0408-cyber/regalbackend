import { pool } from "../db/pool.js";

class EnquiryStorage {
  async findAll() {
    const [rows] = await pool.query(
      "SELECT * FROM enquiries ORDER BY created_at DESC"
    );
    return rows.map(rowToEnquiry);
  }

  async findById(id) {
    const [rows] = await pool.query("SELECT * FROM enquiries WHERE id = ?", [id]);
    return rows[0] ? rowToEnquiry(rows[0]) : null;
  }

  async create(input) {
    const id = crypto.randomUUID();

    await pool.execute(
      `INSERT INTO enquiries (id, full_name, phone, event_type, event_date, source, status)
       VALUES (:id, :full_name, :phone, :event_type, :event_date, :source, 'new')`,
      {
        id,
        full_name: input.fullName,
        phone: input.phone,
        event_type: input.eventType,
        event_date: input.eventDate,
        source: input.source ?? "website",
      }
    );

    return this.findById(id);
  }

  async updateStatus(id, status) {
    const [result] = await pool.execute(
      "UPDATE enquiries SET status = ? WHERE id = ?",
      [status, id]
    );
    if (result.affectedRows === 0) {
      return null;
    }
    return this.findById(id);
  }
}

function rowToEnquiry(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    eventType: row.event_type,
    eventDate: row.event_date,
    source: row.source,
    status: row.status,
    createdAt: row.created_at?.toISOString?.() ?? row.created_at,
    updatedAt: row.updated_at?.toISOString?.() ?? row.updated_at,
  };
}

export const enquiryStorage = new EnquiryStorage();
