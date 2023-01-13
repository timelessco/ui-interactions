import React from 'react';
import {View} from 'react-native';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  WithSpringConfig,
} from 'react-native-reanimated';
import tailwind from 'twrnc';

const VerticalSpringConfig: WithSpringConfig = {
  mass: 1,
  velocity: 1,
  stiffness: 120,
  damping: 20,
};
const HorizontalSpringConfig: WithSpringConfig = {
  mass: 1,
  velocity: 1,
  stiffness: 120,
  damping: 30,
};

const ScaleSpringConfig: WithSpringConfig = {
  mass: 1,
  velocity: 0,
  stiffness: 120,
  damping: 30,
};

const AlignInteraction1 = () => {
  const verticalLine = useSharedValue(20);
  const horizontalLine = useSharedValue(28);
  const scaleAnim = useSharedValue(1);
  const verticalLineStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: verticalLine.value,
        },
      ],
    };
  });
  const horizontalLineStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: horizontalLine.value,
        },
      ],
    };
  });
  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: scaleAnim.value,
        },
      ],
    };
  });
  return (
    <View
      style={tailwind.style(
        'flex-1 bg-white justify-center items-center bg-blue-300',
      )}>
      <Animated.View
        style={[
          tailwind.style(
            'relative px-5 bg-white w-[250px] h-[100px] rounded-xl shadow-xl flex flex-row items-center justify-between',
          ),
          containerStyle,
        ]}>
        <TouchableWithoutFeedback
          onPressIn={() =>
            (scaleAnim.value = withSpring(0.97, ScaleSpringConfig, finished => {
              if (finished) {
                scaleAnim.value = withDelay(10, withSpring(1));
              }
            }))
          }
          onPress={() => {
            verticalLine.value = withSpring(20, VerticalSpringConfig);
            horizontalLine.value = withDelay(
              100,
              withSpring(28, HorizontalSpringConfig),
            );
          }}
          style={tailwind.style(
            'flex flex-row items-center justify-start w-[70px]',
          )}>
          <View style={tailwind.style('h-8 w-1 bg-blue-100 rounded-xl')} />
          <View style={tailwind.style('ml-1 h-2 w-6 bg-blue-100 rounded-sm')} />
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback
          onPressIn={() =>
            (scaleAnim.value = withSpring(0.97, ScaleSpringConfig, finished => {
              if (finished) {
                scaleAnim.value = withDelay(10, withSpring(1));
              }
            }))
          }
          onPress={() => {
            verticalLine.value = withSpring(122, VerticalSpringConfig);
            horizontalLine.value = withDelay(
              100,
              withSpring(112, HorizontalSpringConfig),
            );
          }}
          style={tailwind.style(
            'flex flex-row items-center justify-center w-[70px]',
          )}>
          <View style={tailwind.style('h-8 w-1 bg-blue-100 rounded-xl')} />
          <View
            style={tailwind.style('absolute h-2 w-6 bg-blue-100 rounded-sm')}
          />
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback
          onPressIn={() =>
            (scaleAnim.value = withSpring(0.97, ScaleSpringConfig, finished => {
              if (finished) {
                scaleAnim.value = withDelay(10, withSpring(1));
              }
            }))
          }
          onPress={() => {
            verticalLine.value = withSpring(226, VerticalSpringConfig);
            horizontalLine.value = withDelay(
              100,
              withSpring(198, HorizontalSpringConfig),
            );
          }}
          style={tailwind.style(
            'flex flex-row items-center justify-end w-[70px]',
          )}>
          <View
            style={tailwind.style('h-2 w-6 bg-blue-100 rounded-sm mr-1 ')}
          />
          <View style={tailwind.style('h-8 w-1 bg-blue-100 rounded-xl')} />
        </TouchableWithoutFeedback>
        <Animated.View
          style={tailwind.style('absolute flex flex-row items-center left-0')}>
          <Animated.View
            style={[
              tailwind.style('h-8 w-1 bg-blue-600 rounded-xl z-50'),
              verticalLineStyle,
            ]}
          />
          <Animated.View
            style={[
              tailwind.style('absolute h-2 w-6 bg-blue-600 rounded-sm z-50'),
              horizontalLineStyle,
            ]}
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
};

export default AlignInteraction1;
