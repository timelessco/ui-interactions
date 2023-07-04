import { SafeAreaView } from "react-native-safe-area-context";
import tailwind from "twrnc";

import { CalendarUI } from "../modules/CalendarUI";
import TimelineProvider from "../modules/CalendarUI/context/TimelineProvider";

export const CalendarAgenda = () => {
  return (
    <SafeAreaView style={tailwind.style("flex-1 bg-white")}>
      <TimelineProvider>
        <CalendarUI />
      </TimelineProvider>
    </SafeAreaView>
  );
};
