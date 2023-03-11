import { Image, StatusBar } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
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
  translation: SharedValue<number>;
  item: ItemType;
};

const CARD_HEIGHT = 4 * 96;
const CARD_WIDTH = 4 * 72;

const Photo = ({ index, activeItem, item, translation }: PhotoProps) => {
  const rotationFactor = useDerivedValue(() => {
    const activeCardRotation = interpolate(
      translation.value,
      [-30, 0, 30],
      [-5, 0, 5],
      Extrapolation.CLAMP,
    );
    return index < activeItem.value
      ? -(activeItem.value - index)
      : index > activeItem.value
      ? index - activeItem.value
      : activeCardRotation;
  });

  const zIndex =
    index < activeItem.value
      ? -(activeItem.value - index)
      : index > activeItem.value
      ? activeItem.value - index
      : items.length;

  const scaleFactor = useDerivedValue(() => {
    const activeCardScale = interpolate(
      translation.value,
      [-30, 0, 30],
      [0.85, 1, 0.85],
      Extrapolation.CLAMP,
    );
    return index < activeItem.value
      ? 1 - (activeItem.value - index) / (items.length + 8)
      : index > activeItem.value
      ? 1 + (activeItem.value - index) / (items.length + 8)
      : activeCardScale;
  });

  const itemStyle = useAnimatedStyle(() => {
    const getTransform = () => {
      let transform = {
        transform: [
          { rotate: `${rotationFactor.value * 2}deg` },
          { scale: scaleFactor.value },
          {
            translateX:
              activeItem.value === index
                ? interpolate(
                    translation.value,
                    [-30, 30],
                    [-30, 30],
                    Extrapolation.CLAMP,
                  )
                : 0,
          },
        ],
      };
      return withAnchorPoint(
        transform,
        { x: rotationFactor.value < 0 ? 0 : 1, y: 1 },
        { width: CARD_WIDTH, height: CARD_HEIGHT },
      );
    };

    return {
      zIndex,
      ...getTransform(),
    };
  });

  return (
    <Animated.View
      key={item.key}
      style={[
        tailwind.style(
          "absolute -top-48 h-96 w-72 bg-gray-600 rounded-2xl shadow-md",
        ),
        itemStyle,
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
  const activeItem = useSharedValue(2);
  const translation = useSharedValue(0);
  const panGesture = Gesture.Pan()
    .onChange(event => {
      translation.value = withSpring(event.translationX);
    })
    .onFinalize(() => {
      translation.value = withSpring(0);
    });
  return (
    <SafeAreaView style={tailwind.style("flex-1 justify-center bg-[#141414]")}>
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
