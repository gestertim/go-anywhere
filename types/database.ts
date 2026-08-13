export type Database = {
  public: {
    Tables: {
      trips: {
        Row: { id: string; owner_id: string; title: string; destination: string; start_date: string; end_date: string; created_at: string; updated_at: string };
        Insert: { id?: string; owner_id: string; title: string; destination: string; start_date: string; end_date: string; created_at?: string; updated_at?: string };
        Update: Partial<{ owner_id: string; title: string; destination: string; start_date: string; end_date: string; updated_at: string }>;
      };
      places: {
        Row: { id: string; trip_id: string; name: string | null; address: string | null; latitude: number | null; longitude: number | null; created_at: string };
        Insert: { id?: string; trip_id: string; name?: string | null; address?: string | null; latitude?: number | null; longitude?: number | null; created_at?: string };
        Update: Partial<{ name: string | null; address: string | null; latitude: number | null; longitude: number | null }>;
      };
      itinerary_items: {
        Row: { id: string; trip_id: string; type: "flight" | "accommodation" | "transportation" | "attraction" | "restaurant" | "other"; title: string | null; date: string | null; start_time: string | null; end_time: string | null; place_id: string | null; notes: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; trip_id: string; type: "flight" | "accommodation" | "transportation" | "attraction" | "restaurant" | "other"; title?: string | null; date?: string | null; start_time?: string | null; end_time?: string | null; place_id?: string | null; notes?: string | null; created_at?: string; updated_at?: string };
        Update: Partial<{ type: "flight" | "accommodation" | "transportation" | "attraction" | "restaurant" | "other"; title: string | null; date: string | null; start_time: string | null; end_time: string | null; place_id: string | null; notes: string | null; updated_at: string }>;
      };
      bookings: {
        Row: { id: string; itinerary_item_id: string; confirmation_code: string | null; provider_name: string | null; reference_url: string | null; details: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; itinerary_item_id: string; confirmation_code?: string | null; provider_name?: string | null; reference_url?: string | null; details?: string | null; created_at?: string; updated_at?: string };
        Update: Partial<{ confirmation_code: string | null; provider_name: string | null; reference_url: string | null; details: string | null; updated_at: string }>;
      };
      trip_notes: {
        Row: { id: string; trip_id: string; content: string; created_at: string; updated_at: string };
        Insert: { id?: string; trip_id: string; content?: string; created_at?: string; updated_at?: string };
        Update: Partial<{ content: string; updated_at: string }>;
      };
    };
  };
};
