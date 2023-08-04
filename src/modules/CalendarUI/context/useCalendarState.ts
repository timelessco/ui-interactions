import { create } from "zustand";

import { CalendarEvent } from "../types/calendarTypes";

export interface ColorComboType {
  text: string;
}

interface CalendarEventsStore {
  items: CalendarEvent[];
  addItem: (item: CalendarEvent) => void;
  removeItem: (id: number) => void;
  updateItem: (id: number, updatedItem: CalendarEvent) => void;
}

const useCalendarState = create<CalendarEventsStore>(set => ({
  items: [],
  addItem: (item: CalendarEvent) =>
    set((state: CalendarEventsStore) => ({
      items: [...state.items, item],
    })),
  removeItem: (id: number) =>
    set((state: CalendarEventsStore) => ({
      items: state.items.filter(item => item.id !== id),
    })),
  updateItem: (id: number, updatedItem: CalendarEvent) =>
    set(state => ({
      items: state.items.map(item =>
        item.id === id ? { ...item, ...updatedItem } : item,
      ),
    })),
}));

export { useCalendarState };
