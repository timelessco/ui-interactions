import { useState } from "react";
import { Dimensions, Image, Pressable, Text, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  TextInput,
} from "react-native-gesture-handler";
import Animated, {
  Easing,
  Extrapolation,
  FadeInDown,
  FadeOut,
  FadeOutDown,
  FadeOutUp,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Path, Svg } from "react-native-svg";
import { BlurView } from "expo-blur";
import tailwind from "twrnc";

import { useHaptic } from "../utils/useHaptic";

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const SCREEN_WIDTH = Dimensions.get("screen").width;

const PADDING = 12;

const ACTIONS = 3;

type ACTION_TYPE = "Refresh" | "Search" | "Cancel";

const ACTIONS_LIST: ACTION_TYPE[] = ["Refresh", "Search", "Cancel"];

const SEGMENT_WIDTH = (SCREEN_WIDTH - PADDING * 2) / ACTIONS;

const getCurrentSegment = (gestureX: number) => {
  "worklet";
  return Math.ceil(gestureX / ((SCREEN_WIDTH - PADDING * 2) / ACTIONS));
};

type IconProps = {
  size?: number;
};

const Clock = () => {
  return (
    <Svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="rgba(0, 0, 0, 0.7)"
      height={24}
      width={24}
    >
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </Svg>
  );
};

const ArrowRight = () => {
  return (
    <Svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="rgba(0, 0, 0, 0.7)"
      height={24}
      width={24}
    >
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
      />
    </Svg>
  );
};

