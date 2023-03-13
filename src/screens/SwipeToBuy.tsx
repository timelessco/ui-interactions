import { useCallback, useState } from "react";
import { LayoutChangeEvent, StatusBar, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import { interpolatePath, parse } from "react-native-redash";
import { Path, Svg } from "react-native-svg";
import tailwind from "twrnc";

const DefaultSpringConfig: WithSpringConfig = {
  mass: 1,
  damping: 15,
  stiffness: 180,
};

const AnimatedPath = Animated.createAnimatedComponent(Path);

type IconProps = {
  state: SharedValue<number>;
};

const Icon = ({ state }: IconProps) => {
  const chevronRightPath = parse("M8.25 4.5l7.5 7.5-7.5 7.5");
  const checkPath = parse("M4.5 12.75l6 6 9-13.5");
  const animatedProps = useAnimatedProps(() => {
    const d = interpolatePath(
      state.value,
      [0.7, 1],
      [chevronRightPath, checkPath],
    );
    return { d };
  });
  return (
    <Svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="#f5f2ff"
      height={24}
      width={24}
    >
      <AnimatedPath
        strokeLinecap="round"
        strokeLinejoin="round"
        animatedProps={animatedProps}
      />
    </Svg>
  );
};

export const SwipeToBuy = () => {
  const movingTileTranslationX = useSharedValue(0);
  const buttonTextTranslation = useSharedValue(0);
  const gestureActive = useSharedValue(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [movingContainerWidth, setMovingContainerWidth] = useState(0);
  const [buttonTextWidth, setButtonTextWidth] = useState(0);
  //   console.log("%c⧭", "color: #997326", translatedButtonText, containerWidth);
  const translationValue = containerWidth - movingContainerWidth - 4;

  const handleOnLayout = useCallback((event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  }, []);

  const handleMovingContainerWidth = useCallback((event: LayoutChangeEvent) => {
    setMovingContainerWidth(event.nativeEvent.layout.width);
  }, []);

  const handleTextLayout = useCallback((event: LayoutChangeEvent) => {
    setButtonTextWidth(event.nativeEvent.layout.width);
  }, []);

  const panGesture = Gesture.Pan()
    .onBegin(() => (gestureActive.value = withSpring(1, DefaultSpringConfig)))
    .onChange(event => {
      const interpolatedValue = interpolate(
        event.translationX,
        [0, translationValue],
        [0, translationValue],
        Extrapolation.CLAMP,
      );

      const interpolatedValueForText = interpolate(
        event.translationX,
        [
          (containerWidth - buttonTextWidth) / 2 - movingContainerWidth,
          (containerWidth - buttonTextWidth) / 2 -
            movingContainerWidth +
            buttonTextWidth,
        ],
        [0, 1],
        Extrapolation.CLAMP,
      );

      movingTileTranslationX.value = interpolatedValue;
      buttonTextTranslation.value = interpolatedValueForText;
    })
    .onEnd(() => {
      if (movingTileTranslationX.value > translationValue / 2) {
        movingTileTranslationX.value = withSpring(translationValue, {
          mass: 1,
          damping: 25,
          stiffness: 120,
        });
        buttonTextTranslation.value = withSpring(1, {
          mass: 1,
          damping: 25,
          stiffness: 120,
        });
      } else if (movingTileTranslationX.value === translationValue) {
      } else {
        buttonTextTranslation.value = withSpring(0, {
          mass: 1,
          damping: 25,
          stiffness: 120,
        });
        movingTileTranslationX.value = withSpring(0, {
          mass: 1,
          damping: 25,
          stiffness: 120,
        });
      }
      gestureActive.value = withSpring(1, DefaultSpringConfig);
    });

  const movingTileStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: movingTileTranslationX.value }],
    };
  });

  const animatingTextStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(buttonTextTranslation.value, [0, 1], [1, 0]),
      transform: [
        {
          translateX: interpolate(
            buttonTextTranslation.value,
            [0, 1],
            [0.1 * buttonTextWidth, buttonTextWidth],
          ),
        },
      ],
    };
  });
  const animatingFinalTextStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(buttonTextTranslation.value, [0.7, 1], [0, 1]),
    };
  });

  return (
    <View
      style={tailwind.style("flex-1 bg-[#141414] justify-center w-full px-14")}
    >
      <StatusBar barStyle={"light-content"} />
      <Animated.View
        onLayout={handleOnLayout}
        style={tailwind.style("bg-[#a18eff] w-full py-3 rounded-2xl")}
      >
        <GestureDetector gesture={panGesture}>
          <Animated.View
            onLayout={handleMovingContainerWidth}
            style={[
              tailwind.style(
                "absolute inset-0 justify-center items-center rounded-2xl w-12 m-0.5 bg-[#743afd] z-10",
              ),
              movingTileStyle,
            ]}
          >
            <Icon state={buttonTextTranslation} />
          </Animated.View>
        </GestureDetector>

        <Animated.View
          style={[
            tailwind.style("flex items-center justify-center"),
            animatingTextStyle,
          ]}
        >
          <Text
            onLayout={handleTextLayout}
            style={tailwind.style(
              "text-base p-0 m-0 text-[#743afd] font-medium uppercase",
            )}
          >
            Swipe to Buy
          </Text>
        </Animated.View>
        <Animated.View
          style={[
            tailwind.style("absolute inset-0 flex items-center justify-center"),
            animatingFinalTextStyle,
          ]}
        >
          <Text
            onLayout={handleTextLayout}
            style={tailwind.style(
              "text-base p-0 m-0 text-[#743afd] font-medium uppercase",
            )}
          >
            Order Placed
          </Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
};
