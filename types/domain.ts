export const itineraryTypes = [
  "flight",
  "accommodation",
  "transportation",
  "attraction",
  "restaurant",
  "other",
] as const;

export type ItineraryType = (typeof itineraryTypes)[number];

export type Place = {
  id: string;
  name: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type Booking = {
  id: string;
  itineraryItemId: string;
  confirmationCode: string | null;
  providerName: string | null;
  referenceUrl: string | null;
  details: string | null;
};

export type ItineraryItem = {
  id: string;
  tripId: string;
  type: ItineraryType;
  title: string | null;
  date: string | null;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  place: Place | null;
  notes: string | null;
  booking: Booking | null;
  createdAt: string;
  updatedAt: string;
};

export type Trip = {
  id: string;
  ownerId: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
};

export type TripNote = {
  id: string;
  tripId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};
