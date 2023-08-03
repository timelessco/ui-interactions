import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import tailwind from "twrnc";

import { AddIcon } from "../../../icons/maps";
import { useCalendarContext } from "../context/CalendarProvider";
import { useCalendarState } from "../context/useCalendarState";
import { CalendarEvent } from "../types/calendarTypes";

/**
 * "If you pass a string to this function, it will return a string."
 *
 * The type annotation for the date parameter of the formatDate function describes the type of the date
 * parameter as a string
 * @param {string} dateString - The date string to format.
 * @returns A string that is the date in the format of "Month Day, Year"
 */
function formatDate(dateString: string) {
  const date = new Date(dateString);
  const options = {
    month: "long",
    day: "numeric",
    weekday: "long",
  } as Intl.DateTimeFormatOptions;
  return date.toLocaleDateString("en-US", options);
}

const CalendarIcon = () => {
  return (
    <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <Path
        d="M17.5 8.33332H2.5M13.3333 1.66666V4.99999M6.66667 1.66666V4.99999M6.5 18.3333H13.5C14.9001 18.3333 15.6002 18.3333 16.135 18.0608C16.6054 17.8212 16.9878 17.4387 17.2275 16.9683C17.5 16.4335 17.5 15.7335 17.5 14.3333V7.33332C17.5 5.93319 17.5 5.23313 17.2275 4.69835C16.9878 4.22794 16.6054 3.84549 16.135 3.60581C15.6002 3.33332 14.9001 3.33332 13.5 3.33332H6.5C5.09987 3.33332 4.3998 3.33332 3.86502 3.60581C3.39462 3.84549 3.01217 4.22794 2.77248 4.69835C2.5 5.23313 2.5 5.93319 2.5 7.33332V14.3333C2.5 15.7335 2.5 16.4335 2.77248 16.9683C3.01217 17.4387 3.39462 17.8212 3.86502 18.0608C4.3998 18.3333 5.09987 18.3333 6.5 18.3333Z"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const AddEventBottomSheet = () => {
  const { selectedDate } = useCalendarContext();
  const { bottom } = useSafeAreaInsets();
  // const { animatedStyle, handlers } = useScaleAnimation();

  const eventTitle = useRef<TextInput>(null);
  const descRef = useRef<TextInput>(null);

  const [currentItem, setCurrentItem] = useState<CalendarEvent | null>(null);
  const { addItem } = useCalendarState();

  // Bottomsheet related props
  // hooks
  const sheetRef = useRef<BottomSheet>(null);

  // variables
  const snapPoints = useMemo(() => ["20%"], []);

  const handleChangeTitle = useCallback(
    (text: string) => {
      if (currentItem) {
        setCurrentItem({ ...currentItem, title: text });
      }
    },
    [currentItem],
  );
  const handleChangeDesc = useCallback(
    (text: string) => {
      if (currentItem) {
        setCurrentItem({ ...currentItem, desc: text });
      }
    },
    [currentItem],
  );

  const renderBackdrop = useCallback(
    (renderBackdropProps: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        // pressBehavior={"none"}
        {...renderBackdropProps}
        opacity={0.75}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    [],
  );

  const handleOnCloseSheet = useCallback(() => {
    descRef?.current?.blur();
    eventTitle?.current?.blur();
  }, []);

  const handleAddTodoPress = () => {
    sheetRef?.current?.snapToIndex(0);
    eventTitle?.current?.focus();
    setCurrentItem({
      id: new Date(selectedDate.value).toDateString(),
      title: "",
      desc: "",
      date: selectedDate.value,
      startTime: "",
      endTime: "",
      height: 0,
      location: "",
      type: "CalendarEvent",
    });
  };

  const goToDesc = () => {
    descRef?.current?.focus();
  };

  const handleAddItem = () => {
    if (currentItem) {
      if (currentItem.title) {
        addItem(currentItem);
        descRef.current?.blur();
        sheetRef.current?.close();
      } else {
        descRef.current?.blur();
        sheetRef.current?.close();
        setCurrentItem({
          id: new Date(selectedDate.value).toDateString(),
          title: "",
          desc: "",
          date: selectedDate.value,
          startTime: "",
          endTime: "",
          height: 0,
          location: "",
          type: "CalendarEvent",
        });
      }
    }
  };

  return (
    <>
      <Pressable onPress={handleAddTodoPress}>
        <Animated.View
          style={[
            tailwind.style(
              "absolute right-4 bg-black p-2 rounded-full shadow-xl z-50",
              `bottom-[${bottom}px]`,
            ),
          ]}
        >
          <AddIcon stroke="#FFF" />
        </Animated.View>
      </Pressable>
      <BottomSheet
        index={-1}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        ref={sheetRef}
        snapPoints={snapPoints}
        handleStyle={styles.handleStyle}
        handleIndicatorStyle={styles.handleIndicatorStyle}
        backgroundStyle={tailwind.style("bg-white")}
        onClose={handleOnCloseSheet}
      >
        <BottomSheetView style={tailwind.style("flex-1 bg-white px-5")}>
          <BottomSheetTextInput
            onChangeText={handleChangeTitle}
            placeholder="e.g., Movie marathon madness on Saturday"
            placeholderTextColor={"rgba(0,0,0,0.3)"}
            style={tailwind.style(
              "flex flex-row items-center text-base font-medium leading-tight h-10 text-black",
            )}
            onBlur={() => sheetRef?.current?.snapToIndex(-1)}
            returnKeyType="next"
            onSubmitEditing={goToDesc}
            value={currentItem?.title}
            // @ts-ignore Avoid textinput props
            ref={eventTitle}
          />
          <BottomSheetTextInput
            onChangeText={handleChangeDesc}
            placeholder="Description"
            placeholderTextColor={"rgba(0,0,0,0.3)"}
            style={tailwind.style("text-sm leading-tight h-8 text-black mt-1")}
            onBlur={() => sheetRef?.current?.snapToIndex(-1)}
            returnKeyType="done"
            onSubmitEditing={handleAddItem}
            value={currentItem?.desc}
            // @ts-ignore Avoid textinput props
            ref={descRef}
          />
          <View style={tailwind.style("flex flex-row items-center mt-6")}>
            <CalendarIcon />
            <Text style={styles.bottomSheetText}>
              {formatDate(selectedDate.value)}
            </Text>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </>
  );
};

const styles = StyleSheet.create({
  handleStyle: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: "white",
  },
  handleIndicatorStyle: {
    width: 36,
    height: 4,
  },
  bottomSheetText: {
    paddingLeft: 14,
    fontSize: 16,
    fontWeight: "400",
    color: "black",
  },
});
