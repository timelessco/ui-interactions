import { Dimensions, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Blur,
  Canvas,
  Circle,
  Group,
  rect,
  rrect,
} from "@shopify/react-native-skia";
import tailwind from "twrnc";

const width = Dimensions.get("screen").width;
const height = 180;
const padding = 32;

export const PortfolioHealthCard = () => {
  const { top } = useSafeAreaInsets();
  const cRadius = useSharedValue(128);
  const r = 8;
  const roundedRect = rrect(
    rect(padding, top, width - padding * 2, height),
    r,
    r,
  );

  return (
    <View style={tailwind.style("flex-1 bg-white")}>
      <Canvas style={tailwind.style("flex-1")}>
        <Group clip={roundedRect}>
          <Group>
            <Circle
              cx={cRadius.value}
              cy={cRadius.value}
              r={cRadius.value}
              color="#FF1001"
            />
            <Blur blur={40} />
          </Group>
          <Group blendMode={"exclusion"}>
            <Circle
              cx={cRadius.value * 3}
              cy={cRadius.value}
              r={cRadius.value}
              color="#35B721"
            />
            <Blur blur={45} />
          </Group>
        </Group>
      </Canvas>
    </View>
  );
};
