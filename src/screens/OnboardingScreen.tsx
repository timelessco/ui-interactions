import { useRef, useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  Text,
  TextInput,
} from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import tailwind from "twrnc";

const SCREEN_HEIGHT = Dimensions.get("screen").height;
const SCREEN_WIDTH = Dimensions.get("screen").width;

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const GettingStarted = () => {
  return (
    <Animated.View style={tailwind.style(`w-[${SCREEN_WIDTH}px]`, "h-full")}>
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

interface CreateAccountProps {
  handleFocus: () => void;
  handleBlur: () => void;
}

const CreateAccount = (props: CreateAccountProps) => {
  const { handleBlur, handleFocus } = props;
  const { bottom } = useSafeAreaInsets();

  return (
    <Animated.View
      style={tailwind.style(`w-[${SCREEN_WIDTH}px]`, "relative h-full")}
    >
      <Animated.View style={tailwind.style("px-4")}>
        <Text style={tailwind.style("text-2xl font-bold")}>Get Started!</Text>
        <TextInput
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={tailwind.style(
            "text-lg leading-[21px] mt-2 py-3 border-b-[1px] border-b-[#E3E9ED]",
          )}
          placeholder="Name"
          returnKeyType="next"
        />
        <TextInput
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={tailwind.style(
            "text-lg leading-[21px] mt-2 py-3 border-b-[1px] border-b-[#E3E9ED]",
          )}
          placeholder="Email"
          returnKeyType="next"
          inputMode="email"
        />
        <TextInput
          onFocus={handleFocus}
          onBlur={handleBlur}
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
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useSharedValue(0);
  const sheetHeight = useSharedValue(0);

  const [textInputFocussed, setIsTextInputFocussed] = useState(false);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollX.value = event.contentOffset.x;
      if (!textInputFocussed) {
        sheetHeight.value = event.contentOffset.x;
      }
    },
  });

  const animatedSheetStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(
        sheetHeight.value,
        [0, SCREEN_WIDTH, SCREEN_WIDTH * 2],
        [SCREEN_HEIGHT * 0.45, SCREEN_HEIGHT * 0.55, SCREEN_HEIGHT * 0.9],
      ),
    };
  });

  const continueAnimatingStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollX.value, [0, SCREEN_WIDTH / 2], [1, 0]),
    };
  });

  const createAccountAnimatingStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        scrollX.value,
        [SCREEN_WIDTH / 2, SCREEN_WIDTH],
        [0, 1],
      ),
    };
  });

  const animatingButtonStyle = useAnimatedStyle(() => {
    return {
      width: interpolate(
        sheetHeight.value,
        [0, SCREEN_WIDTH],
        [SCREEN_WIDTH * 0.3, SCREEN_WIDTH * 0.5],
        Extrapolate.CLAMP,
      ),
      bottom: interpolate(
        sheetHeight.value,
        [0, SCREEN_WIDTH, SCREEN_WIDTH * 2],
        [bottom, bottom * 3.9 + 10, bottom * 13],
      ),
    };
  });

  const handlePress = () => {
    if (scrollX.value === 0) {
      scrollRef.current?.scrollTo({ x: SCREEN_WIDTH, animated: true });
      scrollX.value = withSpring(SCREEN_WIDTH, { damping: 20, stiffness: 150 });
      setIsTextInputFocussed(true);
      sheetHeight.value = withSpring(
        SCREEN_WIDTH,
        {
          damping: 20,
          stiffness: 120,
        },
        () => {
          runOnJS(setIsTextInputFocussed)(false);
        },
      );
    }
  };

  const handleFocus = () => {
    setIsTextInputFocussed(true);
    scrollRef.current?.scrollTo({ x: SCREEN_WIDTH, animated: true });
    sheetHeight.value = withSpring(SCREEN_WIDTH * 2, {
      damping: 20,
      stiffness: 150,
    });
  };

  const handleBlur = () => {
    setIsTextInputFocussed(false);
    sheetHeight.value = withSpring(SCREEN_WIDTH, {
      damping: 20,
      stiffness: 150,
    });
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
        <AnimatedScrollView
          ref={scrollRef}
          directionalLockEnabled
          bounces={false}
          style={tailwind.style("pt-8")}
          showsHorizontalScrollIndicator={false}
          horizontal
          snapToInterval={SCREEN_WIDTH}
          decelerationRate={0}
          scrollEventThrottle={16}
          onScroll={scrollHandler}
        >
          <GettingStarted />
          <CreateAccount handleBlur={handleBlur} handleFocus={handleFocus} />
        </AnimatedScrollView>
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
