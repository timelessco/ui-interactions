import React, { useMemo, useState } from "react";
import { NativeScrollEvent, Pressable, Text } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  FadeInLeft,
  FadeOut,
  FadeOutRight,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useEvent,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
import { useDraggableContext } from "../context/DraggableProvider";
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
  const { top } = useSafeAreaInsets();
  const { setDraggingItem, dragY, positionY } = useDraggableContext();

  const selection = useHaptic();

  const [moving, setMoving] = useState(false);

  const derivedValue = useDerivedValue(() =>
    moving ? withSpring(1) : withSpring(0),
  );

  const dragGesture = Gesture.Pan()
    .activateAfterLongPress(350)
    .onStart(event => {
      runOnJS(setMoving)(true);
      runOnJS(setDraggingItem)(calendarItem);
      if (selection && !moving) {
        runOnJS(selection)();
      }
      dragY.value = event.translationY;
      positionY.value = event.absoluteY - (top + 60 + 79) - event.y;
    })
    .onUpdate(event => {
      dragY.value = event.translationY;
    })
    .onEnd(() => {
      runOnJS(setMoving)(false);
      runOnJS(setDraggingItem)(null);
    });

  const draggingItemFixedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(derivedValue.value, [0, 1], [1, 0.4]),
    };
  });

  return (
    <Animated.View
      entering={FadeInLeft}
      exiting={FadeOutRight}
      style={draggingItemFixedStyle}
    >
      <GestureDetector gesture={dragGesture}>
        <Pressable onPress={handlePress}>
          <Animated.View
            style={[
              tailwind.style(
                "w-full border-b-[1px] border-[#DEDEDE] justify-center ml-4 pr-4",
                `h-[${LIST_ITEM_HEIGHT}px]`,
              ),
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

  const { draggingItem, dragY, positionY } = useDraggableContext();
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

  const derivedValue = useDerivedValue(() =>
    draggingItem !== null
      ? withSpring(1, { damping: 25, stiffness: 120 })
      : withSpring(0, { damping: 25, stiffness: 120 }),
  );

  const animatedDraggingStyle = useAnimatedStyle(() => {
    return {
      top: positionY.value,
      left: 0,
      right: 0,
      transform: [{ translateY: dragY.value }],
      backgroundColor: "rgba(255,255,255,1)",
      zIndex: 99,
      opacity: interpolate(derivedValue.value, [0, 1], [0, 1]),
      paddingHorizontal: 16,
      marginHorizontal: interpolate(derivedValue.value, [0, 1], [0, 16]),
      width: interpolate(
        derivedValue.value,
        [0, 1],
        [SCREEN_WIDTH, SCREEN_WIDTH - 16 * 2],
      ),
      borderRadius: interpolate(derivedValue.value, [0, 1], [0, 12]),
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
    };
  });

  return (
    <Animated.View
      style={[tailwind.style("flex-1 relative", `w-[${SCREEN_WIDTH}px]`)]}
    >
      {draggingItem ? (
        <Animated.View
          exiting={FadeOut.springify().damping(25).stiffness(120)}
          style={[
            tailwind.style(
              "absolute w-full justify-center",
              `h-[${LIST_ITEM_HEIGHT}px]`,
            ),
            animatedDraggingStyle,
          ]}
        >
          <Text style={tailwind.style("text-lg font-medium text-black")}>
            {draggingItem.title}
          </Text>
          <Text style={tailwind.style("text-sm text-gray-600")}>
            {draggingItem.desc}
          </Text>
        </Animated.View>
      ) : null}
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
