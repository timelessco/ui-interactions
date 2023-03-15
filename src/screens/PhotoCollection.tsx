import { Image, StatusBar } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
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
  translation: SharedValue<number>;
  item: ItemType;
};

const CARD_HEIGHT = 4 * 96;
const CARD_WIDTH = 4 * 72;
const TRANSLATION_FACTOR = 30;

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

const Photo = ({ index, activeItem, item, translation }: PhotoProps) => {
  const itemStyle = useAnimatedStyle(() => {
    const rotationFactor = getRotationBasedOnActiveIndex(
      index,
      activeItem.value,
    );
    const scaleFactor = getScaleBasedOnActiveIndex(index, activeItem.value);
    const zIndex = getZIndexBasedOnActiveIndex(index, activeItem.value);
    const transforms = withAnchorPoint(
      {
        transform: [
          { rotate: `${rotationFactor * 2}deg` },
          { scale: scaleFactor },
        ],
      },
      { x: rotationFactor < 0 ? 0 : 1, y: 1 },
      { width: CARD_WIDTH, height: CARD_HEIGHT },
    );
    return {
      zIndex,
      ...transforms,
    };
  }, [activeItem.value]);

  const activelyTranslatingStyle = useAnimatedStyle(() => {
    const rotationFactor = getRotationBasedOnActiveIndex(
      index,
      activeItem.value,
    );
    const previousRotationFactor = getRotationBasedOnActiveIndex(
      index,
      activeItem.value + 1,
    );
    const nextRotationFactor = getRotationBasedOnActiveIndex(
      index,
      activeItem.value - 1,
    );
    const scaleFactor = getScaleBasedOnActiveIndex(index, activeItem.value);
    const previousScaleFactor = getScaleBasedOnActiveIndex(
      index,
      activeItem.value + 1,
    );
    const nextScaleFactor = getScaleBasedOnActiveIndex(
      index,
      activeItem.value - 1,
    );
    const zIndex = getZIndexBasedOnActiveIndex(index, activeItem.value);
    const previousZIndex = getZIndexBasedOnActiveIndex(
      index,
      activeItem.value + 1,
    );
    const nextZIndex = getZIndexBasedOnActiveIndex(index, activeItem.value - 1);
    const interpolatedRotate = interpolate(
      translation.value,
      [-TRANSLATION_FACTOR, 0, TRANSLATION_FACTOR],
      [previousRotationFactor, rotationFactor, nextRotationFactor],
      Extrapolation.CLAMP,
    );
    const interpolatedScale = interpolate(
      translation.value,
      [-TRANSLATION_FACTOR, 0, TRANSLATION_FACTOR],
      [previousScaleFactor, scaleFactor, nextScaleFactor],
      Extrapolation.CLAMP,
    );
    const interpolatedZIndex = interpolate(
      translation.value,
      [-TRANSLATION_FACTOR - 1, -TRANSLATION_FACTOR, 0, TRANSLATION_FACTOR],
      [previousZIndex + 1, zIndex, zIndex, nextZIndex + 1],
      Extrapolation.CLAMP,
    );

    const interpolatedTranslationX = interpolate(
      translation.value,
      [-TRANSLATION_FACTOR, 0, TRANSLATION_FACTOR],
      [-TRANSLATION_FACTOR * 2, 0, TRANSLATION_FACTOR * 2],
      Extrapolation.CLAMP,
    );
    const transforms = withAnchorPoint(
      {
        transform: [
          { rotate: `${interpolatedRotate * 2}deg` },
          { scale: interpolatedScale },
          { translateX: interpolatedTranslationX },
        ],
      },
      { x: interpolatedRotate < 0 ? 0 : 1, y: 1 },
      { width: CARD_WIDTH, height: CARD_HEIGHT },
    );
    return activeItem.value === index
      ? {
          zIndex: interpolatedZIndex,
          ...transforms,
        }
      : {};
  }, [activeItem.value]);

  const activelyTranslatingNextCardStyle = useAnimatedStyle(() => {
    const rotationFactor = getRotationBasedOnActiveIndex(
      index,
      activeItem.value,
    );
    const nextRotationFactor = getRotationBasedOnActiveIndex(
      index,
      activeItem.value + 1,
    );

    const scaleFactor = getScaleBasedOnActiveIndex(index, activeItem.value);
    const nextScaleFactor = getScaleBasedOnActiveIndex(
      index,
      activeItem.value + 1,
    );
    const zIndex = getZIndexBasedOnActiveIndex(index, activeItem.value);
    const nextZIndex = getZIndexBasedOnActiveIndex(index, activeItem.value + 1);

    const interpolatedRotate = interpolate(
      translation.value,
      [-TRANSLATION_FACTOR, 0],
      [nextRotationFactor, rotationFactor],
      Extrapolation.CLAMP,
    );
    const interpolatedScale = interpolate(
      translation.value,
      [-TRANSLATION_FACTOR, 0],
      [nextScaleFactor, scaleFactor],
      Extrapolation.CLAMP,
    );
    const interpolatedZIndex = interpolate(
      translation.value,
      [-TRANSLATION_FACTOR - 1, -TRANSLATION_FACTOR, 0],
      [nextZIndex + 1, zIndex - 1, zIndex],
      Extrapolation.CLAMP,
    );

    const transforms = withAnchorPoint(
      {
        transform: [
          { rotate: `${interpolatedRotate * 2}deg` },
          { scale: interpolatedScale },
        ],
      },
      { x: interpolatedRotate < 0 ? 0 : 1, y: 1 },
      { width: CARD_WIDTH, height: CARD_HEIGHT },
    );
    return activeItem.value + 1 === index
      ? {
          zIndex: interpolatedZIndex,
          ...transforms,
        }
      : {};
  }, [activeItem.value]);

  const activelyTranslatingPrevCardStyle = useAnimatedStyle(() => {
    const rotationFactor = getRotationBasedOnActiveIndex(
      index,
      activeItem.value,
    );
    const previousRotationFactor = getRotationBasedOnActiveIndex(
      index,
      activeItem.value - 1,
    );

    const scaleFactor = getScaleBasedOnActiveIndex(index, activeItem.value);
    const previousScaleFactor = getScaleBasedOnActiveIndex(
      index,
      activeItem.value - 1,
    );

    const zIndex = getZIndexBasedOnActiveIndex(index, activeItem.value);
    const previousZIndex = getZIndexBasedOnActiveIndex(
      index,
      activeItem.value - 1,
    );
    const interpolatedRotate = interpolate(
      translation.value,
      [0, TRANSLATION_FACTOR],
      [rotationFactor, previousRotationFactor],
      Extrapolation.CLAMP,
    );
    const interpolatedScale = interpolate(
      translation.value,
      [0, TRANSLATION_FACTOR],
      [scaleFactor, previousScaleFactor],
      Extrapolation.CLAMP,
    );
    const interpolatedZIndex = interpolate(
      translation.value,
      [0, TRANSLATION_FACTOR, TRANSLATION_FACTOR + 1],
      [zIndex, zIndex + 1, previousZIndex],
      Extrapolation.CLAMP,
    );

    const transforms = withAnchorPoint(
      {
        transform: [
          { rotate: `${interpolatedRotate * 2}deg` },
          { scale: interpolatedScale },
        ],
      },
      { x: interpolatedRotate < 0 ? 0 : 1, y: 1 },
      { width: CARD_WIDTH, height: CARD_HEIGHT },
    );
    return activeItem.value - 1 === index
      ? {
          zIndex: interpolatedZIndex,
          ...transforms,
        }
      : {};
  }, [activeItem.value]);
  return (
    <Animated.View
      key={item.key}
      style={[
        tailwind.style(
          "absolute -top-48 h-96 w-72 bg-gray-600 rounded-2xl shadow-md",
        ),
        itemStyle,
        activelyTranslatingStyle,
        activelyTranslatingNextCardStyle,
        activelyTranslatingPrevCardStyle,
      ]}
    >
      <Image
        style={tailwind.style("h-full w-full rounded-2xl overflow-hidden")}
        source={{ uri: item.image }}
      />
    </Animated.View>
  );
};

