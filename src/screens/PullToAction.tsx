import { useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  TextInput,
} from "react-native-gesture-handler";
import Animated, {
  Easing,
  Extrapolation,
  FadeIn,
  FadeInDown,
  FadeOut,
  FadeOutDown,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ClipPath, Defs, G, Path, Rect, Svg } from "react-native-svg";
import { StackScreenProps } from "@react-navigation/stack";
import { BlurView } from "expo-blur";
import tailwind from "twrnc";

import { UIInteractionParamList } from "../../App";
import { useHaptic } from "../utils/useHaptic";

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const SCREEN_WIDTH = Dimensions.get("screen").width;

const PADDING = 12;

const ACTIONS = 3;

type ACTION_TYPE = "Refresh" | "Search" | "Cancel";

const ACTIONS_LIST: ACTION_TYPE[] = ["Refresh", "Search", "Cancel"];

const SEGMENT_WIDTH = (SCREEN_WIDTH - PADDING * 2) / ACTIONS;
// The translation applied to Refresh Icon to move to the center of the screen
const REFRESH_TRANSLATE = (SCREEN_WIDTH - 24) / 2 - 122 / 2;

const getCurrentSegment = (gestureX: number) => {
  "worklet";
  return Math.ceil(gestureX / ((SCREEN_WIDTH - PADDING * 2) / ACTIONS));
};

const ChevronDown = () => {
  return (
    <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <Path
        d="M4.25 6L8 10L11.75 6"
        stroke="#979797"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const CheckCircle = () => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22C17.5229 22 22 17.5229 22 12C22 6.47715 17.5229 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5229 6.47715 22 12 22Z"
        fill="#0D0D0D"
        fillOpacity="0.1"
      />
      <Path
        d="M7.5 12L10.5 15L16.5 9M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
        stroke="#171717"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const ArrowUpRight = () => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 18L18 6M18 6H10M18 6V14"
        stroke="#171717"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const Pin = () => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M13.8228 2.38965C14.0431 2.24512 14.3116 2.19341 14.5699 2.24577C14.8652 2.30564 15.1452 2.58555 15.705 3.14538L20.8481 8.28852C21.4079 8.84834 21.6879 9.12826 21.7477 9.4236C21.8001 9.68187 21.7484 9.95037 21.6038 10.1707C19.2947 13.6913 15.7012 12.9369 14.6202 18.3417C14.4298 19.294 14.3345 19.7702 14.0835 19.9929C13.8648 20.187 13.5721 20.2756 13.2824 20.2355C12.95 20.1894 12.6066 19.846 11.9199 19.1593L4.83418 12.0736C4.14746 11.3869 3.80411 11.0435 3.75802 10.711C3.71786 10.4214 3.80648 10.1287 4.00055 9.91002C4.22331 9.65897 4.69946 9.56374 5.65176 9.37328C10.946 8.31442 10.3889 4.64191 13.8228 2.38965Z"
        fill="#0D0D0D"
        fillOpacity="0.1"
      />
      <Path
        d="M8.37658 15.6164L2.71973 21.2733M4.83375 12.0736L11.9195 19.1593C13.4333 20.6731 14.2344 20.2685 14.6198 18.3417C15.6808 13.0364 19.3465 13.6117 21.6034 10.1707C21.7479 9.95037 21.7996 9.68187 21.7473 9.4236C21.6874 9.12826 21.4075 8.84834 20.8477 8.28852L15.7045 3.14538C15.1447 2.58555 14.8648 2.30564 14.5695 2.24577C14.3112 2.19341 14.0427 2.24512 13.8223 2.38965C10.3814 4.64657 10.9567 8.31221 5.65133 9.37327C3.72455 9.75863 3.31992 10.5597 4.83375 12.0736Z"
        stroke="#171717"
        strokeLinecap="round"
      />
    </Svg>
  );
};

