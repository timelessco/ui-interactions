import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Gesture, GestureDetector, State } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  Layout,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { ClipPath, Defs, G, Path, Rect, Svg } from "react-native-svg";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import dayjs from "dayjs";
import tailwind from "twrnc";

import {
  CalendarEvent,
  ColorComboType,
  COLORS,
  COLORS_COMBO,
  useEventStore,
} from "../utils/useEventState";
import { useHaptic } from "../utils/useHaptic";

const CalendarIcon = () => {
  return (
    <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <Path
        d="M17.5 8.33332H2.5M13.3333 1.66666V4.99999M6.66667 1.66666V4.99999M6.5 18.3333H13.5C14.9001 18.3333 15.6002 18.3333 16.135 18.0608C16.6054 17.8212 16.9878 17.4387 17.2275 16.9683C17.5 16.4335 17.5 15.7335 17.5 14.3333V7.33332C17.5 5.93319 17.5 5.23313 17.2275 4.69835C16.9878 4.22794 16.6054 3.84549 16.135 3.60581C15.6002 3.33332 14.9001 3.33332 13.5 3.33332H6.5C5.09987 3.33332 4.3998 3.33332 3.86502 3.60581C3.39462 3.84549 3.01217 4.22794 2.77248 4.69835C2.5 5.23313 2.5 5.93319 2.5 7.33332V14.3333C2.5 15.7335 2.5 16.4335 2.77248 16.9683C3.01217 17.4387 3.39462 17.8212 3.86502 18.0608C4.3998 18.3333 5.09987 18.3333 6.5 18.3333Z"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const ClockIcon = () => {
  return (
    <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <G clip-path="url(#clip0_7026_48458)">
        <Path
          d="M9.99996 4.99999V9.99999L13.3333 11.6667M18.3333 9.99999C18.3333 14.6024 14.6023 18.3333 9.99996 18.3333C5.39759 18.3333 1.66663 14.6024 1.66663 9.99999C1.66663 5.39762 5.39759 1.66666 9.99996 1.66666C14.6023 1.66666 18.3333 5.39762 18.3333 9.99999Z"
          stroke="black"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_7026_48458">
          <Rect width="20" height="20" fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};

const LocationIcon = () => {
  return (
    <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <Path
        d="M10 9C10.5523 9 11 8.55228 11 8C11 7.44772 10.5523 7 10 7C9.44772 7 9 7.44772 9 8C9 8.55228 9.44772 9 10 9Z"
        fill="black"
      />
      <Path
        d="M10 18.3334C13.3334 15 16.6667 12.0153 16.6667 8.33335C16.6667 4.65146 13.6819 1.66669 10 1.66669C6.31814 1.66669 3.33337 4.65146 3.33337 8.33335C3.33337 12.0153 6.66671 15 10 18.3334Z"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

type TimeSegementRenderProps = {
  item: string;
  index: number;
};

const timeline = [
  "12 AM",
  "1 AM",
  "2 AM",
  "3 AM",
  "4 AM",
  "5 AM",
  "6 AM",
  "7 AM",
  "8 AM",
  "9 AM",
  "10 AM",
  "11 AM",
  "12 PM",
  "1 PM",
  "2 PM",
  "3 PM",
  "4 PM",
  "5 PM",
  "6 PM",
  "7 PM",
  "8 PM",
  "9 PM",
  "10 PM",
  "11 PM",
  "12 AM",
];

const week = ["S", "M", "T", "W", "T", "F", "S"];
const days = [
  "2023-10-23",
  "2023-10-24",
  "2023-10-25",
  "2023-10-26",
  "2023-10-27",
  "2023-10-28",
  "2023-10-29",
];

const SEGMENT_HEIGHT = 72;
const SEGMENT_WIDTH = Dimensions.get("screen").width - (16 + 16 + 44);

function formatTimeIntoMins(totalMins: string) {
  const minutes = parseInt(totalMins, 10);
  if (minutes <= 60) {
    return `${minutes}m`;
  } else {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${mins}m`;
    }
  }
}

/**
 * "If you pass a string to this function, it will return a string."
 *
 * The type annotation for the date parameter of the formatDate function describes the type of the date
 * parameter as a string
 * @param {string} dateString - The date string to format.
 * @returns A string that is the date in the format of "Month Day, Year"
 */
function formatDate(dateString: string) {
  const date = new Date(dateString);
  const options = {
    month: "long",
    day: "numeric",
    weekday: "long",
  } as Intl.DateTimeFormatOptions;
  return date.toLocaleDateString("en-US", options);
}

/**
 * It takes a time string in the format "HH:MM" and returns a formatted time string in the format
 * "HH:MM AM/PM"
 * @param {string} timeString - a string representing a time in the format "HH:MM"
 * @returns a string that is formatted to be in 12 hour time.
 */
function formatTime(time: string) {
  "worklet";
  // Parse the time string into hours and minutes
  var hours = parseInt(time.substring(0, 2), 10);
  var minutes = parseInt(time.substring(3, 5), 10);

  // Determine the AM/PM suffix
  var suffix = hours >= 12 ? "PM" : "AM";

  // Convert hours from 24-hour format to 12-hour format
  hours = ((hours + 11) % 12) + 1;

  // Return the formatted time string
  return hours + ":" + (minutes < 10 ? "0" : "") + minutes + " " + suffix;
}

const parseTime = (formattedTime: string) => {
  // Extracting hours, minutes and period from the formattedTime string
  const [time, period] = formattedTime.split(" ");
  const [hours, minutes] = time.split(":").map(str => parseInt(str, 10));

  // Converting hours to 24-hour format
  const isPM = period.toUpperCase() === "PM";
  const convertedHours = isPM ? (hours === 12 ? 12 : hours + 12) : hours % 12;

  // Concatenating hours and minutes to form the new time string
  const convertedTime = `${
    convertedHours < 10 ? "0" : ""
  }${convertedHours}:${minutes}`;

  return convertedTime;
};

const convertMinutesToPixels = (minutes: number) => {
  "worklet";
  const pixelsPerMinute = SEGMENT_HEIGHT / 60;
  const pixels = minutes * pixelsPerMinute;
  return pixels;
};

const convertPixelsToMinutes = (pixels: number) => {
  "worklet";
  const pixelsPerMinute = SEGMENT_HEIGHT / 60;
  const minutesPerPixel = 1 / pixelsPerMinute;
  const minutes = pixels * minutesPerPixel;
  return minutes;
};

const MINS_MULTIPLIER = convertMinutesToPixels(30);

const INIT_POINTER_HEIGHT = convertMinutesToPixels(30);

/**
 * It takes in a start time and an end time, and returns the height and translateY values for a section
 * Where every minute takes up 1px
 * A Time between 00:15 - 00:30 is of height 15px
 * @param {string} startTime - The start time of the section.
 * @param {string} endTime - The end time of the section.
 * @returns An object with two properties: heightValue and translateYValue.
 */
const getSectionMeasurements = (startTime: string, endTime: string) => {
  let [startHour, startMinute] = parseTime(startTime).split(":").map(Number);
  let [endHour, endMinute] = parseTime(endTime).split(":").map(Number);

  let startTimeInMinutes = 60 * startHour + startMinute;
  let endTimeInMinutes = 60 * endHour + endMinute;

  return {
    heightValue: endTimeInMinutes - startTimeInMinutes,
    translateYValue: startTimeInMinutes,
  };
};

const TimeSegmentRender = memo((props: TimeSegementRenderProps) => {
  const { item, index } = props;
  return (
    <Animated.View
      style={tailwind.style("relative flex flex-row items-start px-4")}
    >
      <Text
        style={tailwind.style(
          "w-11 text-xs text-[#707070] font-medium pr-2 bottom-2",
        )}
      >
        {item}
      </Text>
      <View
        key={index}
        style={[
          tailwind.style(
            `flex-1 flex-col items-center px-4 ${
              index === timeline.length - 1 ? "h-0" : `h-[${SEGMENT_HEIGHT}px]`
            } border-t-[1px] border-black pr-4`,
          ),
          styles.hourSegmentStyle,
        ]}
      />
    </Animated.View>
  );
});
type EventComponentProps = {
  event: CalendarEvent;
};
const EventComponent = (props: EventComponentProps) => {
  const { event } = props;
  const isEvent30Mins = event.height === 30;
  return (
    <Animated.View
      key={event.date + event.title + event.height + event.startTime}
      style={[
        tailwind.style(
          "absolute flex flex-row w-full pl-3 justify-between my-[1px] pr-3 left-15 overflow-hidden",
          `w-[${SEGMENT_WIDTH}px]`,
          isEvent30Mins
            ? { alignItems: "center", borderRadius: 10 }
            : "pt-3 items-start rounded-xl",
        ),
        {
          backgroundColor: event.color.bg,
          height: convertMinutesToPixels(event.height) - 2,
          transform: [{ translateY: convertMinutesToPixels(event.translateY) }],
        },
      ]}
    >
      <Animated.Text
        style={[
          tailwind.style("text-white font-medium"),
          styles.eventText,
          { color: event.color.text },
        ]}
      >
        {event.title}
      </Animated.Text>
      <Animated.Text
        style={[
          tailwind.style("text-white font-semibold"),
          styles.bottomSheetTotalTimeText,
          {
            color: event.color.text,
          },
        ]}
      >
        {formatTimeIntoMins(event.totalTime)}
      </Animated.Text>
    </Animated.View>
  );
};

export const EventCreation = () => {
  const hapticSelection = useHaptic();
  const [selectedDate, setSelectedDate] = useState(days[2]);
  const eventStore = useEventStore();
  const [currentEvent, setCurrentEvent] = useState<CalendarEvent | null>(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [totalTime, setTotalTime] = useState("");

  // Pan handling State
  const [state, setGestureState] = useState<State>(State.UNDETERMINED);
  const panActive = useSharedValue(0);
  const startPoint = useSharedValue(0);
  const startIndex = useSharedValue(0);
  const endIndex = useSharedValue(0);
  const currentPoint = useSharedValue(0);
  const marginTop = useSharedValue(0);
  const textScale = useSharedValue(0);
  const selectionHeight = useSharedValue(INIT_POINTER_HEIGHT);
  const movingSegmentBackground = useSharedValue<ColorComboType>(
    COLORS_COMBO.blue,
  );

  const inputRef = useRef<TextInput>(null);
  const locationInputRef = useRef<TextInput>(null);
  // Pan handling State
  useAnimatedReaction(
    () => [startIndex.value, endIndex.value],
    (next, _prev) => {
      const convertedValues = next.map(value => convertPixelsToMinutes(value));
      textScale.value = withSpring(
        Math.abs(
          convertPixelsToMinutes(convertedValues[0]) -
            convertPixelsToMinutes(convertedValues[1]),
        ),
        {
          mass: 1,
          damping: 20,
          stiffness: 180,
        },
      );
      const getTimeFromMins = (minutes: number) => {
        const hours = Math.floor(minutes / 60) % 24;
        const remainingMinutes = minutes % 60;
        const time =
          (hours < 10 ? "0" + hours : hours) +
          ":" +
          (remainingMinutes < 10 ? "0" + remainingMinutes : remainingMinutes);

        return time;
      };
      runOnJS(setTotalTime)(`${convertedValues[1] - convertedValues[0]}`);
      runOnJS(setStartTime)(formatTime(getTimeFromMins(convertedValues[0])));
      runOnJS(setEndTime)(formatTime(getTimeFromMins(convertedValues[1])));
    },
  );

  const getRandomColor = (): ColorComboType => {
    "worklet";
    const colors = Object.values(COLORS_COMBO);
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  };

  const panGesture = Gesture.Pan()
    .shouldCancelWhenOutside(true)
    .activateAfterLongPress(400)
    .onBegin(() => {
      movingSegmentBackground.value = getRandomColor();
    })
    .onStart(event => {
      if (event.y <= 0 || event.y >= SEGMENT_HEIGHT * MINS_MULTIPLIER) {
        return;
      }
      runOnJS(setGestureState)(event.state);
      panActive.value = withSpring(1);
      const panStartPos = event.y;
      const nearestTimePos =
        Math.floor(panStartPos / MINS_MULTIPLIER) * MINS_MULTIPLIER;

      startPoint.value = nearestTimePos;
      currentPoint.value = startPoint.value;
      startIndex.value = startPoint.value;
      endIndex.value = startPoint.value + INIT_POINTER_HEIGHT;
      hapticSelection && runOnJS(hapticSelection)();
    })
    .onChange(event => {
      /*
       ** Checking if the event.y is less than or equal to 0 or greater than or equal to 1440.
       ** If it is, it will not perform any gesture related changes.
       */
      if (event.y <= 0 || event.y >= SEGMENT_HEIGHT * 60) {
        return;
      }
      runOnJS(setGestureState)(event.state);

      if (event.translationY > 0) {
        // Gesture has started, and translation is happening downwards
        // Write a case on translating the PanGesture into height change snaps
        const computedHeight =
          Math.ceil(event.translationY / MINS_MULTIPLIER) * MINS_MULTIPLIER;
        selectionHeight.value = computedHeight;

        // Checking if there is a new end point based on the new computed height,
        // if yes setting the new end point
        if (endIndex.value !== startIndex.value + computedHeight) {
          endIndex.value = startIndex.value + computedHeight;
        }
      } else if (event.translationY === 0) {
        // When there hasnt been any translation the height remains the same
        selectionHeight.value = INIT_POINTER_HEIGHT;
      } else {
        // Write a case on translating the PanGesture into height change snaps on reverse direction
        // And also setting a negative margin gives the feel the container is been increasing height on top

        const computedHeight =
          Math.ceil(Math.abs(event.translationY) / MINS_MULTIPLIER) *
          MINS_MULTIPLIER;
        selectionHeight.value = computedHeight;

        // Checking if there is a new start point based on the new computed height,
        // while the finger moves up, if yes setting the new start point
        if (endIndex.value - computedHeight !== startIndex.value) {
          // while moving in reverse changing the start point
          startIndex.value = endIndex.value - computedHeight;
        }
        marginTop.value = INIT_POINTER_HEIGHT - selectionHeight.value;
      }
    })
    .onEnd(event => {
      runOnJS(setGestureState)(event.state);
      if (currentEvent === null) {
        runOnJS(setCurrentEvent)({
          id: new Date().getTime(),
          color: movingSegmentBackground.value,
          date: selectedDate,
          startTime,
          endTime,
          totalTime,
          title: "",
          translateY: 0,
          height: 0,
          location: "",
        });
      } else {
        runOnJS(setCurrentEvent)({
          ...currentEvent,
          startTime,
          endTime,
        });
      }
      movingSegmentBackground.value = COLORS_COMBO.blue;
      hapticSelection && runOnJS(hapticSelection)();
      panActive.value = 0;
      selectionHeight.value = INIT_POINTER_HEIGHT;
      startPoint.value = 0;
      currentPoint.value = 0;
      endIndex.value = 0;
      startIndex.value = 0;
      marginTop.value = 0;
    });

  const movingSegmentStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: movingSegmentBackground.value.bg,
      top: startPoint.value + 2,
      height: withSpring(selectionHeight.value - 4, {
        mass: 1,
        damping: 30,
        stiffness: 250,
      }),
      opacity: interpolate(
        panActive.value,
        [0, 1],
        [0, 1],
        Extrapolation.CLAMP,
      ),
      borderRadius: interpolate(
        selectionHeight.value,
        [0, 30, 45],
        [0, 10, 12],
        Extrapolation.CLAMP,
      ),
      width: interpolate(
        panActive.value,
        [0, 1],
        [0, SEGMENT_WIDTH],
        Extrapolation.CLAMP,
      ),
      marginTop: withSpring(marginTop.value, {
        mass: 1,
        damping: 30,
        stiffness: 250,
      }),
      zIndex: 99999,
    };
  });

  const textContainerStyle = useAnimatedStyle(() => {
    return {
      fontSize: interpolate(
        textScale.value,
        [30, 60],
        [10, 12],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          translateY: interpolate(
            textScale.value,
            [30, 60],
            [4, 8],
            Extrapolation.CLAMP,
          ),
        },
        {
          translateX: interpolate(
            textScale.value,
            [30, 60],
            [6, 8],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  useEffect(() => {
    if (currentEvent !== null && state === State.END) {
      setGestureState(State.UNDETERMINED);
      inputRef.current?.focus();
      sheetRef?.current?.snapToIndex(0);
    }
  }, [currentEvent, state]);

  // Bottomsheet related props
  // hooks
  const sheetRef = useRef<BottomSheet>(null);

  // variables
  const snapPoints = useMemo(() => ["40%"], []);

  const handleOnChangeText = useCallback(
    (text: string) => {
      if (currentEvent) {
        setCurrentEvent({ ...currentEvent, title: text });
      }
    },
    [currentEvent],
  );

  const handleOnChangeLocation = useCallback(
    (text: string) => {
      if (currentEvent) {
        setCurrentEvent({ ...currentEvent, location: text });
      }
    },
    [currentEvent],
  );

  const handleAddEventPress = useCallback(() => {
    if (currentEvent && currentEvent.title.length >= 5) {
      const sectionMeasurement = getSectionMeasurements(
        currentEvent.startTime,
        currentEvent.endTime,
      );
      eventStore.addEvent({
        ...currentEvent,
        translateY: sectionMeasurement.translateYValue,
        height: sectionMeasurement.heightValue,
      });
      setCurrentEvent(null);
      sheetRef.current?.close();
      inputRef.current?.blur();
      locationInputRef.current?.blur();
    } else {
      Alert.alert(
        "Enter event title",
        "Event title must be longer than 4 characters.",
        [{ text: "OK", onPress: () => inputRef.current?.focus() }],
      );
    }
  }, [currentEvent, eventStore]);

  const handleOnCloseSheet = useCallback(() => {
    sheetRef.current?.close();
    inputRef.current?.blur();
    locationInputRef.current?.blur();
    setCurrentEvent(null);
  }, []);

  // renders
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        pressBehavior={"none"}
        {...props}
        opacity={0.75}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    [],
  );

  return (
    <SafeAreaView style={tailwind.style("flex-1 bg-white pb-5")}>
      <StatusBar barStyle={"dark-content"} />
      <View style={tailwind.style("px-4 py-1")}>
        <Text style={tailwind.style("text-3xl font-bold text-black")}>
          Today
        </Text>
        <Animated.View style={tailwind.style("py-2")}>
          <View
            style={tailwind.style(
              "flex flex-row w-full justify-between items-center",
            )}
          >
            {week.map((day, index) => {
              return (
                <View
                  style={tailwind.style("flex flex-row flex-1 justify-center")}
                  key={day + index}
                >
                  <Text
                    style={tailwind.style("text-sm font-medium text-[#9A9A9A]")}
                  >
                    {day}
                  </Text>
                </View>
              );
            })}
          </View>
          <View
            style={tailwind.style(
              "flex flex-row w-full justify-between items-center mt-1",
            )}
          >
            {days.map(day => {
              const isSelected = dayjs(selectedDate).isSame(dayjs(day), "day");
              return (
                <Pressable
                  key={day}
                  onPress={() => setSelectedDate(day)}
                  style={tailwind.style(
                    "flex flex-row flex-1 justify-center items-center",
                  )}
                >
                  <View
                    style={tailwind.style(
                      "flex items-center justify-center w-9 h-9",
                      isSelected ? "bg-black rounded-full" : "",
                    )}
                  >
                    <Text
                      style={tailwind.style(
                        "text-lg text-center text-black font-medium",
                        isSelected ? "text-white" : "",
                      )}
                    >
                      {dayjs(day).date()}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>
      </View>
      <Animated.View style={tailwind.style("relative")}>
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          style={tailwind.style("py-4")}
        >
          <GestureDetector gesture={panGesture}>
            <View style={tailwind.style("")}>
              {timeline.map((item, index) => {
                return (
                  <TimeSegmentRender
                    key={item + index}
                    {...{
                      item,
                      index,
                      gestureState: state,
                    }}
                  />
                );
              })}
            </View>
          </GestureDetector>
          <Animated.View style={tailwind.style("h-25")} />
          {eventStore.events.map(event => {
            return event.date === selectedDate ? (
              <EventComponent
                key={event.date + event.startTime + event.endTime}
                event={event}
              />
            ) : null;
          })}

          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              tailwind.style("left-15 overflow-hidden"),
              movingSegmentStyle,
            ]}
          >
            <Animated.View layout={Layout.springify()}>
              <Animated.Text
                style={[
                  tailwind.style("font-medium text-white"),
                  textContainerStyle,
                ]}
              >
                {startTime}-{endTime}
                {"\n"}
                {"New Event"}
              </Animated.Text>
            </Animated.View>
          </Animated.View>
        </Animated.ScrollView>
      </Animated.View>
      <BottomSheet
        index={-1}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        ref={sheetRef}
        snapPoints={snapPoints}
        handleStyle={styles.handleStyle}
        handleIndicatorStyle={styles.handleIndicatorStyle}
        backgroundStyle={tailwind.style("bg-white")}
        onClose={handleOnCloseSheet}
      >
        <BottomSheetView style={tailwind.style("flex-1 bg-white px-5")}>
          <View
            style={tailwind.style(
              "flex flex-row justify-between items-center py-4",
            )}
          >
            {Object.keys(COLORS_COMBO).map(color => {
              const isSelected =
                JSON.stringify(currentEvent?.color) ===
                JSON.stringify(COLORS_COMBO[color as COLORS]);
              const handleColorPress = () => {
                if (currentEvent !== null) {
                  setCurrentEvent({
                    ...currentEvent,
                    color: COLORS_COMBO[color as COLORS],
                  });
                }
              };
              return (
                <Pressable
                  onPress={handleColorPress}
                  style={[
                    tailwind.style(
                      "h-7 w-7 flex items-center justify-center rounded-full",
                    ),
                    isSelected
                      ? {
                          ...tailwind.style("border-[2px]"),
                          ...{
                            borderColor: COLORS_COMBO[color as COLORS].bg,
                          },
                        }
                      : {},
                  ]}
                  key={color}
                >
                  <View
                    style={[
                      tailwind.style("h-5 w-5 rounded-full"),
                      { backgroundColor: COLORS_COMBO[color as COLORS].bg },
                    ]}
                  />
                </Pressable>
              );
            })}
          </View>
          <BottomSheetTextInput
            onChangeText={handleOnChangeText}
            placeholder="Event title"
            placeholderTextColor={"rgba(0,0,0,0.3)"}
            style={tailwind.style(
              "flex flex-row items-center text-xl leading-tight h-10 text-black",
            )}
            onBlur={() => sheetRef?.current?.snapToIndex(-1)}
            enablesReturnKeyAutomatically
            returnKeyType="done"
            onSubmitEditing={handleAddEventPress}
            value={currentEvent?.title}
            // @ts-ignore Avoid textinput props
            ref={inputRef}
          />
          <View style={tailwind.style("flex flex-row items-center mt-6")}>
            <View style={tailwind.style("h-5 w-5 rounded-md bg-[#1C6EE9]")} />
            <Text style={styles.bottomSheetText}>sandeep@timeless.co</Text>
          </View>
          <View style={tailwind.style("flex flex-row items-center mt-6")}>
            <CalendarIcon />
            <Text style={styles.bottomSheetText}>
              {formatDate(selectedDate)}
            </Text>
          </View>
          <View style={tailwind.style("flex flex-row items-center mt-6")}>
            <ClockIcon />
            <Text style={styles.bottomSheetText}>
              {currentEvent?.startTime} → {currentEvent?.endTime}
            </Text>
            <View style={styles.totalTimeContainer}>
              <Text style={[styles.totalTimeText]}>
                {currentEvent?.totalTime
                  ? formatTimeIntoMins(currentEvent?.totalTime)
                  : null}
              </Text>
            </View>
          </View>
          <View style={tailwind.style("flex flex-row items-center mt-6")}>
            <LocationIcon />
            <BottomSheetTextInput
              placeholder="Location"
              onChangeText={handleOnChangeLocation}
              placeholderTextColor={"rgba(0,0,0,0.3)"}
              style={[
                styles.locationTextInput,
                tailwind.style("flex flex-row items-center text-black"),
              ]}
              onBlur={() => sheetRef?.current?.snapToIndex(-1)}
              enablesReturnKeyAutomatically
              returnKeyType="done"
              onSubmitEditing={handleAddEventPress}
              value={currentEvent?.location}
              // @ts-ignore Avoid textinput props
              ref={locationInputRef}
            />
          </View>
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  locationTextInput: {
    height: 18,
    fontSize: 16,
    marginLeft: 14,
  },
  hourSegmentStyle: { opacity: 0.06 },
  handleStyle: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: "white",
  },
  handleIndicatorStyle: {
    width: 36,
    height: 4,
  },
  bottomSheetText: {
    paddingLeft: 14,
    fontSize: 16,
    fontWeight: "400",
    color: "black",
  },
  totalTimeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4.5,
    borderRadius: 16,
    backgroundColor: "#F3F3F3",
    marginLeft: 12,
  },
  totalTimeText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#383838",
  },
  bottomSheetTotalTimeText: {
    opacity: 0.5,
    fontSize: 13,
    fontWeight: "600",
  },
  eventText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
