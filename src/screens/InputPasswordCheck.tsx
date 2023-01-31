import React, { useEffect, useState } from "react";
import { Text, TextInput, View } from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
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
  const [passwordState, setPasswordState] = useState<
    "low" | "medium" | "strong" | null
  >(null);
  const lowV = useSharedValue(0);
  const mediumV = useSharedValue(0);
  const strongV = useSharedValue(0);
  const [password, setPassword] = useState("");

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
    <View style={tailwind.style("flex-1 justify-center bg-gray-100")}>
      <View style={tailwind.style("bg-white mx-3 rounded-xl px-4 py-[14px]")}>
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
            entering={FadeInDown}
            style={tailwind.style("flex flex-row w-full mt-3")}
          >
            <Animated.View
              style={tailwind.style(
                "relative h-[3px] flex-1 bg-[#E4E3E2] overflow-hidden",
              )}
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
              style={tailwind.style(
                "mx-1 relative h-[3px] flex-1 bg-[#E4E3E2] overflow-hidden",
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
              style={tailwind.style(
                "relative h-[3px] flex-1 bg-[#E4E3E2] overflow-hidden",
              )}
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
      </View>
      <Animated.Text
        style={tailwind.style("mt-3 px-5 text-base font-normal text-[#63605F]")}
      >
        Include atleast <Text>8 characters</Text>, <Text>numbers</Text>,{" "}
        <Text>letters</Text>, <Text>special characters</Text>.
      </Animated.Text>
    </View>
  );
};
