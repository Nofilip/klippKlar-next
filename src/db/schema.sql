PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS salons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  public_phone TEXT,
  elks_number TEXT UNIQUE,
  forward_to_number TEXT,
  phone_enabled INTEGER NOT NULL DEFAULT 0,
  calendar_id TEXT
);

INSERT OR IGNORE INTO salons (
  id,
  name,
  slug,
  public_phone,
  phone_enabled
) VALUES (
  1,
  'Demo Salong',
  'demo-salong',
  NULL,
  0
);

CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  salon_id INTEGER NOT NULL DEFAULT 1,
  name TEXT NOT NULL,
  duration_min INTEGER NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY(salon_id) REFERENCES salons(id)
);

CREATE TABLE IF NOT EXISTS opening_hours (
  salon_id INTEGER NOT NULL DEFAULT 1,
  day_of_week INTEGER NOT NULL,
  is_open INTEGER NOT NULL DEFAULT 0,
  start_time TEXT,
  end_time TEXT,
  PRIMARY KEY (salon_id, day_of_week),
  FOREIGN KEY(salon_id) REFERENCES salons(id)
);

INSERT OR IGNORE INTO opening_hours (
  salon_id,
  day_of_week,
  is_open,
  start_time,
  end_time
) VALUES
  (1, 0, 0, NULL, NULL),
  (1, 1, 0, NULL, NULL),
  (1, 2, 0, NULL, NULL),
  (1, 3, 0, NULL, NULL),
  (1, 4, 0, NULL, NULL),
  (1, 5, 0, NULL, NULL),
  (1, 6, 0, NULL, NULL);

CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  salon_id INTEGER NOT NULL DEFAULT 1,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  service_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'booked',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(salon_id) REFERENCES salons(id),
  FOREIGN KEY(service_id) REFERENCES services(id)
);

CREATE INDEX IF NOT EXISTS idx_appointments_salon_date 
ON appointments(salon_id, date);

-- Stoppa bokningar på stängda dagar (Mon=0..Sun=6)
CREATE TRIGGER IF NOT EXISTS prevent_appointments_on_closed_days_insert
BEFORE INSERT ON appointments
BEGIN
  SELECT
    CASE
      WHEN (
        SELECT is_open
        FROM opening_hours
        WHERE salon_id = NEW.salon_id
        AND day_of_week = ((CAST(strftime('%w', NEW.date) AS INTEGER) + 6) % 7)
      ) = 0
      THEN RAISE(ABORT, 'Cannot create appointment on a closed day')
    END;
END;

CREATE TRIGGER IF NOT EXISTS prevent_appointments_on_closed_days_update
BEFORE UPDATE OF date ON appointments
BEGIN
  SELECT
    CASE
      WHEN (
        SELECT is_open
        FROM opening_hours
        WHERE day_of_week = ((CAST(strftime('%w', NEW.date) AS INTEGER) + 6) % 7)
      ) = 0
      THEN RAISE(ABORT, 'Cannot move appointment to a closed day')
    END;
END;

