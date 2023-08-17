import { SharedValue } from "react-native-reanimated";

export type SectionHeaderType = {
  date: string;
  index: number;
  offsetY: number;
  type: "HeaderItem";
  hasItems: boolean;
};

export type CalendarEvent = {
  id: number;
  order: number;
  title: string;
  desc: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  type: "CalendarEvent";
};

export type CalendarSectionItemProps = {
  calendarSection: SectionHeaderType;
  index: number;
};

export type CalendarEventItemProps = {
  calendarItem: CalendarEvent;
  index: number;
  scroll: SharedValue<number>;
};
