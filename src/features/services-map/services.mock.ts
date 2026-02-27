import { Service } from "@/types/type";

export const initialServices: Service[] = [
  {
    id: 1,
    name_public: "Klippning",
    duration_min: 30,
    is_active: true,
    created_at: "2023-01-01T00:00:00Z",
  },
  {
    id: 2,
    name_public: "Färgning",
    duration_min: 60,
    is_active: true,
    created_at: "2023-01-01T00:00:00Z",
  },
  {
    id: 3,
    name_public: "Helhet",
    duration_min: 90,
    is_active: false,
    created_at: "2023-01-01T00:00:00Z",
  },
];