const Notification = () => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M20.1213 3.87868C21.2929 5.05025 21.2929 6.94975 20.1213 8.12132C18.9497 9.29289 17.0503 9.29289 15.8787 8.12132C14.7071 6.94975 14.7071 5.05025 15.8787 3.87868C17.0503 2.70711 18.9497 2.70711 20.1213 3.87868Z"
        fill="#0D0D0D"
        fillOpacity="0.1"
      />
      <Path
        d="M11 4H7.8C6.11984 4 5.27976 4 4.63803 4.32698C4.07354 4.6146 3.6146 5.07354 3.32698 5.63803C3 6.27976 3 7.11984 3 8.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21H15.2C16.8802 21 17.7202 21 18.362 20.673C18.9265 20.3854 19.3854 19.9265 19.673 19.362C20 18.7202 20 17.8802 20 16.2V13M20.1213 3.87868C21.2929 5.05025 21.2929 6.94975 20.1213 8.12132C18.9497 9.29289 17.0503 9.29289 15.8787 8.12132C14.7071 6.94975 14.7071 5.05025 15.8787 3.87868C17.0503 2.70711 18.9497 2.70711 20.1213 3.87868Z"
        stroke="#171717"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const Calendar = () => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        opacity="0.12"
        d="M3 8.8C3 7.11984 3 6.27976 3.32698 5.63803C3.6146 5.07354 4.07354 4.6146 4.63803 4.32698C5.27976 4 6.11984 4 7.8 4H16.2C17.8802 4 18.7202 4 19.362 4.32698C19.9265 4.6146 20.3854 5.07354 20.673 5.63803C21 6.27976 21 7.11984 21 8.8V10H3V8.8Z"
        fill="#383838"
      />
      <Path
        d="M21 10H3M16 2V6M8 2V6M7.8 22H16.2C17.8802 22 18.7202 22 19.362 21.673C19.9265 21.3854 20.3854 20.9265 20.673 20.362C21 19.7202 21 18.8802 21 17.2V8.8C21 7.11984 21 6.27976 20.673 5.63803C20.3854 5.07354 19.9265 4.6146 19.362 4.32698C18.7202 4 17.8802 4 16.2 4H7.8C6.11984 4 5.27976 4 4.63803 4.32698C4.07354 4.6146 3.6146 5.07354 3.32698 5.63803C3 6.27976 3 7.11984 3 8.8V17.2C3 18.8802 3 19.7202 3.32698 20.362C3.6146 20.9265 4.07354 21.3854 4.63803 21.673C5.27976 22 6.11984 22 7.8 22Z"
        stroke="#383838"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

type ActionsListType = {
  icon: JSX.Element;
  title: string;
};

// Actions under the search command
const actionsList: ActionsListType[] = [
  {
    icon: <Calendar />,
    title: "Edit Title",
  },
  {
    icon: <Notification />,
    title: "Mark Unread",
  },
  {
    icon: <Pin />,
    title: "Pin Discussion",
  },
  {
    icon: <ArrowUpRight />,
    title: "Move Discussion",
  },
  {
    icon: <CheckCircle />,
    title: "Close Discussion",
  },
];

type PeopleObject = { name: string; avatar: string; access: string };

const people: PeopleObject[] = [
  {
    name: "Jane Cooper",
    avatar: "https://timeless.sgp1.cdn.digitaloceanspaces.com/avatar-1.png",
    access: "Owner",
  },
  {
    name: "Esther Howard",
    avatar: "https://timeless.sgp1.cdn.digitaloceanspaces.com/avatar-3.png",
    access: "Can edit",
  },
  {
    name: "Jim Carrey",
    avatar: "https://timeless.sgp1.cdn.digitaloceanspaces.com/avatar-5.png",
    access: "Can view",
  },
  // {
  //   name: "Cody Fisher",
  //   avatar: "https://timeless.sgp1.cdn.digitaloceanspaces.com/avatar-2.png",
  //   access: "No access",
  // },
];

const SearchActionIcon = () => {
  return (
    <Svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="rgba(0, 0, 0, 0.7)"
      height={28}
      width={28}
    >
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </Svg>
  );
};

