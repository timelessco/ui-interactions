import React from "react";
import { StatusBar } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import dayjs from "dayjs";
import tailwind from "twrnc";

import { CalendarUI } from "../modules/CalendarUI";
import { AddEventBottomSheet } from "../modules/CalendarUI/components/AddEventBottomSheet";

export const CalendarAgenda = () => {
  const selectedDate = useSharedValue(dayjs().format("YYYY-MM-DD"));

  return (
    <SafeAreaView edges={["top"]} style={tailwind.style("flex-1 bg-white")}>
      <StatusBar barStyle="dark-content" />
      <CalendarUI selectedDate={selectedDate} />
      <AddEventBottomSheet selectedDate={selectedDate} />
    </SafeAreaView>
  );
};
