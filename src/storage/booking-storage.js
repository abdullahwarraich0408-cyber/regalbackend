import { pool } from "../db/pool.js";
import { inputToColumns, rowToBooking } from "../db/booking-mapper.js";

class MySqlBookingStorage {
  async create(input) {
    const id = crypto.randomUUID();
    const columns = inputToColumns(input);

    await pool.execute(
      `INSERT INTO bookings (
        id, status, event_type, preferred_date, alternative_date, event_location,
        area, guest_count, venue_type, setup_time, theme, services_needed,
        budget_range, inspiration_notes, full_name, email, phone,
        preferred_contact_method, message, consent
      ) VALUES (
        :id, 'new', :event_type, :preferred_date, :alternative_date, :event_location,
        :area, :guest_count, :venue_type, :setup_time, :theme, :services_needed,
        :budget_range, :inspiration_notes, :full_name, :email, :phone,
        :preferred_contact_method, :message, :consent
      )`,
      { id, ...columns }
    );

    const record = await this.findById(id);
    console.info("[bookings] saved to mysql", {
      id: record.id,
      eventType: record.eventType,
      preferredDate: record.preferredDate,
    });

    return record;
  }

  async findAll() {
    const [rows] = await pool.query(
      "SELECT * FROM bookings ORDER BY created_at DESC"
    );

    return rows.map(rowToBooking);
  }

  async findById(id) {
    const [rows] = await pool.query("SELECT * FROM bookings WHERE id = ?", [id]);
    return rows[0] ? rowToBooking(rows[0]) : null;
  }

  async updateStatus(id, status) {
    const [result] = await pool.execute(
      "UPDATE bookings SET status = :status WHERE id = :id",
      { id, status }
    );

    if (result.affectedRows === 0) {
      return null;
    }

    return this.findById(id);
  }
}

export const bookingStorage = new MySqlBookingStorage();
