import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Path, Svg } from "react-native-svg";
import { BlurView } from "expo-blur";
import { StatusBar } from "expo-status-bar";
import tailwind from "twrnc";

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedSVG = Animated.createAnimatedComponent(Svg);

const SCREEN_WIDTH = Dimensions.get("screen").width;
const SCREEN_HEIGHT = Dimensions.get("screen").height;

const ICON_FINAL_WIDTH = (SCREEN_WIDTH - 64 - 64) / 3;
const CONTAINER_FINAL_WIDTH = SCREEN_WIDTH - 64;

export type FrappeIconProps = {
  width: string;
  height: string;
  state: SharedValue<number>;
};

export const IOSGroupAppIcons = () => {
  const state = useSharedValue(0);

  console.log("%c⧭", "color: #ace2e6", ICON_FINAL_WIDTH);
  const apps = [
    {
      title: "Gameplan",
      icon: <GamePlan width="12" height="12" state={state} />,
    },
    {
      title: "Frappe Cloud",
      icon: <Cloud width="12" height="12" state={state} />,
    },
    {
      title: "Frappe Insights",
      icon: <Insights width="12" height="12" state={state} />,
    },
    {
      title: "Frappe Helpdesk",
      icon: <HelpDesk width="12" height="12" state={state} />,
    },
    {
      title: "Frappe Drive",
      icon: <Drive width="12" height="12" state={state} />,
    },
    { title: "Frappe CRM", icon: <CRM width="12" height="12" state={state} /> },
    { title: "Frappe LMS", icon: <LMS width="12" height="12" state={state} /> },
  ];

  const animatedBlurIntensity = useAnimatedProps(() => {
    return {
      intensity: interpolate(state.value, [0, 1], [0, 80]),
    };
  });

  const handlePress = () => {
    if (state.value) {
      state.value = withSpring(0, { damping: 20, stiffness: 200 });
    } else {
      state.value = withSpring(1, { damping: 20, stiffness: 200 });
    }
  };

  const containerStyle = useAnimatedStyle(() => {
    return {
      width: interpolate(state.value, [0, 1], [60, CONTAINER_FINAL_WIDTH]),
      height: interpolate(state.value, [0, 1], [60, 400]),
      bottom: interpolate(
        state.value,
        [0, 1],
        [212, (SCREEN_HEIGHT - 400) / 2],
      ),
      right: interpolate(
        state.value,
        [0, 1],
        [32, (SCREEN_WIDTH - CONTAINER_FINAL_WIDTH) / 2],
      ),
    };
  });

  const iconWrapperStyle = useAnimatedStyle(() => {
    return {
      paddingHorizontal: interpolate(
        state.value,
        [0, 1],
        [8, (CONTAINER_FINAL_WIDTH - ICON_FINAL_WIDTH * 3) / 2 - 8],
      ),
      paddingTop: interpolate(state.value, [0, 1], [4, 0]),
    };
  });

  return (
    <View style={tailwind.style("flex-1 justify-center px-16 bg-[#141414]")}>
      <StatusBar hidden />
      <Animated.View style={tailwind.style("absolute inset-0")}>
        <Image
          style={[tailwind.style("h-full w-full"), styles.bgImage]}
          source={require("../assets/frappe/iPhoneBG.jpeg")}
        />
        <AnimatedBlurView
          tint={"dark"}
          animatedProps={animatedBlurIntensity}
          style={[StyleSheet.absoluteFillObject, tailwind.style("rounded-xl")]}
        />
      </Animated.View>
      <Animated.View
        style={[tailwind.style("absolute bottom-53 right-8"), containerStyle]}
      >
        <AnimatedPressable
          onPress={handlePress}
          style={[tailwind.style("h-full w-full")]}
        >
          <Animated.View>
            <View
              style={tailwind.style(
                "rounded-xl h-full w-full justify-center items-center overflow-hidden",
              )}
            >
              <AnimatedBlurView
                tint={"dark"}
                intensity={100}
                style={[
                  StyleSheet.absoluteFillObject,
                  tailwind.style("rounded-xl"),
                ]}
              />
              <Animated.View
                style={[
                  tailwind.style("flex flex-row flex-wrap"),
                  iconWrapperStyle,
                ]}
              >
                {apps.map((app, index) => (
                  <AppIcon {...{ app, index, state }} />
                ))}
              </Animated.View>
            </View>
            <Text
              style={tailwind.style(
                "absolute -bottom-5 text-center w-full text-[12px] text-white",
              )}
            >
              Frappe
            </Text>
          </Animated.View>
        </AnimatedPressable>
      </Animated.View>
    </View>
  );
};

