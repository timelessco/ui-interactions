import Animated, {
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
} from "react-native-reanimated";
import Svg, { Defs, Path, RadialGradient, Stop } from "react-native-svg";
import { BlurView } from "expo-blur";
import tailwind from "twrnc";

type BackgroundGradientProps = {
  sv: SharedValue<number>;
};

export const BackgroundGradient = (props: BackgroundGradientProps) => {
  const { sv } = props;
  const purpleTranslationX = useDerivedValue(
    () => interpolate(sv.value, [15, 345], [-950, -1100]),
    [sv.value],
  );

  const yellowTranslationX = useDerivedValue(
    () => interpolate(sv.value, [15, 345], [-900, -600]),
    [sv.value],
  );

  const yellowTranslationY = useDerivedValue(
    () => interpolate(sv.value, [15, 345], [-350, 0]),
    [sv.value],
  );

  const blueTranslationY = useDerivedValue(
    () => interpolate(sv.value, [15, 345], [-950, -700]),
    [sv.value],
  );

  const blueTranslationX = useDerivedValue(
    () => interpolate(sv.value, [15, 345], [-80, -680]),
    [sv.value],
  );

  const purpleAnimation = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: purpleTranslationX.value,
        },
      ],
    };
  });

  const yellowAnimation = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: yellowTranslationX.value,
        },
        { translateY: yellowTranslationY.value },
      ],
    };
  });

  const blueAnimation = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: blueTranslationX.value,
        },
        { translateY: blueTranslationY.value },
      ],
    };
  });

  const lightBlueTranslationY = useDerivedValue(
    () => interpolate(sv.value, [15, 345], [-850, -1100]),
    [sv.value],
  );

  const lightBlueTranslationX = useDerivedValue(
    () => interpolate(sv.value, [15, 345], [-550, -980]),
    [sv.value],
  );

  const lightBlueAnimation = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: lightBlueTranslationX.value,
        },
        { translateY: lightBlueTranslationY.value },
      ],
    };
  });

  return (
    <Animated.View style={tailwind.style("absolute inset-0")}>
      {/* Light Blue */}
      <Animated.View
        style={[
          tailwind.style("absolute z-10"),
          // { transform: [{ translateY: -850 }, { translateX: -550 }] },
          lightBlueAnimation,
        ]}
      >
        <Svg width="1375" height="1312" viewBox="0 0 1375 1312" fill="none">
          <Path
            d="M1371.91 595.775C1403.5 956.401 1122.55 1275.61 744.378 1308.74C366.194 1341.87 34.0182 1076.38 2.42396 715.757C-29.1704 355.135 251.785 35.928 629.958 2.79333C1008.13 -30.3414 1340.31 235.145 1371.91 595.775Z"
            fill="url(#paint0_radial_6913_47627)"
          />
          <Defs>
            <RadialGradient
              id="paint0_radial_6913_47627"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(687.165 655.764) rotate(-8.84496) scale(519.343 645.952)"
            >
              <Stop offset="0.0416667" stopColor="#3B86F4" />
              <Stop offset="0.458333" stopColor="#3C85F6" />
              <Stop offset="1" stopColor="#509FF7" />
            </RadialGradient>
          </Defs>
        </Svg>
      </Animated.View>
      {/* Blue */}
      <Animated.View style={[tailwind.style("absolute z-10"), blueAnimation]}>
        <Svg width="1144" height="1092" viewBox="0 0 1144 1092" fill="none">
          <Path
            d="M1141.93 495.897C1168.23 796.072 934.368 1061.77 619.59 1089.35C304.809 1116.92 28.3131 895.941 2.01868 595.769C-24.2866 295.592 209.573 29.9007 524.355 2.32433C839.133 -25.252 1115.63 195.725 1141.93 495.897Z"
            fill="url(#paint0_radial_6913_47621)"
          />
          <Defs>
            <RadialGradient
              id="paint0_radial_6913_47621"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(571.973 545.834) rotate(-5.007) scale(949.522 1181)"
            >
              <Stop stopColor="#3B86F4" />
              <Stop offset="0.552083" stopColor="#3C85F6" />
              <Stop offset="1" stopColor="#509FF7" />
            </RadialGradient>
          </Defs>
        </Svg>
      </Animated.View>
      {/* Purple */}
      <Animated.View style={[tailwind.style("absolute"), purpleAnimation]}>
        <Svg width="1695" height="1346" viewBox="0 0 1695 1346" fill="none">
          <Path
            d="M584.141 4.50556C951.488 -43.4366 1643.68 390.137 1691.79 758.754C1739.9 1127.37 1125.7 1291.45 758.355 1339.39C391.008 1387.33 54.2151 1127.37 6.10708 758.755C-42.0009 390.137 216.793 52.4477 584.141 4.50556Z"
            fill="url(#paint0_radial_6913_47623)"
          />
          <Defs>
            <RadialGradient
              id="paint0_radial_6913_47623"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(565.395 540.177) rotate(29.5631) scale(1028.29 1197.63)"
            >
              <Stop stopColor="#AEACFF" />
              <Stop offset="0.552083" stopColor="#DEDFFF" />
              <Stop offset="1" stopColor="#231FFF" />
            </RadialGradient>
          </Defs>
        </Svg>
      </Animated.View>
      {/* Yellow */}
      <Animated.View style={[tailwind.style("absolute"), yellowAnimation]}>
        <Svg width="1532" height="1191" viewBox="0 0 1532 1191" fill="none">
          <Path
            opacity="0.5"
            d="M344.815 94.9038C-15.3282 259.355 -108.329 580.693 137.095 812.629C382.519 1044.56 673.323 1303.15 1033.47 1138.69C1393.61 974.237 1686.72 449.018 1441.29 217.083C1195.87 -14.8568 704.958 -69.5593 344.815 94.9038Z"
            fill="url(#paint0_radial_6913_47625)"
          />
          <Defs>
            <RadialGradient
              id="paint0_radial_6913_47625"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(-307.293 392.673) rotate(-136.619) scale(1014.71 2756.04)"
            >
              <Stop stopColor="#FF0000" />
              <Stop offset="0.583333" stopColor="#FF6D00" />
              <Stop offset="1" stopColor="#FF6D00" />
            </RadialGradient>
          </Defs>
        </Svg>
      </Animated.View>
      <BlurView
        intensity={100}
        style={tailwind.style("absolute inset-0 z-50")}
      />
    </Animated.View>
  );
};
