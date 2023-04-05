import { useCallback } from "react";
import { LayoutChangeEvent, StatusBar, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import tailwind from "twrnc";

const DoubleSideArrow = () => {
  return (
    <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <Path
        d="M1.5 8H14.5M1.5 8L5.4 4M1.5 8L5.4 12M14.5 8L10.6 4M14.5 8L10.6 12"
        stroke="#006DEC"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const AllocationSlider = () => {
  const markerPosition = useSharedValue(0);
  const markerDraggingPosition = useSharedValue(0);
  const sliderWidth = useSharedValue(0);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      sliderWidth.value = event.nativeEvent.layout.width;
    },
    [sliderWidth],
  );
  const panGesture = Gesture.Pan()
    .onStart(() => {
      markerDraggingPosition.value = markerPosition.value;
    })
    .onChange(event => {
      const { translationX } = event;
      const newPosition = markerPosition.value + translationX;
      if (newPosition > 0 && newPosition <= sliderWidth.value) {
        markerDraggingPosition.value = withSpring(newPosition, {
          damping: 18,
          stiffness: 140,
          mass: 1,
        });
      }
    })
    .onFinalize(() => {
      markerPosition.value = markerDraggingPosition.value;
    });

  const markerAnimatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: markerDraggingPosition.value }],
    };
  });

  const filledSliderStyle = useAnimatedStyle(() => {
    return {
      width: `${interpolate(
        markerDraggingPosition.value,
        [0, sliderWidth.value],
        [0, 99],
        Extrapolation.CLAMP,
      )}%`,
    };
  });

  const secondFilledSliderStyle = useAnimatedStyle(() => {
    return {
      width: `${
        99 -
        interpolate(
          markerDraggingPosition.value,
          [0, sliderWidth.value],
          [0, 99],
          Extrapolation.CLAMP,
        )
      }%`,
    };
  });

  return (
    <View style={tailwind.style("flex-1 justify-center px-4")}>
      <StatusBar />
      <Animated.View style={tailwind.style("px-4")}>
        <Animated.View
          onLayout={handleLayout}
          style={tailwind.style(
            "relative w-full h-11 rounded-xl bg-[#E3E3E3] overflow-hidden",
          )}
        >
          <Animated.View
            style={[
              tailwind.style("absolute h-11 bg-[#0EB364]"),
              filledSliderStyle,
            ]}
          />
          <Animated.View
            style={[
              tailwind.style("absolute right-0 h-11 bg-[#1F9EFF]"),
              secondFilledSliderStyle,
            ]}
          />
          <GestureDetector gesture={panGesture}>
            <Animated.View
              style={[
                tailwind.style(
                  "absolute justify-center items-center h-8 w-8 top-[6px] -left-4 rounded-full bg-white shadow-md",
                ),
                markerAnimatedStyles,
              ]}
            >
              <DoubleSideArrow />
            </Animated.View>
          </GestureDetector>
        </Animated.View>
      </Animated.View>
    </View>
  );
};
