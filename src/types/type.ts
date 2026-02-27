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
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type DayHours = {
  day: DayOfWeek;
  start: string;
  end: string;
  isOpen: boolean;
};
