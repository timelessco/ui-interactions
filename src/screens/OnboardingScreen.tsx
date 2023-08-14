import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolate,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import tailwind from "twrnc";

const SCREEN_HEIGHT = Dimensions.get("screen").height;
const SCREEN_WIDTH = Dimensions.get("screen").width;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const DEFAULT_SPRING_CONFIG: WithSpringConfig = {
  velocity: 10,
  mass: 1,
  damping: 50,
  stiffness: 520,
  overshootClamping: false,
  restSpeedThreshold: 0.001,
  restDisplacementThreshold: 0.001,
};
type GettingStartedProps = {
  translateX: SharedValue<number>;
};

const GettingStarted = (props: GettingStartedProps) => {
  const { translateX } = props;
  return (
    <Animated.View
      style={[
        {
          ...StyleSheet.absoluteFillObject,
        },
        tailwind.style(`w-[${SCREEN_WIDTH}px] pt-10`, "h-full"),
        { transform: [{ translateX }] },
      ]}
    >
      <Animated.View style={tailwind.style("px-4")}>
        <Animated.Image
          style={tailwind.style("h-20 w-20")}
          source={require("../assets/AppIcon-removebg.png")}
        />
        <Text style={tailwind.style("text-[40px] font-bold pt-2")}>
          Innovating with Nature's Palette
        </Text>
        <Text style={tailwind.style("text-xl font-normal pt-2 leading-6")}>
          Where the Timeless Strength of Structures Meets the Fluidity of Style
        </Text>
      </Animated.View>
    </Animated.View>
  );
};

type CreateAccountProps = {
  translateX: SharedValue<number>;
};

const CreateAccount = (props: CreateAccountProps) => {
  const { bottom } = useSafeAreaInsets();
  const { translateX } = props;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value + SCREEN_WIDTH }],
    };
  });

  return (
    <Animated.View
      style={[
        {
          ...StyleSheet.absoluteFillObject,
        },
        tailwind.style(`w-[${SCREEN_WIDTH}px] pt-10`, "relative h-full"),
        animatedStyle,
      ]}
    >
      <Animated.View style={tailwind.style("px-4")}>
        <Text style={tailwind.style("text-2xl font-bold")}>Get Started!</Text>
        <TextInput
          style={tailwind.style(
            "text-lg leading-[21px] mt-2 py-3 border-b-[1px] border-b-[#E3E9ED]",
          )}
          placeholder="Name"
          returnKeyType="next"
        />
        <TextInput
          style={tailwind.style(
            "text-lg leading-[21px] mt-2 py-3 border-b-[1px] border-b-[#E3E9ED]",
          )}
          placeholder="Email"
          returnKeyType="next"
          inputMode="email"
        />
        <TextInput
          style={tailwind.style(
            "text-lg leading-[21px] mt-2 py-3 border-b-[1px] border-b-[#E3E9ED]",
          )}
          returnKeyType="done"
          placeholder="Password"
          secureTextEntry
        />
      </Animated.View>
      <AnimatedPressable
        style={tailwind.style(
          "absolute",
          `bottom-[${bottom * 2}px] w-[${SCREEN_WIDTH}px]`,
        )}
      >
        <Animated.Text style={tailwind.style("text-center text-[17px]")}>
          Already Have an Account?{" "}
          <Text style={tailwind.style("text-[#f76808]")}>Login</Text>
        </Animated.Text>
      </AnimatedPressable>
    </Animated.View>
  );
};

