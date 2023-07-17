import { Text, View } from "react-native";
import Animated, { useSharedValue } from "react-native-reanimated";
import dayjs from "dayjs";
import tailwind from "twrnc";

import { CAgenda } from "./components/CalendarAgenda";
import { WeekStrip } from "./components/WeekStrip";

export const CalendarUI = () => {
  const selectedDate = useSharedValue(dayjs().format("YYYY-MM-DD"));

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