const AppIcon = props => {
  const { app, index, state } = props;
  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      display: state.value ? "flex" : "none",
      opacity: interpolate(state.value, [0, 1], [0, 1]),
      width: interpolate(state.value, [0, 1], [0, ICON_FINAL_WIDTH]),
    };
  });

  const iconStyle = useAnimatedStyle(() => {
    return {
      paddingRight:
        (index + 1) % 3 === 0 ? 0 : interpolate(state.value, [0, 1], [2, 8]),
      paddingBottom: interpolate(state.value, [0, 1], [4, 16]),
    };
  });

  return (
    <Animated.View key={app.title} style={[iconStyle]}>
      {app.icon}
      <Animated.Text
        numberOfLines={1}
        style={[tailwind.style("text-center text-white"), animatedTextStyle]}
      >
        {app.title}
      </Animated.Text>
    </Animated.View>
  );
};

export const IOSGroupAppOpenedIcons = () => {
  return (
    <View style={tailwind.style("flex-1 justify-center px-16 bg-[#141414]")}>
      <Animated.View style={tailwind.style("absolute inset-0")}>
        <Image
          style={[tailwind.style("h-full w-full"), styles.bgImage]}
          source={require("../assets/frappe/iPhoneBG.jpeg")}
        />
        <AnimatedBlurView
          tint={"dark"}
          intensity={80}
          style={[StyleSheet.absoluteFillObject, tailwind.style("rounded-xl")]}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  bgImage: {
    resizeMode: "cover",
  },
});

const Cloud = ({ state }: FrappeIconProps) => {
  const animatedProps = useAnimatedProps(() => {
    return {
      width: interpolate(state.value, [0, 1], [12, ICON_FINAL_WIDTH]),
      height: interpolate(state.value, [0, 1], [12, ICON_FINAL_WIDTH]),
    };
  });
  return (
    <AnimatedSVG
      animatedProps={animatedProps}
      viewBox="0 0 101 101"
      fill="none"
    >
      <Path
        d="M75.5195 0.350098H25.5195C11.7124 0.350098 0.519531 11.543 0.519531 25.3501V75.3501C0.519531 89.1572 11.7124 100.35 25.5195 100.35H75.5195C89.3267 100.35 100.52 89.1572 100.52 75.3501V25.3501C100.52 11.543 89.3267 0.350098 75.5195 0.350098Z"
        fill="#02B5DD"
      />
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M47.5195 30.8501C42.158 30.8501 38.8562 34.088 36.9939 38.0505C34.8314 42.6731 30.0401 48.3501 23.0195 48.3501H14.5195V39.3501H23.0195C24.8367 39.3501 27.2644 37.6109 28.843 34.2343L28.8465 34.2268C31.6445 28.2706 37.5424 21.8501 47.5195 21.8501C53.794 21.8501 58.4383 24.2598 61.679 27.5836C63.5365 29.4887 64.8753 31.6299 65.8382 33.6612C69.3571 33.2072 73.6077 33.3518 77.617 34.8079C80.5955 35.8897 83.5153 37.7278 85.802 40.6432C88.0942 43.5656 89.5538 47.3202 89.9986 51.9166C90.8759 60.982 87.9156 68.1455 82.1217 72.8932C76.5441 77.4638 68.8908 79.3501 61.0195 79.3501H35.5195C23.9243 79.3501 14.5195 69.9454 14.5195 58.3501H23.5195C23.5195 64.9748 28.8948 70.3501 35.5195 70.3501H61.0195C67.6483 70.3501 72.9949 68.7364 76.4173 65.9319C79.6235 63.3047 81.6632 59.2182 81.0405 52.7836C80.7353 49.63 79.7986 47.5721 78.7205 46.1976C77.6369 44.8161 76.2123 43.873 74.5446 43.2673C71.0442 41.9959 66.8398 42.3623 64.3753 43.141L60.0214 44.5167L58.7093 40.1432C58.0775 38.037 56.9847 35.6611 55.235 33.8665C53.6007 32.1904 51.245 30.8501 47.5195 30.8501Z"
        fill="white"
      />
    </AnimatedSVG>
  );
};

