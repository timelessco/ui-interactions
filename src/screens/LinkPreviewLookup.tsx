import { useState } from "react";
import { Dimensions, Image, Pressable, StyleSheet, Text } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { FadeIn, FadeOut, runOnJS } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import tailwind from "twrnc";

const SCREEN_WIDTH = Dimensions.get("screen").width;
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const options = [{ title: "Copy" }, { title: "Share" }, { title: "Open" }];
type DataProps = {
  blurhash: string;
  url: string;
  title: string;
  image: string;
};
const data: DataProps[] = [
  {
    blurhash: "UCS~9p:a+O~D?vVuxarFo{b[X+oy^kaKkVtQ",
    url: "https://uiw.tf/link-preview",
    title: "Link Preview",
    image: "https://api.pikwy.com/web/648169af9244bb5f602acade.jpg",
  },
  {
    blurhash: "U12~P~_4-9?I-A-7-C-X=%-X$z$f-W-V-C-W",
    url: "https://vercel.com/",
    title: "Vercel Docs",
    image: "https://api.pikwy.com/web/64808ab65f16fd7f9459cbcf.jpg",
  },
  {
    blurhash: "UPRW3j?c-o-:p2xAkDS%x@Rjn-ah~AJDWAjD",
    url: "https://docs.expo.dev/",
    title: "Expo Docs",
    image: "https://api.pikwy.com/web/64816bf3cc90ba608d3153a2.jpg",
  },
];

type LinkPreviewProps = {
  value: DataProps;
  setPreviewOpen: React.Dispatch<React.SetStateAction<number>>;
  index: number;
};

const LinkPreview = ({ value, setPreviewOpen, index }: LinkPreviewProps) => {
  const longPress = Gesture.LongPress()
    .onStart(event => {
      console.log("%c⧭", "color: #d0bfff", event);
      runOnJS(setPreviewOpen)(index);
    })
    .onEnd(event => {
      console.log("%c⧭", "color: #cc0036", event);
    });

  return (
    <GestureDetector gesture={longPress}>
      <Animated.View style={tailwind.style("relative")}>
        <Animated.View
          entering={FadeIn.springify()}
          exiting={FadeOut}
          style={tailwind.style("relative px-4 py-4 z-0")}
        >
          <Text style={tailwind.style("text-xl font-semibold tracking-wide")}>
            {value.title}
          </Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
};

export const LinkPreviewLookup = () => {
  const [previewOpen, setPreviewOpen] = useState(-1);
  const gesturePan = Gesture.Pan()
    .manualActivation(true)
    .onStart(event => {
      console.log("%c⧭", "color: #d0bfff", event);
    })
    .onChange(event => {
      console.log("%c⧭", "color: #cc0036", event);
    })
    .onEnd(event => {
      console.log("%c⧭", "color: #cc0036", event);
    });
  return (
    <SafeAreaView style={tailwind.style("flex-1")}>
      <Animated.View style={tailwind.style("absolute inset-0 z-0")}>
        <Image
          style={tailwind.style("h-full w-full")}
          source={require("../assets/pull-action-bg-2.jpg")}
        />
      </Animated.View>
      <Animated.View style={tailwind.style("overflow-visible")}>
        {data.map((value, index) => {
          return (
            <LinkPreview
              key={value.title}
              {...{ value, setPreviewOpen, index }}
            />
          );
        })}
      </Animated.View>

      {previewOpen !== -1 ? (
        <GestureDetector gesture={gesturePan}>
          <Animated.View
            entering={FadeIn.springify()}
            exiting={FadeOut.springify()}
            style={tailwind.style(
              "absolute inset-0 justify-center items-center py-4",
            )}
          >
            <AnimatedBlurView
              style={tailwind.style("absolute  inset-0")}
              intensity={70}
            />
            <Pressable
              onPress={() => setPreviewOpen(-1)}
              style={tailwind.style("absolute inset-0")}
            />
            <Animated.View
              style={[
                tailwind.style(`w-[${SCREEN_WIDTH - 32}px] mx-4`),
                styles.imageStyle,
              ]}
            >
              <Animated.Image
                source={{ uri: data[previewOpen].image }}
                style={tailwind.style("h-full w-full rounded-xl")}
              />
            </Animated.View>
            <Animated.View
              style={[
                tailwind.style("mx-4 mt-4 rounded-xl w-40 "),
                styles.optionsList,
              ]}
            >
              {options.map(option => {
                return (
                  <Pressable key={option.title}>
                    <Animated.View style={tailwind.style("px-4 py-3")}>
                      <Text style={tailwind.style("text-base")}>
                        {option.title}
                      </Text>
                    </Animated.View>
                  </Pressable>
                );
              })}
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  imageStyle: {
    aspectRatio: 1.34,
  },
  optionsList: {
    backgroundColor: "rgba(255,255,255,0.9)",
  },
});
