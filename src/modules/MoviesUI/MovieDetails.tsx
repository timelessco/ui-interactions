import React, { useEffect, useState } from "react";
import {
  SharedElement,
  SharedElementCompatRoute,
} from "react-navigation-shared-element";
import {
  Image,
  InteractionManager,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Extrapolation,
  FadeInDown,
  interpolate,
  runOnJS,
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StackScreenProps } from "@react-navigation/stack";
import { BlurView } from "expo-blur";
import tailwind from "twrnc";

import { dummyContent } from "../../constants";
import { RootStackParamList } from "../../screens/SharedElementConceptOne";
import { useHaptic } from "../../utils/useHaptic";
import { useScaleAnimation } from "../../utils/useScaleAnimation";

type MoviesDetailsProps = StackScreenProps<RootStackParamList, "Details">;

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const MovieDetails = (props: MoviesDetailsProps) => {
  const { top } = useSafeAreaInsets();
  const { item } = props.route.params;
  const exitAnim = useSharedValue(1);
  const hapticSelection = useHaptic();
  const [opacity, setOpacity] = useState(1);
  const [backgroundColor, setBackgroundColor] = useState("white");
  const [handleBgColor, setHandleBgColor] = useState("rgba(0,0,0,0.22)");
  const [interactionsFinished, setInteractionsFinished] = useState(false);
  const sv = useSharedValue(0);
  const resetScroll = useSharedValue(0);
  const { handlers, animatedStyle } = useScaleAnimation();
  const svRef = useAnimatedRef();

  const SNAP_POINT = 16 + top;

  useDerivedValue(() => {
    if (resetScroll.value === 0) {
      scrollTo(svRef, 0, resetScroll.value, true);
    }
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onBeginDrag: () => {
      resetScroll.value = 1;
    },
    onScroll: event => {
      if (exitAnim.value) {
        sv.value = event.contentOffset.y;
      }
    },
    onEndDrag: event => {
      if (sv.value > 0 && sv.value < SNAP_POINT && event.velocity?.y === 0) {
        resetScroll.value = 0;
      }
      if (event.contentOffset.y < -70) {
        runOnJS(setOpacity)(0);
        exitAnim.value = 0;
        runOnJS(setBackgroundColor)("rgba(255,255,255,0)");
        runOnJS(setHandleBgColor)("rgba(0,0,0,0)");
        hapticSelection && runOnJS(hapticSelection)();
        runOnJS(props.navigation.pop)();
      }
    },
    onMomentumEnd: () => {
      if (sv.value > 0 && sv.value < SNAP_POINT) {
        resetScroll.value = 0;
      }
    },
  });

  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(
            sv.value,
            [-SNAP_POINT, -1, 0, SNAP_POINT],
            [0.9, 0.96, 0.96, 1],
            Extrapolation.CLAMP,
          ),
        },
      ],
      backgroundColor,
    };
  });

  const blurViewStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        sv.value,
        [0, SNAP_POINT],
        [1, 0.9],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          translateY: interpolate(
            sv.value,
            [0, SNAP_POINT],
            [-SNAP_POINT, 0],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      setInteractionsFinished(true);
    });
  }, []);

  return (
    <Animated.View style={tailwind.style("relative")}>
      <AnimatedBlurView
        intensity={100}
        style={[tailwind.style("absolute inset-0")]}
      />
      <AnimatedBlurView
        intensity={100}
        tint="light"
        style={[
          tailwind.style(`absolute top-0 z-10 w-full h-[${top}px]`),
          blurViewStyle,
        ]}
      />
      <Animated.ScrollView
        // @ts-expect-error: Should check Animated Library
        ref={svRef}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        scrollEnabled={interactionsFinished}
        style={tailwind.style("flex flex-col rounded-2xl")}
      >
        <Animated.View
          style={[
            tailwind.style("flex items-center pb-10 rounded-2xl shadow-md"),
            containerStyle,
          ]}
        >
          <Animated.View
            style={[
              tailwind.style("w-8 h-[6px] rounded-[21px] mt-2"),
              { backgroundColor: handleBgColor },
            ]}
          />
          <View style={tailwind.style("mt-8")}>
            <SharedElement id={`item.${item.id}.image`}>
              <Image
                style={[
                  tailwind.style("rounded-xl h-[430px] w-[287px]"),
                  styles.imageStyle,
                ]}
                source={{ uri: item.url }}
              />
            </SharedElement>
          </View>
          <Animated.View
            style={{ opacity }}
            entering={FadeInDown.springify()
              .mass(1)
              .damping(22)
              .stiffness(189)
              .delay(300)}
          >
            <View style={tailwind.style("flex mt-10")}>
              <Text
                style={tailwind.style("text-3xl font-extrabold text-center")}
              >
                {item.title}
              </Text>
              <Text
                style={tailwind.style(
                  "text-xs font-medium text-[#7C7C7C] mt-2 text-center uppercase",
                )}
              >
                Drama · Comedy · 2021
              </Text>
            </View>
            <View style={tailwind.style("mt-6")}>
              <Animated.View style={animatedStyle}>
                <Pressable
                  {...handlers}
                  style={tailwind.style(
                    "bg-[#171717] min-h-[47px] shadow-sm rounded-[14px] flex items-center justify-center mx-6",
                  )}
                >
                  <Text
                    style={tailwind.style(
                      "text-[13px] font-semibold text-white uppercase",
                    )}
                  >
                    Watch now
                  </Text>
                </Pressable>
              </Animated.View>
            </View>
            <View style={tailwind.style("flex mt-6 px-6")}>
              <Text style={tailwind.style("text-base font-normal")}>
                Four stylish and ambitious best girlfriends in Harlem, New York
                City: a rising star professor struggling to make space for her
                love life.
              </Text>
            </View>
            <View style={tailwind.style("flex mt-6 px-6")}>
              <Text
                style={tailwind.style(
                  "text-xs font-medium uppercase text-[#7C7C7C]",
                )}
              >
                Cast & Crew
              </Text>
              <Text
                style={tailwind.style(
                  "mt-2 text-base font-normal text-[#171717]",
                )}
              >
                Matthew McConaughey, Anne Hathaway, Michael Caine, Jessica
                Chastain
              </Text>
            </View>
            <View style={tailwind.style("flex mt-6 px-6")}>
              <Text
                style={tailwind.style(
                  "text-xs font-medium uppercase text-[#7C7C7C]",
                )}
              >
                Plot
              </Text>
              <Text
                style={tailwind.style(
                  "mt-2 text-base font-normal text-[#171717]",
                )}
              >
                {dummyContent}
              </Text>
            </View>
            <View />
          </Animated.View>
        </Animated.View>
      </Animated.ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
  imageStyle: {
    aspectRatio: 0.67,
  },
});

MovieDetails.sharedElements = (route: SharedElementCompatRoute) => {
  const { item } = route.params;
  return [
    {
      id: `item.${item.id}.image`,
    },
    {
      id: `item.${item.id}.bg`,
    },
  ];
};

export default MovieDetails;
