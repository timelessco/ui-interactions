import { Image, StatusBar, ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolateColor,
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { toDeg, toRad } from "react-native-redash";
import { SafeAreaView } from "react-native-safe-area-context";
import tailwind from "twrnc";

import { useHaptic } from "../utils/useHaptic";

const D = 170;
const R = D / 2;

const angle = 30;
const notches = 360 / angle;

const sweeping_angle = angle * 2;
const last_angle = 360 - sweeping_angle / 2;
const start_angle = sweeping_angle / 2;

// The space between the circle and the notches
const distanceFactor = 1.6;

const getStrokePosition = (angleInDegrees: number) => {
  const angleInRadians = toRad(angleInDegrees);
  const x = R * distanceFactor * Math.cos(angleInRadians);
  const y = R * distanceFactor * Math.sin(angleInRadians);
  return { x, y };
};

const getTransform = (tranformAngle: number): ViewStyle => {
  const { x, y } = getStrokePosition(tranformAngle);
  return {
    transform: [
      { translateX: x },
      { translateY: y },
      { rotate: `${tranformAngle}deg` },
    ],
  };
};

type NotchesProps = {
  index: number;
  currentAngle: SharedValue<number>;
};

const Notches = ({ index, currentAngle }: NotchesProps) => {
  const hapticSelection = useHaptic();
  const active = useSharedValue(0);
  useAnimatedReaction(
    () => currentAngle.value,
    (next, _prev) => {
      // Mapping current angle to an index value
      let currentAngleFactor = next / angle;
      // Mapping Notch angle to an index value
      let notchAngleFactor = (index * angle) / angle;
      // Setting the currentAngleFactor && notchAngleFactor to the notches when it is zero
      // It is the 0, 360 degree point in the Knob
      if (currentAngleFactor === 0) {
        currentAngleFactor = notches;
      }
      if (notchAngleFactor === 0) {
        notchAngleFactor = notches;
      }
      // Setting the currentAngleFactor && notchAngleFactor to the (notches+(factor)) when it is more than zero
      // It is the (start angle) degree point in the Knob, which is the max point

      if (currentAngleFactor > 0 && currentAngleFactor < start_angle / angle) {
        currentAngleFactor = notches + currentAngleFactor;
      }
      if (notchAngleFactor > 0 && notchAngleFactor < start_angle / angle) {
        notchAngleFactor = notches + notchAngleFactor;
      }

      if (currentAngleFactor >= notchAngleFactor) {
        if (active.value === 0) {
          hapticSelection && runOnJS(hapticSelection)();
        }
        active.value = withSpring(1);
      } else {
        if (active.value === 1) {
          hapticSelection && runOnJS(hapticSelection)();
        }
        active.value = withSpring(0);
      }
    },
  );
  const currentStrokeAngle = index * angle;
  const animatedStyles = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        active.value,
        [0, 1],
        ["white", "orange"],
      ),
    };
  });
  if (currentStrokeAngle === 0) {
    return null;
  }
  return (
    <Animated.View
      key={index}
      style={[
        tailwind.style("absolute h-1 w-5 "),
        getTransform(currentStrokeAngle),
        animatedStyles,
      ]}
    />
  );
};

export const TwoPinchKnob = () => {
  // These are the min and max points along the x-axis
  const currentAngle = useSharedValue(start_angle);
  const gestureStartAngle = useSharedValue(start_angle);
  const findNearestMultiple = (angleValue: number) => {
    "worklet";
    let adjustedAngle = angleValue + angle / 2;
    adjustedAngle = adjustedAngle - (adjustedAngle % angle);
    return adjustedAngle;
  };
  const rotationGesture = Gesture.Rotation()
    .onUpdate(event => {
      let rotation = toDeg(event.rotation);
      rotation = findNearestMultiple(rotation);
      const nextAngle = gestureStartAngle.value + rotation;
      if (nextAngle >= start_angle && nextAngle <= last_angle) {
        currentAngle.value = nextAngle;
      }
    })
    .onEnd(() => {
      gestureStartAngle.value = currentAngle.value;
    });

  const indicatorAnimationStyle = useAnimatedStyle(() => {
    const localGetIndicatorPosition = (angleInDegrees: number) => {
      const angleInRadians = (angleInDegrees * Math.PI) / 180;
      const x = R * 0.7 * Math.cos(angleInRadians);
      const y = R * 0.7 * Math.sin(angleInRadians);
      return {
        transform: [
          { translateX: x },
          { translateY: y },
          { rotate: `${angleInDegrees}deg` },
        ],
      };
    };
    return localGetIndicatorPosition(currentAngle.value);
  });

  return (
    <SafeAreaView style={tailwind.style("flex-1 items-center justify-center")}>
      <StatusBar barStyle={"dark-content"} />
      <Animated.View style={tailwind.style("absolute inset-0")}>
        <Image
          style={tailwind.style("h-full w-full")}
          source={require("../assets/background1.jpg")}
        />
      </Animated.View>
      <GestureDetector gesture={rotationGesture}>
        <Animated.View
          style={tailwind.style(
            `h-[${D}px] w-[${D}px] rounded-full bg-white shadow-lg flex justify-center items-center`,
            { transform: [{ rotate: "90deg" }] },
          )}
        >
          <Animated.View
            style={[
              tailwind.style("absolute h-1.5 w-5 bg-[#FFA500] shadow-sm"),
              indicatorAnimationStyle,
            ]}
          />
          {Array(notches)
            .fill(1)
            .map((_value, index) => (
              <Notches key={index} index={index} currentAngle={currentAngle} />
            ))}
        </Animated.View>
      </GestureDetector>
    </SafeAreaView>
  );
};
