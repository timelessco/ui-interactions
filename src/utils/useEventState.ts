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
  | "black"
  | "plum"
  | "orange";

const COLORS_COMBO: Record<COLORS, ColorComboType> = {
  purple: { bg: "#8B32FC", text: "#ffffff" },
  pink: { bg: "#FF5391", text: "#ffffff" },
  blue: { bg: "#315EFD", text: "#ffffff" },
  green: { bg: "#30a46c", text: "#ffffff" },
  black: { bg: "#000000", text: "#ffffff" },
  red: { bg: "#e5484d", text: "#ffffff" },
  plum: { bg: "#00ACEB", text: "#ffffff" },
  orange: { bg: "#FF5C28", text: "#ffffff" },
};

export interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  color: ColorComboType;
  translateY: number;
  totalTime: string;
  height: number;
  location: string;
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
