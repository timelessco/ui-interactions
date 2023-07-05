import { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  Text,
  View,
} from "react-native";
import Animated, {
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useSharedValue,
} from "react-native-reanimated";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import tailwind from "twrnc";

import { DEFAULT_PROPS } from "./constants";
import { calculateDates } from "./utils";

const SCREEN_WIDTH = Dimensions.get("screen").width;
const SECTION_HEADER_HEIGHT = 40;

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

const week = ["S", "M", "T", "W", "T", "F", "S"];

function previousMultipleOfSeven(value: number) {
  var previousMultiple = Math.floor(value / 7) * 7;
  return previousMultiple;
}

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

  const handleDayPress = useCallback(() => {
    selectedDate.value = props.data.item;
  }, [props.data.item, selectedDate]);

  const previousLowestValue = previousMultipleOfSeven(SCREEN_WIDTH);
  const padding = SCREEN_WIDTH - previousLowestValue + 14;

  return (
    <Pressable
      style={tailwind.style(
        "flex-row items-center justify-center",
        `w-[${Math.floor((SCREEN_WIDTH - padding) / 7)}px] h-9`,
      )}
      onPress={handleDayPress}
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

type WeekStripProps = {
  selectedDate: SharedValue<string>;
};

const WeekStrip = (props: WeekStripProps) => {
  const aref = useRef<FlashList<string>>(null);
  const { selectedDate } = props;
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

    if (newIndex !== prevIndex) {
      aref.current?.scrollToIndex({
        index: newIndex - 1,
        animated: true,
      });
    }
  };

  useAnimatedReaction(
    () => selectedDate.value,
    (next, prev) => {
      if (prev) {
        runOnJS(manualScroll)(next, prev);
      }
    },
  );

  const previousLowestValue = previousMultipleOfSeven(SCREEN_WIDTH);
  const padding = SCREEN_WIDTH - previousLowestValue + 14;

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
          ref={aref}
          data={pages.day.data}
          initialScrollIndex={pages.day.index - dayjs().day()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          estimatedItemSize={(SCREEN_WIDTH - padding) / 7}
          estimatedListSize={{ width: SCREEN_WIDTH - padding, height: 36 }}
          renderItem={value => {
            return <CalendarDay data={value} selectedDate={selectedDate} />;
          }}
        />
      </Animated.View>
    </View>
  );
};

type ListItemType = {
  date: string;
  index: number;
  offsetY: number;
};

type CalendarListItemProps = {
  item: ListItemType;
  index: number;
};

const CalendarListItem = ({ item }: CalendarListItemProps) => {
  return (
    <View
      style={tailwind.style(
        "w-full h-10 border-b-[1px] border-[#DEDEDE] justify-center px-4",
      )}
    >
      <Text style={tailwind.style("font-semibold text-base")}>
        {dayjs(item.date).format("MMM DD")} ・{dayjs(item.date).format("dddd")}
        ・{item.offsetY}px
      </Text>
    </View>
  );
};

type CalendarAgendaProps = {
  selectedDate: SharedValue<string>;
};

const CalendarAgenda = (props: CalendarAgendaProps) => {
  const aref = useRef<FlashList<string>>(null);
  const { selectedDate } = props;
  const [isManualScrolling, setIsManualScrolling] = useState(false);
  const [isDateSetOnScroll, setIsDateSetOnScroll] = useState(false);

  const pages = calculateDates(
    DEFAULT_PROPS.FIRST_DAY,
    DEFAULT_PROPS.MIN_DATE,
    DEFAULT_PROPS.MAX_DATE,
    DEFAULT_PROPS.INITIAL_DATE,
  );

  const scroll = useSharedValue(pages.day.index * SECTION_HEADER_HEIGHT);
  function transformDates(dateList: typeof pages.day.data) {
    const convertedDates = dateList.map((date, index) => ({
      date,
      index,
      offsetY: index * SECTION_HEADER_HEIGHT,
    }));
    return convertedDates;
  }

  const transformedDatesList = transformDates(pages.day.data) as ListItemType[];

  // This is the code which triggers the two way linking [Scroll Blocking Required]
  const manualScroll = (newSelectedDate: string) => {
    if (!isManualScrolling) {
      let newOffset = transformedDatesList.filter(
        value => value.date === newSelectedDate,
      )[0].offsetY;
      setIsManualScrolling(true);
      aref.current?.scrollToOffset({
        offset: newOffset,
        animated: false,
      });
      setTimeout(() => {
        setIsManualScrolling(false);
      }, 300);
    }
  };

  useAnimatedReaction(
    () => selectedDate.value,
    (next, prev) => {
      if (next !== prev) {
        if (!isManualScrolling && !isDateSetOnScroll) {
          runOnJS(manualScroll)(next);
        }
      }
    },
  );

  const _onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!isManualScrolling) {
      const { contentOffset } = event.nativeEvent;
      scroll.value = contentOffset.y;
      const closestScrollIndex = Math.round(scroll.value / 40) * 40;
      selectedDate.value = pages.day.data[closestScrollIndex / 40];
      setIsDateSetOnScroll(true);
    }
  };

  const _onMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!isManualScrolling) {
      const { contentOffset } = event.nativeEvent;
      scroll.value = contentOffset.y;
      const closestScrollIndex = Math.round(scroll.value / 40) * 40;
      aref.current?.scrollToOffset({
        offset: closestScrollIndex,
        animated: true,
      });
      setIsDateSetOnScroll(false);
    }
  };

  const _onScrollAnimationEnd = () => {
    setIsDateSetOnScroll(false);
  };

  return (
    <Animated.View style={tailwind.style("flex-1", `w-[${SCREEN_WIDTH}px]`)}>
      <AnimatedFlashList
        // @ts-ignore
        ref={aref}
        onScroll={_onScroll}
        onMomentumScrollEnd={_onMomentumEnd}
        onScrollAnimationEnd={_onScrollAnimationEnd}
        data={transformedDatesList}
        initialScrollIndex={pages.day.index}
        estimatedItemSize={40}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => (
          <CalendarListItem index={index} item={item as ListItemType} />
        )}
      />
    </Animated.View>
  );
};

export const CalendarUI = () => {
  const selectedDate = useSharedValue(dayjs().format("YYYY-MM-DD"));

  return (
    <View style={tailwind.style("flex-1")}>
      <Animated.View
        style={[tailwind.style("flex-row items-center py-2.5 px-4")]}
      >
        <Text style={tailwind.style("text-3xl font-bold text-black")}>
          Calendar
        </Text>
      </Animated.View>
      <WeekStrip {...{ selectedDate }} />
      <CalendarAgenda {...{ selectedDate }} />
    </View>
  );
};
