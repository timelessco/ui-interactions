import React from "react";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import tailwind from "twrnc";

import { CalendarUI } from "../modules/CalendarUI";
import { AddEventBottomSheet } from "../modules/CalendarUI/components/AddEventBottomSheet";
import { CalendarProvider } from "../modules/CalendarUI/context/CalendarProvider";
import { RefsProvider } from "../modules/CalendarUI/context/RefsProvider";

export const CalendarAgenda = () => {
  return (
    <SafeAreaView edges={["top"]} style={tailwind.style("flex-1 bg-white")}>
      <StatusBar barStyle="dark-content" />
      <RefsProvider>
        <CalendarProvider>
          <CalendarUI />
          <AddEventBottomSheet />
        </CalendarProvider>
      </RefsProvider>
    </SafeAreaView>
  );
};
