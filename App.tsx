/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import { Pressable, StatusBar, Text, View } from "react-native";
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
  DynamicTabBar,
  EventCreation,
  HorizontalDialInteraction,
  ImageUpload,
  InputPasswordCheck,
  MenuInteraction,
  RadialControl,
  ShareAnimationConceptScreen,
  SharedElementConceptOne,
  SharedGestureConcept,
  SpotifyScreen,
  TwoPinchKnob,
  VolumeInteraction,
} from "./src/screens";

enableScreens();

const Stack = createStackNavigator<UIInteractionParamList>();

export type UIInteractionParamList = {
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
};

type RootStackProps = StackScreenProps<
  UIInteractionParamList,
  "UI Interactions"
>;

const RootStack = (props: RootStackProps) => {
  return (
    <SafeAreaView style={tailwind.style("flex-1 bg-[#F4F2F1]")}>
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
    </SafeAreaView>
  );
};

type screenType = {
  name: keyof UIInteractionParamList;
  component: () => JSX.Element;
};

const rootStackScreens: screenType[] = [
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
];

const App = () => {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle={"dark-content"} />
      <GestureHandlerRootView
        style={tailwind.style("flex-1 justify-center bg-gray-100")}
      >
        <NavigationContainer>
          <Stack.Navigator headerMode="none">
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
          </Stack.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

export default App;
