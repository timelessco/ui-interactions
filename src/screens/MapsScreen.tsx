import { useMemo, useRef } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedProps,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomSheet, {
  BottomSheetBackgroundProps,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { BlurView } from "expo-blur";
import tailwind from "twrnc";

import {
  AddIcon,
  BeachIcon,
  FurnitureIcon,
  HomeIcon,
  ParkIcon,
  TimelessIcon,
  TrainIcon,
  WorkIcon,
} from "../icons/maps";

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const favorites = [
  {
    icon: <HomeIcon />,
    title: "Home",
    subtitle: "12 mins",
    iconBg: "#FFF",
  },
  {
    icon: <WorkIcon />,
    title: "Work",
    subtitle: "24 mins",
    iconBg: "#FFF",
  },
  {
    icon: <TrainIcon />,
    title: "Transit",
    subtitle: "Nearby",
    iconBg: "#3478F6",
  },
  {
    icon: <AddIcon />,
    title: "Add",
    subtitle: " ",
    iconBg: "#EDEDED",
  },
];

const FavoritesSection = () => {
  return (
    <View style={tailwind.style("pt-5")}>
      <Text style={tailwind.style("text-sm text-[#0000007A] font-normal")}>
        Favorites
      </Text>
      <View
        style={tailwind.style(
          "flex flex-row bg-white rounded-xl mt-1.5 px-1.5 py-2",
        )}
      >
        {favorites.map(item => {
          return (
            <View
              style={tailwind.style(
                "flex px-2 py-2 justify-center items-center pr-3",
              )}
              key={item.title}
            >
              <View
                style={tailwind.style(
                  "h-14 w-14 rounded-full flex justify-center items-center",
                  `bg-[${item.iconBg}]`,
                )}
              >
                {item.icon}
              </View>
              <View style={tailwind.style("pt-2")}>
                <Text
                  style={tailwind.style("text-base text-center font-normal")}
                >
                  {item.title}
                </Text>
                <Text
                  style={tailwind.style("text-sm text-center text-[#858585]")}
                >
                  {item.subtitle}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const recentItems = [
  {
    icon: <BeachIcon />,
    title: "Palavakkam Beach",
    subtitle: "Anna Salai, Chennai",
  },
  {
    icon: <FurnitureIcon />,
    title: "Sofa 33",
    subtitle: "Velachery Road, Chennai",
  },
  {
    icon: <BeachIcon />,
    title: "ECR Beach",
    subtitle: "Rajaji Avenue, Chennai",
  },
  {
    icon: <TimelessIcon />,
    title: "Timeless",
    subtitle: "Kamakoti Nagar, Pallikaranai",
  },
  {
    icon: <ParkIcon />,
    title: "Kamakoti Nagar Park",
    subtitle: "Kamakoti Nagar, Pallikaranai",
  },
  {
    icon: <BeachIcon />,
    title: "Thiruvanmiyur Beach",
    subtitle: "OMR, Chennai",
  },
  {
    icon: <BeachIcon />,
    title: "Juhu Beach",
    subtitle: "ECR, Chennai",
  },
  {
    icon: <ParkIcon />,
    title: "Semmozhi Poonga",
    subtitle: "Chennai, India",
  },
  {
    icon: <BeachIcon />,
    title: "Cliff Beach",
    subtitle: "Varkala, Kerala",
  },
];

const RecentItemsSection = () => {
  return (
    <View style={tailwind.style("pt-6")}>
      <Text style={tailwind.style("text-sm text-[#0000007A] font-normal")}>
        Recents
      </Text>
      <View style={tailwind.style("pl-4 bg-white rounded-xl mt-1.5")}>
        {recentItems.map(item => {
          return (
            <View
              key={item.title}
              style={tailwind.style(
                "py-3 flex flex-row items-center border-b-[0.5px] border-b-[#F2F2F2]",
              )}
            >
              <View style={tailwind.style("pr-3")}>{item.icon}</View>
              <View>
                <Text
                  style={tailwind.style("text-base text-[#171717] font-medium")}
                >
                  {item.title}
                </Text>
                <Text style={tailwind.style("text-sm text-[#858585]")}>
                  {item.subtitle}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const CustomBackground: React.FC<BottomSheetBackgroundProps> = () => {
  return (
    <AnimatedBlurView
      intensity={100}
      tint={"light"}
      style={tailwind.style("absolute inset-0 rounded-t-xl overflow-hidden")}
    />
  );
};

const CustomBackdrop: React.FC<BottomSheetBackgroundProps> = ({
  animatedIndex,
}) => {
  const animatedProps = useAnimatedProps(() => {
    return {
      intensity: interpolate(animatedIndex.value, [0, 1], [0, 5]),
    };
  });
  return (
    <AnimatedBlurView
      animatedProps={animatedProps}
      style={tailwind.style("absolute inset-0")}
    />
  );
};

export const MapsScreen = () => {
  // ref
  const sheetRef = useRef(null);

  // variables
  const snapPoints = useMemo(() => ["25%", "90%"], []);

  // renders
  return (
    <SafeAreaView style={styles.container}>
      <View style={tailwind.style("absolute inset-0")}>
        <Image
          source={require("../assets/maps.png")}
          style={tailwind.style("h-full w-full")}
        />
      </View>
      <BottomSheet
        ref={sheetRef}
        index={0}
        snapPoints={snapPoints}
        backgroundComponent={CustomBackground}
        backdropComponent={CustomBackdrop}
        handleStyle={tailwind.style("overflow-hidden")}
      >
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          style={tailwind.style("px-4")}
        >
          <BottomSheetTextInput
            placeholder="Search Maps"
            style={tailwind.style(
              "bg-white px-2.5 rounded-[10px] h-9 text-black text-base leading-5",
            )}
            placeholderTextColor={"#0000007A"}
          />
          <FavoritesSection />
          <RecentItemsSection />
          {/* Extra height to indicate scrolling */}
          <View style={tailwind.style("h-64")} />
        </BottomSheetScrollView>
      </BottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "grey",
  },
});
