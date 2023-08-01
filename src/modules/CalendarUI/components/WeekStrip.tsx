import { useCallback, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedReaction,
} from "react-native-reanimated";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import tailwind from "twrnc";

import {
  DEFAULT_PROPS,
  SCREEN_WIDTH,
  SECTION_HEADER_HEIGHT,
  week,
} from "../constants";
import { useCalendarContext } from "../context/CalendarProvider";
import { ListItemType } from "../types/calendarTypes";
import { calculateDates, previousMultipleOfSeven } from "../utils";

export const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

const CalendarDay = (props: any) => {
  const { selectedDate } = props;
  const [isSelected, setIsSelectedState] = useState(
    dayjs().isSame(dayjs(props.data.item), "day"),
  );

  const setIsSelected = (newSelectedDate: string) => {
    const result = dayjs(newSelectedDate).isSame(dayjs(props.data.item), "day");
    setIsSelectedState(result);
  };

  useAnimatedReaction(
    () => selectedDate.value,
    (next, _prev) => {
      runOnJS(setIsSelected)(next);
    },
  );

  const previousLowestValue = previousMultipleOfSeven(SCREEN_WIDTH);
  const padding = SCREEN_WIDTH - previousLowestValue + 14;

  return (
    <Pressable
      style={tailwind.style(
        "flex-row items-center justify-center",
        `w-[${Math.floor((SCREEN_WIDTH - padding) / 7)}px] h-9`,
      )}
      onPress={() => props.handleDayPress(props.data.item)}
    >
      <Animated.View
        style={[
          tailwind.style(
            "h-9 w-9 justify-center",
            isSelected ? "bg-black rounded-full" : "",
          ),
        ]}
      >
        <Animated.Text
          style={[
            tailwind.style(
              "text-lg text-center text-black font-medium",
              isSelected ? "text-white" : "",
            ),
          ]}
        >
          {dayjs(props.data.item).get("date")}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
};

export const WeekStrip = () => {
  const { selectedDate, weekListRef: wref } = useCalendarContext();
  const pages = calculateDates(
    DEFAULT_PROPS.FIRST_DAY,
    DEFAULT_PROPS.MIN_DATE,
    DEFAULT_PROPS.MAX_DATE,
    DEFAULT_PROPS.INITIAL_DATE,
  );

  function transformDates(dateList: typeof pages.day.data) {
    const convertedDates = dateList.map((date, index) => ({
      date,
      index,
      offsetY: index * SECTION_HEADER_HEIGHT,
    }));
    return convertedDates;
  }

  const transformedDatesList = transformDates(pages.day.data) as ListItemType[];

  const manualScroll = (next: string, prev: string) => {
    const startDateOfSelectedWeek = dayjs(next).startOf("week").add(1, "day");
    let newIndex = transformedDatesList.filter(
      value => value.date === startDateOfSelectedWeek.format("YYYY-MM-DD"),
    )[0].index;

    const startDateOfPrevSelectedWeek = dayjs(prev)
      .startOf("week")
      .add(1, "day");
    let prevIndex = transformedDatesList.filter(
      value => value.date === startDateOfPrevSelectedWeek.format("YYYY-MM-DD"),
    )[0].index;
    // If the date is present in the same week, we don't do a manual scroll
    if (newIndex !== prevIndex) {
      wref.current?.scrollToIndex({
        index: newIndex - 1,
        animated: true,
      });
    }
  };

  useAnimatedReaction(
    () => selectedDate.value,
    (next, prev) => {
      // Check if prev is null preventing a manual scroll on initial render
      if (prev) {
        if (next !== prev) {
          runOnJS(manualScroll)(next, prev);
        }
      }
    },
  );

  const previousLowestValue = previousMultipleOfSeven(SCREEN_WIDTH);
  const padding = SCREEN_WIDTH - previousLowestValue + 14;

  const handleDayPress = useCallback(
    (data: string) => {
      selectedDate.value = data;
    },
    [selectedDate],
  );

  return (
    <View style={tailwind.style("border-b border-[#EEEEEE] pb-4")}>
      <View style={tailwind.style("flex flex-row justify-center pb-1.5")}>
        {week.map((day, index) => {
          return (
            <View
              style={tailwind.style(
                "flex items-center justify-center",
                `w-[${(SCREEN_WIDTH - padding) / 7}px]`,
              )}
              key={day + index}
            >
              <Text
                style={tailwind.style(
                  "text-sm text-center font-medium text-[#9A9A9A]",
                )}
              >
                {day}
              </Text>
            </View>
          );
        })}
      </View>
      <Animated.View style={tailwind.style("h-9", `px-[${padding / 2}px]`)}>
        <AnimatedFlashList
          // @ts-ignore
          ref={wref}
          data={pages.day.data}
          initialScrollIndex={pages.day.index - dayjs().day()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          estimatedItemSize={(SCREEN_WIDTH - padding) / 7}
          estimatedListSize={{ width: SCREEN_WIDTH - padding, height: 36 }}
          renderItem={value => {
            return (
              <CalendarDay
                data={value}
                selectedDate={selectedDate}
                handleDayPress={handleDayPress}
              />
            );
          }}
        />
      </Animated.View>
    </View>
  );
};