export const OnboardingScreen = () => {
  const { bottom } = useSafeAreaInsets();
  const translateX = useSharedValue(0);
  const startTranslation = useSharedValue(0);
  const offset = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      startTranslation.value = translateX.value;
    })
    .onUpdate(event => {
      translateX.value = event.translationX + startTranslation.value;
    })
    .onEnd(event => {
      if (offset.value === 0) {
        if (event.velocityX < 0 && Math.abs(event.velocityX) > 1500) {
          translateX.value = withSpring(-SCREEN_WIDTH, DEFAULT_SPRING_CONFIG);
          offset.value = 1;
          return;
        }
        if (event.translationX > 0) {
          translateX.value = withSpring(0, DEFAULT_SPRING_CONFIG);
        } else {
          if (Math.abs(event.translationX) > SCREEN_WIDTH / 2) {
            translateX.value = withSpring(-SCREEN_WIDTH, DEFAULT_SPRING_CONFIG);
            offset.value = 1;
          } else {
            translateX.value = withSpring(0, DEFAULT_SPRING_CONFIG);
          }
        }
      } else if (offset.value === 1) {
        if (event.velocityX > 0 && Math.abs(event.velocityX) > 1500) {
          translateX.value = withSpring(0, DEFAULT_SPRING_CONFIG);
          offset.value = 0;
          return;
        }
        if (event.translationX < 0) {
          translateX.value = withSpring(-SCREEN_WIDTH, DEFAULT_SPRING_CONFIG);
        } else {
          if (Math.abs(event.translationX) > SCREEN_WIDTH / 2) {
            translateX.value = withSpring(0, DEFAULT_SPRING_CONFIG);
            offset.value = 0;
          } else {
            translateX.value = withSpring(-SCREEN_WIDTH, DEFAULT_SPRING_CONFIG);
          }
        }
      }
    });

  const animatedSheetStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(
        translateX.value,
        [0, -SCREEN_WIDTH],
        [SCREEN_HEIGHT * 0.45, SCREEN_HEIGHT * 0.55],
        Extrapolate.CLAMP,
      ),
    };
  });

  const animatingButtonStyle = useAnimatedStyle(() => {
    return {
      width: interpolate(
        translateX.value,
        [0, -SCREEN_WIDTH],
        [SCREEN_WIDTH * 0.3, SCREEN_WIDTH * 0.5],
        Extrapolate.CLAMP,
      ),
      bottom: interpolate(
        translateX.value,
        [0, -SCREEN_WIDTH],
        [bottom, bottom * 3.9 + 10],
        Extrapolate.CLAMP,
      ),
    };
  });

  const continueAnimatingStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(translateX.value, [0, -SCREEN_WIDTH / 2], [1, 0]),
    };
  });

  const createAccountAnimatingStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        translateX.value,
        [-SCREEN_WIDTH / 2, -SCREEN_WIDTH],
        [0, 1],
      ),
    };
  });

  const handlePress = () => {
    if (offset.value === 0) {
      translateX.value = withSpring(-SCREEN_WIDTH, DEFAULT_SPRING_CONFIG);
      offset.value = 1;
    } else if (offset.value === 1) {
      translateX.value = withSpring(0, DEFAULT_SPRING_CONFIG);
      offset.value = 0;
    }
  };

  return (
    <Animated.View style={tailwind.style("flex-1 items-center justify-end")}>
      <Animated.View style={[tailwind.style("absolute inset-0")]}>
        <Animated.Image
          style={tailwind.style("h-full w-full")}
          source={require("../assets/radialbg.jpg")}
        />
      </Animated.View>
      <Animated.View
        style={[
          tailwind.style(
            "flex justify-end w-full bg-white rounded-t-3xl overflow-hidden",
          ),
          animatedSheetStyle,
        ]}
      >
        <GestureDetector gesture={panGesture}>
          <Animated.View style={tailwind.style("flex-1 flex-row")}>
            <GettingStarted translateX={translateX} />
            <CreateAccount translateX={translateX} />
          </Animated.View>
        </GestureDetector>
        <AnimatedPressable
          onPress={handlePress}
          style={[
            tailwind.style(
              "absolute h-11 px-3 py-2 justify-center items-center right-4 bg-[#f76808] rounded-xl",
            ),
            animatingButtonStyle,
          ]}
        >
          <Animated.Text
            style={[
              tailwind.style(
                "absolute justify-center text-center text-[17px] font-semibold text-white",
              ),
              continueAnimatingStyle,
            ]}
          >
            Continue
          </Animated.Text>
          <Animated.Text
            style={[
              tailwind.style(
                "absolute justify-center text-center text-[17px] font-semibold text-white",
              ),
              createAccountAnimatingStyle,
            ]}
          >
            Create account
          </Animated.Text>
        </AnimatedPressable>
      </Animated.View>
    </Animated.View>
  );
};
