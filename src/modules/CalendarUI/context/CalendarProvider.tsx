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

import { useCalendarItemsState } from "./useCalendarItemsState";

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

// Useful in finding the Header Item of the moved Item in the Flatlist
const findNearestHeaderItem = (
  array: (SectionHeaderType | CalendarEvent)[],
  index: number,
) => {
  for (let i = index - 1; i >= 0; i--) {
    const item = array[i];
    if (item.type === "HeaderItem") {
      return item;
    }
  }
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

  const { items, updateItem } = useCalendarItemsState();

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
        const dateItems = items
          .filter(item => item.date === date)
          .sort((a, b) => a.order - b.order);
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

  const decrementOrderAfterIndex = (index: number, events: CalendarEvent[]) => {
    events.map(event => {
      updateItem(event.id, {
        ...event,
        order: event.order > index ? event.order - 1 : event.order,
      });
    });
  };

  const incrementOrderAfterIndex = (index: number, events: CalendarEvent[]) => {
    events.map(event => {
      updateItem(event.id, {
        ...event,
        order: event.order >= index ? event.order + 1 : event.order,
      });
    });
  };

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

    //  The Dragging Item
    const itemToMove = transformedDatesList.splice(
      fromIndex,
      1,
    )[0] as CalendarEvent;

    // The toIndex section data
    const toIndexSectionHeaderData = findNearestHeaderItem(
      transformedDatesList,
      toIndex,
    ) as SectionHeaderType;
    // The fromIndex section data
    const fromIndexSectionHeaderData = findNearestHeaderItem(
      transformedDatesList,
      fromIndex,
    ) as SectionHeaderType;

    // The Items under the from section -> sorted based on order
    const itemsPartOfFromSection = items
      .filter(value => value.date === fromIndexSectionHeaderData?.date)
      .sort((a, b) => a.order - b.order);

    const draggingItemIndexInSortedItemsOfSection =
      itemsPartOfFromSection.findIndex(value => value.id === itemToMove.id);

    // Find new order
    const newOrder =
      toIndex -
      transformedDatesList.findIndex(
        value => value.date === toIndexSectionHeaderData?.date,
      );
    // The Items under the to section -> sorted based on order
    const itemsPartOfToSection = items
      .filter(value => value.date === toIndexSectionHeaderData?.date)
      .sort((a, b) => a.order - b.order);

    transformedDatesList.splice(toIndex, 0, itemToMove);

    setTimeout(() => {
      if (fromIndexSectionHeaderData.date !== toIndexSectionHeaderData.date) {
        // Function to decrease the order in items before the dragging position item
        decrementOrderAfterIndex(
          draggingItemIndexInSortedItemsOfSection,
          itemsPartOfFromSection,
        );

        // Now we need to update the order of the dragging item
        updateItem(itemToMove.id, {
          ...itemToMove,
          date: toIndexSectionHeaderData?.date,
          order: newOrder,
        });

        // Function to increase the order in items after the dragging position item
        incrementOrderAfterIndex(newOrder, itemsPartOfToSection);
      } else {
        // Reordering items, from and to index are part of same section
        const itemsPartOfSection = items
          .filter(value => value.date === fromIndexSectionHeaderData?.date)
          .sort((a, b) => a.order - b.order);

        const direction = itemToMove.order < newOrder ? 1 : -1;

        if (direction > 0) {
          // Top to bottom movement
          for (let i = itemToMove.order; i < newOrder; i++) {
            updateItem(itemsPartOfSection[i].id, {
              ...itemsPartOfSection[i],
              order: itemsPartOfSection[i].order - 1,
            });
          }
        } else {
          // Bottom to top movement
          for (let i = newOrder - 1; i < itemToMove.order - 1; i++) {
            updateItem(itemsPartOfSection[i].id, {
              ...itemsPartOfSection[i],
              order: itemsPartOfSection[i].order + 1,
            });
          }
        }

        // Update the order of the dragging item
        updateItem(itemToMove.id, {
          ...itemToMove,
          order: newOrder,
        });
      }
    }, 0.01);
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
