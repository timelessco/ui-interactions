import {StackScreenProps} from '@react-navigation/stack';
import React, {useRef} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  SharedElement,
  SharedElementCompatRoute,
} from 'react-navigation-shared-element';
import tailwind from 'twrnc';
import {RootStackParamList} from '../../../App';

type MoviesDetailsProps = StackScreenProps<RootStackParamList, 'Details'>;

const DefaultSpringConfig: WithSpringConfig = {
  mass: 1,
  damping: 25,
  stiffness: 200,
  overshootClamping: false,
  restSpeedThreshold: 0.001,
  restDisplacementThreshold: 0.001,
};

const MovieDetails = (props: MoviesDetailsProps) => {
  const {item} = props.route.params;
  const {top} = useSafeAreaInsets();

  const sv = useSharedValue(0);

  const scrollViewRef = useRef<Animated.ScrollView>(null);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      sv.value = event.contentOffset.y;
    },
    onEndDrag: event => {
      if (event.contentOffset.y > 50) {
        sv.value = withSpring(top, DefaultSpringConfig);
      } else {
        sv.value = withSpring(0, DefaultSpringConfig);
      }
      if (event.contentOffset.y < -50) {
        runOnJS(props.navigation.pop)();
      }
    },
  });

  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(
            sv.value,
            [-30, 0, 50],
            [0.85, 0.9, 1],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  return (
    <Animated.ScrollView
      ref={scrollViewRef}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      style={[tailwind.style('flex flex-col rounded-2xl ')]}>
      <Animated.View
        style={[
          tailwind.style(
            'flex items-center pb-10 rounded-2xl shadow-sm bg-white',
          ),
          containerStyle,
        ]}>
        <View
          style={[
            tailwind.style('w-8 h-[6px] rounded-[21px] mt-2'),
            styles.handleStyle,
          ]}
        />
        <View style={tailwind.style('mt-8')}>
          <SharedElement id={`item.${item.id}.bg`}>
            <View style={[StyleSheet.absoluteFillObject]} />
          </SharedElement>
          <SharedElement id={`item.${item.id}.image`}>
            <Image
              style={[
                tailwind.style('rounded-xl h-[430px] w-[287px]'),
                styles.imageStyle,
              ]}
              source={{uri: item.url}}
            />
          </SharedElement>
        </View>
        <View style={tailwind.style('flex mt-10')}>
          <Text style={tailwind.style('text-3xl font-extrabold text-center')}>
            {item.title}
          </Text>
          <Text
            style={tailwind.style(
              'text-xs font-medium text-[#7C7C7C] mt-2 text-center',
            )}>
            Drama · Comedy · 2021
          </Text>
        </View>
        <View style={tailwind.style('flex mt-4 px-4')}>
          <Text style={tailwind.style('text-base font-normal')}>
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s, when an unknown printer took a galley of type
            and scrambled it to make a type specimen book. It has survived not
            only five centuries, but also the leap into electronic typesetting,
            remaining essentially unchanged. It was popularised in the 1960s
            with the release of Letraset sheets containing Lorem Ipsum passages,
            and more recently with desktop publishing software like Aldus
            PageMaker including versions of Lorem Ipsum. Lorem Ipsum is simply
            dummy text of the printing and typesetting industry. Lorem Ipsum has
            been the industry's standard dummy text ever since the 1500s, when
            an unknown printer took a galley of type and scrambled it to make a
            type specimen book. It has survived not only five centuries, but
            also the leap into electronic typesetting, remaining essentially
            unchanged. It was popularised in the 1960s with the release of
            Letraset sheets containing Lorem Ipsum passages, and more recently
            with desktop publishing software like Aldus PageMaker including
            versions of Lorem Ipsum.
          </Text>
        </View>
      </Animated.View>
    </Animated.ScrollView>
  );
};

const styles = StyleSheet.create({
  handleStyle: {
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  imageStyle: {
    aspectRatio: 0.67,
  },
});

MovieDetails.sharedElements = (route: SharedElementCompatRoute) => {
  const {item} = route.params;
  return [
    {
      id: `item.${item.id}.image`,
    },
    {
      id: `item.${item.id}.bg`,
    },
  ];
};

export default MovieDetails;
