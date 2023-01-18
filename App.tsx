/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React from 'react';
import {Image, Pressable, StatusBar, StyleSheet, Text} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import tailwind from 'twrnc';

const useProgressState = (initialValue: number | null = null) => {
  const [value, setValue] = React.useState<number | null>(initialValue);

  React.useEffect(() => {
    const clearId = setInterval(() => {
      setValue(prevValue => {
        if (prevValue == null) {
          return prevValue;
        }
        return prevValue + Math.floor(Math.random() * 11);
      });
    }, 500);

    if (value && value >= 100) {
      clearInterval(clearId);
    }

    return () => {
      clearInterval(clearId);
    };
  }, [setValue, value]);

  return [value, setValue] as const;
};

const App = () => {
  const [progressValue, setProgressValue] = useProgressState();

  const derivedProgress = useDerivedValue(() =>
    progressValue
      ? withSpring(progressValue, {
          velocity: 0,
          stiffness: 3,
          damping: 10,
          mass: 1,
        })
      : 0,
  );

  const uploadVal = useDerivedValue(() =>
    progressValue
      ? withSpring((progressValue / 100) * 650, {
          velocity: 0,
          stiffness: 150,
          damping: 30,
          mass: 1,
        })
      : 0,
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: -uploadVal.value,
        },
        {
          scale: interpolate(derivedProgress.value, [90, 100], [1, 0.95]),
        },
      ],
    };
  });

  const uploadSuccessStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(derivedProgress.value, [90, 100], [0, 1], {
            extrapolateLeft: 'clamp',
          }),
        },
      ],
    };
  });

  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(derivedProgress.value, [90, 100], [0, 0.3]),
    };
  });

  return (
    <SafeAreaProvider
      style={tailwind.style(
        'flex-1 bg-white justify-center items-center bg-white px-10',
      )}>
      <StatusBar barStyle={'light-content'} />
      <Animated.View
        style={tailwind.style('relative overflow-hidden rounded-lg')}>
        <Animated.View style={tailwind.style('relative h-[650px] rounded-lg')}>
          <Image
            style={[
              tailwind.style('h-full w-full rounded-lg'),
              stlyes.imageAspect,
            ]}
            source={{
              uri: 'https://i.pinimg.com/564x/b3/36/da/b336da47db6ccde036fe000dd70ceef3.jpg',
            }}
          />
        </Animated.View>
        <Animated.View
          style={[
            tailwind.style(
              'absolute top-0 bottom-0 left-0 right-0 bg-gray-900 opacity-80 rounded-lg z-10',
            ),
            animatedStyle,
          ]}
        />
        <Animated.View
          style={[
            tailwind.style(
              'absolute top-0 bottom-0 left-0 right-0 bg-gray-800 rounded-lg z-20',
            ),
            overlayStyle,
          ]}
        />
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            tailwind.style('absolute inset-0 justify-center items-center z-30'),
            uploadSuccessStyle,
          ]}>
          <Text
            style={[
              tailwind.style('text-6xl text-center'),
              stlyes.textLineHeight,
            ]}>
            👍
          </Text>
        </Animated.View>
      </Animated.View>
      <Pressable
        style={tailwind.style(
          'mt-4 h-8 rounded-md px-3 flex justify-center items-center bg-gray-900',
        )}
        onPress={() => setProgressValue(0)}>
        <Text style={tailwind.style('text-lg text-white')}>
          {progressValue === null
            ? 'Upload'
            : progressValue >= 100
            ? 'Upload complete!'
            : 'Uploading...'}
        </Text>
      </Pressable>
    </SafeAreaProvider>
  );
};

const stlyes = StyleSheet.create({
  imageAspect: {aspectRatio: 0.44, resizeMode: 'cover'},
  textLineHeight: {lineHeight: 70},
});

export default App;
