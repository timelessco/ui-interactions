import { useState } from "react";
import {
  Dimensions,
  LayoutChangeEvent,
  StatusBar,
  StyleSheet,
  Text,
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
import tailwind from "twrnc";

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

const SEGMENT_HEIGHT = 60;
const SEGMENT_WIDTH = Dimensions.get("screen").width - (16 + 16 + 44);
const MINS_MULTIPLIER = 15;

const INIT_POINTER_HEIGHT = 15;

const TimeSegmentRender = (props: TimeSegementRenderProps) => {
  const { item, index } = props;
  const segementContext = useSharedValue({
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    x3: 0,
    y3: 0,
    x4: 0,
    y4: 0,
  });

  const handleOnLayout = (event: LayoutChangeEvent) => {
    event.target.measure((x, y) => {
      segementContext.value = {
        x1: x,
        y1: y,
        x2: x + SEGMENT_WIDTH,
        y2: y,
        x3: x,
        y3: y + SEGMENT_HEIGHT,
        x4: x + SEGMENT_WIDTH,
        y4: y + SEGMENT_HEIGHT,
      };
    });
  };

  return (
    <Animated.View
      onLayout={handleOnLayout}
      style={tailwind.style("relative flex flex-row items-start px-4")}
    >
      <Text
        style={tailwind.style(
          "w-11 text-xs text-[#707070] font-medium pr-2 bottom-2",
        )}
      >
        {item}
        {segementContext.value.y1}
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
};

export const EventCreation = () => {
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
  const selectionHeight = useSharedValue(INIT_POINTER_HEIGHT);
  // Pan handling State

  useAnimatedReaction(
    () => [startIndex.value, endIndex.value],
    (prev, _next) => {
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
    .activateAfterLongPress(300)
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
    })
    .onChange(event => {
      if (event.y <= 0 || event.y >= 1440) {
        return;
      }
      runOnJS(setGestureState)(event.state);

      if (event.translationY > 0) {
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
    .onFinalize(event => {
      runOnJS(setGestureState)(event.state);
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
      width: interpolate(
        panActive.value,
        [0, 1],
        [0, SEGMENT_WIDTH],
        Extrapolation.CLAMP,
      ),
      marginTop: marginTop.value,
    };
  });
  return (
    <SafeAreaView style={tailwind.style("flex-1 bg-[#141414] pb-5")}>
      <StatusBar barStyle={"light-content"} />
      <View style={tailwind.style("px-4 shadow")}>
        <Text style={tailwind.style("text-lg font-medium text-[#EDEDED]")}>
          October{" "}
          <Text style={tailwind.style("font-normal text-[#7E7E7E]")}>2023</Text>
        </Text>
      </View>
      <Animated.View style={tailwind.style("")}>
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          style={tailwind.style("pt-4")}
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
          <Animated.View
            style={[
              tailwind.style(
                "absolute flex rounded bg-blue-700 left-15 z-30 overflow-hidden",
              ),
              movingSegmentStyle,
            ]}
          >
            <Animated.Text
              style={tailwind.style("text-xs font-medium text-white p-1")}
            >
              {startTime}-{endTime}
            </Animated.Text>
          </Animated.View>
        </Animated.ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};
