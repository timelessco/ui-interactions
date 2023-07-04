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

  return (
    <Pressable
      style={tailwind.style(
        "flex-row items-center justify-center",
        `w-[${SCREEN_WIDTH / 7}px] h-9`,
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

  return (
    <View style={tailwind.style("border-b border-[#EEEEEE] pb-4")}>
      <View
        style={tailwind.style(
          "flex flex-row items-center justify-around pt-10",
        )}
      >
        {week.map((day, index) => {
          return (
            <View
              style={tailwind.style(
                "flex flex-row items-center justify-center",
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
      <Animated.View style={tailwind.style("h-9", `w-[${SCREEN_WIDTH}px]`)}>
        <AnimatedFlashList
          // @ts-ignore
          ref={aref}
          data={pages.day.data}
          initialScrollIndex={pages.day.index - dayjs().day()}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          scrollEventThrottle={16}
          estimatedItemSize={SCREEN_WIDTH / 7}
          estimatedListSize={{ width: SCREEN_WIDTH, height: 36 }}
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

  // const manualScroll = (newSelectedDate: string) => {
  //   let newIndex = transformedDatesList.filter(
  //     value => value.date === newSelectedDate,
  //   )[0].index;
  //   aref.current?.scrollToOffset({
  //     offset: newIndex * SECTION_HEADER_HEIGHT,
  //     animated: false,
  //   });
  // };

  // useAnimatedReaction(
  //   () => selectedDate.value,
  //   (next, _prev) => {
  //     runOnJS(manualScroll)(next);
  //   },
  // );

  const transformedDatesList = transformDates(pages.day.data) as ListItemType[];
  const _onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset } = event.nativeEvent;
    scroll.value = contentOffset.y;
    const closestScrollIndex = Math.round(scroll.value / 40) * 40;
    selectedDate.value = pages.day.data[closestScrollIndex / 40];
  };

  const _onMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset } = event.nativeEvent;
    scroll.value = contentOffset.y;
    const closestScrollIndex = Math.round(scroll.value / 40) * 40;

    aref.current?.scrollToOffset({
      offset: closestScrollIndex,
      animated: true,
    });
  };

  return (
    <Animated.View style={tailwind.style("flex-1", `w-[${SCREEN_WIDTH}px]`)}>
      <AnimatedFlashList
        // @ts-ignore
        ref={aref}
        onScroll={_onScroll}
        onMomentumScrollEnd={_onMomentumEnd}
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
      <WeekStrip {...{ selectedDate }} />
      <CalendarAgenda {...{ selectedDate }} />
    </View>
  );
};
