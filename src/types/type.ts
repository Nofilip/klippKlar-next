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