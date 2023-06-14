import { Image, StatusBar } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import tailwind from "twrnc";

import { withAnchorPoint } from "../utils/withAnchorPoint";

type ItemType = {
  key: string;
  image: string;
};

const items: ItemType[] = [
  {
    key: "1",
    image:
      "https://i.pinimg.com/564x/2d/05/98/2d059890746c5801f412d396e1933cfc.jpg",
  },
  {
    key: "2",
    image:
      "https://i.pinimg.com/564x/e4/1b/c6/e41bc6e34edcf76cf6479458859fbb38.jpg",
  },
  {
    key: "3",
    image:
      "https://i.pinimg.com/564x/56/fd/4e/56fd4ef6560012f97c5ea73e961190a6.jpg",
  },
  {
    key: "4",
    image:
      "https://i.pinimg.com/474x/d3/8b/5e/d38b5e59a8cfadd11577671970cc4ada.jpg",
  },
  {
    key: "5",
    image:
      "https://i.pinimg.com/474x/26/0f/5f/260f5fa035cb7788d5bb63ce5eab43bc.jpg",
  },
];

type PhotoProps = {
  index: number;
  activeItem: SharedValue<number>;
  item: ItemType;
};

const CARD_HEIGHT = 4 * 96;
const CARD_WIDTH = 4 * 72;

const getRotationBasedOnActiveIndex = (index: number, activeIndex: number) => {
  "worklet";
  return index < activeIndex
    ? -(activeIndex - index)
    : index > activeIndex
    ? index - activeIndex
    : 0;
};
const getScaleBasedOnActiveIndex = (index: number, activeIndex: number) => {
  "worklet";
  const scaleValue =
    index < activeIndex
      ? 1 - (activeIndex - index) / (items.length + 8)
      : index > activeIndex
      ? 1 + (activeIndex - index) / (items.length + 8)
      : 1;
  return Math.round(scaleValue * 100) / 100;
};
const getZIndexBasedOnActiveIndex = (index: number, activeIndex: number) => {
  "worklet";
  return index < activeIndex
    ? -(activeIndex - index)
    : index > activeIndex
    ? activeIndex - index
    : items.length;
};

const getActiveIndex = (
  activeIndex: number,
  value: number,
  maxValue: number,
) => {
  "worklet";
  let newActiveIndex = activeIndex;
  if (value > 0) {
    if (activeIndex !== 0) {
      newActiveIndex--;
    }
  }
  if (value < 0) {
    if (activeIndex !== maxValue - 1) {
      newActiveIndex++;
    }
  }
  return newActiveIndex;
};

const Photo = ({ index, activeItem, item }: PhotoProps) => {
  const translation = useSharedValue(0);
  const panGesture = Gesture.Pan()
    .onChange(event => {
      translation.value = event.translationX;
    })
    .onFinalize(event => {
      if (Math.abs(event.translationX) > 150) {
        const newActiveIndex = getActiveIndex(
          activeItem.value,
          event.translationX,
          items.length,
        );

        activeItem.value = newActiveIndex;
        translation.value = withSpring(0, { damping: 28, stiffness: 180 });
      } else {
        translation.value = withSpring(0, { damping: 28, stiffness: 180 });
      }
    });

  const photoTranslationStyle = useAnimatedStyle(() => {
    const rotationFactor = getRotationBasedOnActiveIndex(
      index,
      activeItem.value,
    );
    const zIndex = getZIndexBasedOnActiveIndex(index, activeItem.value);

    const scaleFactor = getScaleBasedOnActiveIndex(index, activeItem.value);

    const transforms = withAnchorPoint(
      {
        transform: [
          {
            translateX: interpolate(
              translation.value,
              [-100, 0, 100],
              [-100, 0, 100],
            ),
          },
          {
            rotate: `${interpolate(
              translation.value,
              [-200, 0, 200],
              [-10, rotationFactor * 2, 10],
              Extrapolation.CLAMP,
            )}deg`,
          },
          {
            scale: interpolate(
              translation.value,
              [-200, 0, 200],
              [scaleFactor * 0.7, scaleFactor, scaleFactor * 0.7],
              Extrapolation.CLAMP,
            ),
          },
        ],
      },
      { x: rotationFactor < 0 ? 0 : 1, y: 1 },
      { width: CARD_WIDTH, height: CARD_HEIGHT },
    );
    return {
      zIndex,
      ...transforms,
    };
  });
  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        key={item.key}
        style={[
          tailwind.style(
            "absolute -top-48 h-96 w-72 bg-gray-600 rounded-2xl shadow-md",
          ),
          photoTranslationStyle,
        ]}
      >
        <Image
          style={tailwind.style("h-full w-full rounded-2xl overflow-hidden")}
          source={{ uri: item.image }}
        />
      </Animated.View>
    </GestureDetector>
  );
};

export const PhotoCollection = () => {
  const activeItem = useSharedValue(0);

  return (
    <SafeAreaView style={tailwind.style("flex-1 justify-center bg-white")}>
      <StatusBar barStyle={"light-content"} />
      <Animated.View style={tailwind.style("flex items-center")}>
        {items.map((item, index) => (
          <Photo key={item.key} {...{ item, index, activeItem }} />
        ))}
      </Animated.View>
    </SafeAreaView>
  );
};
