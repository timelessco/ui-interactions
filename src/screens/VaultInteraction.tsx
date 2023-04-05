import React from "react";
import { Dimensions, StatusBar, ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withSpring,
} from "react-native-reanimated";
import tailwind from "twrnc";

import { withAnchorPoint } from "../utils/withAnchorPoint";

function toRad(degrees: number) {
  "worklet";
  return (degrees * Math.PI) / 180;
}

function toDeg(radians: number) {
  "worklet";
  return (radians * 180) / Math.PI;
}

const chars: string[] = [];
const notches = 360;

// add A-Z
for (let i = 65; i <= 90; i++) {
  chars.push(String.fromCharCode(i));
}

// add 0-9
for (let i = 48; i <= 57; i++) {
  chars.push(String.fromCharCode(i));
}

const OUTER_D = parseInt(`${Dimensions.get("screen").width * 0.8}`, 10);
const OUTER_R = OUTER_D / 2;

const getCharPosition = (angleInRadians: number, distanceFactor: number) => {
  const x = distanceFactor * OUTER_R * Math.cos(angleInRadians);
  const y = distanceFactor * OUTER_R * Math.sin(angleInRadians);
  return { x, y };
};

const getCharsTransform = (
  tranformAngle: number,
  index: number,
  distanceFactor: number,
): ViewStyle => {
  const { x, y } = getCharPosition(tranformAngle, distanceFactor);
  const transforms = withAnchorPoint(
    {
      transform: [
        { translateX: x },
        { translateY: y },
        {
          rotate: `${index * 10}deg`,
        },
      ],
    },
    { x: 0.5, y: 0.5 },
    { height: 40, width: 40 },
  );
  return {
    ...transforms,
  };
};

