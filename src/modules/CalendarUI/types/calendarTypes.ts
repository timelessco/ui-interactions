import { SharedValue } from "react-native-reanimated";

export type WeekStripProps = {
  selectedDate: SharedValue<string>;
};

export type ListItemType = {
  date: string;
  index: number;
  offsetY: number;
  type: "HeaderItem";
};

export type CalendarListItemProps = {
  calendarItem: ListItemType;
  index: number;
};

export type CalendarAgendaProps = {
  selectedDate: SharedValue<string>;
};
