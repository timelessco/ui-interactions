import { create } from "zustand";

export interface ColorComboType {
  bg: string;
  text: string;
}

export type COLORS =
  | "red"
  | "purple"
  | "pink"
  | "blue"
  | "green"
  | "slate"
  | "mint"
  | "plum"
  | "orange";

const COLORS_COMBO: Record<COLORS, ColorComboType> = {
  purple: { bg: "#793aaf", text: "#f9f1fe" },
  pink: { bg: "#cd1d8d", text: "#feeef8" },
  blue: { bg: "#006adc", text: "#edf6ff" },
  green: { bg: "#18794e", text: "#e9f9ee" },
  slate: { bg: "#687076", text: "#f1f3f5" },
  mint: { bg: "#147d6f", text: "#e1fbf4" },
  red: { bg: "#cd2b31", text: "#ffefef" },
  plum: { bg: "#9c2bad", text: "#fceffc" },
  orange: { bg: "#bd4b00", text: "#fff1e7" },
};

export interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  color: ColorComboType;
  top: number;
}

interface CalendarEventsStore {
  events: CalendarEvent[];
  addEvent: (event: CalendarEvent) => void;
  removeEvent: (id: number) => void;
}

const useEventStore = create<CalendarEventsStore>(set => ({
  events: [],
  addEvent: (event: CalendarEvent) =>
    set((state: CalendarEventsStore) => ({
      events: [...state.events, event],
    })),
  removeEvent: (id: number) =>
    set((state: CalendarEventsStore) => ({
      events: state.events.filter(event => event.id !== id),
    })),
}));

export { COLORS_COMBO, useEventStore };
