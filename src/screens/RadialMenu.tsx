import { useState } from "react";
import { Image, StatusBar, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
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
import { toDeg, toRad } from "react-native-redash";
import { Path, Svg } from "react-native-svg";
import tailwind from "twrnc";

import { useHaptic } from "../utils/useHaptic";

type MenuItemType = {
  label: string;
  icon: JSX.Element;
};
const menuItems: MenuItemType[] = [
  {
    label: "Forward",
    icon: (
      <Svg
        height={24}
        width={24}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="#232323"
      >
        <Path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
        />
      </Svg>
    ),
  },
  {
    label: "Reload",
    icon: (
      <Svg
        height={24}
        width={24}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="#232323"
      >
        <Path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
        />
      </Svg>
    ),
  },
  {
    label: "Print",
    icon: (
      <Svg
        height={24}
        width={24}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="#232323"
      >
        <Path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z"
        />
      </Svg>
    ),
  },
  {
    label: "Back",
    icon: (
      <Svg
        height={24}
        width={24}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="#232323"
      >
        <Path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
        />
      </Svg>
    ),
  },
  {
    label: "Save",
    icon: (
      <Svg
        height={24}
        width={24}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="#232323"
      >
        <Path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
        />
      </Svg>
    ),
  },
  {
    label: "Like",
    icon: (
      <Svg
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="#232323"
        height={24}
        width={24}
      >
        <Path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </Svg>
    ),
  },
];

const D = 170;
const R = D / 2;
const distanceFactor = 1;
const DEFAULT_SPRING_CONFIG: WithSpringConfig = {
  mass: 1,
  damping: 20,
  stiffness: 250,
  overshootClamping: false,
  restSpeedThreshold: 0.001,
  restDisplacementThreshold: 0.001,
};

const getStrokePosition = (angleInDegrees: number) => {
  "worklet";
  const angleInRadians = toRad(angleInDegrees);
  const x = R * distanceFactor * Math.cos(angleInRadians);
  const y = R * distanceFactor * Math.sin(angleInRadians);
  return { x, y };
};

const getTransform = (tranformAngle: number) => {
  "worklet";
  const { x, y } = getStrokePosition(tranformAngle);
  return [{ translateX: x }, { translateY: y }];
};

type MenuItemProps = {
  index: number;
  currentStrokeAngle: number;
  menuItem: MenuItemType;
  currentMenuItem: SharedValue<number>;
};

const MenuItem = ({
  index,
  currentStrokeAngle,
  menuItem,
  currentMenuItem,
}: MenuItemProps) => {
  const sv = useSharedValue(0);
  const hapticSelection = useHaptic();

  const enteringAnimation = () => {
    "worklet";
    const animations = {
      transform: [
        {
          scale: withDelay(
            index * 100,
            withSpring(1, { damping: 15, stiffness: 180, mass: 1 }),
          ),
        },
      ],
      opacity: withDelay(
        index * 100,
        withSpring(1, { damping: 15, stiffness: 180, mass: 1 }),
      ),
    };
    const initialValues = {
      opacity: 0,
      transform: [{ scale: 0.7 }],
    };
    return {
      initialValues,
      animations,
    };
  };

  const exitingAnimation = () => {
    "worklet";
    const animations = {
      transform: [
        {
          scale: withSpring(0.75, { damping: 15, stiffness: 180, mass: 1 }),
        },
      ],
      opacity: withSpring(0, { damping: 15, stiffness: 180, mass: 1 }),
    };
    const initialValues = {
      opacity: 1,
      transform: [{ scale: 1 }],
    };
    return {
      initialValues,
      animations,
    };
  };
  useAnimatedReaction(
    () => currentMenuItem.value,
    (next, prev) => {
      if (next !== prev) {
        if (next === index) {
          sv.value = withSpring(1, DEFAULT_SPRING_CONFIG);
          hapticSelection && runOnJS(hapticSelection)();
        } else {
          sv.value = withSpring(0, DEFAULT_SPRING_CONFIG);
        }
      }
    },
  );
  const menuItemAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        ...getTransform(currentStrokeAngle),
        {
          scale: interpolate(sv.value, [0, 1], [1, 1.2]),
        },
      ],
    };
  });

  return (
    <Animated.View
      style={tailwind.style("absolute")}
      entering={enteringAnimation}
      exiting={exitingAnimation}
    >
      <Animated.View
        key={index}
        style={[
          tailwind.style(
            "h-15 w-15 justify-center bg-white rounded-full items-center",
          ),
          menuItemAnimatedStyle,
        ]}
      >
        {menuItem.icon}
      </Animated.View>
    </Animated.View>
  );
};

