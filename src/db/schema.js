import { pool } from "./pool.js";

const createBookingsTable = `
  CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(36) PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('new', 'contacted', 'quoted', 'confirmed', 'declined') NOT NULL DEFAULT 'new',
    event_type VARCHAR(80) NOT NULL,
    preferred_date VARCHAR(32) NOT NULL,
    alternative_date VARCHAR(32) NOT NULL DEFAULT '',
    event_location VARCHAR(160) NOT NULL,
    area VARCHAR(120) NOT NULL DEFAULT '',
    guest_count VARCHAR(20) NOT NULL DEFAULT '',
    venue_type VARCHAR(20) NULL,
    setup_time VARCHAR(120) NOT NULL DEFAULT '',
    theme VARCHAR(200) NOT NULL DEFAULT '',
    services_needed JSON NOT NULL,
    budget_range VARCHAR(40) NULL,
    inspiration_notes TEXT NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(200) NOT NULL DEFAULT '',
    phone VARCHAR(40) NOT NULL DEFAULT '',
    preferred_contact_method VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    consent TINYINT(1) NOT NULL DEFAULT 1,
    INDEX idx_bookings_status (status),
    INDEX idx_bookings_created_at (created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

const createEventTypesTable = `
  CREATE TABLE IF NOT EXISTS event_types (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE,
    icon VARCHAR(40) NOT NULL DEFAULT 'sparkles',
    published TINYINT(1) NOT NULL DEFAULT 1,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_event_types_published (published),
    INDEX idx_event_types_sort_order (sort_order)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

const createServicesTable = `
  CREATE TABLE IF NOT EXISTS services (
    id VARCHAR(36) PRIMARY KEY,
    slug VARCHAR(80) NOT NULL UNIQUE,
    title VARCHAR(120) NOT NULL,
    icon VARCHAR(40) NOT NULL DEFAULT 'sparkles',
    best_for VARCHAR(120) NOT NULL,
    short_description TEXT NOT NULL,
    long_description TEXT NOT NULL,
    highlights JSON NOT NULL,
    published TINYINT(1) NOT NULL DEFAULT 1,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_services_published (published),
    INDEX idx_services_sort_order (sort_order)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

const createPortfolioTable = `
  CREATE TABLE IF NOT EXISTS portfolio (
    id VARCHAR(36) PRIMARY KEY,
    slug VARCHAR(120) NOT NULL UNIQUE,
    title VARCHAR(160) NOT NULL,
    category ENUM('Weddings', 'Private Events', 'Corporate') NOT NULL,
    cover_image_url TEXT NOT NULL,
    gallery JSON NOT NULL,
    client_name VARCHAR(120) NOT NULL DEFAULT '',
    description TEXT NOT NULL,
    highlights JSON NOT NULL,
    instagram_url TEXT NOT NULL,
    palette JSON NOT NULL,
    published TINYINT(1) NOT NULL DEFAULT 1,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_portfolio_published (published),
    INDEX idx_portfolio_category (category),
    INDEX idx_portfolio_sort_order (sort_order)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

const createTestimonialsTable = `
  CREATE TABLE IF NOT EXISTS testimonials (
    id VARCHAR(36) PRIMARY KEY,
    quote TEXT NOT NULL,
    name VARCHAR(120) NOT NULL,
    event VARCHAR(120) NOT NULL,
    rating TINYINT NOT NULL DEFAULT 5,
    source ENUM('client', 'google') NOT NULL DEFAULT 'client',
    published TINYINT(1) NOT NULL DEFAULT 1,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_testimonials_published (published),
    INDEX idx_testimonials_sort_order (sort_order)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

const createEnquiriesTable = `
  CREATE TABLE IF NOT EXISTS enquiries (
    id VARCHAR(36) PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    phone VARCHAR(40) NOT NULL,
    event_type VARCHAR(80) NOT NULL,
    event_date VARCHAR(32) NOT NULL,
    source VARCHAR(40) NOT NULL DEFAULT 'website',
    status ENUM('new', 'contacted', 'converted', 'declined') NOT NULL DEFAULT 'new',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_enquiries_status (status),
    INDEX idx_enquiries_created_at (created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

export async function initDatabase() {
  const connection = await pool.getConnection();

  try {
    await connection.query(createBookingsTable);
    await connection.query(createEventTypesTable);
    await connection.query(createServicesTable);
    await connection.query(createPortfolioTable);
    await connection.query(createTestimonialsTable);
    await connection.query(createEnquiriesTable);
    console.info("[db] bookings table ready");
    console.info("[db] event_types table ready");
    console.info("[db] services table ready");
    console.info("[db] portfolio table ready");
    console.info("[db] testimonials table ready");
    console.info("[db] enquiries table ready");
  } finally {
    connection.release();
  }
}

export async function verifyDatabaseConnection() {
  const connection = await pool.getConnection();

  try {
    await connection.ping();
  } finally {
    connection.release();
  }
}
