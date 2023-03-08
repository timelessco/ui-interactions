import { useCallback, useEffect, useState } from "react";
import { Image, ImageSourcePropType, Pressable, StatusBar } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  FadeInDown,
  FadeOutDown,
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import tailwind from "twrnc";

import { useHaptic } from "../utils/useHaptic";

type PeopleObject = { name: string; avatar: ImageSourcePropType };

const people: PeopleObject[] = [
  { name: "Jane Cooper", avatar: require("../assets/avatar/avatar.png") },
  { name: "Cody Fisher", avatar: require("../assets/avatar/avatar-1.png") },
  { name: "Esther Howard", avatar: require("../assets/avatar/avatar-2.png") },
  { name: "Jenny Wilson", avatar: require("../assets/avatar/avatar-3.png") },
  { name: "Jim Carrey", avatar: require("../assets/avatar/avatar-4.png") },
  { name: "Joshua Goldberg", avatar: require("../assets/avatar/avatar-5.png") },
];

const SEGMENT_HEIGHT = 44;
const SEGMENT_WIDTH = 250;
const MOVING_SEGMENT_WIDTH = 272;
const MOVING_SEGMENT_HEIGHT = 48;

const DEFAULT_SPRING_CONFIG: WithSpringConfig = {
  mass: 1,
  damping: 20,
  stiffness: 250,
  overshootClamping: false,
  restSpeedThreshold: 0.001,
  restDisplacementThreshold: 0.001,
};

type PersonComponentProps = {
  person: PeopleObject;
  setCurrentShareTarget: React.Dispatch<React.SetStateAction<string>>;
  currentTarget: SharedValue<number>;
  index: number;
};

