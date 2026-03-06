PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  duration_min INTEGER NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS opening_hours (
  day_of_week INTEGER PRIMARY KEY, -- 0..6
  is_open INTEGER NOT NULL DEFAULT 0,
  start_time TEXT,
  end_time TEXT
);

CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL, -- "YYYY-MM-DD"
  time TEXT NOT NULL, -- "HH:MM"
  service_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'booked',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(service_id) REFERENCES services(id)
);

CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);

-- Stoppa bokningar på stängda dagar (Mon=0..Sun=6)
CREATE TRIGGER IF NOT EXISTS prevent_appointments_on_closed_days_insert
BEFORE INSERT ON appointments
BEGIN
  SELECT
    CASE
      WHEN (
        SELECT is_open
        FROM opening_hours
        WHERE day_of_week = ((CAST(strftime('%w', NEW.date) AS INTEGER) + 6) % 7)
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