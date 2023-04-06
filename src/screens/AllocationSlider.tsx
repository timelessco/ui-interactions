import { useCallback } from "react";
import {
  LayoutChangeEvent,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import tailwind from "twrnc";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
Animated.addWhitelistedNativeProps({ text: true });

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
  const markerPosition = useSharedValue(110);
  const markerDraggingPosition = useSharedValue(110);
  const sliderWidth = useSharedValue(0);
  const equityShare = useDerivedValue(() => {
    return interpolate(
      markerDraggingPosition.value,
      [0, sliderWidth.value],
      [0, 100],
      Extrapolation.CLAMP,
    );
  });
  const equityAnimatedTextProps = useAnimatedProps(() => {
    return {
      text: `${Math.round(equityShare.value)}%`,
    };
  });
  const debtAnimatedTextProps = useAnimatedProps(() => {
    return {
      text: `${Math.round(100 - equityShare.value)}%`,
    };
  });
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
      <Animated.View>
        <Animated.View style={tailwind.style("bg-white rounded-xl pt-[2px]")}>
          <Animated.View
            style={tailwind.style("flex flex-row items-center h-[48px] px-4")}
          >
            <Animated.View
              style={tailwind.style("h-3 w-3 rounded-full bg-[#0EB364]")}
            />
            <Animated.View
              style={tailwind.style(
                "flex flex-row justify-between items-center w-full pr-4",
              )}
            >
              <Text
                style={tailwind.style(
                  "pl-2.5 text-base font-medium text-[#151414]",
                )}
              >
                Equity
              </Text>
              <AnimatedTextInput
                style={[
                  tailwind.style(
                    "text-base font-medium text-[#63605F] tracking-wide",
                  ),
                  styles.textLineHeight,
                ]}
                editable={false}
                value={`${String(Math.round(equityShare.value))}%`}
                // @ts-ignore
                animatedProps={equityAnimatedTextProps}
              />
            </Animated.View>
          </Animated.View>
          <Animated.View
            style={tailwind.style(
              "flex flex-row items-center h-[48px] px-4 border-t border-t-[#EBEAEA]",
            )}
          >
            <Animated.View
              style={tailwind.style("h-3 w-3 rounded-full bg-[#1F9EFF]")}
            />
            <Animated.View
              style={tailwind.style(
                "flex flex-row justify-between items-center w-full pr-4",
              )}
            >
              <Text
                style={tailwind.style(
                  "pl-2.5 text-base font-medium text-[#151414]",
                )}
              >
                Debt
              </Text>
              <AnimatedTextInput
                style={[
                  tailwind.style(
                    "text-base font-medium text-[#63605F] tracking-wide",
                  ),
                  styles.textLineHeight,
                ]}
                editable={false}
                value={`${String(Math.round(100 - equityShare.value))}%`}
                // @ts-ignore
                animatedProps={debtAnimatedTextProps}
              />
            </Animated.View>
          </Animated.View>
          <Text
            style={tailwind.style(
              "text-sm font-normal text-[#63605F] px-4 pt-2",
            )}
          >
            Adjust the slider to set allocation
          </Text>
          <Animated.View style={tailwind.style("px-4")}>
            <Animated.View
              onLayout={handleLayout}
              style={tailwind.style(
                "relative w-full h-11 rounded-xl bg-[#E3E3E3] overflow-hidden my-4",
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
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  textLineHeight: { lineHeight: 19 },
});
