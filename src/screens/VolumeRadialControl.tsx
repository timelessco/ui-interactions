import { Image, StatusBar, ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { toDeg, toRad } from "react-native-redash";
import { SafeAreaView } from "react-native-safe-area-context";
import tailwind from "twrnc";

const D = 170;
const R = D / 2;
const angle = 45;

// The space between the circle and the stroke
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

export const VolumeRadialControl = () => {
  const sv = useSharedValue(0);
  const currentAngle = useSharedValue(270);
  const gestureInSweepingAngle = useSharedValue(0);
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      sv.value = withSpring(1);
    })
    .onChange(event => {
      const { x, y } = event;
      const deltaX = x - R; // The Center Coordinates of the Container is now (R, R)
      const deltaY = y - R; // The Center Coordinates of the Container is now (R, R)
      const angleRadians = Math.atan2(deltaY, deltaX);
      const angleDegrees = toDeg(angleRadians);
      let adjustedAngle = angleDegrees;
      adjustedAngle = adjustedAngle < 0 ? adjustedAngle + 360 : adjustedAngle;
      if (adjustedAngle > 45 && adjustedAngle < 135) {
        gestureInSweepingAngle.value = 1;
      } else {
        currentAngle.value = adjustedAngle;
      }
    })
    .onEnd(() => {
      sv.value = withSpring(0);
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
          style={tailwind.style(
            `h-[${D}px] w-[${D}px] rounded-full bg-gray-600 shadow-lg flex justify-center items-center`,
          )}
        >
          <Animated.View
            style={[
              tailwind.style("absolute h-1.5 w-5 bg-gray-400"),
              indicatorAnimationStyle,
            ]}
          />
          {Array(8)
            .fill(1)
            .map((_value, index) => {
              const currentStrokeAngle = index * angle;
              if (currentStrokeAngle === 90) {
                return;
              }
              return (
                <Animated.View
                  key={index}
                  style={[
                    tailwind.style("absolute h-1 w-5 bg-white"),
                    getTransform(currentStrokeAngle),
                  ]}
                />
              );
            })}
        </Animated.View>
      </GestureDetector>
    </SafeAreaView>
  );
};
