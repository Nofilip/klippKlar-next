export type Service = {
  id: number;
  name_public: string;
  duration_min: number;
  is_active: boolean;
  created_at: string;
}

export type ServiceInput = Pick<Service, "name_public" | "duration_min" | "is_active">;

export type ServiceDraft = ServiceInput & {
  id: number;
  created_at?: string; // kan saknas innan DB skapar den, därav "(?)"
};

export type Booking = {
  id: number;
  date: string;   // "YYYY-MM-DD"
  time: string;   // "10:00"
  customer: string;
  service: string;
};

export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type DayHours = {
  day: DayOfWeek;
  isOpen: boolean;
  start: string;
  end: string;
};

export type OpeningHoursRow = {
  salon_id: number;
  day_of_week: number;
  is_open: number;
  start_time: string | null;
  end_time: string | null;
};

export type WorkingHoursResponse = {
  hours: OpeningHoursRow[];
};

export type ServiceRow = {
  id: number;
  name: string;
  duration_min: number;
  is_active: number; // SQLite brukar ge 0/1
};

export type AppointmentApiRow = {
  id: number;
  date: string;
  time: string;
  service_id: number;
  service_name: string;
  duration_min: number;
  status: string;
  created_at: string;
};

export type SalonRow = {
  id: number;
  name: string;
  slug: string;
  public_phone: string | null;
  elks_number: string | null;
  forward_to_number: string | null;
  phone_enabled: number;
  calendar_id: string | null;
};

export type ServiceChoice = {
  digit: string;
  serviceId: number;
  name: string;
  durationMin: number;
};