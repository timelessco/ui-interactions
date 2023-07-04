/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import { Pressable, ScrollView, StatusBar, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { enableScreens } from "react-native-screens";
import { NavigationContainer } from "@react-navigation/native";
import {
  createStackNavigator,
  StackScreenProps,
} from "@react-navigation/stack";
import tailwind from "twrnc";

import { ChevronRight } from "./src/icons/ChevronRight";
import {
  AlignInteraction1,
  AllocationSlider,
  AssetAllocation,
  CalendarAgenda,
  DynamicTabBar,
  EventCreation,
  HorizontalDialInteraction,
  ImageLightBox,
  ImageUpload,
  InputPasswordCheck,
  LinkPreviewLookup,
  MenuInteraction,
  PhotoCollection,
  PortfolioHealthCard,
  PullToAction,
  RadialControl,
  RadialMenu,
  ShareAnimationConceptScreen,
  SharedElementConceptOne,
  SharedGestureConcept,
  SpotifyScreen,
  SwipeToBuy,
  TwoPinchKnob,
  VaultInteraction,
  VolumeInteraction,
} from "./src/screens";

enableScreens();

const Stack = createStackNavigator<UIInteractionParamList>();

export type UIInteractionParamList = {
  "Pull To Action": undefined;
  "Shared Element Concept": undefined;
  "Align Interaction - 1": undefined;
  "Image Upload": undefined;
  "Input Password Check": undefined;
  "Menu Interaction": undefined;
  "Share Animation Concept": undefined;
  "Spotify Interaction": undefined;
  "UI Interactions": undefined;
  "Event Creation": undefined;
  "Share Gesture": undefined;
  "Radial Control": undefined;
  "Dynamic Tab Bar": undefined;
  "Two Pinch Knob": undefined;
  "Horizontal Dial Interaction": undefined;
  "Volume Interaction": undefined;
  "Photo Collection": undefined;
  "Swipe To Buy": undefined;
  "Vault Interaction": undefined;
  "Allocation Slider": undefined;
  "Portfolio Health Card": undefined;
  "Radial Menu": undefined;
  "Light Box": undefined;
  "LinkPreview Lookup": undefined;
  "Asset Allocation": undefined;
  "Calendar Agenda": undefined;
};

type RootStackProps = StackScreenProps<
  UIInteractionParamList,
  "UI Interactions"
>;

const RootStack = (props: RootStackProps) => {
  return (
    <SafeAreaView style={tailwind.style("flex-1")}>
      <ScrollView>
        <View
          style={tailwind.style("bg-white mx-3 rounded-[14px] overflow-hidden")}
        >
          {rootStackScreens.map((item, index) => {
            return (
              <Pressable
                style={({ pressed }) => [
                  tailwind.style(
                    `flex-row justify-between items-center px-4 min-h-13 border-[#EBEAEA] ${
                      index === 0 ? "" : "border-t-[1px]"
                    }`,
                  ),
                  pressed ? tailwind.style("bg-gray-100") : {},
                ]}
                onPress={() => props.navigation.push(item.name)}
                key={item.name}
              >
                <Text
                  style={tailwind.style("text-base text-[#151414] font-medium")}
                >
                  {item.name}
                </Text>
                <ChevronRight />
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

type screenType = {
  name: keyof UIInteractionParamList;
  component: () => JSX.Element;
};

const rootStackScreens: screenType[] = [
  {
    name: "Calendar Agenda",
    component: CalendarAgenda,
  },
  {
    name: "Asset Allocation",
    component: AssetAllocation,
  },
  {
    name: "Light Box",
    component: ImageLightBox,
  },
  {
    name: "LinkPreview Lookup",
    component: LinkPreviewLookup,
  },
  {
    name: "Pull To Action",
    component: PullToAction,
  },
  {
    name: "Allocation Slider",
    component: AllocationSlider,
  },

  {
    name: "Radial Menu",
    component: RadialMenu,
  },
  {
    name: "Shared Element Concept",
    component: SharedElementConceptOne,
  },
  {
    name: "Align Interaction - 1",
    component: AlignInteraction1,
  },
  {
    name: "Image Upload",
    component: ImageUpload,
  },
  {
    name: "Input Password Check",
    component: InputPasswordCheck,
  },
  {
    name: "Menu Interaction",
    component: MenuInteraction,
  },
  {
    name: "Share Animation Concept",
    component: ShareAnimationConceptScreen,
  },
  {
    name: "Spotify Interaction",
    component: SpotifyScreen,
  },
  {
    name: "Event Creation",
    component: EventCreation,
  },
  {
    name: "Share Gesture",
    component: SharedGestureConcept,
  },
  {
    name: "Radial Control",
    component: RadialControl,
  },
  {
    name: "Dynamic Tab Bar",
    component: DynamicTabBar,
  },
  {
    name: "Two Pinch Knob",
    component: TwoPinchKnob,
  },
  {
    name: "Horizontal Dial Interaction",
    component: HorizontalDialInteraction,
  },
  {
    name: "Volume Interaction",
    component: VolumeInteraction,
  },
  {
    name: "Photo Collection",
    component: PhotoCollection,
  },
  {
    name: "Swipe To Buy",
    component: SwipeToBuy,
  },
  {
    name: "Vault Interaction",
    component: VaultInteraction,
  },
  {
    name: "Portfolio Health Card",
    component: PortfolioHealthCard,
  },
];

const App = () => {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle={"dark-content"} />
      <GestureHandlerRootView
        style={tailwind.style("flex-1 justify-center bg-gray-100")}
      >
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="UI Interactions" component={RootStack} />
            <Stack.Screen
              name="Shared Element Concept"
              component={SharedElementConceptOne}
            />
            <Stack.Screen
              name="Align Interaction - 1"
              component={AlignInteraction1}
            />
            <Stack.Screen name="Image Upload" component={ImageUpload} />
            <Stack.Screen
              name="Input Password Check"
              component={InputPasswordCheck}
            />
            <Stack.Screen name="Menu Interaction" component={MenuInteraction} />
            <Stack.Screen
              name="Share Animation Concept"
              component={ShareAnimationConceptScreen}
            />
            <Stack.Screen
              name="Spotify Interaction"
              component={SpotifyScreen}
            />
            <Stack.Screen name="Event Creation" component={EventCreation} />
            <Stack.Screen
              name="Share Gesture"
              component={SharedGestureConcept}
            />
            <Stack.Screen name="Radial Control" component={RadialControl} />
            <Stack.Screen name="Dynamic Tab Bar" component={DynamicTabBar} />
            <Stack.Screen name="Two Pinch Knob" component={TwoPinchKnob} />
            <Stack.Screen
              name="Horizontal Dial Interaction"
              component={HorizontalDialInteraction}
            />
            <Stack.Screen
              name="Volume Interaction"
              component={VolumeInteraction}
            />
            <Stack.Screen name="Photo Collection" component={PhotoCollection} />
            <Stack.Screen name="Swipe To Buy" component={SwipeToBuy} />
            <Stack.Screen
              name="Vault Interaction"
              component={VaultInteraction}
            />
            <Stack.Screen
              name="Allocation Slider"
              component={AllocationSlider}
            />
            <Stack.Screen
              name="Portfolio Health Card"
              component={PortfolioHealthCard}
            />
            <Stack.Screen name="Radial Menu" component={RadialMenu} />
            <Stack.Screen name="Pull To Action" component={PullToAction} />
            <Stack.Screen name="Light Box" component={ImageLightBox} />
            <Stack.Screen
              name="LinkPreview Lookup"
              component={LinkPreviewLookup}
            />
            <Stack.Screen name="Asset Allocation" component={AssetAllocation} />
            <Stack.Screen name="Calendar Agenda" component={CalendarAgenda} />
          </Stack.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

export default App;
