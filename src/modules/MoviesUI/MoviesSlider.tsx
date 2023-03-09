import React, { useCallback } from "react";
import { FlatList, Image, Pressable, StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import { StackNavigationProp } from "@react-navigation/stack";
import tailwind from "twrnc";

import { RootStackParamList } from "../../screens/SharedElementConceptOne";
import { useHaptic } from "../../utils/useHaptic";
import { useScaleAnimation } from "../../utils/useScaleAnimation";

import { MoviesList } from "./data";

const ItemWidth = 145;
const Spacing = 20;

type MoviesSliderProps = {
  listData: MoviesList[];
  navigation: StackNavigationProp<RootStackParamList, "List">;
};

type MovieCardProps = {
  item: MoviesList;
  index: number;
  navigation: StackNavigationProp<RootStackParamList, "List">;
};

const MovieCard = ({ item, index, navigation }: MovieCardProps) => {
  const { handlers, animatedStyle } = useScaleAnimation();
  const hapticSelection = useHaptic();

  const handlePress = useCallback(() => {
    navigation.push("Details", { item });
    hapticSelection?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);
  return (
    <Animated.View style={animatedStyle}>
      <Pressable onPress={handlePress} {...handlers}>
        <Image
          style={[
            tailwind.style(
              `w-[145px] h-[216px] rounded-md ${index !== 0 ? "ml-5" : ""}`,
            ),
            styles.imageStyle,
          ]}
          source={{ uri: item.url }}
        />
      </Pressable>
    </Animated.View>
  );
};

const MoviesSlider = ({ listData, navigation }: MoviesSliderProps) => {
  return (
    <FlatList
      contentContainerStyle={tailwind.style("px-5")}
      snapToInterval={ItemWidth + Spacing}
      decelerationRate="fast"
      renderItem={props => <MovieCard {...props} navigation={navigation} />}
      data={listData}
      horizontal
      keyExtractor={item => item.url}
      showsHorizontalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  imageStyle: {
    aspectRatio: 0.67,
  },
});

export default MoviesSlider;
