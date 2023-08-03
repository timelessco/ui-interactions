import React, { useCallback, useRef, useState } from "react";
import { SharedValue, useSharedValue } from "react-native-reanimated";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";

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
  agendaListRef: React.RefObject<FlashList<string>>;
  weekListRef: React.RefObject<FlashList<string>>;
  transformedDatesList: (CalendarEvent | SectionHeaderType)[];
  isManualScrolling: boolean;
  setIsManualScrolling: React.Dispatch<React.SetStateAction<boolean>>;
  isMomentumScrollBegin: boolean;
  setIsMomentumScrollBegin: React.Dispatch<React.SetStateAction<boolean>>;
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
  const aref = useRef<FlashList<string>>(null);
  const wref = useRef<FlashList<string>>(null);

  const today = useSharedValue(dayjs().format("YYYY-MM-DD"));
  const [isManualScrolling, setIsManualScrolling] = useState(true);
  const [isMomentumScrollBegin, setIsMomentumScrollBegin] = useState(true);

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

  return (
    <CalendarContext.Provider
      value={{
        selectedDate: today,
        agendaListRef: aref,
        weekListRef: wref,
        transformedDatesList,
        isManualScrolling,
        setIsManualScrolling,
        isMomentumScrollBegin,
        setIsMomentumScrollBegin,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

export { CalendarProvider, useCalendarContext };
