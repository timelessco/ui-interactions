import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useRef, useState} from 'react';
import {
  Image,
  InteractionManager,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Extrapolation,
  FadeInDown,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from 'react-native-reanimated';
import {
  SharedElement,
  SharedElementCompatRoute,
} from 'react-navigation-shared-element';
import tailwind from 'twrnc';
import {RootStackParamList} from '../../../App';
import {dummyContent} from '../../constants';
import {useHaptic} from '../../utils/useHaptic';
import {useScaleAnimation} from '../../utils/useScaleAnimation';

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
  const hapticSelection = useHaptic();
  const exitAnim = useSharedValue(1);
  const [opacity, setOpacity] = useState(1);
  const [backgroundColor, setBackgroundColor] = useState('white');
  const [handleBgColor, setHandleBgColor] = useState('rgba(0,0,0,0.22)');
  const [interactionsFinished, setInteractionsFinished] = useState(false);
  const sv = useSharedValue(0);
  const scrollViewRef = useRef<Animated.ScrollView>(null);
  const {handlers, animatedStyle} = useScaleAnimation();
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      if (exitAnim.value) {
        sv.value = event.contentOffset.y;
      }
    },
    onEndDrag: event => {
      if (sv.value > 50) {
        sv.value = withSpring(event.contentOffset.y, DefaultSpringConfig);
      } else {
        sv.value = withSpring(0, DefaultSpringConfig);
      }
      if (event.contentOffset.y < -70) {
        sv.value = event.contentOffset.y;
        exitAnim.value = 0;
        runOnJS(setOpacity)(0);
        runOnJS(setBackgroundColor)('rgba(255,255,255,0)');
        runOnJS(setHandleBgColor)('rgba(0,0,0,0)');
        hapticSelection && runOnJS(hapticSelection)();
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
            [-50, 0, 50],
            [0.85, 0.9, 1],
            Extrapolation.CLAMP,
          ),
        },
      ],
      backgroundColor,
    };
  });

  const handleStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        sv.value,
        [-70, -50],
        ['rgba(0,0,0,0)', handleBgColor],
      ),
    };
  });

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      setInteractionsFinished(true);
    });
  }, []);

  return (
    <Animated.ScrollView
      ref={scrollViewRef}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      scrollEnabled={interactionsFinished}
      style={tailwind.style('flex flex-col rounded-2xl')}>
      <Animated.View
        style={[
          tailwind.style('flex items-center pb-10 rounded-2xl shadow-md'),
          containerStyle,
        ]}>
        <Animated.View
          style={[
            tailwind.style('w-8 h-[6px] rounded-[21px] mt-2'),
            handleStyle,
          ]}
        />
        <View style={tailwind.style('mt-8')}>
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
        <Animated.View
          style={{opacity}}
          entering={FadeInDown.springify()
            .mass(1)
            .damping(22)
            .stiffness(189)
            .delay(300)}>
          <View style={tailwind.style('flex mt-10')}>
            <Text style={tailwind.style('text-3xl font-extrabold text-center')}>
              {item.title}
            </Text>
            <Text
              style={tailwind.style(
                'text-xs font-medium text-[#7C7C7C] mt-2 text-center uppercase',
              )}>
              Drama · Comedy · 2021
            </Text>
          </View>
          <View style={tailwind.style('mt-6')}>
            <Animated.View style={animatedStyle}>
              <Pressable
                {...handlers}
                style={tailwind.style(
                  'bg-[#171717] min-h-[47px] shadow-sm rounded-[14px] flex items-center justify-center mx-6',
                )}>
                <Text
                  style={tailwind.style(
                    'text-[13px] font-semibold text-white uppercase',
                  )}>
                  Watch now
                </Text>
              </Pressable>
            </Animated.View>
          </View>
          <View style={tailwind.style('flex mt-6 px-6')}>
            <Text style={tailwind.style('text-base font-normal')}>
              Four stylish and ambitious best girlfriends in Harlem, New York
              City: a rising star professor struggling to make space for her
              love life.
              {dummyContent}
            </Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Animated.ScrollView>
  );
};

const styles = StyleSheet.create({
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
