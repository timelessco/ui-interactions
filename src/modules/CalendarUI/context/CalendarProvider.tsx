import React, { useCallback, useRef, useState } from "react";
import { TextInput } from "react-native";
import { SharedValue, useSharedValue } from "react-native-reanimated";
import dayjs from "dayjs";
import { useDeepCompareMemo } from "use-deep-compare";

import {
  DEFAULT_PROPS,
  LIST_ITEM_HEIGHT,
  SECTION_HEADER_HEIGHT,
} from "../constants";
import { CalendarEvent, SectionHeaderType } from "../types/calendarTypes";
import { calculateDates } from "../utils";

import { useCalendarState } from "./useCalendarState";

interface CalendarContextType {
  selectedDate: SharedValue<string>;
  transformedDatesList: (CalendarEvent | SectionHeaderType)[];
  isManualScrolling: boolean;
  setIsManualScrolling: React.Dispatch<React.SetStateAction<boolean>>;
  isMomentumScrollBegin: boolean;
  setIsMomentumScrollBegin: React.Dispatch<React.SetStateAction<boolean>>;
  editItem: CalendarEvent | null;
  setEditItem: React.Dispatch<React.SetStateAction<CalendarEvent | null>>;
  sheetTriggerAction: "EDIT" | "ADD";
  setSheetTriggerAction: React.Dispatch<React.SetStateAction<"EDIT" | "ADD">>;
  eventTitleTextInputRef: React.RefObject<TextInput>;
  flatlistOffsets: number[];
  moveItem: (fromIndex: number, toIndex: number) => void;
}

const CalendarContext = React.createContext<CalendarContextType | undefined>(
  undefined,
);

const useCalendarContext = (): CalendarContextType => {
  const context = React.useContext(CalendarContext);

  if (!context) {
    throw new Error(
      "useCalendarContext: `CalendarContext` is undefined. Seems you forgot to wrap component within the CalendarProvider",
    );
  }

  return context;
};

const CalendarProvider: React.FC<
  Partial<CalendarContextType & { children: React.ReactNode }>
> = props => {
  const eventTitleTextInputRef = useRef<TextInput>(null);

  const today = useSharedValue(dayjs().format("YYYY-MM-DD"));
  const [isManualScrolling, setIsManualScrolling] = useState(true);
  const [isMomentumScrollBegin, setIsMomentumScrollBegin] = useState(true);
  const [editItem, setEditItem] = useState<CalendarEvent | null>(null);
  const [sheetTriggerAction, setSheetTriggerAction] = useState<"EDIT" | "ADD">(
    "ADD",
  );

  const { items } = useCalendarState();

  const { children } = props;

  const pages = calculateDates(
    DEFAULT_PROPS.FIRST_DAY,
    DEFAULT_PROPS.MIN_DATE,
    DEFAULT_PROPS.MAX_DATE,
    DEFAULT_PROPS.INITIAL_DATE,
  );

  const transformDates = useCallback(
    (dateList: typeof pages.day.data) => {
      let cumulativeOffset = 0;
      const convertedDates = dateList.map((date, index) => {
        const dateItems = items.filter(item => item.date === date);
        const currentOffset = cumulativeOffset;
        // Update cumulativeOffset to include the current dateItems length
        cumulativeOffset += dateItems.length * LIST_ITEM_HEIGHT;
        return [
          {
            date,
            index,
            offsetY: index * SECTION_HEADER_HEIGHT + currentOffset,
            type: "HeaderItem",
            hasItems: dateItems.length > 0,
          },
          ...dateItems,
        ];
      });
      return convertedDates.flat();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pages, items, items.length],
  );

  const transformedDatesList = transformDates(pages.day.data) as (
    | SectionHeaderType
    | CalendarEvent
  )[];

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      fromIndex >= transformedDatesList.length ||
      toIndex < 0 ||
      toIndex >= transformedDatesList.length
    ) {
      // Invalid indices or no movement needed
      return;
    }

    const itemToMove = transformedDatesList.splice(fromIndex, 1)[0];
    transformedDatesList.splice(toIndex, 0, itemToMove);
  };

  const flatlistOffsets = useDeepCompareMemo(() => {
    let cumulativeOffset = 0;
    const offsets = transformedDatesList.map(item => {
      if (item.type === "HeaderItem") {
        cumulativeOffset = item.offsetY;
        return item.offsetY;
      } else {
        cumulativeOffset += LIST_ITEM_HEIGHT;
        return cumulativeOffset;
      }
    });
    return offsets;
  }, [transformedDatesList, items]);

  return (
    <CalendarContext.Provider
      value={{
        selectedDate: today,
        eventTitleTextInputRef,
        transformedDatesList,
        isManualScrolling,
        setIsManualScrolling,
        isMomentumScrollBegin,
        setIsMomentumScrollBegin,
        editItem,
        setEditItem,
        setSheetTriggerAction,
        sheetTriggerAction,
        flatlistOffsets,
        moveItem,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

export { CalendarProvider, useCalendarContext };
