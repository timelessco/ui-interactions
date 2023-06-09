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
        stroke="#525252"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

function roundToNearestPart(value: number, overallValue: number) {
  "worklet";
  var partSize = overallValue / 4;
  var nearestPart = Math.round(value / partSize) * partSize;

  // Adjust the nearest part if value is closer to the next part
  if (value - nearestPart > partSize / 2) {
    nearestPart += partSize;
  }
  //   nearestPart = (nearestPart / overallValue) * 100;
  return nearestPart;
}

const CIRCLE_WIDTH = 350;

export const AssetAllocation = () => {
  const markerPosition = useSharedValue(0);
  const markerDraggingPosition = useSharedValue(0);
  const sliderWidth = useSharedValue(0);

  const debt = useSharedValue(0);
  const equity = useSharedValue(0);

  const equityAssetStyle = useAnimatedStyle(() => {
    return {
      width: interpolate(
        equity.value,
        [25, 50, 100],
        [CIRCLE_WIDTH * 0.15, CIRCLE_WIDTH * 0.4, CIRCLE_WIDTH * 0.65],
        Extrapolation.CLAMP,
      ),
      height: interpolate(
        equity.value,
        [25, 50, 100],
        [CIRCLE_WIDTH * 0.15, CIRCLE_WIDTH * 0.4, CIRCLE_WIDTH * 0.65],
        Extrapolation.CLAMP,
      ),
      opacity: interpolate(equity.value, [20, 25], [0, 1], Extrapolation.CLAMP),
    };
  });
  const equityShare = useDerivedValue(() => {
    return interpolate(
      equity.value,
      [0, 25, 50, 100],
      [0, 15, 40, 65],
      Extrapolation.CLAMP,
    );
  });
  const equityAnimatedTextProps = useAnimatedProps(() => {
    return {
      text: `${Math.round(equityShare.value)}%`,
    };
  });

  const goldAssetStyle = useAnimatedStyle(() => {
    return {
      width: interpolate(
        equity.value,
        [25, 50, 100],
        [CIRCLE_WIDTH * 0.15, CIRCLE_WIDTH * 0.3, CIRCLE_WIDTH * 0.15],
        Extrapolation.CLAMP,
      ),
      height: interpolate(
        equity.value,
        [25, 50, 100],
        [CIRCLE_WIDTH * 0.15, CIRCLE_WIDTH * 0.3, CIRCLE_WIDTH * 0.15],
        Extrapolation.CLAMP,
      ),
      opacity: interpolate(equity.value, [20, 25], [0, 1], Extrapolation.CLAMP),
    };
  });
  const goldShare = useDerivedValue(() => {
    return interpolate(
      equity.value,
      [0, 25, 50, 100],
      [0, 15, 30, 15],
      Extrapolation.CLAMP,
    );
  });
  const goldAnimatedTextProps = useAnimatedProps(() => {
    return {
      text: `${Math.round(goldShare.value)}%`,
    };
  });

  const debtAssetStyle = useAnimatedStyle(() => {
    return {
      width: interpolate(
        debt.value,
        [0, 25, 50, 100],
        [
          CIRCLE_WIDTH,
          CIRCLE_WIDTH * 0.7,
          CIRCLE_WIDTH * 0.3,
          CIRCLE_WIDTH * 0.2,
        ],
        Extrapolation.CLAMP,
      ),
      height: interpolate(
        debt.value,
        [0, 25, 50, 100],
        [
          CIRCLE_WIDTH,
          CIRCLE_WIDTH * 0.7,
          CIRCLE_WIDTH * 0.3,
          CIRCLE_WIDTH * 0.2,
        ],
        Extrapolation.CLAMP,
      ),
    };
  });
  const debtShare = useDerivedValue(() => {
    return interpolate(
      debt.value,
      [0, 25, 50, 100],
      [100, 70, 30, 20],
      Extrapolation.CLAMP,
    );
  });
  const debtAnimatedTextProps = useAnimatedProps(() => {
    return {
      text: `${Math.round(debtShare.value)}%`,
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
          damping: 20,
          stiffness: 180,
          mass: 1,
        });
      }
      const draggingWRT100 = Math.round(
        (markerDraggingPosition.value / sliderWidth.value) * 100,
      );
      debt.value = withSpring(draggingWRT100, { damping: 20, stiffness: 180 });
      equity.value = withSpring(draggingWRT100, {
        damping: 20,
        stiffness: 180,
      });
    })
    .onFinalize(() => {
      const nearestPart = roundToNearestPart(
        markerDraggingPosition.value,
        sliderWidth.value,
      );
      markerDraggingPosition.value = withSpring(nearestPart, {
        damping: 20,
        stiffness: 180,
        mass: 1,
      });
      markerPosition.value = nearestPart;
      const draggingWRT100 = Math.round(
        (nearestPart / sliderWidth.value) * 100,
      );
      debt.value = withSpring(draggingWRT100, { damping: 20, stiffness: 180 });
      equity.value = withSpring(draggingWRT100, {
        damping: 20,
        stiffness: 180,
      });
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

  return (
    <View style={tailwind.style("flex-1 justify-center px-4 bg-white")}>
      <StatusBar />
      <Animated.View style={tailwind.style("")}>
        <Animated.View style={tailwind.style("flex flex-row items-end h-3/4")}>
          <Animated.View
            style={[
              tailwind.style(
                "rounded-full bg-[#E8F7F0] justify-center items-center",
              ),
              debtAssetStyle,
            ]}
          >
            <Text style={tailwind.style("text-sm text-[#00954E]")}>Debt</Text>
            <AnimatedTextInput
              style={[
                tailwind.style("text-sm text-[#00954E] tracking-wide"),
                styles.textLineHeight,
              ]}
              editable={false}
              value={`${String(Math.round(debtShare.value))}%`}
              // @ts-ignore
              animatedProps={debtAnimatedTextProps}
            />
          </Animated.View>
          <Animated.View
            style={[
              tailwind.style(
                "rounded-full bg-[#E5F4FF] justify-center items-center",
              ),
              equityAssetStyle,
            ]}
          >
            <Text style={tailwind.style("text-sm text-[#045695]")}>Equity</Text>
            <AnimatedTextInput
              style={[
                tailwind.style("text-sm text-[#045695] tracking-wide"),
                styles.textLineHeight,
              ]}
              editable={false}
              value={`${String(Math.round(equityShare.value))}%`}
              // @ts-ignore
              animatedProps={equityAnimatedTextProps}
            />
          </Animated.View>
          <Animated.View
            style={[
              tailwind.style(
                "rounded-full bg-[#FFF5D7] justify-center items-center",
              ),
              goldAssetStyle,
            ]}
          >
            <Text style={tailwind.style("text-sm text-[#755B02]")}>Gold</Text>
            <AnimatedTextInput
              style={[
                tailwind.style("text-sm text-[#755B02] tracking-wide"),
                styles.textLineHeight,
              ]}
              editable={false}
              value={`${String(Math.round(goldShare.value))}%`}
              // @ts-ignore
              animatedProps={goldAnimatedTextProps}
            />
          </Animated.View>
        </Animated.View>
        <Animated.View>
          <Animated.View style={tailwind.style("rounded-xl pt-[2px]")}>
            <Text
              style={tailwind.style(
                "text-base font-medium text-black px-4 pt-2",
              )}
            >
              Risk Appetite
            </Text>
            <Animated.View style={tailwind.style("px-4")}>
              <Animated.View
                onLayout={handleLayout}
                style={tailwind.style(
                  "relative w-full h-11 rounded-xl bg-[#E3E3E3] overflow-hidden mt-4 mb-2",
                )}
              >
                <Animated.View
                  style={[
                    tailwind.style("absolute h-11 bg-[#FF760B]"),
                    filledSliderStyle,
                  ]}
                />
                <GestureDetector gesture={panGesture}>
                  <Animated.View
                    style={[
                      tailwind.style(
                        "absolute justify-center items-center h-11 w-11 -left-5.5 rounded-full bg-white shadow-md",
                      ),
                      markerAnimatedStyles,
                    ]}
                  >
                    <DoubleSideArrow />
                  </Animated.View>
                </GestureDetector>
              </Animated.View>
              <Animated.View
                style={tailwind.style("flex flex-row justify-between pb-2")}
              >
                <Animated.Text
                  style={tailwind.style("text-[#827E7D] text-sm font-medium")}
                >
                  Low
                </Animated.Text>
                <Animated.Text
                  style={tailwind.style("text-[#827E7D] text-sm font-medium")}
                >
                  High
                </Animated.Text>
              </Animated.View>
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
