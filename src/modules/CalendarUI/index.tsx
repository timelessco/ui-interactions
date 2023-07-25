import { Text, View } from "react-native";
import Animated, { SharedValue } from "react-native-reanimated";
import tailwind from "twrnc";

import { CAgenda } from "./components/CAgenda";
import { WeekStrip } from "./components/WeekStrip";

type CalendarUIProps = {
  selectedDate: SharedValue<string>;
};

export const CalendarUI = (props: CalendarUIProps) => {
  const { selectedDate } = props;
  return (
    <View style={tailwind.style("flex-1")}>
      <Animated.View
        style={[tailwind.style("flex-row items-center py-2.5 px-4")]}
      >
        <Text style={tailwind.style("text-3xl font-bold text-black")}>
          Calendar
        </Text>
      </Animated.View>
      <WeekStrip {...{ selectedDate }} />
      <CAgenda {...{ selectedDate }} />
    </View>
  );
};
