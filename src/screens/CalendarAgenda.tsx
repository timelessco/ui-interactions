import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import tailwind from "twrnc";

import { CalendarUI } from "../modules/CalendarUI";

export const CalendarAgenda = () => {
  return (
    <SafeAreaView style={tailwind.style("flex-1 bg-white")}>
      <StatusBar barStyle={"dark-content"} />
      <CalendarUI />
    </SafeAreaView>
  );
};
