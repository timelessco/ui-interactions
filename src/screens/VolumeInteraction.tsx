import { Dimensions, View } from "react-native";
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

const VolumeStrokes = () => {
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
        <Path
          d="M0.380841 8.70504C0.758771 8.95113 1.25096 8.86324 1.52342 8.47652C2.23533 7.5273 2.65721 6.18258 2.65721 4.78511C2.65721 3.38765 2.23533 2.05172 1.52342 1.09371C1.25096 0.70699 0.758771 0.619099 0.380841 0.873982C-0.049823 1.15523 -0.128925 1.67379 0.213849 2.18355C0.697247 2.87789 0.969708 3.80953 0.969708 4.78511C0.969708 5.7607 0.697247 6.68355 0.213849 7.38668C-0.128925 7.89644 -0.049823 8.415 0.380841 8.70504Z"
          fill="#A09FA6"
        />
      </Svg>
      <Svg width="4" height="14" viewBox="0 0 4 14" fill="none">
        <Path
          d="M0.922639 13.0602C1.32694 13.3063 1.81912 13.2184 2.10037 12.8054C3.24295 11.1882 3.91092 9.01727 3.91092 6.78485C3.91092 4.55242 3.25174 2.37274 2.10037 0.764338C1.81912 0.351252 1.32694 0.254572 0.922639 0.509455C0.500764 0.773127 0.43924 1.30047 0.755646 1.76629C1.68729 3.13738 2.22342 4.92156 2.22342 6.78485C2.22342 8.63934 1.6785 10.4235 0.755646 11.8034C0.448029 12.2692 0.500764 12.7878 0.922639 13.0602Z"
          fill="#A09FA6"
        />
      </Svg>
      <Svg width="5" height="18" viewBox="0 0 5 18" fill="none">
        <Path
          d="M0.48256 17.4425C0.869279 17.6974 1.38783 17.5831 1.66908 17.1612C3.21596 14.8409 4.1476 11.9581 4.1476 8.79404C4.1476 5.62118 3.19838 2.74716 1.66908 0.418059C1.38783 -0.0126051 0.869279 -0.118074 0.48256 0.136809C0.0606854 0.40927 -0.000838012 0.927825 0.289201 1.39364C1.63393 3.4415 2.46889 5.98154 2.46889 8.79404C2.46889 11.589 1.63393 14.1466 0.289201 16.1856C-0.000838012 16.6515 0.0606854 17.17 0.48256 17.4425Z"
          fill="#A09FA6"
        />
      </Svg>
    </View>
  );
};

const SpeakerIcon = () => {
  return (
    <Svg width="25" height="25" viewBox="0 0 25 25" fill="none">
      <Path
        d="M16.8574 20C17.5166 20 18 19.5078 18 18.8574V5.43652C18 4.77734 17.5166 4.25 16.8398 4.25C16.3916 4.25 16.0664 4.43457 15.5918 4.90039L11.918 8.33691C11.8652 8.38965 11.7949 8.41602 11.7158 8.41602H9.22852C7.92773 8.41602 7.22461 9.13672 7.22461 10.499V13.7686C7.22461 15.1309 7.92773 15.8516 9.22852 15.8516H11.7158C11.7949 15.8516 11.8564 15.8779 11.918 15.9307L15.5918 19.3936C16.0312 19.8154 16.4004 20 16.8574 20Z"
        fill="#A09FA6"
      />
    </Svg>
  );
};

const SCREEN_WIDTH = Dimensions.get("screen").width;

const SPEAKER_ICON_WIDTH = 37;
const HORIZONTAL_PADDING = 80;

const SLIDER_WIDTH = SCREEN_WIDTH - SPEAKER_ICON_WIDTH - HORIZONTAL_PADDING;
const SLIDER_HEIGHT = 4;
const INCREASED_SLIDER_WIDTH = SCREEN_WIDTH - HORIZONTAL_PADDING;
const INCREASED_SLIDER_HEIGHT = 32;

export const VolumeInteraction = () => {
  const sliderActive = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      sliderActive.value = withSpring(1);
    })
    .onFinalize(() => {
      sliderActive.value = withSpring(0);
    });

  const sliderAnimatingStyle = useAnimatedStyle(() => {
    return {
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
          scale: interpolate(
            sliderActive.value,
            [0, 1],
            [1, 1.19],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  return (
    <View style={tailwind.style("flex-1 justify-center px-10 bg-[#141414]")}>
      <Animated.View style={containerStyle}>
        <GestureDetector gesture={panGesture}>
          <View
            style={[
              tailwind.style(
                "w-full flex flex-row items-center justify-between py-4 ",
              ),
            ]}
          >
            <View style={tailwind.style("flex flex-row z-10")}>
              <SpeakerIcon />
              <VolumeStrokes />
            </View>
            <Animated.View
              style={[
                tailwind.style(
                  "flex flex-row items-center bg-[#232326] rounded-md z-0",
                ),
                sliderAnimatingStyle,
              ]}
            />
          </View>
        </GestureDetector>
      </Animated.View>
    </View>
  );
};
