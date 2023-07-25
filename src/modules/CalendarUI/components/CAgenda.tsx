import React, { useCallback, useMemo, useRef, useState } from "react";
import { Text, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import tailwind from "twrnc";

import { useHaptic } from "../../../utils/useHaptic";
import {
  DEFAULT_PROPS,
  SCREEN_WIDTH,
  SECTION_HEADER_HEIGHT,
} from "../constants";
import { CalendarItem, useCalendarState } from "../context/useCalendarState";
import {
  CalendarAgendaProps,
  CalendarListItemProps,
  ListItemType,
} from "../types/calendarTypes";
import { calculateDates } from "../utils";

export const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

const LIST_ITEM_HEIGHT = 60;

var isToday = require("dayjs/plugin/isToday");

dayjs.extend(isToday);

const CalendarListItem = React.memo(
  ({ calendarItem }: CalendarListItemProps) => {
    return (
      <View
        style={tailwind.style(
          "w-full border-b-[1px] border-[#DEDEDE] justify-center px-4 bg-white",
          `h-[${SECTION_HEADER_HEIGHT}px]`,
        )}
      >
        <Text
          style={tailwind.style(
            calendarItem.hasItems ? "font-bold" : "font-normal",
            "text-base",
          )}
        >
          {dayjs(calendarItem.date).format("MMM DD")} ・{" "}
          {dayjs(calendarItem.date).isSame(dayjs()) ? "Today" : ""}
          {dayjs(calendarItem.date).format("dddd")}
        </Text>
      </View>
    );
  },
);

export const CAgenda = (props: CalendarAgendaProps) => {
  const aref = useRef<FlashList<string>>(null);
  const { selectedDate } = props;
  const [isManualScrolling, setIsManualScrolling] = useState(true);
  const [isDateSetOnScroll, setIsDateSetOnScroll] = useState(false);
  const hapticSelection = useHaptic();
  const { items } = useCalendarState();

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

  const scroll = useSharedValue(0);

  const transformedDatesList = transformDates(pages.day.data) as (
    | ListItemType
    | CalendarItem
  )[];

  // This is the code which triggers the two way linking [Scroll Blocking Required]
  const manualScroll = (newSelectedDate: string) => {
    const selectedDateIndex = transformedDatesList.findIndex(
      value => value.type === "HeaderItem" && value.date === newSelectedDate,
    );

    setIsManualScrolling(true);
    aref.current?.scrollToIndex({
      index: selectedDateIndex,
      animated: true,
    });
    setTimeout(() => {
      setIsManualScrolling(false);
    }, 200);
  };

  useAnimatedReaction(
    () => selectedDate.value,
    (next, prev) => {
      // Check if prev is null preventing a manual scroll on initial render
      if (prev) {
        if (next !== prev) {
          hapticSelection && runOnJS(hapticSelection)();
          // Checking the case where date is changing but its not from the scrolling
          // and it is not manual scrolling because the date changed in week strip
          if (!isDateSetOnScroll && !isManualScrolling) {
            runOnJS(manualScroll)(next);
          }
        }
      }
    },
  );

  const handleOnLayout = () => {
    setTimeout(() => {
      setIsManualScrolling(false);
      setIsDateSetOnScroll(false);
    }, 300);
  };

  const findClosestScrollIndex = () => {
    const closestScrollIndex =
      Math.round(scroll.value / LIST_ITEM_HEIGHT) * LIST_ITEM_HEIGHT;
    const scrollIndex = closestScrollIndex / LIST_ITEM_HEIGHT;
    const currentSection = transformedDatesList[scrollIndex];

    if (currentSection.type === "HeaderItem") {
      aref.current?.scrollToOffset({
        offset: closestScrollIndex,
        animated: true,
      });
    } else {
      const currentHeaderItem = transformedDatesList
        .filter(item => item.type === "HeaderItem")
        .filter(item => item.date === currentSection.date);
      const headerItemIndex = transformedDatesList.findIndex(
        value => value.date === currentHeaderItem[0].date,
      );
      aref.current?.scrollToIndex({
        index: headerItemIndex,
        animated: true,
      });
    }
  };

  const changeDateOnScroll = () => {
    const closestScrollIndex =
      Math.floor(scroll.value / LIST_ITEM_HEIGHT) * LIST_ITEM_HEIGHT;
    const scrollIndex = closestScrollIndex / LIST_ITEM_HEIGHT;
    selectedDate.value = transformedDatesList[scrollIndex].date;
  };

  const scrollHandler = useAnimatedScrollHandler({
    onBeginDrag: () => runOnJS(setIsDateSetOnScroll)(true),
    onScroll: event => {
      if (!isManualScrolling) {
        const { contentOffset } = event;
        scroll.value = contentOffset.y;
        runOnJS(changeDateOnScroll)();
        runOnJS(setIsDateSetOnScroll)(true);
      }
    },
    onMomentumEnd: event => {
      if (!isManualScrolling) {
        runOnJS(setIsDateSetOnScroll)(false);
        const { contentOffset } = event;
        scroll.value = contentOffset.y;
        runOnJS(findClosestScrollIndex)();
      }
    },
  });

  const initialScrollIndex = useMemo(() => {
    const currentIndex = transformedDatesList
      .filter(item => item.type === "HeaderItem")
      .filter(item => item.date === selectedDate.value);

    const scrollIndex = transformedDatesList.findIndex(
      value => value.date === currentIndex[0].date,
    );
    return scrollIndex;
  }, [selectedDate.value, transformedDatesList]);

  return (
    <Animated.View style={tailwind.style("flex-1", `w-[${SCREEN_WIDTH}px]`)}>
      <AnimatedFlashList
        // @ts-ignore
        ref={aref}
        // Write case for negative scroll-y and set it to true
        bounces={false}
        onScroll={scrollHandler}
        onLayout={handleOnLayout}
        data={transformedDatesList}
        initialScrollIndex={initialScrollIndex}
        estimatedItemSize={SECTION_HEADER_HEIGHT}
        scrollEventThrottle={16}
        // stickyHeaderIndices={stickyHeaderIndices}
        getItemType={item => {
          // To achieve better performance, specify the type based on the item
          const sectionListItem = item as ListItemType | CalendarItem;
          return (
            sectionListItem.type === "HeaderItem" ? "sectionHeader" : "row"
          ) as string;
        }}
        // @ts-ignore
        renderItem={({
          item,
          index,
        }: {
          item: ListItemType | CalendarItem;
          index: number;
        }) => {
          if (item.type === "HeaderItem") {
            return (
              <CalendarListItem
                index={index}
                calendarItem={item as ListItemType}
              />
            );
          }
          return (
            <View
              style={tailwind.style(
                "w-full border-b-[1px] border-[#DEDEDE] justify-center ml-4 pr-4",
                `h-[${LIST_ITEM_HEIGHT}px]`,
              )}
            >
              <Text style={tailwind.style("text-lg font-medium text-black")}>
                {item.title}
              </Text>
              <Text style={tailwind.style("text-sm text-gray-600")}>
                {item.desc}
              </Text>
            </View>
          );
        }}
        extraData={items.length}
      />
    </Animated.View>
  );
};
