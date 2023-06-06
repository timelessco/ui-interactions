import React, { useMemo, useState } from "react";
import { Dimensions, Pressable } from "react-native";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { MasonryFlashList } from "@shopify/flash-list";
import { BlurView } from "expo-blur";
import tailwind from "twrnc";

import { useScaleAnimation } from "../utils/useScaleAnimation";

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

type PhotosListType = {
  image: string;
  ar: number;
};
const photosList: PhotosListType[] = [
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

const COLUMN_WIDTH = (Dimensions.get("screen").width - 16 * 2) / 2;
const WIDTH = Dimensions.get("screen").width;

type PhotoCellProps = {
  index: number;
  item: PhotosListType;
  setActiveImage: React.Dispatch<React.SetStateAction<number>>;
};

const PhotoCell = ({ item, index, setActiveImage }: PhotoCellProps) => {
  const inFirstCol = index % 2 === 0;
  const { animatedStyle, handlers } = useScaleAnimation();
  const handlePress = () => {
    setActiveImage(index);
  };

  return (
    <Pressable onPress={handlePress} {...handlers}>
      <Animated.View
        style={[
          tailwind.style(
            ` w-[${COLUMN_WIDTH}px] py-2`,
            inFirstCol ? "pl-2 pr-1" : "pl-1 pr-2",
          ),
          { aspectRatio: item.ar },
          animatedStyle,
        ]}
      >
        <Animated.Image
          style={tailwind.style("h-full w-full rounded-xl bg-gray-300")}
          source={{ uri: item.image }}
        />
      </Animated.View>
    </Pressable>
  );
};

export const ImageLightBox = () => {
  const [activeImage, setActiveImage] = useState(-1);
  const imageData = useMemo(() => {
    return photosList[activeImage];
  }, [activeImage]);
  return (
    <SafeAreaView style={tailwind.style("flex-1 px-4")}>
      <MasonryFlashList
        showsVerticalScrollIndicator={false}
        data={photosList}
        numColumns={2}
        estimatedItemSize={100}
        style={tailwind.style("relative")}
        renderItem={({ item, index }) => {
          return (
            <PhotoCell {...{ item, index, activeImage, setActiveImage }} />
          );
        }}
      />
      {activeImage !== -1 ? (
        <AnimatedBlurView
          intensity={90}
          style={tailwind.style(
            "absolute inset-0 justify-center items-center z-10",
          )}
        >
          <Pressable
            style={[tailwind.style("absolute inset-0 z-10")]}
            onPress={() => setActiveImage(-1)}
          />
          <Animated.View style={tailwind.style("z-20")}>
            <Animated.View
              style={[
                tailwind.style(`w-[${WIDTH - 32}px]`),
                { aspectRatio: imageData.ar },
              ]}
            >
              <Animated.Image
                style={tailwind.style("h-full w-full rounded-xl bg-gray-300")}
                source={{ uri: imageData.image }}
              />
            </Animated.View>
          </Animated.View>
        </AnimatedBlurView>
      ) : null}
    </SafeAreaView>
  );
};
