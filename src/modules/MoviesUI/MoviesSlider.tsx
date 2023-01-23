import {StackNavigationProp} from '@react-navigation/stack';
import React from 'react';
import {FlatList, Image, Pressable, StyleSheet, View} from 'react-native';
import {SharedElement} from 'react-navigation-shared-element';
import tailwind from 'twrnc';
import {RootStackParamList} from '../../../App';
import {MoviesList} from './data';

const ItemWidth = 145;
const Spacing = 20;

type MoviesSliderProps = {
  listData: MoviesList[];
  navigation: StackNavigationProp<RootStackParamList, 'List'>;
};

const MoviesSlider = ({listData, navigation}: MoviesSliderProps) => {
  return (
    <FlatList
      contentContainerStyle={tailwind.style('px-5')}
      snapToInterval={ItemWidth + Spacing}
      decelerationRate="fast"
      renderItem={({item, index}) => {
        return (
          <Pressable onPress={() => navigation.push('Details', {item})}>
            <SharedElement id={`item.${item.id}.bg`}>
              <View style={[StyleSheet.absoluteFillObject]} />
            </SharedElement>
            <SharedElement id={`item.${item.id}.image`}>
              <Image
                style={[
                  tailwind.style(
                    `w-[145px] h-[216px] rounded-md ${
                      index !== 0 ? 'ml-5' : ''
                    }`,
                  ),
                  styles.imageStyle,
                ]}
                source={{uri: item.url}}
              />
            </SharedElement>
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
