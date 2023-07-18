import { useCallback, useRef, useState } from "react";
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
import {
  CalendarAgendaProps,
  CalendarListItemProps,
  ListItemType,
} from "../types/calendarTypes";
import { calculateDates } from "../utils";

export const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

const LIST_ITEM_HEIGHT = 40;

const CalendarListItem = ({ item }: CalendarListItemProps) => {
  return (
    <View
      style={tailwind.style(
        "w-full h-10 border-b-[1px] border-[#DEDEDE] justify-center px-4",
      )}
    >
      <Text style={tailwind.style("font-semibold text-base")}>
        {dayjs(item.date).format("MMM DD")} ・ {dayjs(item.date).format("dddd")}
      </Text>
    </View>
  );
};

export const CAgenda = (props: CalendarAgendaProps) => {
  const aref = useRef<FlashList<string>>(null);
  const { selectedDate } = props;
  const [isManualScrolling, setIsManualScrolling] = useState(true);
  const [isDateSetOnScroll, setIsDateSetOnScroll] = useState(false);
  const hapticSelection = useHaptic("heavy");

  const pages = calculateDates(
    DEFAULT_PROPS.FIRST_DAY,
    DEFAULT_PROPS.MIN_DATE,
    DEFAULT_PROPS.MAX_DATE,
    DEFAULT_PROPS.INITIAL_DATE,
  );

  const transformDates = useCallback(
    (dateList: typeof pages.day.data) => {
      const convertedDates = dateList.map((date, index) => ({
        date,
        index,
        offsetY: index * SECTION_HEADER_HEIGHT,
      }));
      return convertedDates;
    },
    [pages],
  );

  const scroll = useSharedValue(pages.day.index * SECTION_HEADER_HEIGHT);

  const transformedDatesList = transformDates(pages.day.data) as ListItemType[];

  // This is the code which triggers the two way linking [Scroll Blocking Required]
  const manualScroll = (newSelectedDate: string) => {
    let newOffset = transformedDatesList.filter(
      value => value.date === newSelectedDate,
    )[0].offsetY;
    setIsManualScrolling(true);
    aref.current?.scrollToIndex({
      index: newOffset / LIST_ITEM_HEIGHT,
      animated: false,
    });
    setTimeout(() => {
      setIsManualScrolling(false);
    }, 500);
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
    aref.current?.scrollToOffset({
      offset: closestScrollIndex,
      animated: true,
    });
  };

  const changeDateOnScroll = () => {
    const closestScrollIndex =
      Math.round(scroll.value / LIST_ITEM_HEIGHT) * LIST_ITEM_HEIGHT;
    selectedDate.value = pages.day.data[closestScrollIndex / LIST_ITEM_HEIGHT];
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

  return (
    <Animated.View style={tailwind.style("flex-1", `w-[${SCREEN_WIDTH}px]`)}>
      <AnimatedFlashList
        // @ts-ignore
        ref={aref}
        onScroll={scrollHandler}
        onLayout={handleOnLayout}
        // onScroll={_onScroll}
        // onMomentumScrollBegin={_onMomentumScrollBegin}
        // onMomentumScrollEnd={_onMomentumEnd}
        // onScrollEndDrag={_onScrollAnimationEnd}
        // onScrollAnimationEnd={_onScrollAnimationEnd}
        data={transformedDatesList}
        initialScrollIndex={pages.day.index}
        estimatedItemSize={LIST_ITEM_HEIGHT}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => (
          <CalendarListItem index={index} item={item as ListItemType} />
        )}
      />
    </Animated.View>
  );
};