const CRM = ({ state }: FrappeIconProps) => {
  const animatedProps = useAnimatedProps(() => {
    return {
      width: interpolate(state.value, [0, 1], [12, ICON_FINAL_WIDTH]),
      height: interpolate(state.value, [0, 1], [12, ICON_FINAL_WIDTH]),
    };
  });
  return (
    <AnimatedSVG
      animatedProps={animatedProps}
      viewBox="0 0 100 101"
      fill="none"
    >
      <Path
        d="M75 0.709961H25C11.1929 0.709961 0 11.9028 0 25.71V75.71C0 89.5171 11.1929 100.71 25 100.71H75C88.8071 100.71 100 89.5171 100 75.71V25.71C100 11.9028 88.8071 0.709961 75 0.709961Z"
        fill="#00ACB7"
      />
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M75.75 29.46H19.75V20.46H77.25C81.3953 20.46 84.75 23.8147 84.75 27.96V40.54C84.75 42.0264 84.1495 43.4244 83.132 44.442L83.1103 44.4637L66.25 60.87V73.47C66.25 77.6153 62.8953 80.97 58.75 80.97H45.75C41.6047 80.97 38.25 77.6153 38.25 73.47V60.87L21.3897 44.4637L21.368 44.442C20.3504 43.4244 19.75 42.0263 19.75 40.54V37.46H28.75V39.068L47.25 57.0699V71.97H57.25V57.0699L75.75 39.068V29.46Z"
        fill="white"
      />
    </AnimatedSVG>
  );
};

const Drive = ({ state }: FrappeIconProps) => {
  const animatedProps = useAnimatedProps(() => {
    return {
      width: interpolate(state.value, [0, 1], [12, ICON_FINAL_WIDTH]),
      height: interpolate(state.value, [0, 1], [12, ICON_FINAL_WIDTH]),
    };
  });
  return (
    <AnimatedSVG
      animatedProps={animatedProps}
      viewBox="0 0 100 101"
      fill="none"
    >
      <Path
        d="M75 0.350098H25C11.1929 0.350098 0 11.543 0 25.3501V75.3501C0 89.1572 11.1929 100.35 25 100.35H75C88.8071 100.35 100 89.1572 100 75.3501V25.3501C100 11.543 88.8071 0.350098 75 0.350098Z"
        fill="#09C855"
      />
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M44.244 32.8501H20V23.8501H49.1761L54.8961 32.8101H82.5V77.8501H19.79V45.3901H28.79V68.8501H73.5V41.8101H49.964L44.244 32.8501Z"
        fill="white"
      />
    </AnimatedSVG>
  );
};

const GamePlan = ({ state }: FrappeIconProps) => {
  const animatedProps = useAnimatedProps(() => {
    return {
      width: interpolate(state.value, [0, 1], [12, ICON_FINAL_WIDTH]),
      height: interpolate(state.value, [0, 1], [12, ICON_FINAL_WIDTH]),
    };
  });
  return (
    <AnimatedSVG
      animatedProps={animatedProps}
      viewBox="0 0 100 100"
      fill="none"
    >
      <Path
        d="M75 0H25C11.1929 0 0 11.1929 0 25V75C0 88.8071 11.1929 100 25 100H75C88.8071 100 100 88.8071 100 75V25C100 11.1929 88.8071 0 75 0Z"
        fill="#F9771A"
      />
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M72 36.5H21V27.5H81V74.05H61.2029L53.4792 80.8726L47.5208 74.1274L57.7971 65.05H72V36.5Z"
        fill="white"
      />
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M21 49.03H30V65.04H47.5V74.04H21V49.03Z"
        fill="white"
      />
    </AnimatedSVG>
  );
};

