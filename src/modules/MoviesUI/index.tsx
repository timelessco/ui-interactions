import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import Animated from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import tailwind from 'twrnc';
import {RootStackParamList} from '../../../App';
import {continueWatching, trending} from './data';
import MoviesSlider from './MoviesSlider';

export type MoviesUIProps = StackScreenProps<RootStackParamList, 'List'>;

const MoviesUI = ({navigation}: MoviesUIProps) => {
  const {top} = useSafeAreaInsets();
  return (
    <View style={tailwind.style(`flex-1 pt-[${top}px]`)}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tailwind.style('pb-12')}>
        <View style={tailwind.style('flex justify-center items-center')}>
          <View style={tailwind.style('h-[430px] w-[287px]')}>
            <Image
              style={[
                tailwind.style('h-full w-full rounded-xl'),
                styles.imageStyle,
              ]}
              source={{
                uri: 'https://media-cache.cinematerial.com/p/500x/nza9lluu/top-gun-maverick-movie-poster.jpg',
              }}
            />
          </View>
        </View>
        <View style={tailwind.style('mt-8')}>
          <Text style={tailwind.style('pl-5 font-600 text-lg pb-2')}>
            Trending Now
          </Text>
          <MoviesSlider navigation={navigation} listData={trending} />
        </View>
        <View style={tailwind.style('mt-8')}>
          <Text style={tailwind.style('pl-5 font-600 text-lg pb-2')}>
            Continue Watching
          </Text>
          <MoviesSlider navigation={navigation} listData={continueWatching} />
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  handleStyle: {
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  imageStyle: {
    aspectRatio: 0.67,
  },
});

export default MoviesUI;
