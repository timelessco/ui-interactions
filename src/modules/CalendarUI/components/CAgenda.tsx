import React, { useMemo, useState } from "react";
import { NativeScrollEvent, Text, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useEvent,
  useSharedValue,
} from "react-native-reanimated";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import tailwind from "twrnc";

import { useHaptic } from "../../../utils/useHaptic";
import {
  LIST_ITEM_HEIGHT,
  SCREEN_WIDTH,
  SECTION_HEADER_HEIGHT,
} from "../constants";
import { useCalendarContext } from "../context/CalendarProvider";
import { CalendarItem, useCalendarState } from "../context/useCalendarState";
import { CalendarListItemProps, ListItemType } from "../types/calendarTypes";

export const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

var isToday = require("dayjs/plugin/isToday");

dayjs.extend(isToday);

const CalendarListItem = React.memo(
  ({ calendarItem, index }: CalendarListItemProps) => {
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
          {dayjs(calendarItem.date).format("dddd")}・ {index}
        </Text>
      </View>
    );
  },
);

export const CAgenda = () => {
  const {
    selectedDate,
    agendaListRef: aref,
    transformedDatesList,
    isManualScrolling,
    setIsManualScrolling,
    setIsMomentumScrollBegin,
  } = useCalendarContext();

  const [isDateSetOnScroll, setIsDateSetOnScroll] = useState(false);
  const hapticSelection = useHaptic();
  const scroll = useSharedValue(0);

  const { items } = useCalendarState();

  // This is the code which triggers the two way linking [Scroll Blocking Required
  const manualScroll = (newSelectedDate: string) => {
    const selectedDateIndex = transformedDatesList.findIndex(
      value => value.type === "HeaderItem" && value.date === newSelectedDate,
    );

    setIsManualScrolling(true);
    aref.current?.scrollToIndex({
      index: selectedDateIndex,
      animated: true,
    });
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
          if (!isDateSetOnScroll) {
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
      setIsMomentumScrollBegin(false);
    }, 300);
  };

  const findClosestScrollIndex = () => {
    const offsets = transformedDatesList.map(
      value => value.type === "HeaderItem" && value.offsetY,
    ) as number[];
    const nearestValue = findNearestValue(offsets, scroll.value);
    setIsManualScrolling(true);
    const item =
      transformedDatesList[offsets.findIndex(value => value === nearestValue)];
    aref.current?.scrollToIndex({
      index: offsets.findIndex(value => value === nearestValue),
      animated: true,
    });
    selectedDate.value = item.date;
  };

  function findNearestValue(arr: number[], target: number) {
    return arr.reduce((prev, curr) => {
      return Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev;
    });
  }
  const changeDateOnScroll = () => {
    const offsets = transformedDatesList.map(
      value => value.type === "HeaderItem" && value.offsetY,
    ) as number[];
    const nearestValue = findNearestValue(offsets, scroll.value);
    const item =
      transformedDatesList[offsets.findIndex(value => value === nearestValue)];
    selectedDate.value = item.date;
  };

  const scrollHandler = useAnimatedScrollHandler({
    onBeginDrag: () => {
      runOnJS(setIsDateSetOnScroll)(true);
      runOnJS(setIsManualScrolling)(false);
    },
    onScroll: event => {
      if (!isManualScrolling) {
        const { contentOffset } = event;
        scroll.value = contentOffset.y;
        runOnJS(changeDateOnScroll)();
        runOnJS(setIsDateSetOnScroll)(true);
      }
    },

    onMomentumEnd: event => {
      // It is called twice while fixing the bug, need to check
      if (!isManualScrolling) {
        runOnJS(setIsDateSetOnScroll)(false);
        const { contentOffset } = event;
        scroll.value = contentOffset.y;
        runOnJS(findClosestScrollIndex)();
      }
      runOnJS(setIsMomentumScrollBegin)(false);
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

  const _onScrollEndDrag = useEvent((event: NativeScrollEvent) => {
    "worklet";
    if (event.velocity?.y === 0) {
      runOnJS(setIsDateSetOnScroll)(false);
      const { contentOffset } = event;
      scroll.value = contentOffset.y;
      runOnJS(findClosestScrollIndex)();
    }
  });

  const _onMomentumBegin = useEvent(() => {
    "worklet";
    runOnJS(setIsMomentumScrollBegin)(true);
  });

  return (
    <Animated.View style={tailwind.style("flex-1", `w-[${SCREEN_WIDTH}px]`)}>
      <AnimatedFlashList
        // @ts-ignore
        ref={aref}
        // Write case for negative scroll-y and set it to true
        bounces={false}
        onScroll={scrollHandler}
        onScrollEndDrag={_onScrollEndDrag}
        onMomentumScrollBegin={_onMomentumBegin}
        showsVerticalScrollIndicator={false}
        onLayout={handleOnLayout}
        data={transformedDatesList}
        initialScrollIndex={initialScrollIndex}
        estimatedItemSize={SECTION_HEADER_HEIGHT}
        scrollEventThrottle={16}
        // stickyHeaderIndices={stickyHeaderIndices}
        overrideItemLayout={(layout, item) => {
          const listItem = item as ListItemType | CalendarItem;
          switch (listItem.type) {
            case "HeaderItem":
              layout.size = SECTION_HEADER_HEIGHT;
              break;
            case "CalendarItem":
              layout.size = LIST_ITEM_HEIGHT;
              break;
          }
        }}
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
