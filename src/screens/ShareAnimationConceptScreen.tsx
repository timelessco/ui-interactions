import React from 'react';
import {Pressable} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  Easing,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
  withTiming,
} from 'react-native-reanimated';
import Svg, {Path} from 'react-native-svg';
import tailwind from 'twrnc';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const SHARE_SPRING_CONFIG: WithSpringConfig = {
  mass: 1,
  damping: 20,
  stiffness: 300,
  overshootClamping: false,
  restSpeedThreshold: 0.01,
  restDisplacementThreshold: 0.01,
};

const CLOSE_SPRING_CONFIG: WithSpringConfig = {
  mass: 1,
  damping: 20,
  stiffness: 150,
  overshootClamping: false,
  restSpeedThreshold: 0.01,
  restDisplacementThreshold: 0.01,
};

type IconStackProps = {av: SharedValue<number>};

const ShareIconStack: React.FC<IconStackProps> = ({av}) => {
  const appearStyle1 = useAnimatedStyle(() => {
    return {
      opacity: interpolate(av.value, [0, 0.95, 1], [1, 0, 0]),
      transform: [{translateX: interpolate(av.value, [0, 1], [0, 100])}],
    };
  });
  const appearStyle2 = useAnimatedStyle(() => {
    return {
      opacity: interpolate(av.value, [0, 0.95, 1], [1, 0, 0]),
      transform: [{translateX: interpolate(av.value, [0, 1], [0, 70])}],
    };
  });
  const appearStyle3 = useAnimatedStyle(() => {
    return {
      opacity: interpolate(av.value, [0, 0.95, 1], [1, 0, 0]),
      transform: [{translateX: interpolate(av.value, [0, 1], [0, 36])}],
    };
  });
  return (
    <>
      <Animated.View style={[tailwind.style('pr-2'), appearStyle1]}>
        <Svg width="24" height="24" fill="none" viewBox="0 0 24 24">
          <Path
            fillRule="evenodd"
            d="M1 2.838A1.838 1.838 0 0 1 2.838 1H21.16A1.837 1.837 0 0 1 23 2.838V21.16A1.838 1.838 0 0 1 21.161 23H2.838A1.838 1.838 0 0 1 1 21.161V2.838zm8.708 6.55h2.979v1.496c.43-.86 1.53-1.634 3.183-1.634 3.169 0 3.92 1.713 3.92 4.856v5.822h-3.207v-5.106c0-1.79-.43-2.8-1.522-2.8-1.515 0-2.145 1.089-2.145 2.8v5.106H9.708V9.388zm-5.5 10.403h3.208V9.25H4.208v10.54zM7.875 5.812a2.063 2.063 0 1 1-4.125 0 2.063 2.063 0 0 1 4.125 0z"
            clipRule="evenodd"
            fill={tailwind.color('text-white')}
          />
        </Svg>
      </Animated.View>
      <Animated.View style={[tailwind.style('pr-2'), appearStyle2]}>
        <Svg width="24" height="24" fill="none" viewBox="0 0 24 24">
          <Path
            fill={tailwind.color('text-white')}
            d="M23.643 4.937c-.835.37-1.732.62-2.675.733a4.67 4.67 0 0 0 2.048-2.578 9.3 9.3 0 0 1-2.958 1.13 4.66 4.66 0 0 0-7.938 4.25 13.229 13.229 0 0 1-9.602-4.868c-.4.69-.63 1.49-.63 2.342A4.66 4.66 0 0 0 3.96 9.824a4.647 4.647 0 0 1-2.11-.583v.06a4.66 4.66 0 0 0 3.737 4.568 4.692 4.692 0 0 1-2.104.08 4.661 4.661 0 0 0 4.352 3.234 9.348 9.348 0 0 1-5.786 1.995 9.5 9.5 0 0 1-1.112-.065 13.175 13.175 0 0 0 7.14 2.093c8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602a9.47 9.47 0 0 0 2.323-2.41l.002-.003z"
          />
        </Svg>
      </Animated.View>
      <Animated.View style={[tailwind.style('pr-1'), appearStyle3]}>
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path
            d="M21.9803 11.4104C21.6403 5.61044 16.3703 1.14045 10.3003 2.14045C6.12029 2.83045 2.77029 6.22043 2.12029 10.4004C1.74029 12.8204 2.24031 15.1104 3.33031 17.0004L2.4403 20.3104C2.2403 21.0604 2.93028 21.7404 3.67028 21.5304L6.93029 20.6304C8.41029 21.5004 10.1403 22.0004 11.9903 22.0004C17.6303 22.0004 22.3103 17.0304 21.9803 11.4104ZM16.8803 15.7204C16.7903 15.9004 16.6803 16.0704 16.5403 16.2304C16.2903 16.5004 16.0203 16.7004 15.7203 16.8204C15.4203 16.9504 15.0903 17.0104 14.7403 17.0104C14.2303 17.0104 13.6803 16.8905 13.1103 16.6405C12.5303 16.3905 11.9603 16.0604 11.3903 15.6504C10.8103 15.2304 10.2703 14.7604 9.7503 14.2504C9.2303 13.7304 8.77027 13.1804 8.35027 12.6104C7.94027 12.0404 7.61029 11.4704 7.37029 10.9004C7.13029 10.3304 7.01031 9.78045 7.01031 9.26045C7.01031 8.92044 7.0703 8.59044 7.1903 8.29044C7.3103 7.98044 7.50032 7.70045 7.77032 7.45045C8.09032 7.13045 8.4403 6.98045 8.8103 6.98045C8.95029 6.98045 9.09027 7.01044 9.22027 7.07044C9.35027 7.13044 9.47029 7.22044 9.5603 7.35044L10.7203 8.99043C10.8103 9.12043 10.8803 9.23043 10.9203 9.34043C10.9703 9.45043 10.9903 9.55043 10.9903 9.65043C10.9903 9.77043 10.9503 9.89045 10.8803 10.0104C10.8103 10.1304 10.7203 10.2504 10.6003 10.3704L10.2203 10.7704C10.1603 10.8304 10.1403 10.8904 10.1403 10.9704C10.1403 11.0104 10.1503 11.0504 10.1603 11.0904C10.1803 11.1304 10.1903 11.1604 10.2003 11.1904C10.2903 11.3604 10.4503 11.5704 10.6703 11.8304C10.9003 12.0904 11.1403 12.3604 11.4003 12.6204C11.6703 12.8904 11.9303 13.1304 12.2003 13.3604C12.4603 13.5804 12.6803 13.7304 12.8503 13.8204C12.8803 13.8304 12.9103 13.8504 12.9403 13.8604C12.9803 13.8804 13.0203 13.8804 13.0703 13.8804C13.1603 13.8804 13.2203 13.8504 13.2803 13.7904L13.6603 13.4104C13.7903 13.2804 13.9103 13.1904 14.0203 13.1304C14.1403 13.0604 14.2503 13.0204 14.3803 13.0204C14.4803 13.0204 14.5803 13.0404 14.6903 13.0904C14.8003 13.1404 14.9203 13.2004 15.0403 13.2904L16.7003 14.4704C16.8303 14.5604 16.9203 14.6704 16.9803 14.7904C17.0303 14.9204 17.0603 15.0404 17.0603 15.1804C17.0003 15.3504 16.9603 15.5404 16.8803 15.7204Z"
            fill={tailwind.color('text-white')}
          />
        </Svg>
      </Animated.View>
    </>
  );
};

