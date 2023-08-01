import { SharedValue } from "react-native-reanimated";
import { FlashList } from "@shopify/flash-list";

export type WeekStripProps = {
  selectedDate: SharedValue<string>;
};

export type ListItemType = {
  date: string;
  index: number;
  offsetY: number;
  type: "HeaderItem";
  hasItems: boolean;
};

export type CalendarListItemProps = {
  calendarItem: ListItemType;
  index: number;
};

export type CalendarAgendaProps = {
  selectedDate: SharedValue<string>;
  aref: React.RefObject<FlashList<string>>;
};
