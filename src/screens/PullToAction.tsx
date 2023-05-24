import { useState } from "react";
import { Dimensions, Image, Text } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  FadeInDown,
  FadeOutDown,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Path, Svg } from "react-native-svg";
import { BlurView } from "expo-blur";
import tailwind from "twrnc";

import { useHaptic } from "../utils/useHaptic";

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const SCREEN_WIDTH = Dimensions.get("screen").width;

const PADDING = 12;

const ACTIONS = 3;

const ACTIONS_LIST = ["Refresh", "Search", "Cancel"];

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
      stroke="rgb(0, 0, 0)"
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
      stroke="rgb(0, 0, 0)"
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
      stroke="rgb(0, 0, 0);"
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

  const { bottom } = useSafeAreaInsets();
  const [currentShareTarget, setCurrentShareTarget] = useState("");

  const hapticSelection = useHaptic();

  useAnimatedReaction(
    () => currentSegment.value,
    (next, prev) => {
      if (next !== -1 && next !== prev) {
        hapticSelection && runOnJS(hapticSelection)();
      }
    },
  );

  const setAction = (action: string) => {
    setCurrentShareTarget(action);
    setTimeout(() => setCurrentShareTarget(""), 2000);
  };

  const panGesture = Gesture.Pan()
    .onBegin(event => {
      const segment = getCurrentSegment(event.x);
      const calculatedTranslateValue =
        SEGMENT_WIDTH * (segment - 1) + SEGMENT_WIDTH / 2 + PADDING - 60 / 2;

      translateX.value = calculatedTranslateValue;
    })
    .onChange(event => {
      translateValue.value = event.translationY > 0 ? event.translationY : 0;
      if (event.translationY > 80) {
        const segment = getCurrentSegment(event.x);
        if (segment - 1 < ACTIONS) {
          currentSegment.value = segment - 1;
        }
        translateY.value = withSpring(0, {
          damping: 25,
          stiffness: 100,
        });
      }
      if (Math.abs(event.translationX) > 10 && event.translationY > 80) {
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

          translateX.value = withSpring(calculatedTranslateValue, {
            damping: 24,
            stiffness: 250,
            mass: 1,
          });
        }
      }
    })
    .onEnd(event => {
      if (event.translationY > 80) {
        runOnJS(setAction)(ACTIONS_LIST[currentSegment.value]);
      }
      translateValue.value = withTiming(0);
      translateY.value = -120;
      translateX.value = 0;
    });

  const scrollViewGesture = Gesture.Native();

  const animatedViewStyle = useAnimatedStyle(() => {
    return {
      height: translateValue.value,
      opacity: interpolate(translateValue.value, [70, 80], [0, 1]),
      transform: [
        {
          scale: interpolate(
            translateValue.value,
            [70, 80],
            [0.9, 1],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  const currentSegmentAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: translateX.value > 0 ? withTiming(0.3) : 0,
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
      opacity:
        currentSegment.value === -1
          ? interpolate(
              translateValue.value,
              [0, 40],
              [0.45, 1],
              Extrapolation.CLAMP,
            )
          : currentSegment.value === 0
          ? 1
          : 0.45,
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
              ? withSpring(1.3)
              : 1,
        },
      ],
    };
  });

  const iconAnimatedStyle2 = useAnimatedStyle(() => {
    return {
      opacity:
        currentSegment.value === -1
          ? interpolate(
              translateValue.value,
              [0, 40],
              [0.45, 1],
              Extrapolation.CLAMP,
            )
          : currentSegment.value === 1
          ? 1
          : 0.45,
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
              ? withSpring(1.3)
              : 1,
        },
      ],
    };
  });

  const iconAnimatedStyle3 = useAnimatedStyle(() => {
    return {
      opacity:
        currentSegment.value === -1
          ? interpolate(
              translateValue.value,
              [0, 40],
              [0.45, 1],
              Extrapolation.CLAMP,
            )
          : currentSegment.value === 2
          ? 1
          : 0.45,
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
              ? withSpring(1.3)
              : 1,
        },
      ],
    };
  });

  return (
    <SafeAreaView style={tailwind.style("flex-1 bg-white")}>
      <Animated.View style={tailwind.style("absolute inset-0")}>
        <Image
          style={tailwind.style("h-full w-full")}
          source={require("../assets/background.jpg")}
        />
      </Animated.View>
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
            <AnimatedBlurView
              intensity={100}
              style={[
                tailwind.style(
                  "absolute h-15 w-15 overflow-hidden bg-white rounded-full",
                ),
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
            Settings
          </Text>
        </Animated.ScrollView>
      </GestureDetector>
      {currentShareTarget !== "" ? (
        <Animated.View
          style={tailwind.style(
            `absolute w-full bottom-${
              bottom - 20
            } h-10 rounded-md justify-center items-center px-2`,
          )}
          entering={FadeInDown}
          exiting={FadeOutDown}
        >
          <Animated.Text
            style={tailwind.style("text-base text-white font-medium")}
          >
            Selected Action is {currentShareTarget}
          </Animated.Text>
        </Animated.View>
      ) : null}
    </SafeAreaView>
  );
};
