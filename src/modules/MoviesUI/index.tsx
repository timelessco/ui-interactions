import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StackScreenProps } from "@react-navigation/stack";
import { BlurView } from "expo-blur";
import tailwind from "twrnc";

import { RootStackParamList } from "../../screens/SharedElementConceptOne";

import { continueWatching, trending } from "./data";
import MoviesSlider from "./MoviesSlider";

export type MoviesUIProps = StackScreenProps<RootStackParamList, "List">;
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const MoviesUI = ({ navigation }: MoviesUIProps) => {
  const sv = useSharedValue(0);
  const { top } = useSafeAreaInsets();

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      if (event.contentOffset.y > 0) {
        sv.value = withSpring(1);
      } else {
        sv.value = withSpring(0);
      }
    },
  });
  const blurViewStyle = useAnimatedStyle(() => {
    return {
      opacity: sv.value,
      transform: [
        {
          translateY: interpolate(
            sv.value,
            [0, 1],
            [-top, 0],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });
  return (
    <Animated.View style={tailwind.style("relative")}>
      <AnimatedBlurView
        intensity={80}
        tint="light"
        style={[
          tailwind.style(`absolute top-0 z-10 w-full h-[${top}px]`),
          blurViewStyle,
        ]}
      />
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tailwind.style(`pb-12 pt-[${top}px]`)}
      >
        <View style={tailwind.style("flex justify-center items-center")}>
          <View style={tailwind.style("h-[375px]")}>
            <Image
              style={[
                tailwind.style("h-full w-full rounded-xl"),
                styles.imageStyle,
              ]}
              source={{
                uri: "https://www.themoviedb.org/t/p/original/qyEtuIIEpUHNMhmdvcvID7oQGYu.jpg",
              }}
            />
          </View>
        </View>
        <View style={tailwind.style("mt-8")}>
          <Text style={tailwind.style("pl-5 font-600 text-lg pb-2")}>
            Trending Now
          </Text>
          <MoviesSlider navigation={navigation} listData={trending} />
        </View>
        <View style={tailwind.style("mt-8")}>
          <Text style={tailwind.style("pl-5 font-600 text-lg pb-2")}>
            Continue Watching
          </Text>
          <MoviesSlider navigation={navigation} listData={continueWatching} />
        </View>
      </Animated.ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  handleStyle: {
    backgroundColor: "rgba(0,0,0,0.22)",
  },
  imageStyle: {
    aspectRatio: 0.67,
  },
});

export default MoviesUI;
