import { Image, StatusBar, ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
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

export const RadialControl = () => {
  const currentAngle = useSharedValue(start_angle);
  const startAngle = useSharedValue(start_angle);

  const gestureStartThetaθ = useSharedValue(0);

  // const movingForwardGestureReachedLimit = useSharedValue(1);
  // const movingBackwardGestureReachedLimit = useSharedValue(1);

  const gestureReachedDeadZone = useSharedValue(0);

  const findNearestMultiple = (angleValue: number) => {
    "worklet";
    let adjustedAngle = angleValue + angle / 2;
    adjustedAngle = adjustedAngle - (adjustedAngle % angle);
    return adjustedAngle;
  };

  const panGesture = Gesture.Pan()
    .onBegin(event => {
      const { x, y } = event;
      const deltaX = x - R; // The Center Coordinates of the Container is now (R, R)
      const deltaY = y - R; // The Center Coordinates of the Container is now (R, R)
      const angleRadians = Math.atan2(deltaY, deltaX);
      const angleDegrees = toDeg(angleRadians);
      let adjustedAngle = angleDegrees;
      adjustedAngle = adjustedAngle < 0 ? adjustedAngle + 360 : adjustedAngle;
      gestureStartThetaθ.value = adjustedAngle;
    })
    .onChange(event => {
      const { x, y } = event;
      const deltaX = x - R; // The Center Coordinates of the Container is now (R, R)
      const deltaY = y - R; // The Center Coordinates of the Container is now (R, R)
      const angleRadians = Math.atan2(deltaY, deltaX);

      const angleDegrees = toDeg(angleRadians);
      let adjustedAngle = angleDegrees;
      adjustedAngle = adjustedAngle < 0 ? adjustedAngle + 360 : adjustedAngle;

      if (
        Math.round(adjustedAngle) < start_angle &&
        Math.round(adjustedAngle) > 0 &&
        currentAngle.value === start_angle
      ) {
        gestureReachedDeadZone.value = 1;
      }
      if (
        Math.round(adjustedAngle) > last_angle &&
        Math.round(adjustedAngle) < 360 &&
        currentAngle.value === last_angle
      ) {
        gestureReachedDeadZone.value = 1;
      }
      const interpolatedValue = interpolate(
        adjustedAngle,
        [0, gestureStartThetaθ.value, 360],
        [start_angle, startAngle.value, last_angle],
      );
      if (gestureReachedDeadZone.value === 0) {
        currentAngle.value = findNearestMultiple(interpolatedValue);
      }
    })
    .onEnd(() => {
      startAngle.value = currentAngle.value;
      gestureReachedDeadZone.value = 0;
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
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            tailwind.style(
              `h-[${D}px] w-[${D}px] rounded-full bg-white shadow-lg flex justify-center items-center`,
            ),
            {
              transform: [{ rotate: "90deg" }],
            },
          ]}
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

// const deltaX = x - R; // The Center Coordinates of the Container is now (R, R)
// const deltaY = y - R; // The Center Coordinates of the Container is now (R, R)
// const angleRadians = Math.atan2(deltaY, deltaX);
// const angleDegrees = toDeg(angleRadians);
// let adjustedAngle = angleDegrees;
// adjustedAngle = adjustedAngle < 0 ? adjustedAngle + 360 : adjustedAngle;
// /* Making sure that the angle is always a multiple of 45. */
// // By adding half of the angle to the calculated angle we take it to closer multiple of angle = 45
// // Like for 15 -> 15 + (45/2) = 37.5
// // Like for 24 -> 24 + (45/2) = 46.5
// adjustedAngle = adjustedAngle + angle / 2;
// // By subtracting the remainder of (value/angle) of the result, we get the closest multiple of the angle
// // Now 37.5 -> 37.5 - (37.5%45) = 0
// // Now 46.5 -> 46.5 - (46.5%45) = 45
// adjustedAngle = adjustedAngle - (adjustedAngle % angle);
// if (adjustedAngle > last_angle && adjustedAngle < start_angle) {
//   goingInOppDirection.value = 1;
// } else {
//   if (goingInOppDirection.value) {
//     if (currentAngle.value === adjustedAngle) {
//       goingInOppDirection.value = 0;
//     }
//   } else {
//     currentAngle.value = adjustedAngle;
//   }
// }
