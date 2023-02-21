import { useCallback, useState } from "react";
import { Image, Pressable, StatusBar } from "react-native";
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

type PeopleObject = { name: string };

const people: PeopleObject[] = [
  { name: "Jane Cooper" },
  { name: "Cody Fisher" },
  { name: "Esther Howard" },
  { name: "Jenny Wilson" },
  { name: "Cameron Williamson" },
];

const SEGMENT_HEIGHT = 44;
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
    (next, _prev) => {
      if (next === people.length - index - 1) {
        sv.value = withSpring(1, DEFAULT_SPRING_CONFIG);
        hapticSelection && runOnJS(hapticSelection)();
      } else {
        sv.value = withSpring(0, DEFAULT_SPRING_CONFIG);
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
        style={({ pressed }) => [
          pressed
            ? tailwind.style("bg-slate-100 rounded-md px-2")
            : tailwind.style("px-2 z-20"),
        ]}
      >
        <Animated.View
          style={tailwind.style(
            `h-[${SEGMENT_HEIGHT}px] w-60 flex-row items-center`,
          )}
        >
          <Animated.View
            style={tailwind.style("h-8 w-8 rounded-full overflow-hidden")}
          >
            <Animated.Image
              style={tailwind.style("h-full w-full ")}
              source={{ uri: `https://i.pravatar.cc/300?img=${index + 1}` }}
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
  const { bottom } = useSafeAreaInsets();
  const [shareSheetOpen, setShareSheetOpen] = useState(false);
  const [currentShareTarget, setCurrentShareTarget] = useState("");
  const tapScale = useSharedValue(0);
  const enableSelection = useSharedValue(0);
  const selectedContainerTranslate = useSharedValue(0);
  const currentTarget = useSharedValue(-1);
  const hapticSelection = useHaptic();
  const containerStretch = useSharedValue(0);

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
    .activeOffsetY(10)
    .onBegin(() => {
      tapScale.value = withSpring(1, DEFAULT_SPRING_CONFIG);
      hapticSelection && runOnJS(hapticSelection)();
    })
    .onStart(() => {
      runOnJS(setShareSheetOpen)(true);
    })
    .maxPointers(1)
    .onChange(event => {
      if (event.y < -22) {
        // The Gesture is in bound of the Share Sheet
        // Enable the Selection Mode which brings the Moving Segment
        // Translate to the initial position

        if (event.y > -250) {
          containerStretch.value = 0;
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
              currentTarget.value = translationDiffFactor;
              enableSelection.value = withSpring(1, DEFAULT_SPRING_CONFIG);
              // Translate Up the moving segment up by the height of the segment

              selectedContainerTranslate.value = withSpring(
                -(SEGMENT_HEIGHT * translationDiffFactor),
                DEFAULT_SPRING_CONFIG,
              );
            }
          }
        } else {
          // Write code to stretch the whole container upwards - the selection is enabled
          // The event.translationY moves from -250 and beyond
          // so get the translation beyond 250 using %
          // Disable selection and reset current target
          containerStretch.value = Math.floor(Math.abs(event.y) % 250);
          enableSelection.value = withSpring(0, DEFAULT_SPRING_CONFIG);
          currentTarget.value = -1;
        }
      } else {
        // Write code to stretch the whole container downwards - the selection is enabled
        // Disable selection and reset current target

        if (event.y > 0) {
          if (event.translationY > 0) {
            containerStretch.value = Math.round(event.translationY);
          }
        }
        enableSelection.value = withSpring(0, DEFAULT_SPRING_CONFIG);
        currentTarget.value = -1;
      }
    })
    .onEnd(event => {
      containerStretch.value = withSpring(0);
      if (currentTarget.value >= 0 && currentTarget.value < people.length) {
        runOnJS(setCurrentShareTarget)(
          // Reversing the array simplify the complication of mapping the diff factor to array index
          people.reverse()[currentTarget.value].name,
        );
      }
      if (event.y < -22) {
        // Gesture end out of lower bounds
        if (event.y > -250) {
          // When these cases are checked, the gesture is within the Share Sheet bounds
          runOnJS(setShareSheetOpen)(false);
          currentTarget.value = -1;
        }
      }
      tapScale.value = withSpring(0, DEFAULT_SPRING_CONFIG);
      enableSelection.value = withSpring(0);
    })
    .onFinalize(() => {
      tapScale.value = withSpring(0, DEFAULT_SPRING_CONFIG);
    });

  const composed = Gesture.Exclusive(tapGesture, panGesture);

  const scaleStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(tapScale.value, [0, 1], [1, 0.7]),
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
            [0, 50],
            [1, 0.9],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  return (
    <SafeAreaView style={tailwind.style("flex-1 items-center justify-center")}>
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
              "relative flex items-center justify-center rounded-[11px]",
            ),
          ]}
        >
          {shareSheetOpen ? (
            <Animated.View
              entering={FadeInDown}
              exiting={FadeOutDown}
              style={[
                tailwind.style(
                  "absolute items-center px-2 py-2 rounded-[11px] -top-[248px] bg-white",
                ),
                containerOutOfBoundStyle,
              ]}
            >
              <Animated.View
                style={[
                  tailwind.style(
                    `absolute h-[${MOVING_SEGMENT_HEIGHT}px] w-66 bottom-1.5 rounded-[9px] bg-white shadow-md z-10`,
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
            `absolute bottom-${bottom} h-10 rounded-md justify-center items-center px-2 bg-gray-900`,
          )}
          entering={FadeInDown}
        >
          <Animated.Text style={tailwind.style("text-white")}>
            Sharing to {currentShareTarget}
          </Animated.Text>
        </Animated.View>
      ) : null}
    </SafeAreaView>
  );
};
