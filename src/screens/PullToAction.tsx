import { Dimensions, Text } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Path, Svg } from "react-native-svg";
import tailwind from "twrnc";

import { useHaptic } from "../utils/useHaptic";

const SCREEN_WIDTH = Dimensions.get("screen").width;

const PADDING = 12;

const ACTIONS = 3;

const SEGMENT_WIDTH = (SCREEN_WIDTH - PADDING * 2) / ACTIONS;

const getCurrentSegment = (gestureX: number) => {
  "worklet";
  return Math.ceil(gestureX / ((SCREEN_WIDTH - PADDING * 2) / ACTIONS));
};

const SearchIcon = () => {
  return (
    <Svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="#000000"
      height={28}
      width={28}
    >
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </Svg>
  );
};

const RefreshIcon = () => {
  return (
    <Svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="#000000"
      height={28}
      width={28}
    >
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
      />
    </Svg>
  );
};

const CancelAction = () => {
  return (
    <Svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="#000000"
      height={28}
      width={28}
    >
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </Svg>
  );
};

export const PullToAction = () => {
  const translateValue = useSharedValue(0);
  const currentSegment = useSharedValue(-1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(-120);

  const hapticSelection = useHaptic();

  useAnimatedReaction(
    () => currentSegment.value,
    (next, _prev) => {
      if (next !== -1) {
        hapticSelection && runOnJS(hapticSelection)();
      }
    },
  );

  const panGesture = Gesture.Pan()
    .onUpdate(event => {
      if (event.translationY > 0) {
        translateValue.value = event.translationY;
        const segment = getCurrentSegment(event.x);
        if (segment - 1 < ACTIONS) {
          if (currentSegment.value !== -1) {
            currentSegment.value = segment - 1;
          }
          const calculatedTranslateValue =
            SEGMENT_WIDTH * (segment - 1) +
            SEGMENT_WIDTH / 2 +
            PADDING -
            60 / 2;

          translateX.value = withSpring(
            calculatedTranslateValue,
            {
              damping: 18,
              stiffness: 120,
            },
            finished => {
              if (finished) {
                translateY.value = withSpring(0, {
                  damping: 15,
                  stiffness: 200,
                });
                currentSegment.value = segment - 1;
              }
            },
          );
        }
      }
    })
    .onEnd(() => {
      translateValue.value = withTiming(0);
      translateY.value = -120;
      translateX.value = 0;
      currentSegment.value = -1;
    });

  const scrollViewGesture = Gesture.Native();

  const animatedViewStyle = useAnimatedStyle(() => {
    return {
      height: translateValue.value,
    };
  });

  const currentSegmentAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: translateX.value > 0 ? withTiming(1) : 0,
      transform: [
        {
          translateX: translateX.value,
        },
        {
          translateY: translateY.value,
        },
      ],
    };
  });

  const iconAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        translateValue.value,
        [0, 40],
        [0, 1],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          scale:
            currentSegment.value === -1
              ? interpolate(
                  translateValue.value,
                  [0, 40],
                  [0, 1],
                  Extrapolation.CLAMP,
                )
              : currentSegment.value === 0
              ? withSpring(1.4)
              : 1,
        },
      ],
    };
  });

  const iconAnimatedStyle2 = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        translateValue.value,
        [0, 40],
        [0, 1],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          scale:
            currentSegment.value === -1
              ? interpolate(
                  translateValue.value,
                  [0, 40],
                  [0, 1],
                  Extrapolation.CLAMP,
                )
              : currentSegment.value === 1
              ? withSpring(1.4)
              : 1,
        },
      ],
    };
  });

  const iconAnimatedStyle3 = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        translateValue.value,
        [0, 40],
        [0, 1],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          scale:
            currentSegment.value === -1
              ? interpolate(
                  translateValue.value,
                  [0, 40],
                  [0, 1],
                  Extrapolation.CLAMP,
                )
              : currentSegment.value === 2
              ? withSpring(1.4)
              : 1,
        },
      ],
    };
  });

  return (
    <SafeAreaView style={tailwind.style("flex-1 bg-white")}>
      <GestureDetector
        gesture={Gesture.Simultaneous(panGesture, scrollViewGesture)}
      >
        <Animated.ScrollView scrollEventThrottle={16}>
          <Animated.View
            style={[
              tailwind.style("flex flex-row items-center justify-between px-3"),
              animatedViewStyle,
            ]}
          >
            <Animated.View
              style={[
                tailwind.style("absolute h-15 w-15 bg-gray-300 rounded-full"),
                currentSegmentAnimatedStyle,
              ]}
            />
            <Animated.View
              style={[tailwind.style("flex-1 items-center"), iconAnimatedStyle]}
            >
              <RefreshIcon />
            </Animated.View>
            <Animated.View
              style={[
                tailwind.style("flex-1 items-center"),
                iconAnimatedStyle2,
              ]}
            >
              <SearchIcon />
            </Animated.View>
            <Animated.View
              style={[
                tailwind.style("flex-1 items-center"),
                iconAnimatedStyle3,
              ]}
            >
              <CancelAction />
            </Animated.View>
          </Animated.View>
          <Text style={tailwind.style("text-3xl font-bold px-4")}>
            Contacts
          </Text>
        </Animated.ScrollView>
      </GestureDetector>
    </SafeAreaView>
  );
};
