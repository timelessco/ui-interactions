import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
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
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      sv.value = event.contentOffset.y;
    },
  });
  const { top } = useSafeAreaInsets();
  const blurViewStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(sv.value, [0, top], [1, 0.9], Extrapolation.CLAMP),
      transform: [
        {
          translateY: interpolate(
            sv.value,
            [0, top],
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
        intensity={100}
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
          <View style={tailwind.style("h-[430px] w-[287px]")}>
            <Image
              style={[
                tailwind.style("h-full w-full rounded-xl"),
                styles.imageStyle,
              ]}
              source={{
                uri: "https://media-cache.cinematerial.com/p/500x/nza9lluu/top-gun-maverick-movie-poster.jpg",
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
