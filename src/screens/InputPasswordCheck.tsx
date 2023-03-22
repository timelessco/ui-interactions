import React, { useCallback, useEffect, useState } from "react";
import { LayoutChangeEvent, Text, TextInput } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import tailwind from "twrnc";

const DefaultSpringConfig: WithSpringConfig = {
  mass: 1,
  damping: 20,
  stiffness: 150,
  overshootClamping: false,
  restSpeedThreshold: 0.001,
  restDisplacementThreshold: 0.001,
};

export const InputPasswordCheck = () => {
  const [focused, setFocused] = useState(false);
  const [_passwordState, setPasswordState] = useState<
    "low" | "medium" | "strong" | null
  >(null);
  const lowV = useSharedValue(0);
  const mediumV = useSharedValue(0);
  const strongV = useSharedValue(0);
  const [password, setPassword] = useState("");

  const [singleContainerWidth, setSingleContainerWidth] = useState(0);
  const passwordState = useSharedValue(0);
  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setSingleContainerWidth(event.nativeEvent.layout.width);
  }, []);

  const entering = () => {
    "worklet";
    const animations = {
      backgroundColor: withTiming("#E4E3E2", { duration: 400 }),
    };
    const initialValues = {
      backgroundColor: "white",
    };
    return {
      initialValues,
      animations,
    };
  };
  const enteringText = () => {
    "worklet";
    const animations = {
      opacity: withSpring(1, { stiffness: 100, damping: 20 }),
      transform: [
        { translateY: withSpring(0, { stiffness: 100, damping: 20 }) },
      ],
    };
    const initialValues = {
      opacity: 0,
      transform: [{ translateY: -5 }],
    };
    return {
      initialValues,
      animations,
    };
  };
  useEffect(() => {
    const validatePassword = (pass: string) => {
      let strength = 0;

      // Check length
      if (pass.length >= 8) {
        strength += 1;
      }

      // Check for special characters
      if (/[!@#$%^&*]/.test(pass)) {
        strength += 1;
      }

      // Check for numbers
      if (/\d/.test(pass)) {
        strength += 1;
      }

      // Check for uppercase and lowercase letters
      if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) {
        strength += 1;
      }

      // Return password strength
      if (strength >= 4) {
        lowV.value = 0;
        mediumV.value = 0;
        strongV.value = withSpring(100, DefaultSpringConfig);
        passwordState.value = withSpring(3, DefaultSpringConfig);
        return "strong";
      }
      if (strength >= 2) {
        lowV.value = 0;
        mediumV.value = withSpring(100, DefaultSpringConfig);
        strongV.value = 0;
        passwordState.value = withSpring(2, DefaultSpringConfig);
        return "medium";
      }
      if (strength === 1) {
        lowV.value = withSpring(100, DefaultSpringConfig);
        mediumV.value = 0;
        strongV.value = 0;
        passwordState.value = withSpring(1, DefaultSpringConfig);
        return "low";
      }
      passwordState.value = withSpring(0, DefaultSpringConfig);
      lowV.value = 0;
      mediumV.value = 0;
      strongV.value = 0;
      return null;
    };
    setPasswordState(validatePassword(password));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password]);

  const translatingViewStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        passwordState.value,
        [0, 1, 2, 3],
        ["#E4E3E2", "#FF4A11", "#F2781F", "#68E95C"],
      ),
      opacity: interpolate(passwordState.value, [0, 0.5, 1], [0, 0, 1]),
      transform: [
        {
          translateX: interpolate(
            passwordState.value,
            [0, 1, 2, 3],
            [
              -singleContainerWidth,
              0,
              singleContainerWidth + 4,
              singleContainerWidth * 2 + 8,
            ],
          ),
        },
      ],
    };
  });

  return (
    <SafeAreaView style={tailwind.style("flex-1 bg-gray-100")}>
      <Animated.View
        layout={Layout.springify().stiffness(200).damping(50)}
        style={tailwind.style("bg-white mx-3 rounded-xl px-4 py-[14px]")}
      >
        <TextInput
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Password"
          placeholderTextColor={"#827E7D"}
          value={password}
          onChange={event => setPassword(event.nativeEvent.text)}
          style={tailwind.style("")}
          // secureTextEntry
        />
        {focused && (
          <Animated.View
            layout={Layout.springify().stiffness(100).damping(20)}
            style={tailwind.style("relative flex flex-row w-full mt-3")}
          >
            <Animated.View
              style={[
                tailwind.style(
                  `absolute w-[${singleContainerWidth}px] h-[3px] z-50 rounded-2xl`,
                ),
                translatingViewStyle,
              ]}
            />
            <Animated.View
              onLayout={handleLayout}
              entering={entering}
              style={tailwind.style(
                "h-[3px] flex-1 overflow-hidden rounded-2xl",
              )}
            />
            <Animated.View
              entering={entering}
              style={tailwind.style(
                "mx-1 h-[3px] flex-1 overflow-hidden rounded-2xl",
              )}
            />
            <Animated.View
              entering={entering}
              style={tailwind.style(
                "h-[3px] flex-1 overflow-hidden rounded-2xl",
              )}
            />
          </Animated.View>
        )}
      </Animated.View>
      {focused && (
        <Animated.Text
          entering={enteringText}
          layout={Layout.springify()}
          style={tailwind.style(
            "mt-3 px-5 text-base font-normal text-[#63605F]",
          )}
        >
          Include atleast <Text>8 characters</Text>, <Text>numbers</Text>,{" "}
          <Text>letters</Text>, <Text>special characters</Text>.
        </Animated.Text>
      )}
    </SafeAreaView>
  );
};