const HelpDesk = ({ state }: FrappeIconProps) => {
  const animatedProps = useAnimatedProps(() => {
    return {
      width: interpolate(state.value, [0, 1], [12, ICON_FINAL_WIDTH]),
      height: interpolate(state.value, [0, 1], [12, ICON_FINAL_WIDTH]),
    };
  });
  return (
    <AnimatedSVG
      animatedProps={animatedProps}
      viewBox="0 0 101 101"
      fill="none"
    >
      <Path
        d="M75.0801 0.0600586H25.0801C11.273 0.0600586 0.0800781 11.2529 0.0800781 25.0601V75.0601C0.0800781 88.8672 11.273 100.06 25.0801 100.06H75.0801C88.8872 100.06 100.08 88.8672 100.08 75.0601V25.0601C100.08 11.2529 88.8872 0.0600586 75.0801 0.0600586Z"
        fill="#0982F1"
      />
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M73.3301 33.5801H22.3301V24.5801H82.3301V43.3053L77.4972 45.8321C73.3014 48.0152 73.6365 54.1226 78.0453 55.8338C78.0459 55.8341 78.0465 55.8343 78.047 55.8345L82.3401 57.4973V77.0801H21.8301V46.0801H30.8301V68.0801H73.3401V63.5749C63.1135 58.3395 62.7597 43.3671 73.3301 37.8549V33.5801Z"
        fill="white"
      />
    </AnimatedSVG>
  );
};

const Insights = ({ state }: FrappeIconProps) => {
  const animatedProps = useAnimatedProps(() => {
    return {
      width: interpolate(state.value, [0, 1], [12, ICON_FINAL_WIDTH]),
      height: interpolate(state.value, [0, 1], [12, ICON_FINAL_WIDTH]),
    };
  });
  return (
    <AnimatedSVG
      animatedProps={animatedProps}
      viewBox="0 0 101 100"
      fill="none"
    >
      <Path
        d="M75.9902 0H25.9902C12.1831 0 0.990234 11.1929 0.990234 25V75C0.990234 88.8071 12.1831 100 25.9902 100H75.9902C89.7974 100 100.99 88.8071 100.99 75V25C100.99 11.1929 89.7974 0 75.9902 0Z"
        fill="#7A5EEE"
      />
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M49.9202 33.51H21.9902V24.51H58.9202V42.51H84.4902V78.51H21.7803V46.04H30.7803V69.51H49.9202V33.51ZM58.9202 69.51H75.4902V51.51H58.9202V69.51Z"
        fill="white"
      />
    </AnimatedSVG>
  );
};

const LMS = ({ state }: FrappeIconProps) => {
  const animatedProps = useAnimatedProps(() => {
    return {
      width: interpolate(state.value, [0, 1], [12, ICON_FINAL_WIDTH]),
      height: interpolate(state.value, [0, 1], [12, ICON_FINAL_WIDTH]),
    };
  });
  return (
    <AnimatedSVG
      animatedProps={animatedProps}
      viewBox="0 0 101 101"
      fill="none"
    >
      <Path
        d="M75.5195 0.709961H25.5195C11.7124 0.709961 0.519531 11.9028 0.519531 25.71V75.71C0.519531 89.5171 11.7124 100.71 25.5195 100.71H75.5195C89.3267 100.71 100.52 89.5171 100.52 75.71V25.71C100.52 11.9028 89.3267 0.709961 75.5195 0.709961Z"
        fill="#F9B70D"
      />
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M25.7395 34.22H21.5195V25.22H25.7395C34.287 25.22 42.5985 28.0615 49.3595 33.3158C49.3594 33.3157 49.3596 33.3159 49.3595 33.3158C49.3599 33.3161 49.3606 33.3166 49.361 33.3169L50.2695 34.0224L51.1788 33.3163C57.9277 28.0737 66.2393 25.22 74.7995 25.22H81.5195V71.77H75.7795C68.2261 71.77 60.8033 73.6442 54.1637 77.2363C54.1628 77.2368 54.1619 77.2373 54.1611 77.2377L50.277 79.3463L45.7041 76.8811C39.4992 73.5343 32.5622 71.78 25.5195 71.78H21.0195V46.77H30.0195V62.9772C36.9932 63.5898 43.786 65.6208 49.9757 68.9593L50.2646 69.1151C57.163 65.4539 64.7503 63.3319 72.5195 62.8673V34.3082C66.7744 34.7535 61.2696 36.8739 56.7002 40.4237L50.2696 45.4175L43.838 40.423C38.6593 36.398 32.2914 34.22 25.7395 34.22Z"
        fill="white"
      />
    </AnimatedSVG>
  );
};
