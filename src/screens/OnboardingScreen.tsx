import { useCallback, useMemo, useRef } from "react";
import { Image, Pressable, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import BottomSheet from "@gorhom/bottom-sheet";
import { StatusBar } from "expo-status-bar";
import tailwind from "twrnc";

export const OnboardingScreen = () => {
  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // variables
  const snapPoints = useMemo(() => ["52%"], []);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);
  return (
    <View style={tailwind.style("flex-1 justify-center px-16 bg-[#141414]")}>
      <StatusBar style="dark" />
      <Animated.View style={tailwind.style("absolute inset-0")}>
        <Image
          style={tailwind.style("h-full w-full")}
          source={require("../assets/background.jpg")}
        />
      </Animated.View>
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        handleIndicatorStyle={tailwind.style("bg-white")}
      >
        <View style={tailwind.style("px-4 pt-4")}>
          <Image
            style={tailwind.style("h-20 w-20")}
            source={require("../assets/Bitmap.png")}
          />
          <Text style={tailwind.style("text-[40px] font-bold pt-8")}>
            Design from the Heart of the North
          </Text>
          <Text style={tailwind.style("text-xl font-normal pt-2 leading-6")}>
            We are inspired by the stable structures of architecture and the
            dynamics of fashion
          </Text>
          <View style={tailwind.style("flex flex-row justify-end pt-8")}>
            <Pressable
              style={tailwind.style(
                "h-11 px-3 py-2 bg-[#f76808] justify-center items-center w-1/3 rounded-xl",
              )}
            >
              <Text
                style={tailwind.style("text-[17px] font-semibold text-white")}
              >
                Continue
              </Text>
            </Pressable>
          </View>
        </View>
      </BottomSheet>
    </View>
  );
};
