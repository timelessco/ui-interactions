import { Image } from "react-native";
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import tailwind from "twrnc";

const CARD_WIDTH = 300;

const carouselItems = [
  {
    image:
      "https://images.unsplash.com/photo-1678436748951-ef6d381e7a25?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDN8YWV1NnJMLWo2ZXd8fGVufDB8fHx8fA%3D%3D",
    ar: 0.7,
  },
  {
    image:
      "https://images.unsplash.com/photo-1680813977591-5518e78445a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ar: 0.67,
  },
  {
    image:
      "https://images.unsplash.com/photo-1679508056887-5c76269dad54?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ar: 0.8,
  },
  {
    image:
      "https://images.unsplash.com/photo-1681243303374-72d01f749dfa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDczfGFldTZyTC1qNmV3fHxlbnwwfHx8fHw%3D",
    ar: 0.68,
  },
  {
    image:
      "https://images.unsplash.com/photo-1675185741953-18b60234cb79?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ar: 0.67,
  },
  {
    image:
      "https://images.unsplash.com/photo-1685725083464-26cab8f2da1e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ar: 0.67,
  },
];

type GalleryCarouselItemProps = {
  item: (typeof carouselItems)[0];
  index: number;
  scrollXOffset: SharedValue<number>;
};

const GalleryCarouselItem = (props: GalleryCarouselItemProps) => {
  const { item, index, scrollXOffset } = props;
  const inputRange = [
    (index - 1) * CARD_WIDTH,
    // The number is pre-calculated, could not figure a mathematical to arrive at the number,
    // The value is the scrollOffset which is not the CARD_WIDTH * no. of items
    index === carouselItems.length - 1 ? 1439 : index * CARD_WIDTH,
    (index + 1) * CARD_WIDTH,
  ];

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective: 800 },
        {
          rotateY: `${interpolate(
            scrollXOffset.value,
            inputRange,
            [-40, 0, 40],
          )}deg`,
        },
        {
          scale: interpolate(scrollXOffset.value, inputRange, [0.9, 1, 0.9]),
        },
        {
          translateX: interpolate(
            scrollXOffset.value,
            inputRange,
            [-20, 0, 20],
          ),
        },
      ],
    };
  });

  return (
    <Animated.View
      key={item.image}
      style={[
        tailwind.style(`w-[${CARD_WIDTH}px]`, "h-[430px]"),
        animatedStyle,
      ]}
    >
      <Image
        source={{ uri: item.image }}
        style={[tailwind.style("h-full w-full rounded-xl")]}
      />
    </Animated.View>
  );
};

export const GalleryCarousel = () => {
  const scrollXOffset = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollXOffset.value = event.contentOffset.x;
    },
  });

  return (
    <SafeAreaView style={tailwind.style("flex-1 justify-center bg-white")}>
      <Animated.View style={tailwind.style("overflow-visible")}>
        <Animated.ScrollView
          horizontal
          onScroll={scrollHandler}
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH}
          scrollEventThrottle={16}
          decelerationRate={0}
          style={tailwind.style("overflow-visible")}
          contentContainerStyle={tailwind.style("overflow-visible pl-4 pr-4")}
        >
          {carouselItems.map((item, index) => (
            <GalleryCarouselItem
              key={index}
              {...{ item, index, scrollXOffset }}
            />
          ))}
        </Animated.ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};