export const RadialMenu = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const shareActive = useSharedValue(0);
  const currentMenuItem = useSharedValue(-1);
  const getMenuItemFromAngle = (adjustedAngle: number) => {
    "worklet";
    switch (true) {
      case (adjustedAngle >= 340 && adjustedAngle <= 360) ||
        (adjustedAngle >= 0 && adjustedAngle <= 20):
        return 0;
      case adjustedAngle >= 40 && adjustedAngle <= 80:
        return 1;
      case adjustedAngle >= 100 && adjustedAngle <= 140:
        return 2;
      case adjustedAngle >= 160 && adjustedAngle <= 200:
        return 3;
      case adjustedAngle >= 220 && adjustedAngle <= 260:
        return 4;
      case adjustedAngle >= 280 && adjustedAngle <= 320:
        return 5;
      default:
        return -1;
    }
  };
  const panGesture = Gesture.Pan()
    .activateAfterLongPress(250)
    .onStart(() => {
      shareActive.value = withSpring(1);
      runOnJS(setMenuOpen)(true);
    })
    .onUpdate(event => {
      const { x, y } = event;
      if (x >= 62.5 && x <= 107.5 && y >= 62.5 && y <= 107.5) {
        currentMenuItem.value = -1;
        return;
      }

      const deltaX = x - R; // The Center Coordinates of the Container is now (R, R)
      const deltaY = y - R; // The Center Coordinates of the Container is now (R, R)
      const angleRadians = Math.atan2(deltaY, deltaX);

      const angleDegrees = toDeg(angleRadians);
      let adjustedAngle = angleDegrees;
      adjustedAngle = adjustedAngle < 0 ? adjustedAngle + 360 : adjustedAngle;
      const gestureOverMenuItem = getMenuItemFromAngle(adjustedAngle);
      currentMenuItem.value = gestureOverMenuItem;
    })
    .onFinalize(() => {
      shareActive.value = withSpring(0);
      currentMenuItem.value = -1;
      runOnJS(setMenuOpen)(false);
    });

  const menuAnimationStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: interpolate(shareActive.value, [0, 1], [1, 0.75]) }],
    };
  });

  return (
    <View style={tailwind.style("flex-1 justify-center items-center")}>
      <StatusBar barStyle={"dark-content"} />
      <Animated.View style={[tailwind.style("absolute inset-0")]}>
        <Image
          style={[tailwind.style("h-full w-full")]}
          source={require("../assets/background1.jpg")}
        />
      </Animated.View>
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            tailwind.style(
              `h-[${D}px] w-[${D}px]`,
              "relative rounded-full flex justify-center items-center",
            ),
          ]}
        >
          <Animated.View
            style={[
              tailwind.style(
                "h-15 w-15 justify-center items-center rounded-full bg-white",
              ),
              menuAnimationStyle,
            ]}
          >
            <Svg
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="#232323"
              height={36}
              width={36}
            >
              <Path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </Svg>
          </Animated.View>
          {menuOpen
            ? menuItems.map((menuItem, index) => {
                const currentStrokeAngle = index * 60;
                return (
                  <MenuItem
                    key={menuItem.label}
                    {...{
                      currentStrokeAngle,
                      menuItem,
                      index,
                      currentMenuItem,
                    }}
                  />
                );
              })
            : null}
        </Animated.View>
      </GestureDetector>
    </View>
  );
};
