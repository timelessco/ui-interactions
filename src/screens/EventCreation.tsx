import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
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
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import dayjs from "dayjs";
import { BlurView } from "expo-blur";
import tailwind from "twrnc";

import {
  CalendarEvent,
  COLORS,
  COLORS_COMBO,
  useEventStore,
} from "../utils/useEventState";
import { useHaptic } from "../utils/useHaptic";

type TimeSegementRenderProps = {
  item: string;
  index: number;
};

const timeline = [
  "00:00",
  "01:00",
  "02:00",
  "03:00",
  "04:00",
  "05:00",
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
  "23:00",
  "00:00",
];

const week = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const days = [
  "2023-10-06",
  "2023-10-07",
  "2023-10-08",
  "2023-10-09",
  "2023-10-10",
  "2023-10-11",
  "2023-10-12",
];

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
    year: "numeric",
  } as Intl.DateTimeFormatOptions;
  return date.toLocaleDateString("en-US", options);
}

/**
 * It takes a time string in the format "HH:MM" and returns a formatted time string in the format
 * "HH:MM AM/PM"
 * @param {string} timeString - a string representing a time in the format "HH:MM"
 * @returns a string that is formatted to be in 12 hour time.
 */
function formatTime(timeString: string) {
  const [hours, minutes] = timeString.split(":");
  const isPM = parseInt(hours, 10) >= 12;
  const formattedHours = isPM ? parseInt(hours, 10) - 12 : hours;
  const period = isPM ? "PM" : "AM";
  const formattedTime = `${formattedHours}:${minutes} ${period}`;
  return formattedTime;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SEGMENT_HEIGHT = 60;
const SEGMENT_WIDTH = Dimensions.get("screen").width - (16 + 16 + 44);
const MINS_MULTIPLIER = 15;

const INIT_POINTER_HEIGHT = 15;

/**
 * It takes in a start time and an end time, and returns the height and translateY values for a section
 * Where every minute takes up 1px
 * A Time between 00:15 - 00:30 is of height 15px
 * @param {string} startTime - The start time of the section.
 * @param {string} endTime - The end time of the section.
 * @returns An object with two properties: heightValue and translateYValue.
 */
const getSectionMeasurements = (startTime: string, endTime: string) => {
  let [startHour, startMinute] = startTime.split(":").map(Number);
  let [endHour, endMinute] = endTime.split(":").map(Number);

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
              index === timeline.length - 1 ? "h-0" : "h-15"
            } border-[#303030] pr-4`,
          ),
          { borderTopWidth: StyleSheet.hairlineWidth },
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
  const isSmallSection = event.height === 15;
  const isMediumSection = event.height === 30 || event.height === 45;

  return (
    <Animated.View
      key={event.date + event.title + event.height + event.startTime}
      style={[
        tailwind.style(
          `absolute flex my-[1px] ${
            isSmallSection || isMediumSection ? "flex-row" : "flex-col"
          } w-full pl-2 ${
            isSmallSection || isMediumSection
              ? "justify-start items-center"
              : "pt-1"
          } ${
            isSmallSection ? "rounded-[4px]" : "rounded-md"
          } w-[${SEGMENT_WIDTH}px] left-15 overflow-hidden`,
        ),
        {
          backgroundColor: event.color.bg,
          height: event.height - 2,
          transform: [{ translateY: event.translateY }],
        },
      ]}
    >
      <Animated.Text
        style={[
          tailwind.style(
            `text-${isMediumSection ? "sm" : "base"} text-white font-medium`,
          ),
          isSmallSection ? styles.smallTitleStyle : {},
          { color: event.color.text },
        ]}
      >
        {event.title}
      </Animated.Text>
      {!isSmallSection ? (
        <Animated.Text
          style={[
            styles.subtitleStyle,
            tailwind.style(
              `${isSmallSection || isMediumSection ? "pl-[6px]" : ""}`,
            ),
          ]}
        >
          {formatTime(event.startTime)} — {formatTime(event.endTime)}
        </Animated.Text>
      ) : null}
    </Animated.View>
  );
};

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export const EventCreation = () => {
  const hapticSelection = useHaptic();
  const [selectedDate, setSelectedDate] = useState("2023-10-08");
  const eventStore = useEventStore();
  const [currentEvent, setCurrentEvent] = useState<CalendarEvent | null>(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
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

  const inputRef = useRef<TextInput>(null);
  // Pan handling State
  useAnimatedReaction(
    () => [startIndex.value, endIndex.value],
    (prev, _next) => {
      textScale.value = withSpring(Math.abs(prev[0] - prev[1]), {
        mass: 1,
        damping: 20,
        stiffness: 180,
      });
      const getTimeFromMins = (minutes: number) => {
        const hours = Math.floor(minutes / 60) % 24;
        const remainingMinutes = minutes % 60;
        const time =
          (hours < 10 ? "0" + hours : hours) +
          ":" +
          (remainingMinutes < 10 ? "0" + remainingMinutes : remainingMinutes);
        return time;
      };
      runOnJS(setStartTime)(getTimeFromMins(prev[0]));
      runOnJS(setEndTime)(getTimeFromMins(prev[1]));
    },
  );

  const panGesture = Gesture.Pan()
    .shouldCancelWhenOutside(true)
    .activateAfterLongPress(400)
    .onStart(event => {
      if (event.y <= 0 || event.y >= 1440) {
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
      if (event.y <= 0 || event.y >= 1440) {
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
          color: COLORS_COMBO.slate,
          date: selectedDate,
          startTime,
          endTime,
          title: "",
          translateY: 0,
          height: 0,
        });
      } else {
        runOnJS(setCurrentEvent)({
          ...currentEvent,
          startTime,
          endTime,
        });
      }
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
      top: startPoint.value,
      height: selectionHeight.value,
      opacity: interpolate(
        panActive.value,
        [0, 1],
        [0, 1],
        Extrapolation.CLAMP,
      ),
      borderRadius: interpolate(
        selectionHeight.value,
        [0, 15, 30, 45],
        [0, 4, 6, 8],
        Extrapolation.CLAMP,
      ),
      width: interpolate(
        panActive.value,
        [0, 1],
        [0, SEGMENT_WIDTH],
        Extrapolation.CLAMP,
      ),
      marginTop: marginTop.value,
      zIndex: 99999,
    };
  });

  const segmentTextStyle = useAnimatedStyle(() => {
    return {
      fontSize: interpolate(
        textScale.value,
        [0, 45],
        [8, 12],
        Extrapolation.CLAMP,
      ),
      paddingTop: interpolate(
        textScale.value,
        [0, 45],
        [0, 4],
        Extrapolation.CLAMP,
      ),
      paddingLeft: interpolate(
        textScale.value,
        [0, 45],
        [2, 4],
        Extrapolation.CLAMP,
      ),
    };
  });

  const newEventTextStyle = useAnimatedStyle(() => {
    return {
      fontSize: interpolate(
        textScale.value,
        [0, 45],
        [8, 12],
        Extrapolation.CLAMP,
      ),
      paddingTop: interpolate(
        textScale.value,
        [0, 45],
        [0, 2],
        Extrapolation.CLAMP,
      ),
      paddingLeft: interpolate(
        textScale.value,
        [0, 45],
        [2, 4],
        Extrapolation.CLAMP,
      ),
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
  const snapPoints = useMemo(() => ["35%"], []);

  const handleOnChangeText = useCallback(
    (text: string) => {
      if (currentEvent) {
        setCurrentEvent({ ...currentEvent, title: text });
      }
    },
    [currentEvent],
  );

  const handleCancelEventPress = useCallback(() => {
    sheetRef.current?.close();
    inputRef.current?.blur();
    setCurrentEvent(null);
  }, []);

  const handleAddEventPress = useCallback(() => {
    if (currentEvent) {
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
    }
  }, [currentEvent, eventStore]);

  const handleOnCloseSheet = useCallback(() => {
    inputRef.current?.blur();
    setCurrentEvent(null);
  }, []);

  // renders
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        opacity={0.75}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    [],
  );

  return (
    <SafeAreaView style={tailwind.style("flex-1 bg-[#141414] pb-5")}>
      <StatusBar barStyle={"light-content"} />
      <View style={tailwind.style("px-4 py-1 border-b-[1px] border-[#1C1C1C]")}>
        <Text
          style={tailwind.style(
            "text-lg font-medium text-[#EDEDED] text-center",
          )}
        >
          October{" "}
          <Text style={tailwind.style("font-normal text-[#7E7E7E]")}>2023</Text>
        </Text>
        <Animated.View style={tailwind.style("py-2")}>
          <View
            style={tailwind.style(
              "flex flex-row w-full justify-between items-center",
            )}
          >
            {week.map(day => {
              return (
                <View
                  style={tailwind.style("flex flex-row flex-1 justify-center")}
                  key={day}
                >
                  <Text style={tailwind.style("text-[#A0A0A0]")}>{day}</Text>
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
                      "flex items-center justify-center p-2.5 rounded-md",
                      isSelected ? "bg-[#1C1C1C]" : "",
                    )}
                  >
                    <Text style={tailwind.style("text-center text-[#A0A0A0]")}>
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

          <AnimatedBlurView
            intensity={panActive.value * 10}
            tint="dark"
            style={[
              StyleSheet.absoluteFill,
              tailwind.style("left-15 overflow-hidden bg-blue-700"),
              movingSegmentStyle,
            ]}
          >
            <Animated.Text
              style={[
                tailwind.style("font-medium text-white"),
                segmentTextStyle,
              ]}
            >
              {startTime}-{endTime}
            </Animated.Text>
            <Animated.Text
              style={[
                tailwind.style("font-medium text-white"),
                newEventTextStyle,
              ]}
            >
              {"New Event"}
            </Animated.Text>
          </AnimatedBlurView>
        </Animated.ScrollView>
      </Animated.View>
      <BottomSheet
        index={-1}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        ref={sheetRef}
        snapPoints={snapPoints}
        handleStyle={tailwind.style("bg-[#141414]")}
        handleIndicatorStyle={styles.handleIndicatorStyle}
        backgroundStyle={tailwind.style("bg-[#141414]")}
        onClose={handleOnCloseSheet}
      >
        <BottomSheetView style={tailwind.style("flex-1 bg-[#141414] px-4")}>
          <View
            style={tailwind.style(
              "flex w-full flex-row items-center justify-between py-2",
            )}
          >
            <Pressable
              onPress={handleCancelEventPress}
              style={tailwind.style("flex-1 items-start")}
            >
              <Text
                style={tailwind.style(
                  "flex text-base font-medium text-[#DC3D43]",
                )}
              >
                Cancel
              </Text>
            </Pressable>
            <View style={tailwind.style("flex-1 items-center")}>
              <Text
                style={tailwind.style("flex text-base font-medium text-white")}
              >
                New Event
              </Text>
            </View>
            <Pressable
              disabled={
                currentEvent
                  ? currentEvent.title.length > 2
                    ? false
                    : true
                  : true
              }
              onPress={handleAddEventPress}
              style={tailwind.style("flex-1 items-end")}
            >
              <Text
                style={tailwind.style(
                  "flex text-base font-medium",
                  currentEvent
                    ? currentEvent.title.length > 2
                      ? "text-[#2563eb]"
                      : "text-[#6b7280]"
                    : "text-[#6b7280]",
                )}
              >
                Add
              </Text>
            </Pressable>
          </View>
          <View
            style={tailwind.style(
              "flex flex-row justify-between items-center py-4 px-4",
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
            placeholder="Title"
            placeholderTextColor={"#7a7a7a"}
            style={tailwind.style(
              "flex flex-row items-center bg-[#252525] h-9 text-sm rounded-[10px] leading-4 px-3 text-white",
            )}
            onBlur={() => sheetRef?.current?.snapToIndex(-1)}
            enablesReturnKeyAutomatically
            returnKeyType="done"
            onSubmitEditing={handleAddEventPress}
            value={currentEvent?.title}
            // @ts-ignore Avoid textinput props
            ref={inputRef}
          />
          <View style={tailwind.style("mt-6 bg-[#252525] rounded-2.5")}>
            <View
              style={tailwind.style(
                "flex-row justify-between items-center px-4 min-h-10 border-[#EBEAEA]",
              )}
            >
              <Text style={tailwind.style("text-white text-sm leading-4")}>
                Starts
              </Text>
              <View style={tailwind.style("flex flex-row items-center")}>
                <View
                  style={tailwind.style(
                    "flex flex-row items-center justify-center py-1.5 rounded-lg bg-[#2e2e2e] min-w-30",
                  )}
                >
                  <Text style={tailwind.style("text-white text-sm leading-4")}>
                    {formatDate(selectedDate)}
                  </Text>
                </View>
                <View
                  style={tailwind.style(
                    "flex flex-row justify-center ml-1.5 py-1.5 rounded-lg bg-[#2e2e2e] min-w-20",
                  )}
                >
                  <Text style={tailwind.style("text-white text-sm leading-4")}>
                    {currentEvent?.startTime
                      ? formatTime(currentEvent?.startTime)
                      : ""}
                  </Text>
                </View>
              </View>
            </View>
            <View
              style={tailwind.style(
                "flex-row justify-between items-center mx-4 min-h-10 border-[#363636] border-t-[1px]",
              )}
            >
              <Text style={tailwind.style("text-white text-sm leading-4")}>
                Ends
              </Text>
              <View style={tailwind.style("flex flex-row items-center")}>
                <View
                  style={tailwind.style(
                    "flex flex-row items-center justify-center py-1.5 rounded-lg bg-[#2e2e2e] min-w-30",
                  )}
                >
                  <Text style={tailwind.style("text-white text-sm leading-4")}>
                    {formatDate(selectedDate)}
                  </Text>
                </View>
                <View
                  style={tailwind.style(
                    "flex flex-row justify-center ml-1.5 py-1.5 rounded-lg bg-[#2e2e2e] min-w-20",
                  )}
                >
                  <Text style={tailwind.style("text-white text-sm leading-4")}>
                    {currentEvent?.endTime
                      ? formatTime(currentEvent?.endTime)
                      : ""}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  handleIndicatorStyle: {
    width: 32,
    height: 4,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  subtitleStyle: {
    fontSize: 11,
    color: "rgba(255,255,255,0.8)",
  },
  smallTitleStyle: {
    fontSize: 12,
    lineHeight: 13.7,
  },
});