const PersonComponent = ({
  person,
  setCurrentShareTarget,
  currentTarget,
  index,
}: PersonComponentProps) => {
  const sv = useSharedValue(0);
  const hapticSelection = useHaptic();
  useAnimatedReaction(
    () => currentTarget.value,
    (next, prev) => {
      if (next !== prev) {
        if (next === people.length - index - 1) {
          sv.value = withSpring(1, DEFAULT_SPRING_CONFIG);
          hapticSelection && runOnJS(hapticSelection)();
        } else {
          sv.value = withSpring(0, DEFAULT_SPRING_CONFIG);
        }
      }
    },
  );
  const containerStyle = useAnimatedStyle(() => {
    return {
      zIndex: interpolate(sv.value, [0, 1], [-1, 9999]),
      transform: [
        {
          scale: interpolate(sv.value, [0, 1], [1, 1.1]),
        },
      ],
    };
  });

  const handlePress = useCallback(() => {
    setCurrentShareTarget(person.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Animated.View style={containerStyle}>
      <Pressable
        key={person.name}
        onPress={handlePress}
        style={[tailwind.style("px-2 z-20")]}
      >
        <Animated.View
          style={tailwind.style(
            `h-[${SEGMENT_HEIGHT}px] w-[${SEGMENT_WIDTH}px] flex-row items-center`,
          )}
        >
          <Animated.View
            style={tailwind.style("h-8 w-8 rounded-full overflow-hidden")}
          >
            <Animated.Image
              style={tailwind.style("h-full w-full ")}
              source={person.avatar}
            />
          </Animated.View>
          <Animated.Text
            style={[
              tailwind.style("text-base font-medium text-[#171717] pl-2.5"),
            ]}
          >
            {person.name}
          </Animated.Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

export const SharedGestureConcept = () => {
  const lowerBounds = -20;
  const upperBounds = -(people.length * SEGMENT_HEIGHT + 30);
  const { bottom } = useSafeAreaInsets();
  const [shareSheetOpen, setShareSheetOpen] = useState(false);
  const [currentShareTarget, setCurrentShareTarget] = useState("");
  const tapScale = useSharedValue(0);
  const enableSelection = useSharedValue(0);
  const selectedContainerTranslate = useSharedValue(0);
  const currentTarget = useSharedValue(-1);
  const hapticSelection = useHaptic();
  const containerStretch = useSharedValue(0);

  const activatedFromTap = useSharedValue(0);
  const enableSpringTranslation = useSharedValue(0);

  const tapGesture = Gesture.Tap()
    .onStart(() => {
      tapScale.value = withSpring(1, DEFAULT_SPRING_CONFIG);
      runOnJS(setShareSheetOpen)(!shareSheetOpen);
    })
    .onEnd(() => {
      tapScale.value = withDelay(100, withSpring(0, DEFAULT_SPRING_CONFIG));
    });

  const panGesture = Gesture.Pan()
    .activateAfterLongPress(350)
    .onBegin(event => {
      tapScale.value = withSpring(1, DEFAULT_SPRING_CONFIG);
      hapticSelection && runOnJS(hapticSelection)();

      selectedContainerTranslate.value = 0;
      if (event.y < lowerBounds && activatedFromTap.value === 0) {
        if (event.y > upperBounds) {
          activatedFromTap.value = 1;
          enableSpringTranslation.value = 1;
          const translationDiffFactor = Math.floor(
            Math.abs(event.y) / SEGMENT_HEIGHT,
          );

          if (
            translationDiffFactor >= 0 &&
            translationDiffFactor <= people.length
          ) {
            selectedContainerTranslate.value = -(
              SEGMENT_HEIGHT *
              (translationDiffFactor - 1)
            );
          }
        }
      }
    })
    .onStart(() => {
      runOnJS(setShareSheetOpen)(true);
    })
    .maxPointers(1)
    .onChange(event => {
      if (event.y < lowerBounds) {
        // The Gesture is in bound of the Share Sheet
        // Enable the Selection Mode which brings the Moving Segment
        // Translate to the initial position
        if (event.y > upperBounds) {
          containerStretch.value = withSpring(0, DEFAULT_SPRING_CONFIG);
          // Allowing +20px extra on moving upwards because the selected state gets
          // deselected too soon
          tapScale.value = withSpring(0, DEFAULT_SPRING_CONFIG);
          // Find the pan gesture translation with respect to the Segment Height
          const translationDiff = Math.abs(event.y) % SEGMENT_HEIGHT;
          if (translationDiff > SEGMENT_HEIGHT / 2) {
            // Calculate by what Factor there is movement
            const translationDiffFactor = Math.floor(
              Math.abs(event.y) / SEGMENT_HEIGHT,
            );
            if (translationDiff >= people.length) {
              // Setting the state the first container even thought the finger is moved past
              enableSelection.value = withSpring(1, DEFAULT_SPRING_CONFIG);
              currentTarget.value = people.length - 1;
            }
            if (
              translationDiffFactor >= 0 &&
              translationDiffFactor < people.length
            ) {
              // Translate Up the moving segment up by the height of the segment
              if (enableSpringTranslation.value) {
                selectedContainerTranslate.value = -(
                  SEGMENT_HEIGHT * translationDiffFactor
                );
                enableSpringTranslation.value = 0;
              } else {
                selectedContainerTranslate.value = withSpring(
                  -(SEGMENT_HEIGHT * translationDiffFactor),
                  DEFAULT_SPRING_CONFIG,
                );
              }

              currentTarget.value = translationDiffFactor;
              enableSelection.value = withSpring(1, DEFAULT_SPRING_CONFIG);
            }
          } else {
            if (enableSpringTranslation.value) {
              enableSelection.value = withSpring(1, DEFAULT_SPRING_CONFIG);
              const translationDiffFactor = Math.floor(
                Math.abs(event.y) / SEGMENT_HEIGHT,
              );
              currentTarget.value = translationDiffFactor - 1;
              enableSpringTranslation.value = 0;
            }
          }
        } else {
          // Write code to stretch the whole container upwards - the selection is enabled
          // The event.translationY moves from upperBounds and beyond
          // so get the translation beyond 250 using %
          // Disable selection and reset current target
          containerStretch.value = Math.floor(
            Math.abs(event.y) % Math.abs(upperBounds),
          );
          enableSelection.value = withSpring(0, DEFAULT_SPRING_CONFIG);
          currentTarget.value = -1;
        }
      } else {
        // Write code to stretch the whole container downwards - the selection is enabled
        // Disable selection and reset current target
        if (event.y > 0) {
          if (event.translationY > 0) {
            if (activatedFromTap.value) {
              containerStretch.value = Math.round(event.y);
            } else {
              containerStretch.value = Math.round(event.translationY);
            }
          }
        }
        enableSelection.value = withSpring(0, DEFAULT_SPRING_CONFIG);
        currentTarget.value = -1;
      }
    })
    .onEnd(event => {
      containerStretch.value = withSpring(0, DEFAULT_SPRING_CONFIG);
      if (currentTarget.value >= 0 && currentTarget.value < people.length) {
        runOnJS(setCurrentShareTarget)(
          // Reversing the array simplify the complication of mapping the diff factor to array index
          people.reverse()[currentTarget.value].name,
        );
      }
      if (event.y < lowerBounds) {
        // Gesture end out of lower bounds
        if (event.y > upperBounds) {
          // When these cases are checked, the gesture is within the Share Sheet bounds
          runOnJS(setShareSheetOpen)(false);
          currentTarget.value = -1;
        }
      }
      tapScale.value = withSpring(0, DEFAULT_SPRING_CONFIG);
      enableSelection.value = withSpring(0);
      activatedFromTap.value = 0;
    })
    .onFinalize(() => {
      tapScale.value = withSpring(0, DEFAULT_SPRING_CONFIG);
      activatedFromTap.value = 0;
    });

  const composed = Gesture.Exclusive(tapGesture, panGesture);

  const scaleStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(tapScale.value, [0, 1], [1, 0.95]),
        },
      ],
    };
  });

  const movingSegmentStyle = useAnimatedStyle(() => {
    return {
      zIndex: interpolate(
        enableSelection.value,
        [0, 1],
        [-1, 20],
        Extrapolation.CLAMP,
      ),
      opacity: interpolate(
        enableSelection.value,
        [0, 1],
        [0, 1],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          translateY: selectedContainerTranslate.value,
        },
        {
          scale: interpolate(
            enableSelection.value,
            [0, 1],
            [1, 1.1],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  const containerOutOfBoundStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: "rgba(255,255,255,0.9)",
      transform: [
        {
          scale: interpolate(
            containerStretch.value,
            [-50, 0, 50],
            [1.1, 1, 0.9],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  useEffect(() => {
    const resetCurrentShareTarget = setTimeout(() => {
      setCurrentShareTarget("");
    }, 3000);

    // Clear the timeout if the component unmounts or if myState changes
    return () => {
      clearTimeout(resetCurrentShareTarget);
    };
  }, [currentShareTarget]);

  return (
    <SafeAreaView
      style={tailwind.style("flex-1 items-center justify-end pb-40")}
    >
      <StatusBar barStyle={"dark-content"} />
      <Animated.View style={tailwind.style("absolute inset-0")}>
        <Image
          style={tailwind.style("h-full w-full")}
          source={require("../assets/background.jpg")}
        />
      </Animated.View>
      <GestureDetector gesture={composed}>
        <Animated.View
          style={[
            tailwind.style(
              "relative flex items-center justify-center rounded-2xl",
            ),
          ]}
        >
          {shareSheetOpen ? (
            <Animated.View
              entering={FadeInDown.springify()
                .damping(15)
                .stiffness(180)
                .mass(1)}
              exiting={FadeOutDown.springify()
                .damping(15)
                .stiffness(180)
                .mass(1)}
              style={[
                tailwind.style(
                  "absolute items-center px-2 py-2 rounded-2xl bottom-15 bg-white ",
                ),
                containerOutOfBoundStyle,
              ]}
            >
              <Animated.View
                style={[
                  tailwind.style(
                    `absolute h-[${MOVING_SEGMENT_HEIGHT}px] w-[${MOVING_SEGMENT_WIDTH}px] bottom-1.5 rounded-xl bg-white shadow-md z-10`,
                  ),
                  movingSegmentStyle,
                ]}
              />
              {people.map((person, index) => {
                return (
                  <PersonComponent
                    key={person.name}
                    person={person}
                    setCurrentShareTarget={setCurrentShareTarget}
                    currentTarget={currentTarget}
                    index={index}
                  />
                );
              })}
            </Animated.View>
          ) : null}
          <Animated.View
            style={[
              tailwind.style("h-11 w-11 rounded-md overflow-hidden"),
              scaleStyle,
            ]}
          >
            <Image
              style={tailwind.style("h-full w-full")}
              source={require("../assets/button.png")}
            />
          </Animated.View>
        </Animated.View>
      </GestureDetector>
      {currentShareTarget.length > 0 ? (
        <Animated.View
          style={tailwind.style(
            `absolute bottom-${
              bottom - 20
            } h-10 rounded-md justify-center items-center px-2`,
          )}
          entering={FadeInDown}
          exiting={FadeOutDown}
        >
          <Animated.Text
            style={tailwind.style("text-base text-white font-medium")}
          >
            Sharing to {currentShareTarget}
          </Animated.Text>
        </Animated.View>
      ) : null}
    </SafeAreaView>
  );
};
