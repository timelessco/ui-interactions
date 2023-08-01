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
