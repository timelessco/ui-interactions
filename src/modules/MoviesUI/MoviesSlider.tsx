import React from 'react';
import {FlatList, Image, Pressable, StyleSheet} from 'react-native';
import tailwind from 'twrnc';
import {MoviesList} from './data';

const ItemWidth = 145;
const Spacing = 20;

type MoviesSliderProps = {
  listData: MoviesList[];
};

const MoviesSlider = ({listData}: MoviesSliderProps) => {
  return (
    <FlatList
      contentContainerStyle={tailwind.style('px-5')}
      snapToInterval={ItemWidth + Spacing}
      decelerationRate="fast"
      renderItem={({item, index}) => {
        return (
          <Pressable
            style={tailwind.style(
              `w-[145px] h-[216px] ${index !== 0 ? 'ml-5' : ''}`,
            )}>
            <Image
              style={[tailwind.style('rounded-md'), styles.imageStyle]}
              source={{uri: item.url}}
            />
          </Pressable>
        );
      }}
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
