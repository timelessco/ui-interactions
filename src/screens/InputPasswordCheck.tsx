import React, { useEffect, useState } from "react";
import { Text, TextInput } from "react-native";
import Animated, {
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import tailwind from "twrnc";

const DefaultSpringConfig: WithSpringConfig = {
  mass: 1,
  damping: 20,
  stiffness: 150,
  overshootClamping: false,
  restSpeedThreshold: 0.001,
  restDisplacementThreshold: 0.001,
};

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export const InputPasswordCheck = () => {
  const [focused, setFocused] = useState(false);
  const [_passwordState, setPasswordState] = useState<
    "low" | "medium" | "strong" | null
  >(null);
  const lowV = useSharedValue(0);
  const mediumV = useSharedValue(0);
  const strongV = useSharedValue(0);
  const [password, setPassword] = useState("");

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
        return "strong";
      }
      if (strength >= 2) {
        lowV.value = 0;
        mediumV.value = withSpring(100, DefaultSpringConfig);
        strongV.value = 0;
        return "medium";
      }
      if (strength === 1) {
        lowV.value = withSpring(100, DefaultSpringConfig);
        mediumV.value = 0;
        strongV.value = 0;
        return "low";
      }
      lowV.value = 0;
      mediumV.value = 0;
      strongV.value = 0;
      return null;
    };
    setPasswordState(validatePassword(password));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password]);

  const animatedLowStyle = useAnimatedStyle(() => {
    return {
      width: `${lowV.value}%`,
    };
  });
  const animatedMediumStyle = useAnimatedStyle(() => {
    return {
      width: `${mediumV.value}%`,
    };
  });
  const animatedStrongStyle = useAnimatedStyle(() => {
    return {
      width: `${strongV.value}%`,
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
          value={password}
          onChange={event => setPassword(event.nativeEvent.text)}
          style={tailwind.style("")}
          // secureTextEntry
        />
        {focused && (
          <Animated.View
            layout={Layout.springify().stiffness(100).damping(20)}
            style={tailwind.style("flex flex-row w-full mt-3")}
          >
            <Animated.View
              entering={entering}
              style={tailwind.style("relative h-[3px] flex-1 overflow-hidden")}
            >
              <AnimatedLinearGradient
                start={{ x: -1, y: 0 }}
                end={{ x: 1, y: 0 }}
                colors={[
                  "rgba(255, 74, 17, 0)",
                  "rgba(255, 92, 82, 0.51)",
                  "rgba(255, 134, 66, 1)",
                ]}
                style={[tailwind.style("flex-1 h-full"), animatedLowStyle]}
              />
            </Animated.View>
            <Animated.View
              entering={entering}
              style={tailwind.style(
                "mx-1 relative h-[3px] flex-1 overflow-hidden",
              )}
            >
              <AnimatedLinearGradient
                start={{ x: -1, y: 0 }}
                end={{ x: 1, y: 0 }}
                colors={[
                  "rgba(242, 120, 31, 0)",
                  "rgba(252, 145, 67, 0.51)",
                  "rgba(255, 179, 66, 1)",
                ]}
                style={[tailwind.style("flex-1 h-full"), animatedMediumStyle]}
              />
            </Animated.View>

            <Animated.View
              entering={entering}
              style={tailwind.style("relative h-[3px] flex-1 overflow-hidden")}
            >
              <AnimatedLinearGradient
                start={{ x: -1, y: 0 }}
                end={{ x: 1, y: 0 }}
                colors={[
                  "rgba(104, 233, 92, 0)",
                  "rgba(61, 213, 103, 0.59)",
                  "rgba(120, 222, 111, 1)",
                ]}
                style={[tailwind.style("flex-1 h-full"), animatedStrongStyle]}
              />
            </Animated.View>
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
