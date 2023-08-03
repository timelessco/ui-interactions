export type SectionHeaderType = {
  date: string;
  index: number;
  offsetY: number;
  type: "HeaderItem";
  hasItems: boolean;
};

export type CalendarEvent = {
  id: string;
  title: string;
  desc: string;
  date: string;
  startTime: string;
  endTime: string;
  height: number;
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
};
