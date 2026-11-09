export type User = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
};

export type Event = {
  id: string;
  title: string;
  description: string;
  date: string; // ISO, ex.: "2026-11-20T00:00:00.000Z"
  time: string; // "HH:mm"
  location: string;
  image: string;
};

export type Registration = {
  id: string;
  userId: string;
  eventId: string;
  createdAt: string;
  event: Event;
};
