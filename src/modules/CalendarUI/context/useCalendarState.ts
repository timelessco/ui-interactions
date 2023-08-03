import { create } from "zustand";

import { CalendarEvent } from "../types/calendarTypes";

export interface ColorComboType {
  text: string;
}

interface CalendarEventsStore {
  items: CalendarEvent[];
  addItem: (item: CalendarEvent) => void;
  removeItem: (id: string) => void;
}

const useCalendarState = create<CalendarEventsStore>(set => ({
  items: [],
  addItem: (item: CalendarEvent) =>
    set((state: CalendarEventsStore) => ({
      items: [...state.items, item],
    })),
  removeItem: (id: string) =>
    set((state: CalendarEventsStore) => ({
      items: state.items.filter(item => item.id !== id),
    })),
}));

export { useCalendarState };
