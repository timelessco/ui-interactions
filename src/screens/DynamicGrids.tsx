import { Dimensions, Pressable, Text, View } from "react-native";
import Animated, {
  interpolate,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import tailwind from "twrnc";

type ValueGridProps = {
  value: string;
  title: string;
  textColor: string;
  index: number;
};

const SCREEN_WIDTH = Dimensions.get("screen").width;

const PADDING = 12;

const GRID_WIDTH = (SCREEN_WIDTH - PADDING * 5) / 3;

const array = [
  { value: "₹ 20,2 L", title: "Invested", textColor: "#343332" },
  { value: "₹ 1.45 L", title: "Gains", textColor: "#13A277" },
  { value: "- 1.03%", title: "XIRR", textColor: "#DC3D43" },
];

const ValueGrid = (props: ValueGridProps) => {
  const cardState = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: interpolate(
        cardState.value,
        [0, 1],
        [GRID_WIDTH, SCREEN_WIDTH - PADDING * 2],
      ),
    };
  });

  const handlePress = () => {
    if (cardState.value) {
      cardState.value = withTiming(0);
    } else {
      cardState.value = withTiming(1);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[
        tailwind.style(props.index === array.length - 1 ? "" : "pr-3 ", "py-3"),
      ]}
    >
      <Animated.View
        style={[
          tailwind.style("flex items-center px-4 py-3 bg-[#F7F7F7] rounded-xl"),
          animatedStyle,
        ]}
      >
        <Animated.View>
          <Text
            style={tailwind.style(
              "text-base font-medium",
              `text-[${props.textColor}]`,
            )}
          >
            {props.value}
          </Text>
          <Text style={tailwind.style("text-sm font-normal text-[#63605F]")}>
            {props.title}
          </Text>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

export const DynamicGrids = () => {
  return (
    <View style={tailwind.style("flex-1 bg-white px-3")}>
      <Animated.View style={tailwind.style("h-20")} />
      <Animated.View style={tailwind.style("flex flex-row flex-wrap")}>
        {array.map((value, index) => (
          <Animated.View
            layout={Layout.overshootClamping(0).duration(250)}
            key={value.title}
          >
            <ValueGrid {...value} index={index} />
          </Animated.View>
        ))}
      </Animated.View>
    </View>
  );
};
