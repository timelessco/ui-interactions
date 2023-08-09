import React, { useMemo, useState } from "react";
import { NativeScrollEvent, Pressable, Text } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useEvent,
  useSharedValue,
  withSpring,
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
import { useCalendarState } from "../context/useCalendarState";
import {
  CalendarEvent,
  CalendarEventItemProps,
  CalendarSectionItemProps,
  SectionHeaderType,
} from "../types/calendarTypes";

export const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

var isToday = require("dayjs/plugin/isToday");

dayjs.extend(isToday);

const CalendarSectionHeader = React.memo(
  ({ calendarSection }: CalendarSectionItemProps) => {
    return (
      <Animated.View
        style={tailwind.style(
          "w-full border-b-[1px] border-[#DEDEDE] justify-center px-4 bg-white z-0",
          `h-[${SECTION_HEADER_HEIGHT}px]`,
        )}
      >
        <Text
          style={tailwind.style(
            calendarSection.hasItems ? "font-bold" : "font-normal",
            "text-base",
          )}
        >
          {dayjs(calendarSection.date).format("MMM DD")} ・{" "}
          {dayjs(calendarSection.date).isSame(dayjs()) ? "Today" : ""}
          {dayjs(calendarSection.date).format("dddd")}
        </Text>
      </Animated.View>
    );
  },
);

const CalendarEventItem = ({ calendarItem }: CalendarEventItemProps) => {
  const {
    sheetRef,
    setEditItem,
    eventTitleTextInputRef,
    setSheetTriggerAction,
  } = useCalendarContext();
  const handlePress = () => {
    setEditItem(calendarItem);
    setSheetTriggerAction("EDIT");
    eventTitleTextInputRef?.current?.focus();
    sheetRef?.current?.snapToIndex(0);
  };

  const selection = useHaptic();
  const [moving, setMoving] = useState(false);
  const top = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const dragGesture = Gesture.Pan()
    .activateAfterLongPress(350)
    .onStart(event => {
      runOnJS(setMoving)(true);
      if (selection && !moving) {
        runOnJS(selection)();
      }
      top.value = event.absoluteY;
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      console.log("%c⧭", "color: #d0bfff", "Gesture Begin");
    })
    .onUpdate(event => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      console.log("%c⧭", "color: #cc0036", "Gesture Update");
    })
    .onEnd(() => {
      runOnJS(setMoving)(false);
      top.value = 0;
      translateX.value = withSpring(0, {
        damping: 18,
        stiffness: 120,
        mass: 1,
      });
      translateY.value = withSpring(0, {
        damping: 18,
        stiffness: 120,
        mass: 1,
      });
      console.log("%c⧭", "color: #cc0036", "Gesture End");
    });

  const derivedValue = useDerivedValue(() =>
    moving ? withSpring(1) : withSpring(0),
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      position: moving ? "absolute" : "relative",
      left: 0,
      right: 0,
      // top: top.value,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
      backgroundColor: "white",
      zIndex: interpolate(derivedValue.value, [0, 1], [-10, 9999]),
      borderRadius: interpolate(derivedValue.value, [0, 1], [0, 12]),
      width: `${interpolate(derivedValue.value, [0, 1], [100, 80])}%`,
      shadowColor: interpolateColor(
        derivedValue.value,
        [0, 1],
        ["transparent", "#000"],
      ),
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
    };
  });

  const tileSelectedStyle = useAnimatedStyle(() => {
    return {
      borderBottomWidth: interpolate(derivedValue.value, [0, 1], [1, 0]),
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <GestureDetector gesture={dragGesture}>
        <Pressable onPress={handlePress}>
          <Animated.View
            style={[
              tailwind.style(
                "w-full border-b-[1px] border-[#DEDEDE] justify-center ml-4 pr-4",
                `h-[${LIST_ITEM_HEIGHT}px]`,
              ),
              tileSelectedStyle,
            ]}
          >
            <Text style={tailwind.style("text-lg font-medium text-black")}>
              {calendarItem.title}
            </Text>
            <Text style={tailwind.style("text-sm text-gray-600")}>
              {calendarItem.desc}
            </Text>
          </Animated.View>
        </Pressable>
      </GestureDetector>
    </Animated.View>
  );
};

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
        contentContainerStyle={tailwind.style("pb-10")}
        estimatedItemSize={SECTION_HEADER_HEIGHT}
        scrollEventThrottle={16}
        // stickyHeaderIndices={stickyHeaderIndices}
        overrideItemLayout={(layout, item) => {
          const listItem = item as SectionHeaderType | CalendarEvent;
          switch (listItem.type) {
            case "HeaderItem":
              layout.size = SECTION_HEADER_HEIGHT;
              break;
            case "CalendarEvent":
              layout.size = LIST_ITEM_HEIGHT;
              break;
          }
        }}
        getItemType={item => {
          // To achieve better performance, specify the type based on the item
          const sectionListItem = item as SectionHeaderType | CalendarEvent;
          return (
            sectionListItem.type === "HeaderItem" ? "sectionHeader" : "row"
          ) as string;
        }}
        // @ts-ignore
        renderItem={({
          item,
          index,
        }: {
          item: SectionHeaderType | CalendarEvent;
          index: number;
        }) => {
          if (item.type === "HeaderItem") {
            return (
              <CalendarSectionHeader
                index={index}
                calendarSection={item as SectionHeaderType}
              />
            );
          }
          return (
            <CalendarEventItem
              index={index}
              calendarItem={item as CalendarEvent}
            />
          );
        }}
        extraData={items.length}
      />
    </Animated.View>
  );
};