const SearchIcon = ({ size = 28 }: IconProps) => {
  return (
    <Svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="rgba(0, 0, 0, 0.7)"
      height={size}
      width={size}
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
      stroke="rgba(0, 0, 0, 0.7)"
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
  const refreshRotationValue = useSharedValue(0);

  const startXDistance = useSharedValue(0);

  const selectionActive = useSharedValue(0);

  const { bottom, top } = useSafeAreaInsets();
  const [currentShareTarget, setCurrentShareTarget] = useState<
    ACTION_TYPE | ""
  >("");

  const hapticActive = useHaptic("medium");
  const hapticSelection = useHaptic();

  useAnimatedReaction(
    () => selectionActive.value,
    (next, _prev) => {
      if (next === 1) {
        hapticActive && runOnJS(hapticActive)();
      }
    },
  );

  const setAction = (action: ACTION_TYPE) => {
    setCurrentShareTarget(action);
    if (action !== "Search") {
      if (action === "Refresh") {
        refreshRotationValue.value = withRepeat(
          withTiming(360, { duration: 1000, easing: Easing.linear }),
          4,
          false,
        );
      }
      setTimeout(() => {
        setCurrentShareTarget("");
        refreshRotationValue.value = 0;
      }, 3000);
    }
  };

  useAnimatedReaction(
    () => currentSegment.value,
    (next, prev) => {
      if (prev !== next && prev !== -1 && next !== -1) {
        hapticSelection && runOnJS(hapticSelection)();
      }
    },
  );

  const panGesture = Gesture.Pan()
    .onBegin(event => {
      const segment = 2;
      const calculatedTranslateValue =
        SEGMENT_WIDTH * (segment - 1) + SEGMENT_WIDTH / 2 + PADDING - 60 / 2;
      currentSegment.value = segment - 1;
      translateX.value = calculatedTranslateValue;
      startXDistance.value = event.x;
    })
    .onChange(event => {
      translateValue.value = event.translationY > 0 ? event.translationY : 0;
      const activatePullToAction = interpolate(
        translateValue.value,
        [0, 80],
        [0, 180],
        Extrapolation.CLAMP,
      );
      if (activatePullToAction === 180) {
        selectionActive.value = 1;
      } else {
        selectionActive.value = 0;
      }

      const segment = getCurrentSegment(event.x);
      if (Math.abs(event.translationX) >= 50 && event.translationY >= 80) {
        if (segment - 1 < ACTIONS) {
          currentSegment.value = segment - 1;
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
    .onEnd(() => {
      if (selectionActive.value) {
        runOnJS(setAction)(ACTIONS_LIST[currentSegment.value]);
      }
      currentSegment.value = -1;
      selectionActive.value = 0;
      translateValue.value = withTiming(0, {
        duration: 300,
        easing: Easing.inOut(Easing.ease),
      });
    });

  const scrollViewGesture = Gesture.Native();

  const animatedViewStyle = useAnimatedStyle(() => {
    return {
      height: translateValue.value,
    };
  });

  const currentSegmentAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        translateValue.value,
        [70, 80],
        [0, 0.5],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          translateX: translateX.value,
        },
        {
          translateY: interpolate(
            translateValue.value,
            [70, 80],
            [-30, 0],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  const refreshIconAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        translateValue.value,
        [40, 70],
        [0, 1],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          translateX: interpolate(
            translateValue.value,
            [0, 80],
            [80, 0],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  const cancelIconAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        translateValue.value,
        [40, 70],
        [0, 1],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          translateX: interpolate(
            translateValue.value,
            [0, 80],
            [-80, 0],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  const searchIconAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        translateValue.value,
        [40, 70],
        [0, 1],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          rotate: `${interpolate(
            translateValue.value,
            [0, 80],
            [-90, 0],
            Extrapolation.CLAMP,
          )}deg`,
        },
        {
          scale: interpolate(
            translateValue.value,
            [0, 80],
            [0.9, 1],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  const refreshingStateStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${refreshRotationValue.value}deg` }],
    };
  });

  return (
    <View style={tailwind.style("flex-1 bg-white", `pt-[${top}px]`)}>
      {currentShareTarget === "Search" ? (
        <AnimatedBlurView
          entering={FadeInDown}
          exiting={FadeOut.duration(250)}
          intensity={100}
          style={[tailwind.style("absolute inset-0 z-10")]}
        >
          <Animated.View
            entering={FadeInDown.springify().damping(18).stiffness(140)}
            style={tailwind.style(
              "bg-white py-2 mx-4 rounded-xl h-[310px]",
              `mt-[${top}px]`,
            )}
          >
            <Animated.View
              style={tailwind.style("relative px-2 flex flex-row items-center")}
            >
              <Animated.View
                style={tailwind.style(
                  "absolute justify-center items-center h-9 pl-4 z-10",
                )}
              >
                <SearchIcon size={20} />
              </Animated.View>
              <TextInput
                returnKeyType="done"
                onSubmitEditing={() => setCurrentShareTarget("")}
                autoFocus
                placeholder="Search"
                placeholderTextColor={tailwind.color("bg-gray-800")}
                style={tailwind.style(
                  "bg-gray-300 py-[7px] px-2.5 text-base leading-5 rounded-lg flex-1 pl-8 h-9",
                )}
              />
              <Pressable
                onPress={() => {
                  setCurrentShareTarget("");
                }}
              >
                <Text style={tailwind.style("text-base pl-2 pr-2 text-black")}>
                  Cancel
                </Text>
              </Pressable>
            </Animated.View>
            <Animated.View style={tailwind.style("px-4 pt-3")}>
              <Text style={tailwind.style("text-sm uppercase text-gray-500")}>
                Recent Search
              </Text>
              <Animated.View>
                <Animated.View
                  style={tailwind.style("flex flex-row items-center py-3")}
                >
                  <Clock />
                  <Text style={tailwind.style("text-base text-gray-600 pl-4")}>
                    Kevin
                  </Text>
                </Animated.View>
                <Animated.View
                  style={tailwind.style("flex flex-row items-center py-3")}
                >
                  <Clock />
                  <Text style={tailwind.style("text-base text-gray-500 pl-4")}>
                    Chris
                  </Text>
                </Animated.View>
              </Animated.View>
            </Animated.View>
            <Animated.View style={tailwind.style("px-4 pt-3")}>
              <Text style={tailwind.style("text-sm uppercase text-gray-500")}>
                Navigation
              </Text>
              <Animated.View>
                <Animated.View
                  style={tailwind.style("flex flex-row items-center py-3")}
                >
                  <ArrowRight />
                  <Text style={tailwind.style("text-base text-gray-600 pl-4")}>
                    Go to Dashboard
                  </Text>
                </Animated.View>
                <Animated.View
                  style={tailwind.style("flex flex-row items-center py-3")}
                >
                  <ArrowRight />
                  <Text style={tailwind.style("text-base text-gray-500 pl-4")}>
                    Go to Settings
                  </Text>
                </Animated.View>
              </Animated.View>
            </Animated.View>
          </Animated.View>
        </AnimatedBlurView>
      ) : null}
      <Animated.View style={tailwind.style("absolute inset-0 z-0")}>
        <Image
          style={tailwind.style("h-full w-full")}
          source={require("../assets/radialbg.jpg")}
        />
      </Animated.View>
      <GestureDetector
        gesture={Gesture.Simultaneous(panGesture, scrollViewGesture)}
      >
        <Animated.ScrollView
          style={tailwind.style("overflow-visible")}
          scrollEventThrottle={16}
        >
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
              style={[
                tailwind.style("flex-1 items-center"),
                refreshIconAnimatedStyle,
              ]}
            >
              <RefreshIcon />
            </Animated.View>
            <Animated.View
              style={[
                tailwind.style("flex-1 items-center"),
                searchIconAnimatedStyle,
              ]}
            >
              <SearchIcon />
            </Animated.View>
            <Animated.View
              style={[
                tailwind.style("flex-1 items-center"),
                cancelIconAnimatedStyle,
              ]}
            >
              <CancelAction />
            </Animated.View>
          </Animated.View>
          {currentShareTarget === "Refresh" ? (
            <Animated.View
              style={[
                tailwind.style("absolute w-full justify-center items-center"),
                refreshingStateStyle,
              ]}
              entering={FadeInDown}
              exiting={FadeOutUp.duration(500)}
            >
              <RefreshIcon />
            </Animated.View>
          ) : null}
          <Animated.View>
            <Text style={tailwind.style("text-3xl font-bold px-4")}>
              Contacts
            </Text>
          </Animated.View>
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
    </View>
  );
};