const SearchIcon = () => {
  return (
    <Svg width={"16"} height={"16"} viewBox="0 0 16 16" fill="none">
      <G clipPath="url(#clip0_7186_69311)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1.98311 6.66668C1.98311 4.08015 4.07991 1.98335 6.66644 1.98335C9.25297 1.98335 11.3498 4.08015 11.3498 6.66668C11.3498 9.25322 9.25297 11.35 6.66644 11.35C4.07991 11.35 1.98311 9.25322 1.98311 6.66668ZM6.66644 0.68335C3.36194 0.68335 0.683105 3.36218 0.683105 6.66668C0.683105 9.97119 3.36194 12.65 6.66644 12.65C8.08453 12.65 9.38741 12.1567 10.4128 11.3323L14.207 15.1265C14.4608 15.3803 14.8724 15.3803 15.1262 15.1265C15.3801 14.8726 15.3801 14.4611 15.1262 14.2072L11.332 10.413C12.1564 9.38765 12.6498 8.08478 12.6498 6.66668C12.6498 3.36218 9.97094 0.68335 6.66644 0.68335Z"
          fill="#707070"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_7186_69311">
          <Rect width="16" height="16" fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};

const RefreshIcon = () => {
  return (
    <Svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="rgba(0, 0, 0, 0.7)"
      height={28}
      width={28}
    >
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
      />
    </Svg>
  );
};

const CancelAction = () => {
  return (
    <Svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="rgb(0, 0, 0);"
      height={28}
      width={28}
    >
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </Svg>
  );
};

type PullToActionProps = StackScreenProps<
  UIInteractionParamList,
  "Pull To Action"
>;

export const PullToAction = (props: PullToActionProps) => {
  const translateValue = useSharedValue(0);
  const refreshTranslateValue = useSharedValue(0);

  const currentSegment = useSharedValue(-1);
  const translateX = useSharedValue(0);
  const refreshRotationValue = useSharedValue(0);

  const startXDistance = useSharedValue(0);

  const selectionActive = useSharedValue(0);

  const { bottom, top } = useSafeAreaInsets();
  const [currentShareTarget, setCurrentShareTarget] = useState<
    ACTION_TYPE | ""
  >("");

  const hapticActive = useHaptic("medium");
  const hapticSelection = useHaptic();

  useAnimatedReaction(
    () => selectionActive.value,
    (next, _prev) => {
      if (next === 1) {
        hapticActive && runOnJS(hapticActive)();
      }
    },
  );

  const setAction = (action: ACTION_TYPE) => {
    setCurrentShareTarget(action);
    if (action === "Cancel") {
      runOnJS(setCurrentShareTarget)("");
      props.navigation.pop();
      return;
    }
    if (action !== "Search") {
      if (action === "Refresh") {
        refreshRotationValue.value = withRepeat(
          withTiming(360, { duration: 1000, easing: Easing.linear }),
          4,
          false,
        );
      }
      setTimeout(() => {
        refreshTranslateValue.value = withTiming(
          0,
          {
            duration: 300,
            easing: Easing.inOut(Easing.ease),
          },
          finished => {
            if (finished) {
              runOnJS(setCurrentShareTarget)("");
            }
          },
        );
        refreshRotationValue.value = 0;
      }, 3000);
    }
  };

  useAnimatedReaction(
    () => currentSegment.value,
    (next, prev) => {
      if (prev !== next && prev !== -1 && next !== -1) {
        hapticSelection && runOnJS(hapticSelection)();
      }
    },
  );

  const panGesture = Gesture.Pan()
    .onBegin(event => {
      const segment = 2;
      const calculatedTranslateValue =
        SEGMENT_WIDTH * (segment - 1) + SEGMENT_WIDTH / 2 + PADDING - 60 / 2;
      currentSegment.value = segment - 1;
      translateX.value = calculatedTranslateValue;
      startXDistance.value = event.x;
    })
    .onChange(event => {
      translateValue.value = event.translationY > 0 ? event.translationY : 0;
      refreshTranslateValue.value = translateValue.value;

      const activatePullToAction = interpolate(
        translateValue.value,
        [0, 80],
        [0, 180],
        Extrapolation.CLAMP,
      );
      if (activatePullToAction === 180) {
        selectionActive.value = 1;
      } else {
        selectionActive.value = 0;
      }

      const segment = getCurrentSegment(event.x);
      if (Math.abs(event.translationX) >= 50 && event.translationY >= 80) {
        if (segment - 1 < ACTIONS) {
          currentSegment.value = segment - 1;
          const calculatedTranslateValue =
            SEGMENT_WIDTH * (segment - 1) +
            SEGMENT_WIDTH / 2 +
            PADDING -
            60 / 2;

          translateX.value = withSpring(calculatedTranslateValue, {
            damping: 24,
            stiffness: 250,
            mass: 1,
          });
        }
      }
    })
    .onEnd(event => {
      if (selectionActive.value) {
        runOnJS(setAction)(ACTIONS_LIST[currentSegment.value]);
      }
      if (
        ACTIONS_LIST[currentSegment.value] === "Refresh" &&
        event.translationY >= 80
      ) {
        refreshTranslateValue.value = withTiming(80, {
          duration: 300,
          easing: Easing.inOut(Easing.ease),
        });
      } else {
        refreshTranslateValue.value = withTiming(0, {
          duration: 300,
          easing: Easing.inOut(Easing.ease),
        });
      }
      currentSegment.value = -1;
      selectionActive.value = 0;
      translateValue.value = withTiming(0, {
        duration: 350,
        easing: Easing.linear,
      });
    })
    .enabled(currentShareTarget === "");

  const scrollViewGesture = Gesture.Native();

  const animatedViewStyle = useAnimatedStyle(() => {
    return {
      height:
        currentShareTarget === "Refresh"
          ? refreshTranslateValue.value
          : translateValue.value,
    };
  });

  const currentSegmentAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        translateValue.value,
        [70, 80],
        [0, 0.5],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          translateX: translateX.value,
        },
        {
          translateY: interpolate(
            translateValue.value,
            [70, 80],
            [-30, 0],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  const refreshIconAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        refreshTranslateValue.value,
        [40, 70],
        [0, 1],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          translateX:
            currentShareTarget === "Refresh"
              ? withTiming(REFRESH_TRANSLATE, {
                  duration: 300,
                  easing: Easing.linear,
                })
              : interpolate(
                  refreshTranslateValue.value,
                  [0, 80],
                  [80, 0],
                  Extrapolation.CLAMP,
                ),
        },
        { rotate: `${refreshRotationValue.value}deg` },
      ],
    };
  });

  const cancelIconAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        translateValue.value,
        [40, 70],
        [0, 1],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          translateX: interpolate(
            translateValue.value,
            [0, 80],
            [-80, 0],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  const searchIconAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        translateValue.value,
        [40, 70],
        [0, 1],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          rotate: `${interpolate(
            translateValue.value,
            [0, 80],
            [-30, 0],
            Extrapolation.CLAMP,
          )}deg`,
        },
        {
          scale: interpolate(
            translateValue.value,
            [0, 80],
            [0.9, 1],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  return (
    <View style={tailwind.style("flex-1 bg-white", `pt-[${top}px]`)}>
      <Animated.View style={tailwind.style("absolute inset-0 z-0")}>
        <Image
          style={tailwind.style("h-full w-full")}
          source={require("../assets/pull-action-bg-2.jpg")}
        />
      </Animated.View>
      {currentShareTarget === "Search" ? (
        <AnimatedBlurView
          intensity={10}
          entering={FadeIn}
          exiting={FadeOut}
          style={[tailwind.style("absolute inset-0 z-10")]}
        >
          <AnimatedBlurView
            style={tailwind.style("absolute inset-0")}
            intensity={100}
          />
          <Pressable
            style={[tailwind.style("absolute inset-0 z-20")]}
            onPress={() => setCurrentShareTarget("")}
          />
          <Animated.View
            entering={FadeInDown.springify().damping(18).stiffness(140)}
            exiting={FadeOutDown.springify().damping(18).stiffness(140)}
            style={tailwind.style(
              "bg-white py-2 mx-4 rounded-[19px] z-20",
              `mt-[${top}px]`,
            )}
          >
            <Animated.View
              style={tailwind.style("relative mx-2 flex flex-row items-center")}
            >
              <Animated.View
                style={tailwind.style(
                  "absolute justify-center items-center pl-3 z-10",
                )}
              >
                <SearchIcon />
              </Animated.View>
              <TextInput
                autoFocus
                returnKeyType="go"
                onSubmitEditing={() => setCurrentShareTarget("")}
                placeholder="Search"
                placeholderTextColor={"#707070"}
                style={[styles.textInputStyle]}
              />
            </Animated.View>
            <Animated.ScrollView>
              <Animated.View style={tailwind.style("mt-3 mx-1.5")}>
                <Text
                  style={tailwind.style(
                    "px-2 text-sm text-[#858585] tracking-wide",
                  )}
                >
                  Actions
                </Text>
                <Animated.View style={tailwind.style("px-2")}>
                  {actionsList.map(value => {
                    return (
                      <Animated.View
                        key={value.title}
                        style={tailwind.style(
                          "flex flex-row items-center py-2",
                        )}
                      >
                        {value.icon}
                        <Text
                          style={tailwind.style(
                            "px-2 text-[16px] text-[#171717]",
                          )}
                        >
                          {value.title}
                        </Text>
                      </Animated.View>
                    );
                  })}
                </Animated.View>
              </Animated.View>
              <Animated.View style={tailwind.style("mt-3 mx-1.5")}>
                <Text
                  style={tailwind.style(
                    "px-2 text-sm text-[#858585] tracking-wide",
                  )}
                >
                  People with access
                </Text>
                <Animated.View style={tailwind.style("px-2")}>
                  {people.map(value => {
                    return (
                      <Animated.View
                        key={value.name}
                        style={tailwind.style(
                          "flex flex-row items-center justify-between py-2",
                        )}
                      >
                        <Animated.View
                          style={tailwind.style(
                            "flex flex-row items-center justify-between",
                          )}
                        >
                          <Animated.View
                            style={tailwind.style(
                              "h-7 w-7 rounded-full overflow-hidden",
                            )}
                          >
                            <Animated.Image
                              style={tailwind.style("h-full w-full")}
                              source={{ uri: value.avatar }}
                            />
                          </Animated.View>
                          <Text
                            style={tailwind.style(
                              "px-2 text-[16px] text-[#171717]",
                            )}
                          >
                            {value.name}
                          </Text>
                        </Animated.View>
                        <Animated.View
                          style={tailwind.style("flex flex-row items-center")}
                        >
                          <Text
                            style={tailwind.style(
                              "pr-0.5 text-[15px] font-medium text-[#7C7C7C]",
                            )}
                          >
                            {value.access}
                          </Text>
                          {value.access !== "Owner" ? <ChevronDown /> : null}
                        </Animated.View>
                      </Animated.View>
                    );
                  })}
                </Animated.View>
              </Animated.View>
            </Animated.ScrollView>
          </Animated.View>
        </AnimatedBlurView>
      ) : null}
      <GestureDetector
        gesture={Gesture.Simultaneous(panGesture, scrollViewGesture)}
      >
        <Animated.ScrollView
          style={tailwind.style("flex-1 overflow-visible")}
          scrollEventThrottle={16}
        >
          <Animated.View
            style={[
              tailwind.style("flex flex-row items-center justify-between px-3"),
              animatedViewStyle,
            ]}
          >
            <AnimatedBlurView
              intensity={100}
              style={[
                tailwind.style(
                  "absolute h-15 w-15 overflow-hidden bg-white rounded-full",
                ),
                currentSegmentAnimatedStyle,
              ]}
            />
            <Animated.View
              style={[
                tailwind.style("flex-1 items-center"),
                refreshIconAnimatedStyle,
              ]}
            >
              <RefreshIcon />
            </Animated.View>
            <Animated.View
              style={[
                tailwind.style("flex-1 items-center"),
                searchIconAnimatedStyle,
              ]}
            >
              <SearchActionIcon />
            </Animated.View>
            <Animated.View
              style={[
                tailwind.style("flex-1 items-center"),
                cancelIconAnimatedStyle,
              ]}
            >
              <CancelAction />
            </Animated.View>
          </Animated.View>
          <Animated.View style={tailwind.style("")}>
            <Text style={tailwind.style("text-3xl font-bold px-5 pt-[18px]")}>
              Discussion
            </Text>
          </Animated.View>
        </Animated.ScrollView>
      </GestureDetector>
      {currentShareTarget !== "" ? (
        <Animated.View
          style={tailwind.style(
            `absolute w-full bottom-${
              bottom - 20
            } h-10 rounded-md justify-center items-center px-2`,
          )}
          entering={FadeInDown}
          exiting={FadeOutDown}
        >
          <Animated.Text
            style={tailwind.style("text-base text-white font-medium")}
          >
            Selected Action is {currentShareTarget}
          </Animated.Text>
        </Animated.View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  textInputStyle: {
    flex: 1,
    height: 40,
    borderRadius: 13,
    paddingLeft: 34,
    backgroundColor: "rgba(15,15,15,0.07)",
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 19,
  },
});
