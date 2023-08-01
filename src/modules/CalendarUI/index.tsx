import { useRef } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { SharedValue } from "react-native-reanimated";
import { Path, Svg } from "react-native-svg";
import { FlashList } from "@shopify/flash-list";
import tailwind from "twrnc";

import { CAgenda } from "./components/CAgenda";
import { WeekStrip } from "./components/WeekStrip";

type CalendarUIProps = {
  selectedDate: SharedValue<string>;
};

export const CalendarIcon = () => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 8.24687C2.55817 8.24687 2.2 8.60505 2.2 9.04688C2.2 9.4887 2.55817 9.84688 3 9.84688V8.24687ZM21 9.84688C21.4418 9.84688 21.8 9.4887 21.8 9.04688C21.8 8.60505 21.4418 8.24687 21 8.24687V9.84688ZM8.8 1.79688C8.8 1.35505 8.44183 0.996875 8 0.996875C7.55817 0.996875 7.2 1.35505 7.2 1.79688H8.8ZM7.2 4.29688C7.2 4.7387 7.55817 5.09688 8 5.09688C8.44183 5.09688 8.8 4.7387 8.8 4.29688H7.2ZM16.8 1.79688C16.8 1.35505 16.4418 0.996875 16 0.996875C15.5582 0.996875 15.2 1.35505 15.2 1.79688H16.8ZM15.2 4.29688C15.2 4.7387 15.5582 5.09688 16 5.09688C16.4418 5.09688 16.8 4.7387 16.8 4.29688H15.2ZM7 3.84688H17V2.24687H7V3.84688ZM20.2 7.04688V17.0469H21.8V7.04688H20.2ZM17 20.2469H7V21.8469H17V20.2469ZM3.8 17.0469V7.04688H2.2V17.0469H3.8ZM7 20.2469C5.23269 20.2469 3.8 18.8142 3.8 17.0469H2.2C2.2 19.6978 4.34903 21.8469 7 21.8469V20.2469ZM20.2 17.0469C20.2 18.8142 18.7673 20.2469 17 20.2469V21.8469C19.651 21.8469 21.8 19.6978 21.8 17.0469H20.2ZM17 3.84688C18.7673 3.84688 20.2 5.27956 20.2 7.04688H21.8C21.8 4.39591 19.651 2.24687 17 2.24687V3.84688ZM7 2.24687C4.34903 2.24687 2.2 4.39591 2.2 7.04688H3.8C3.8 5.27956 5.23269 3.84688 7 3.84688V2.24687ZM3 9.84688H21V8.24687H3V9.84688ZM7.2 1.79688V4.29688H8.8V1.79688H7.2ZM15.2 1.79688V4.29688H16.8V1.79688H15.2ZM15.5 16.7469C14.8373 16.7469 14.3 16.2096 14.3 15.5469H12.7C12.7 17.0933 13.9536 18.3469 15.5 18.3469V16.7469ZM16.7 15.5469C16.7 16.2096 16.1627 16.7469 15.5 16.7469V18.3469C17.0464 18.3469 18.3 17.0933 18.3 15.5469H16.7ZM15.5 14.3469C16.1627 14.3469 16.7 14.8841 16.7 15.5469H18.3C18.3 14.0005 17.0464 12.7469 15.5 12.7469V14.3469ZM15.5 12.7469C13.9536 12.7469 12.7 14.0005 12.7 15.5469H14.3C14.3 14.8841 14.8373 14.3469 15.5 14.3469V12.7469Z"
        fill="black"
      />
    </Svg>
  );
};

export const CalendarUI = (props: CalendarUIProps) => {
  const { selectedDate } = props;
  const aref = useRef<FlashList<string>>(null);

  // const goToToday = () => {};

  return (
    <View style={tailwind.style("flex-1")}>
      <Animated.View
        style={[
          tailwind.style("flex-row items-center justify-between py-2.5 px-4"),
        ]}
      >
        <Text style={tailwind.style("text-3xl font-bold text-black")}>
          Calendar
        </Text>
        <Pressable>
          <Animated.View style={[tailwind.style("p-2 shadow-xl z-50")]}>
            <CalendarIcon />
          </Animated.View>
        </Pressable>
      </Animated.View>
      <WeekStrip {...{ selectedDate }} />
      <CAgenda {...{ selectedDate, aref }} />
    </View>
  );
};
