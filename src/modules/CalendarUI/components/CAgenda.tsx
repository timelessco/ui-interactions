import React, { useState } from "react";
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  Pressable,
  Text,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  FadeOut,
  interpolate,
  Layout,
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
import { useDeepCompareMemo } from "use-deep-compare";

import { useHaptic } from "../../../utils/useHaptic";
import {
  LIST_ITEM_HEIGHT,
  PAGE_HEADER,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  SECTION_HEADER_HEIGHT,
  WEEK_STRIP,
} from "../constants";
import { useAnimatedValues } from "../context/AnimatedValues";
import { useCalendarContext } from "../context/CalendarProvider";
import { useDraggableContext } from "../context/DraggableProvider";
import { useRefsContext } from "../context/RefsProvider";
import { useAutoScroll } from "../hooks/useAutoScroll";
import { useStableCallback } from "../hooks/useStableCallback";
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
  ({ calendarSection, index }: CalendarSectionItemProps) => {
    const selection = useHaptic();
    const { currentDraggingItem, dropIndex } = useDraggableContext();

    const derivedPositionValue = useDerivedValue(() => {
      const isDropIndexSame =
        index !== currentDraggingItem.value &&
        dropIndex.value === index &&
        currentDraggingItem.value !== dropIndex.value - 1;

      if (isDropIndexSame && selection) {
        runOnJS(selection)();
      }
      return isDropIndexSame ? withSpring(1) : withSpring(0);
    });

    const animatedDropIndicatorStyle = useAnimatedStyle(() => {
      return {
        opacity: interpolate(derivedPositionValue.value, [0, 1], [0, 1]),
      };
    });

    return (
      <Animated.View
        style={tailwind.style(
          "relative w-full border-b-[1px] border-[#DEDEDE] justify-center px-4 bg-white z-0",
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
          {dayjs(calendarSection.date).format("dddd")} ・{" "}
          {calendarSection.offsetY}
        </Text>
        <Animated.View
          style={[
            tailwind.style(
              "absolute left-0 right-0 top-[-1px] h-[1px] bg-black ml-4 z-10",
            ),
            animatedDropIndicatorStyle,
          ]}
        >
          <Animated.View
            style={[
              tailwind.style("absolute -top-1 h-2 w-2 rounded-full bg-black"),
            ]}
          />
        </Animated.View>
      </Animated.View>
    );
  },
);

// Custom functions to  find closest offset index in UI Thread
function customAbs(x: number) {
  "worklet";
  return x < 0 ? -x : x;
}

function customFloor(x: number) {
  "worklet";
  return x - (x % 1);
}

function findClosestOffsetIndex(scrollY: number, offsets: number[]) {
  "worklet";
  let left = 0;
  let right = offsets.length - 1;
  let closestIndex = 0;
  let closestDifference = customAbs(scrollY - offsets[0]);

  while (left <= right) {
    const mid = customFloor((left + right) / 2);
    const difference = customAbs(scrollY - offsets[mid]);

    if (difference < closestDifference) {
      closestDifference = difference;
      closestIndex = mid;
    }

    if (scrollY < offsets[mid]) {
      right = mid - 1;
    } else if (scrollY > offsets[mid]) {
      left = mid + 1;
    } else {
      // Found an exact match, no need to search further
      return mid;
    }
  }

  return closestIndex;
}

const CalendarEventItem = React.memo(
  ({ calendarItem, index }: CalendarEventItemProps) => {
    const {
      setEditItem,
      eventTitleTextInputRef,
      setSheetTriggerAction,
      flatlistOffsets,
      moveItem,
    } = useCalendarContext();

    const { sheetRef } = useRefsContext();
    const { scrollOffset, currentHoverOffset } = useAnimatedValues();

    const handlePress = () => {
      setEditItem(calendarItem);
      setSheetTriggerAction("EDIT");
      eventTitleTextInputRef?.current?.focus();
      sheetRef?.current?.snapToIndex(0);
    };
    const { top, bottom } = useSafeAreaInsets();
    const {
      setDraggingItem,
      currentDraggingItem,
      dragY,
      dragX,
      positionY,
      dropIndex,
    } = useDraggableContext();

    const selection = useHaptic();

    const startY = useSharedValue(0);

    const [moving, setMoving] = useState(false);

    const derivedValue = useDerivedValue(() =>
      moving ? withSpring(1) : withSpring(0),
    );

    const dragGesture = Gesture.Pan()
      .maxPointers(1)
      .activateAfterLongPress(350)
      .onBegin(event => {
        startY.value = event.y;
        currentHoverOffset.value = event.absoluteY - startY.value;
      })
      .onStart(event => {
        currentDraggingItem.value = index;
        runOnJS(setMoving)(true);
        runOnJS(setDraggingItem)(calendarItem);
        if (selection && !moving) {
          runOnJS(selection)();
        }
        dragY.value = event.translationY;
        dragX.value = event.translationX;

        positionY.value =
          event.absoluteY - (top + PAGE_HEADER + WEEK_STRIP) - event.y;
      })
      .onChange(event => {
        const dragFactor = event.absoluteY - (top + PAGE_HEADER + WEEK_STRIP);
        const visibleHeight =
          SCREEN_HEIGHT - (top + PAGE_HEADER + WEEK_STRIP) - 2 * bottom;
        dragY.value = event.translationY;
        dragX.value = event.translationX;

        currentHoverOffset.value = event.absoluteY - startY.value;
        // We get the mappedScrollY (the dragging point with respect to scroll)
        // Finding the nearest drop index when dragging in <View></View>
        const mappedScrollY =
          scrollOffset.value + (dragFactor / visibleHeight) * visibleHeight;
        const closestDropIndex = findClosestOffsetIndex(
          mappedScrollY,
          flatlistOffsets,
        );

        dropIndex.value = closestDropIndex;
      })
      .onEnd(() => {
        runOnJS(moveItem)(
          currentDraggingItem.value,
          currentDraggingItem.value >= dropIndex.value
            ? dropIndex.value
            : dropIndex.value - 1,
        );
        dropIndex.value = -1;
        runOnJS(setMoving)(false);
        runOnJS(setDraggingItem)(null);
        currentDraggingItem.value = -1;
      });

    const draggingItemStyle = useAnimatedStyle(() => {
      return {
        zIndex: 0,
        opacity: interpolate(derivedValue.value, [0, 1], [1, 0.4]),
      };
    });

    const derivedPositionValue = useDerivedValue(() => {
      const isDropIndexSame =
        index !== currentDraggingItem.value &&
        dropIndex.value === index &&
        currentDraggingItem.value !== dropIndex.value - 1;

      if (isDropIndexSame && selection) {
        runOnJS(selection)();
      }
      return isDropIndexSame ? withSpring(1) : withSpring(0);
    });

    const animatedDropPositionStyle = useAnimatedStyle(() => {
      return {
        opacity: interpolate(derivedPositionValue.value, [0, 1], [0, 1]),
      };
    });

    return (
      <Animated.View layout={Layout.springify()} style={draggingItemStyle}>
        <GestureDetector gesture={dragGesture}>
          <Pressable onPress={handlePress}>
            <Animated.View
              style={[
                tailwind.style(
                  "relative w-full border-b-[1px] border-[#DEDEDE] justify-center ml-4 pr-4",
                  `h-[${LIST_ITEM_HEIGHT}px]`,
                ),
              ]}
            >
              <Text style={tailwind.style("text-lg font-medium text-black")}>
                {calendarItem.title}
              </Text>
              <Text style={tailwind.style("text-sm text-gray-600")}>
                {calendarItem.desc} - {index} - {calendarItem.order}
              </Text>
              <Animated.View
                style={[
                  tailwind.style(
                    "absolute left-0 right-0 top-[-1px] h-[1px] bg-black z-10",
                  ),
                  animatedDropPositionStyle,
                ]}
              >
                <Animated.View
                  style={tailwind.style(
                    "absolute -top-1 h-2 w-2 rounded-full bg-black",
                  )}
                />
              </Animated.View>
            </Animated.View>
          </Pressable>
        </GestureDetector>
      </Animated.View>
    );
  },
);

export const CAgenda = () => {
  const {
    selectedDate,
    transformedDatesList,
    isManualScrolling,
    setIsManualScrolling,
    setIsMomentumScrollBegin,
  } = useCalendarContext();

  const { agendaListRef: aref } = useRefsContext();

  const [isDateSetOnScroll, setIsDateSetOnScroll] = useState(false);
  const hapticSelection = useHaptic();
  const {
    scrollOffset,
    scrollViewSize,
    containerSize,
    autoScrolling,
    setAutoScrolling,
  } = useAnimatedValues();
  const { draggingItem, dragY, dragX, positionY } = useDraggableContext();

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

  const findClosestScrollIndex = () => {
    const offsets = transformedDatesList.map(
      value => value.type === "HeaderItem" && value.offsetY,
    ) as number[];
    const nearestValue = findNearestValue(offsets, scrollOffset.value);
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
    const nearestValue = findNearestValue(offsets, scrollOffset.value);
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
      if (autoScrolling) {
        return;
      }
      if (!isManualScrolling) {
        const { contentOffset } = event;
        scrollOffset.value = contentOffset.y;
        runOnJS(changeDateOnScroll)();
        runOnJS(setIsDateSetOnScroll)(true);
      }
    },

    onMomentumEnd: event => {
      if (autoScrolling) {
        const { contentOffset } = event;
        scrollOffset.value = contentOffset.y;
        runOnJS(setAutoScrolling)(false);
        return;
      }
      // It is called twice while fixing the bug, need to check
      if (!isManualScrolling) {
        runOnJS(setIsDateSetOnScroll)(false);
        const { contentOffset } = event;
        scrollOffset.value = contentOffset.y;
        runOnJS(findClosestScrollIndex)();
      }
      runOnJS(setIsMomentumScrollBegin)(false);
    },
  });

  const initialScrollIndex = useDeepCompareMemo(() => {
    const currentIndex = transformedDatesList
      .filter(item => item.type === "HeaderItem")
      .filter(item => item.date === selectedDate.value);

    const scrollIndex = transformedDatesList.findIndex(
      value => value.date === currentIndex[0].date,
    );
    scrollOffset.value =
      currentIndex[0].type === "HeaderItem" ? currentIndex[0].offsetY : 0;
    return scrollIndex;
  }, [selectedDate.value]);

  const _onScrollEndDrag = useEvent((event: NativeScrollEvent) => {
    "worklet";
    if (event.velocity?.y === 0) {
      runOnJS(setIsDateSetOnScroll)(false);
      const { contentOffset } = event;
      scrollOffset.value = contentOffset.y;
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
      transform: [{ translateY: dragY.value }, { translateX: dragX.value }],
      backgroundColor: "rgba(255,255,255,0.8)",
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
      // shadowColor: "#000",
      // shadowOffset: {
      //   width: 0,
      //   height: 2,
      // },
      // shadowOpacity: 0.23,
      // shadowRadius: 2.62,
      // elevation: 4,
    };
  });

  const onContentSizeChange = useStableCallback((w: number, h: number) => {
    scrollViewSize.value = h;
  });

  const onLayout = useStableCallback((event: LayoutChangeEvent) => {
    setTimeout(() => {
      setIsManualScrolling(false);
      setIsDateSetOnScroll(false);
      setIsMomentumScrollBegin(false);
    }, 300);

    const {
      nativeEvent: { layout },
    } = event;
    containerSize.value = layout.height;
  });

  useAutoScroll();

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
        onContentSizeChange={onContentSizeChange}
        onLayout={onLayout}
        onScrollEndDrag={_onScrollEndDrag}
        onMomentumScrollBegin={_onMomentumBegin}
        showsVerticalScrollIndicator={false}
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
      />
    </Animated.View>
  );
};
