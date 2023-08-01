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
import { SCREEN_WIDTH, SECTION_HEADER_HEIGHT } from "../constants";
import {
  LIST_ITEM_HEIGHT,
  useCalendarContext,
} from "../context/CalendarProvider";
import { CalendarItem, useCalendarState } from "../context/useCalendarState";
import { CalendarListItemProps, ListItemType } from "../types/calendarTypes";

export const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

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

export const CAgenda = () => {
  const {
    selectedDate,
    agendaListRef: aref,
    transformedDatesList,
    isManualScrolling,
    setIsManualScrolling,
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
    }, 300);
  };

  const findClosestScrollIndex = () => {
    const closestScrollIndex =
      Math.round(scroll.value / LIST_ITEM_HEIGHT) * LIST_ITEM_HEIGHT;
    const scrollIndex = closestScrollIndex / LIST_ITEM_HEIGHT;
    const currentSection = transformedDatesList[scrollIndex];

    if (currentSection.type === "HeaderItem") {
      setIsManualScrolling(true);
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
      setIsManualScrolling(true);
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

  return (
    <Animated.View style={tailwind.style("flex-1", `w-[${SCREEN_WIDTH}px]`)}>
      <AnimatedFlashList
        // @ts-ignore
        ref={aref}
        // Write case for negative scroll-y and set it to true
        bounces={false}
        onScroll={scrollHandler}
        onScrollEndDrag={_onScrollEndDrag}
        showsVerticalScrollIndicator={false}
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
