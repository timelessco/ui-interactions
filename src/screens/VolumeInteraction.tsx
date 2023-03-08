import { Dimensions, Image, StatusBar, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  runOnJS,
  SharedValue,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import { interpolatePath, parse } from "react-native-redash";
import Svg, { Path } from "react-native-svg";
import { BlurView } from "expo-blur";
import tailwind from "twrnc";

import { useHaptic } from "../utils/useHaptic";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

type VolumeStrokesProps = {
  sliderCurrentValue: SharedValue<number>;
  sliderActive: SharedValue<number>;
};

const VolumeStrokes = ({
  sliderCurrentValue,
  sliderActive,
}: VolumeStrokesProps) => {
  const lowStrokeStyle = useAnimatedStyle(() => {
    return {
      opacity: sliderCurrentValue.value >= 1 ? withSpring(1) : withSpring(0),
      transform: [
        {
          scale:
            sliderCurrentValue.value >= 1 ? withSpring(1) : withSpring(0.9),
        },
      ],
    };
  });
  const mediumStrokeStyle = useAnimatedStyle(() => {
    return {
      opacity: sliderCurrentValue.value >= 25 ? withSpring(1) : withSpring(0),
      transform: [
        {
          scale:
            sliderCurrentValue.value >= 25 ? withSpring(1) : withSpring(0.9),
        },
      ],
    };
  });
  const normalStrokeStyle = useAnimatedStyle(() => {
    return {
      opacity: sliderCurrentValue.value > 60 ? withSpring(1) : withSpring(0),
      transform: [
        {
          scale:
            sliderCurrentValue.value > 60 ? withSpring(1) : withSpring(0.9),
        },
      ],
    };
  });
  const volumeStrokeFill = useAnimatedProps(() => {
    const fill = interpolateColor(
      sliderActive.value,
      [0, 1],
      ["white", "rgba(0,0,0,0.45)"],
    );
    return { fill };
  });
  return (
    <View
      style={[
        tailwind.style("flex flex-row items-center justify-center"),
        { transform: [{ translateX: -4 }] },
      ]}
    >
      <Svg
        width="3"
        height="9"
        viewBox="0 0 3 9"
        fill="none"
        style={{ transform: [{ translateY: -0.5 }] }}
      >
        <AnimatedPath
          d="M0.380841 8.70504C0.758771 8.95113 1.25096 8.86324 1.52342 8.47652C2.23533 7.5273 2.65721 6.18258 2.65721 4.78511C2.65721 3.38765 2.23533 2.05172 1.52342 1.09371C1.25096 0.70699 0.758771 0.619099 0.380841 0.873982C-0.049823 1.15523 -0.128925 1.67379 0.213849 2.18355C0.697247 2.87789 0.969708 3.80953 0.969708 4.78511C0.969708 5.7607 0.697247 6.68355 0.213849 7.38668C-0.128925 7.89644 -0.049823 8.415 0.380841 8.70504Z"
          animatedProps={volumeStrokeFill}
          style={lowStrokeStyle}
        />
      </Svg>
      <Svg width="4" height="14" viewBox="0 0 4 14" fill="none">
        <AnimatedPath
          d="M0.922639 13.0602C1.32694 13.3063 1.81912 13.2184 2.10037 12.8054C3.24295 11.1882 3.91092 9.01727 3.91092 6.78485C3.91092 4.55242 3.25174 2.37274 2.10037 0.764338C1.81912 0.351252 1.32694 0.254572 0.922639 0.509455C0.500764 0.773127 0.43924 1.30047 0.755646 1.76629C1.68729 3.13738 2.22342 4.92156 2.22342 6.78485C2.22342 8.63934 1.6785 10.4235 0.755646 11.8034C0.448029 12.2692 0.500764 12.7878 0.922639 13.0602Z"
          animatedProps={volumeStrokeFill}
          style={mediumStrokeStyle}
        />
      </Svg>
      <Svg width="5" height="18" viewBox="0 0 5 18" fill="none">
        <AnimatedPath
          d="M0.48256 17.4425C0.869279 17.6974 1.38783 17.5831 1.66908 17.1612C3.21596 14.8409 4.1476 11.9581 4.1476 8.79404C4.1476 5.62118 3.19838 2.74716 1.66908 0.418059C1.38783 -0.0126051 0.869279 -0.118074 0.48256 0.136809C0.0606854 0.40927 -0.000838012 0.927825 0.289201 1.39364C1.63393 3.4415 2.46889 5.98154 2.46889 8.79404C2.46889 11.589 1.63393 14.1466 0.289201 16.1856C-0.000838012 16.6515 0.0606854 17.17 0.48256 17.4425Z"
          animatedProps={volumeStrokeFill}
          style={normalStrokeStyle}
        />
      </Svg>
    </View>
  );
};

type SpeakerIconProps = {
  sliderCurrentValue: SharedValue<number>;
  sliderActive: SharedValue<number>;
};

const SpeakerIcon = ({
  sliderCurrentValue,
  sliderActive,
}: SpeakerIconProps) => {
  const defaultPath = parse("M 4 4 L 0 0");
  const extendedPath = parse("M 4 4 L 19 19");

  const innerPathAnimatedProps = useAnimatedProps(() => {
    const d = interpolatePath(
      sliderCurrentValue.value,
      [1, 0],
      [defaultPath, extendedPath],
    );
    const opacity = interpolate(sliderCurrentValue.value, [1, 0], [0, 1]);
    const stroke = interpolateColor(
      sliderActive.value,
      [0, 1],
      ["white", "rgba(0,0,0,0.45)"],
    );
    return {
      d,
      opacity,
      stroke,
    };
  });

  const outerPathAnimatedProps = useAnimatedProps(() => {
    const d = interpolatePath(
      sliderCurrentValue.value,
      [1, 0],
      [defaultPath, extendedPath],
    );
    const opacity = interpolate(sliderCurrentValue.value, [1, 0], [0, 1]);
    const stroke = interpolateColor(
      sliderActive.value,
      [1, 0],
      ["#EA9A78", "rgb(255,169,135)"],
    );
    return {
      d,
      opacity,
      stroke,
    };
  });

  const speakerIconAnimatedProps = useAnimatedProps(() => {
    const fill = interpolateColor(
      sliderActive.value,
      [0, 1],
      ["white", "rgba(0,0,0,0.45)"],
    );
    return { fill };
  });

  return (
    <View style={tailwind.style("relative")}>
      <Svg width="25" height="25" viewBox="0 0 25 25" fill="none">
        <AnimatedPath
          d="M16.8574 20C17.5166 20 18 19.5078 18 18.8574V5.43652C18 4.77734 17.5166 4.25 16.8398 4.25C16.3916 4.25 16.0664 4.43457 15.5918 4.90039L11.918 8.33691C11.8652 8.38965 11.7949 8.41602 11.7158 8.41602H9.22852C7.92773 8.41602 7.22461 9.13672 7.22461 10.499V13.7686C7.22461 15.1309 7.92773 15.8516 9.22852 15.8516H11.7158C11.7949 15.8516 11.8564 15.8779 11.918 15.9307L15.5918 19.3936C16.0312 19.8154 16.4004 20 16.8574 20Z"
          animatedProps={speakerIconAnimatedProps}
        />
      </Svg>
      <View style={tailwind.style("absolute left-[3px]")}>
        <Svg width="25" height="25" viewBox="0 0 25 25" fill="none">
          <AnimatedPath
            strokeWidth="5"
            strokeLinecap="round"
            animatedProps={outerPathAnimatedProps}
          />
        </Svg>
      </View>
      <View style={tailwind.style("absolute left-[3px]")}>
        <Svg width="25" height="25" viewBox="0 0 25 25" fill="none">
          <AnimatedPath
            stroke="#A09FA6"
            strokeWidth="3"
            strokeLinecap="round"
            animatedProps={innerPathAnimatedProps}
          />
        </Svg>
      </View>
    </View>
  );
};

const SCREEN_WIDTH = Dimensions.get("screen").width;

const SPEAKER_ICON_WIDTH = 37;
const HORIZONTAL_PADDING = 128;

const SLIDER_WIDTH = SCREEN_WIDTH - SPEAKER_ICON_WIDTH - HORIZONTAL_PADDING;
const SLIDER_HEIGHT = 4;
const INCREASED_SLIDER_WIDTH = SCREEN_WIDTH - HORIZONTAL_PADDING;
const INCREASED_SLIDER_HEIGHT = 40;

const SCALING_FACTOR = 1.1;

const DefaultSpringConfig: WithSpringConfig = {
  mass: 1,
  damping: 15,
  stiffness: 180,
};

export const VolumeInteraction = () => {
  const sliderActive = useSharedValue(0);

  // These are the min and max points along the x-axis
  const min_x = 0;
  const max_x = INCREASED_SLIDER_WIDTH;
  const startingWidth = useSharedValue(30);
  const sliderState = useSharedValue(30);

  const startXDistance = useSharedValue(0);
  const currentXDistance = useSharedValue(0);
  const hapticSelection = useHaptic("selection");

  const isMuted = useSharedValue(0);
  const isVolumeFull = useSharedValue(0);

  useAnimatedReaction(
    () => isMuted.value,
    (prev, next) => {
      if (prev !== next) {
        // console.log("%c⧭", "color: #cc0036", prev, next);
      }
    },
  );

  const hapticWarning = useHaptic("warning");
  const hapticHeavy = useHaptic("heavy");

  const panGesture = Gesture.Pan()
    .onBegin(event => {
      sliderActive.value = withSpring(1, DefaultSpringConfig);
      hapticSelection && runOnJS(hapticSelection)();
      startXDistance.value = event.x;
    })
    .onChange(event => {
      const { x } = event;
      currentXDistance.value = x;
      const interpolatedValue = interpolate(
        currentXDistance.value,
        [min_x, startXDistance.value, max_x],
        [0, startingWidth.value, 100],
        Extrapolation.CLAMP,
      );
      const computedValue = Math.round(interpolatedValue);
      if (Number.isInteger(computedValue)) {
        if (computedValue === 0 && isMuted.value === 0) {
          hapticWarning && runOnJS(hapticWarning)();
          isMuted.value = 1;
        }
        if (computedValue > 0) {
          isMuted.value = 0;
        }
        if (computedValue === 100 && isVolumeFull.value === 0) {
          hapticHeavy && runOnJS(hapticHeavy)();
          isVolumeFull.value = 1;
        }
        if (computedValue < 100) {
          isVolumeFull.value = 0;
        }
        sliderState.value = withSpring(computedValue, {
          mass: 1,
          damping: 30,
          stiffness: 180,
        });
      }
    })
    .onEnd(() => {})
    .onFinalize(() => {
      startingWidth.value = sliderState.value;
      sliderActive.value = withSpring(0, DefaultSpringConfig);
    });

  const sliderAnimatingStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: "rgba(0, 0, 0, 0.15)",
      width: interpolate(
        sliderActive.value,
        [0, 1],
        [SLIDER_WIDTH, INCREASED_SLIDER_WIDTH],
        Extrapolation.CLAMP,
      ),
      height: interpolate(
        sliderActive.value,
        [0, 1],
        [SLIDER_HEIGHT, INCREASED_SLIDER_HEIGHT],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          translateX: interpolate(
            sliderActive.value,
            [0, 1],
            [0, -SPEAKER_ICON_WIDTH],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(sliderActive.value, [0, 1], [1, SCALING_FACTOR]),
        },
      ],
    };
  });

  const speakerIconWrapper = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            sliderActive.value,
            [0, 1],
            [0, 4],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  const filledSlider = useAnimatedStyle(() => {
    return {
      width: sliderState.value >= 0 ? `${sliderState.value}%` : "0%",
    };
  });

  return (
    <View style={tailwind.style("flex-1 justify-center px-16 bg-[#141414]")}>
      <StatusBar barStyle={"dark-content"} />
      <Animated.View style={tailwind.style("absolute inset-0")}>
        <Image
          style={tailwind.style("h-full w-full")}
          source={require("../assets/background.jpg")}
        />
      </Animated.View>
      <Animated.View style={containerStyle}>
        <GestureDetector gesture={panGesture}>
          <View
            style={[
              tailwind.style(
                "relative w-full flex flex-row items-center justify-between py-4",
              ),
            ]}
          >
            <Animated.View
              style={[
                tailwind.style("flex flex-row items-center z-10"),
                speakerIconWrapper,
              ]}
            >
              <SpeakerIcon
                sliderCurrentValue={sliderState}
                sliderActive={sliderActive}
              />
              <VolumeStrokes
                sliderCurrentValue={sliderState}
                sliderActive={sliderActive}
              />
            </Animated.View>
            <AnimatedBlurView
              intensity={35}
              style={[
                tailwind.style(
                  "flex flex-row items-center z-0 rounded-xl overflow-hidden",
                ),
                sliderAnimatingStyle,
              ]}
            >
              <Animated.View
                style={[
                  tailwind.style("absolute inset-0 rounded-r-xl bg-white w-0"),
                  filledSlider,
                ]}
              />
            </AnimatedBlurView>
          </View>
        </GestureDetector>
      </Animated.View>
    </View>
  );
};