export const PhotoCollection = () => {
  const activeItem = useSharedValue(0);
  const translation = useSharedValue(0);
  const panGesture = Gesture.Pan()
    .onChange(event => {
      const { translationX } = event;
      if (activeItem.value === 0) {
        if (translationX > 0) {
          return;
        }
      }
      if (activeItem.value === items.length - 1) {
        if (translationX < 0) {
          return;
        }
      }
      translation.value = event.translationX;
    })
    .onFinalize(event => {
      const { translationX } = event;
      if (translationX < -TRANSLATION_FACTOR) {
        if (activeItem.value !== items.length - 1) {
          activeItem.value = activeItem.value + 1;
        }
        translation.value = 0;
      } else if (translationX > TRANSLATION_FACTOR) {
        if (activeItem.value !== 0) {
          activeItem.value = activeItem.value - 1;
        }
        translation.value = 0;
      } else {
        translation.value = 0;
      }
    });
  return (
    <SafeAreaView style={tailwind.style("flex-1 justify-center bg-white")}>
      <StatusBar barStyle={"light-content"} />
      <GestureDetector gesture={panGesture}>
        <Animated.View style={tailwind.style("flex items-center")}>
          {items.map((item, index) => (
            <Photo
              key={item.key}
              {...{ item, index, activeItem, translation }}
            />
          ))}
        </Animated.View>
      </GestureDetector>
    </SafeAreaView>
  );
};