const CloseIcon = () => {
  return (
    <Svg width="28" height="28" fill="none" viewBox="0 0 24 24">
      <Path
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M17.25 6.75L6.75 17.25"
      />
      <Path
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M6.75 6.75L17.25 17.25"
      />
    </Svg>
  );
};
const ShareIcon = () => {
  return (
    <Svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <Path
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9.25 4.75H6.75C5.64543 4.75 4.75 5.64543 4.75 6.75V17.25C4.75 18.3546 5.64543 19.25 6.75 19.25H17.25C18.3546 19.25 19.25 18.3546 19.25 17.25V14.75"
      />
      <Path
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M19.25 9.25V4.75H14.75"
      />
      <Path
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M19 5L11.75 12.25"
      />
    </Svg>
  );
};

export const ShareAnimationConceptScreen = () => {
  const iconState = useSharedValue(1);
  const rippleStateScale = useSharedValue(0);
  const rippleStateOpacity = useSharedValue(1);

  const shareIconStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(iconState.value, [0, 1], [0, 1]),
      zIndex: interpolate(iconState.value, [0, 1], [0, 9999]),

      transform: [{scale: interpolate(iconState.value, [0, 1], [0.7, 1])}],
    };
  });
  const closeIconStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(iconState.value, [1, 0], [0, 1]),
      zIndex: interpolate(iconState.value, [1, 0], [0, 9999]),
      transform: [{scale: interpolate(iconState.value, [1, 0], [0.7, 1])}],
    };
  });
  const containerStyle = useAnimatedStyle(() => {
    return {
      width: interpolate(iconState.value, [1, 0], [40, 144]),
    };
  });

  const rippleEffect = useAnimatedStyle(() => {
    return {
      opacity: interpolate(rippleStateOpacity.value, [1, 0], [1, 0]),
      transform: [{scale: interpolate(rippleStateScale.value, [0, 1], [1, 2])}],
    };
  });

  const shareTapHandler = Gesture.Tap()
    .maxDistance(1)
    .onStart(() => {
      'worklet';
      iconState.value = withSpring(0, SHARE_SPRING_CONFIG);
    })
    .onTouchesUp(() => {
      rippleStateScale.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });
    })
    .onFinalize(() => {
      rippleStateOpacity.value = withTiming(
        0,
        {duration: 500, easing: Easing.out(Easing.ease)},
        () => {
          rippleStateOpacity.value = 1;
          rippleStateScale.value = 0;
        },
      );
    });

  const closeTapHandler = Gesture.Tap()
    .maxDistance(1)
    .onStart(() => {
      'worklet';
      iconState.value = withSpring(1, CLOSE_SPRING_CONFIG);
    })
    .onTouchesUp(() => {
      rippleStateScale.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });
    })
    .onFinalize(() => {
      rippleStateOpacity.value = withTiming(
        0,
        {duration: 500, easing: Easing.out(Easing.ease)},
        () => {
          rippleStateOpacity.value = 1;
          rippleStateScale.value = 0;
        },
      );
    });
  return (
    <Pressable style={tailwind.style('w-full px-5')}>
      <Animated.View style={tailwind.style('relative z-10')}>
        <Animated.View
          style={[
            tailwind.style(
              'absolute -top-5 -right-5 bg-violet-600 rounded-full h-10 w-10 z-1 shadow-lg',
            ),
            rippleEffect,
          ]}
        />
        <Animated.View
          style={[
            tailwind.style(
              'absolute -top-5 -right-5 bg-violet-900 flex-row items-center justify-end rounded-full h-10 z-10 shadow-lg',
            ),
            containerStyle,
          ]}>
          <GestureDetector gesture={shareTapHandler}>
            <Animated.View
              style={[tailwind.style('absolute right-2'), shareIconStyle]}>
              <ShareIcon />
            </Animated.View>
          </GestureDetector>
          <ShareIconStack av={iconState} />
          <GestureDetector gesture={closeTapHandler}>
            <Animated.View style={[tailwind.style('pr-2'), closeIconStyle]}>
              <CloseIcon />
            </Animated.View>
          </GestureDetector>
        </Animated.View>
      </Animated.View>
      <AnimatedLinearGradient
        style={tailwind.style('p-5 rounded-lg')}
        start={{x: 0.0, y: 0.25}}
        end={{x: 0.5, y: 1.0}}
        angle={65}
        useAngle={true}
        colors={[
          tailwind.color('text-violet-700') as string,
          tailwind.color('text-violet-500') as string,
          tailwind.color('text-violet-600') as string,
          tailwind.color('text-violet-500') as string,
          tailwind.color('text-violet-700') as string,
        ]}>
        <Animated.Text style={tailwind.style('text-white')}>
          Earnings today
        </Animated.Text>
        <Animated.Text style={tailwind.style('text-white text-5xl pt-6')}>
          ₹10,421.56
        </Animated.Text>
        <Animated.View
          style={tailwind.style('flex flex-row items-center pt-2')}>
          <Animated.View
            style={tailwind.style('px-1 py-0.5 bg-violet-800 rounded-md')}>
            <Animated.Text
              style={tailwind.style('text-white text-sm tracking-wider')}>
              +1.5%
            </Animated.Text>
          </Animated.View>
          <Animated.Text
            style={tailwind.style('text-white text-sm tracking-wide pl-1')}>
            Higher earnings than usual
          </Animated.Text>
        </Animated.View>
      </AnimatedLinearGradient>
    </Pressable>
  );
};
