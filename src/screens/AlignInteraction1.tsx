import React from "react";
import { Pressable, View } from "react-native";
import Animated, {
  interpolate,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import tailwind from "twrnc";

const VerticalSpringConfig: WithSpringConfig = {
  mass: 1,
  velocity: 1,
  stiffness: 120,
  damping: 20,
};
const HorizontalSpringConfig: WithSpringConfig = {
  mass: 1,
  velocity: 1,
  stiffness: 120,
  damping: 30,
};

const ScaleSpringConfig: WithSpringConfig = {
  mass: 1,
  velocity: 0,
  stiffness: 120,
  damping: 30,
};

export const AlignInteraction1 = () => {
  const verticalLine = useSharedValue(0);
  const horizontalLine = useSharedValue(0);

  const scaleAnim = useSharedValue(1);

  // The state for Text Style
  const alignState = useSharedValue(0);

  const verticalLineStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            verticalLine.value,
            [0, 1, 2],
            [20, 122, 226],
          ),
        },
      ],
    };
  });
  const horizontalLineStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            horizontalLine.value,
            [0, 1, 2],
            [28, 112, 198],
          ),
        },
      ],
    };
  });
  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: scaleAnim.value,
        },
      ],
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    return {
      textAlign:
        alignState.value === 0
          ? "left"
          : alignState.value === 1
          ? "center"
          : alignState.value === 2
          ? "right"
          : "auto",
    };
  });

  const handleOnPressIn = () =>
    (scaleAnim.value = withSpring(0.97, ScaleSpringConfig, finished => {
      if (finished) {
        scaleAnim.value = withDelay(10, withSpring(1));
      }
    }));

  const handleOnPressLeftAlignment = () => {
    alignState.value = 0;
    verticalLine.value = withSpring(0, VerticalSpringConfig);
    horizontalLine.value = withDelay(
      100,
      withSpring(0, HorizontalSpringConfig),
    );
  };

  const handleOnPressCenterAlignment = () => {
    alignState.value = 1;
    verticalLine.value = withSpring(1, VerticalSpringConfig);
    horizontalLine.value = withDelay(
      100,
      withSpring(1, HorizontalSpringConfig),
    );
  };

  const handleOnPressRightAlignment = () => {
    alignState.value = 2;
    verticalLine.value = withSpring(2, VerticalSpringConfig);
    horizontalLine.value = withDelay(
      100,
      withSpring(2, HorizontalSpringConfig),
    );
  };

  return (
    <View style={tailwind.style("flex-1 bg-white justify-center items-center")}>
      <Animated.Text
        layout={Layout.springify()}
        style={[
          tailwind.style("text-lg text-center px-10 py-4"),
          textAnimatedStyle,
        ]}
      >
        Good design and development put the user at the center of the process.
        This means understanding the user's needs, wants, and behaviors, and
        designing products that address these.
      </Animated.Text>
      <Animated.View
        style={[
          tailwind.style(
            "relative px-5 bg-white w-[250px] h-[100px] rounded-xl shadow-xl flex flex-row items-center justify-between",
          ),
          containerStyle,
        ]}
      >
        <Pressable
          onPressIn={handleOnPressIn}
          onPress={handleOnPressLeftAlignment}
          style={tailwind.style(
            "flex flex-row items-center justify-start w-[70px] h-[70px]",
          )}
        >
          <View style={tailwind.style("h-8 w-1 bg-blue-100 rounded-xl")} />
          <View style={tailwind.style("ml-1 h-2 w-6 bg-blue-100 rounded-sm")} />
        </Pressable>
        <Pressable
          onPressIn={handleOnPressIn}
          onPress={handleOnPressCenterAlignment}
          style={tailwind.style(
            "flex flex-row items-center justify-center w-[70px] h-[70px]",
          )}
        >
          <View style={tailwind.style("h-8 w-1 bg-blue-100 rounded-xl")} />
          <View
            style={tailwind.style("absolute h-2 w-6 bg-blue-100 rounded-sm")}
          />
        </Pressable>
        <Pressable
          onPressIn={handleOnPressIn}
          onPress={handleOnPressRightAlignment}
          style={tailwind.style(
            "flex flex-row items-center justify-end w-[70px] h-[70px]",
          )}
        >
          <View style={tailwind.style("h-2 w-6 bg-blue-100 rounded-sm mr-1")} />
          <View style={tailwind.style("h-8 w-1 bg-blue-100 rounded-xl")} />
        </Pressable>
        <Animated.View
          style={tailwind.style("absolute flex flex-row items-center left-0")}
        >
          <Animated.View
            style={[
              tailwind.style("h-8 w-1 bg-blue-600 rounded-xl z-50"),
              verticalLineStyle,
            ]}
          />
          <Animated.View
            style={[
              tailwind.style("absolute h-2 w-6 bg-blue-600 rounded-sm z-50"),
              horizontalLineStyle,
            ]}
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
};
