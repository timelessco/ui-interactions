import { useCallback, useRef, useState } from "react";
import { Dimensions, Image, Pressable } from "react-native";
import Animated, {
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import tailwind from "twrnc";

import { ArrowLeft, ArrowRight } from "../icons";

const CARD_WIDTH = 300;
const SCREEN_WIDTH = Dimensions.get("screen").width;

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
  handleCarouselItemPress: (scrollOffset: number) => void;
  scrollViewWidth: number;
};

const GalleryCarouselItem = (props: GalleryCarouselItemProps) => {
  const {
    item,
    index,
    scrollXOffset,
    handleCarouselItemPress,
    scrollViewWidth,
  } = props;
  const inputRange = [
    (index - 1) * CARD_WIDTH,
    index === carouselItems.length - 1
      ? scrollViewWidth - SCREEN_WIDTH
      : index * CARD_WIDTH,
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
  const handlePress = useCallback(() => {
    handleCarouselItemPress(inputRange[1]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Pressable onPress={handlePress}>
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
    </Pressable>
  );
};

export const GalleryCarousel = () => {
  const scrollXOffset = useSharedValue(0);
  const [isFirstCard, setIsFirstCard] = useState(scrollXOffset.value === 0);
  const [isLastCard, setIsLastCard] = useState(false);
  const [scrollViewWidth, setScrollViewWidth] = useState(0);

  const scrollRef = useRef<Animated.ScrollView>(null);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollXOffset.value = withSpring(event.contentOffset.x, {
        damping: 18,
        stiffness: 120,
      });
    },
    onMomentumEnd: event => {
      const scrollOffset = event.contentOffset.x;
      scrollXOffset.value = withSpring(event.contentOffset.x, {
        damping: 18,
        stiffness: 120,
      });
      if (scrollOffset === 0) {
        runOnJS(setIsFirstCard)(true);
      } else {
        runOnJS(setIsFirstCard)(false);
      }
      if (scrollOffset === scrollViewWidth - SCREEN_WIDTH) {
        runOnJS(setIsLastCard)(true);
      } else {
        runOnJS(setIsLastCard)(false);
      }
    },
  });

  const findNextNearestMultiple = (
    targetNumber: number,
    multiple: number,
  ): number => {
    const quotient = Math.ceil((targetNumber + 1) / multiple);
    const nextNearestMultiple = multiple * quotient;
    return nextNearestMultiple;
  };

  const findPreviousMultiple = (
    targetNumber: number,
    multiple: number,
  ): number => {
    const quotient = Math.floor((targetNumber - 1) / multiple);
    const previousMultiple = multiple * quotient;
    return previousMultiple;
  };

  const goToNext = () => {
    if (scrollXOffset.value < scrollViewWidth - SCREEN_WIDTH) {
      const nextMultiple = findNextNearestMultiple(
        scrollXOffset.value,
        CARD_WIDTH,
      );

      scrollRef.current?.scrollTo({ x: nextMultiple, animated: true });
    }
  };

  const goToPrevious = () => {
    if (scrollXOffset.value !== 0) {
      const nextMultiple = findPreviousMultiple(
        scrollXOffset.value,
        CARD_WIDTH,
      );

      scrollRef.current?.scrollTo({ x: nextMultiple, animated: true });
    }
  };

  const handleCarouselItemPress = (scrollOffset: number) => {
    scrollRef.current?.scrollTo({ x: scrollOffset, animated: true });
  };

  const handleContentSizeChange = (width: number, _height: number) => {
    setScrollViewWidth(width);
  };

  return (
    <SafeAreaView style={tailwind.style("flex-1 justify-center bg-white")}>
      <Animated.View style={tailwind.style("overflow-visible")}>
        <Animated.ScrollView
          ref={scrollRef}
          horizontal
          onScroll={scrollHandler}
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH}
          scrollEventThrottle={16}
          decelerationRate={0}
          style={tailwind.style("overflow-visible")}
          contentContainerStyle={tailwind.style("overflow-visible pl-4 pr-4")}
          onContentSizeChange={handleContentSizeChange}
        >
          {carouselItems.map((item, index) => (
            <GalleryCarouselItem
              key={index}
              {...{
                item,
                index,
                scrollXOffset,
                handleCarouselItemPress,
                scrollViewWidth,
              }}
            />
          ))}
        </Animated.ScrollView>
        <Animated.View style={tailwind.style("px-4 flex flex-row pt-5")}>
          <Pressable
            disabled={isFirstCard}
            onPress={goToPrevious}
            style={({ pressed }) =>
              tailwind.style(
                pressed ? "bg-gray-100 rounded-xl" : "",
                "mr-2 p-2",
              )
            }
          >
            <Animated.View style={tailwind.style("")}>
              <ArrowLeft
                stroke={isFirstCard ? tailwind.color("bg-gray-400") : "black"}
              />
            </Animated.View>
          </Pressable>
          <Pressable
            disabled={isLastCard}
            onPress={goToNext}
            style={({ pressed }) =>
              tailwind.style(
                pressed ? "bg-gray-100 rounded-xl" : "",
                "mr-2 p-2",
              )
            }
          >
            <Animated.View style={tailwind.style("")}>
              <ArrowRight
                stroke={isLastCard ? tailwind.color("bg-gray-400") : "black"}
              />
            </Animated.View>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
};