export const VaultInteraction = () => {
  const currentAngle = useSharedValue(0);
  const angle = (Math.PI * 2) / chars.length;
  const startAngle = useSharedValue(0);
  const isDecayingFinished = useSharedValue(0);

  useAnimatedReaction(
    () => currentAngle.value,
    (next, _prev) => {
      const findNearestMultiple = (angleValue: number) => {
        "worklet";
        let adjustedAngle = angleValue + 10 / 2;
        adjustedAngle = adjustedAngle - (adjustedAngle % 10);
        return adjustedAngle;
      };
      if (isDecayingFinished.value) {
        currentAngle.value = withSpring(
          findNearestMultiple(next),
          {
            damping: 18,
            stiffness: 140,
          },
          finished => {
            if (finished) {
              currentAngle.value = findNearestMultiple(next) % 360;
            }
          },
        );
      }
    },
  );

  const panGesture = Gesture.Pan()
    .onStart(event => {
      const { x, y } = event;
      const deltaX = x - (OUTER_D + 50) / 2;
      const deltaY = y - (OUTER_D + 50) / 2;
      const angleInRadians = Math.atan2(deltaY, deltaX);
      const angleDegrees = toDeg(angleInRadians);
      let adjustedAngle = angleDegrees;
      adjustedAngle = adjustedAngle < 0 ? adjustedAngle + 360 : adjustedAngle;
      startAngle.value = adjustedAngle;
      isDecayingFinished.value = 0;
    })
    .onChange(event => {
      const { x, y } = event;
      const deltaX = x - (OUTER_D + 50) / 2;
      const deltaY = y - (OUTER_D + 50) / 2;
      const angleInRadians = Math.atan2(deltaY, deltaX);
      const angleDegrees = toDeg(angleInRadians);
      let adjustedAngle = angleDegrees;
      adjustedAngle = adjustedAngle < 0 ? adjustedAngle + 360 : adjustedAngle;
      const angleDiff = adjustedAngle - startAngle.value;
      const nextAngle = currentAngle.value + angleDiff;
      currentAngle.value = nextAngle;
    })
    .onFinalize(event => {
      currentAngle.value = withDecay(
        {
          velocity: event.velocityY,
        },
        () => {
          isDecayingFinished.value = 1;
        },
      );
    });

  const dialRotation = useAnimatedStyle(() => {
    return {
      transform: [{ rotateZ: `${currentAngle.value}deg` }],
    };
  });

  return (
    <Animated.View
      style={tailwind.style("flex-1 justify-center items-center bg-[#1f0039]")}
    >
      <StatusBar barStyle={"light-content"} />
      <Animated.View
        style={[
          tailwind.style("relative justify-center items-center"),
          {
            transform: [{ rotate: "270deg" }],
          },
        ]}
      >
        {/* INNER DIAL */}
        <Animated.View
          style={[
            tailwind.style(
              "bg-[#8001d5] rounded-full absolute",
              `h-[${OUTER_D}px] w-[${OUTER_D}px]`,
            ),
          ]}
        >
          <Animated.View
            style={[
              tailwind.style("h-full w-full justify-center items-center"),
            ]}
          >
            {chars.map((value, index) => {
              const currentStrokeAngle = index * angle;
              return (
                <Animated.View
                  key={index}
                  style={[
                    tailwind.style(
                      "absolute justify-center items-center w-10 h-10",
                    ),
                    getCharsTransform(currentStrokeAngle, index, 0.8),
                  ]}
                >
                  <Animated.Text
                    style={[
                      tailwind.style(
                        "text-sm font-semibold text-center text-[#f7ecfc]",
                      ),
                      { transform: [{ rotate: "90deg" }] },
                    ]}
                  >
                    {value}
                  </Animated.Text>
                </Animated.View>
              );
            })}
            {Array(notches)
              .fill(1)
              .map((_value, index) => {
                const getStrokePosition = (
                  angleInDegrees: number,
                  distanceFactor: number,
                ) => {
                  const angleInRadians = toRad(angleInDegrees);
                  const x = distanceFactor * OUTER_R * Math.cos(angleInRadians);
                  const y = distanceFactor * OUTER_R * Math.sin(angleInRadians);
                  return { x, y };
                };

                const getTransform = (
                  tranformAngle: number,
                  h: number,
                  w: number,
                  distanceFactor: number,
                ): ViewStyle => {
                  const { x, y } = getStrokePosition(
                    tranformAngle,
                    distanceFactor,
                  );
                  const transforms = withAnchorPoint(
                    {
                      transform: [
                        { translateX: x },
                        { translateY: y },
                        { rotate: `${tranformAngle}deg` },
                      ],
                    },
                    { x: 0.5, y: 0.5 },
                    { height: h, width: w },
                  );
                  return {
                    ...transforms,
                  };
                };

                const currentStrokeAngle = index * 2;

                return currentStrokeAngle % 5 === 0 ? (
                  <Animated.View
                    key={index}
                    style={[
                      tailwind.style(
                        "absolute bg-[#cb81ff]",
                        currentStrokeAngle % 5 === 0
                          ? "h-[0.5px] w-3"
                          : "h-[0.45px] w-1",
                      ),
                      getTransform(currentStrokeAngle, 0.5, 12, 0.945),
                    ]}
                  />
                ) : null;
              })}
            {Array(notches)
              .fill(1)
              .map((_value, index) => {
                const getStrokePosition = (
                  angleInDegrees: number,
                  distanceFactor: number,
                ) => {
                  const angleInRadians = toRad(angleInDegrees);
                  const x = distanceFactor * OUTER_R * Math.cos(angleInRadians);
                  const y = distanceFactor * OUTER_R * Math.sin(angleInRadians);
                  return { x, y };
                };

                const getTransform = (
                  tranformAngle: number,
                  h: number,
                  w: number,
                  distanceFactor: number,
                ): ViewStyle => {
                  const { x, y } = getStrokePosition(
                    tranformAngle,
                    distanceFactor,
                  );
                  const transforms = withAnchorPoint(
                    {
                      transform: [
                        { translateX: x },
                        { translateY: y },
                        { rotate: `${tranformAngle}deg` },
                      ],
                    },
                    { x: 0.5, y: 0.5 },
                    { height: h, width: w },
                  );
                  return {
                    ...transforms,
                  };
                };

                const currentStrokeAngle = index * 2;

                return currentStrokeAngle % 5 !== 0 ? (
                  <Animated.View
                    key={index}
                    style={[
                      tailwind.style(
                        "absolute bg-[#bf7af0]",
                        currentStrokeAngle % 5 === 0
                          ? "h-[0.5px] w-3"
                          : "h-[0.45px] w-1",
                      ),
                      getTransform(currentStrokeAngle, 0.45, 4, 0.97),
                    ]}
                  />
                ) : null;
              })}
          </Animated.View>
        </Animated.View>
        {/* OUTER DIAL */}
        <Animated.View
          style={[
            tailwind.style(
              "rounded-full ",
              `h-[${OUTER_D + 50}px] w-[${OUTER_D + 50}px]`,
            ),
            dialRotation,
          ]}
        >
          <GestureDetector gesture={panGesture}>
            <Animated.View
              style={[
                tailwind.style("h-full w-full justify-center items-center"),
              ]}
            >
              {chars.map((value, index) => {
                const currentStrokeAngle = index * angle;
                return (
                  <Animated.View
                    key={index}
                    style={[
                      tailwind.style(
                        "absolute justify-center items-center w-10 h-10",
                      ),
                      getCharsTransform(currentStrokeAngle, index, 1.1),
                    ]}
                  >
                    <Animated.Text
                      style={[
                        tailwind.style(
                          "text-base font-medium text-center text-[#f7ecfc]",
                        ),
                        { transform: [{ rotate: "90deg" }] },
                      ]}
                    >
                      {value}
                    </Animated.Text>
                  </Animated.View>
                );
              })}
            </Animated.View>
          </GestureDetector>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
};
