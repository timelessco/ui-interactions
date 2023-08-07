import { Pressable, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import tailwind from "twrnc";

type ValueGridProps = {
  value: string;
  title: string;
  textColor: string;
};

// const SCREEN_WIDTH = Dimensions.get("screen").width;

const ValueGrid = (props: ValueGridProps) => {
  // const cardState = useSharedValue(0);

  // const animatedStyle = useAnimatedStyle(() => {
  //   return {
  //     width: interpolate(cardState.value, [0, 1], [70, 1]),
  //   };
  // });

  return (
    <Pressable style={tailwind.style("")}>
      <Animated.View
        style={tailwind.style(
          "flex items-center px-4 py-3 bg-[#F7F7F7] rounded-xl",
        )}
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
  const array = [
    { value: "₹ 20,2 L", title: "Invested", textColor: "#343332" },
    // { value: "₹ 1.45 L", title: "Gains", textColor: "#13A277" },
    // { value: "- 1.03%", title: "XIRR", textColor: "#DC3D43" },
  ];
  return (
    <View style={tailwind.style("flex-1 justify-center bg-white px-4")}>
      <View style={tailwind.style("flex flex-row justify-between flex-wrap")}>
        {array.map(value => (
          <ValueGrid {...value} key={value.title} />
        ))}
      </View>
    </View>
  );
};
