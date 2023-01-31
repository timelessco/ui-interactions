/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React from "react";
import { View } from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import tailwind from "twrnc";

const springConfig: WithSpringConfig = {
  mass: 1,
  velocity: 0,
  stiffness: 250,
  damping: 45,
};

const MenuInteraction = () => {
  const toggleAnim = useSharedValue(0);
  const dotTransform = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(toggleAnim.value, [0, 1], [0, 1]),
        },
      ],
    };
  });
  const centerLineTransform = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${interpolate(toggleAnim.value, [0, 1], [0, -45])}deg`,
        },
      ],
    };
  });
  const topLineTransform = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: -13.5,
        },
        {
          rotate: `${interpolate(toggleAnim.value, [0, 1], [0, 45])}deg`,
        },
        {
          translateX: interpolate(toggleAnim.value, [0, 1], [13.5, 16]),
        },
      ],
    };
  });

  const bottomLineTransform = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: 13.5,
        },
        {
          rotate: `${interpolate(toggleAnim.value, [0, 1], [0, 45])}deg`,
        },
        {
          translateX: interpolate(toggleAnim.value, [0, 1], [-13.5, -16]),
        },
      ],
    };
  });

  const handlePress = () => {
    if (toggleAnim.value) {
      toggleAnim.value = withSpring(0, springConfig);
    } else {
      toggleAnim.value = withSpring(1, springConfig);
    }
  };

  return (
    <TouchableWithoutFeedback
      onPress={handlePress}
      style={tailwind.style(
        "relative w-20 bg-white h-20 rounded-xl flex justify-center items-center",
      )}
    >
      <View style={tailwind.style("flex flex-col")}>
        <Animated.View
          style={[
            tailwind.style(
              "absolute right-0 bottom-0 top-0 left-0 justify-center items-center",
            ),
            dotTransform,
          ]}
        >
          <View
            style={tailwind.style("h-2.5 w-2.5 bg-blue-700 rounded-full")}
          />
        </Animated.View>
        <Animated.View
          style={[
            tailwind.style("flex flex-row justify-start"),
            topLineTransform,
          ]}
        >
          <View
            style={tailwind.style("h-1.5 w-5 rounded-md bg-blue-700 mb-1.5")}
          />
        </Animated.View>

        <Animated.View
          style={[
            tailwind.style("h-1.5 w-10 rounded-md bg-blue-700"),
            centerLineTransform,
          ]}
        />
        <Animated.View
          style={[
            tailwind.style("flex flex-row justify-end"),
            bottomLineTransform,
          ]}
        >
          <View
            style={tailwind.style("h-1.5 w-5 rounded-md bg-blue-700 mt-1.5")}
          />
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default MenuInteraction;
