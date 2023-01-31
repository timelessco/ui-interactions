/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import { Pressable, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { enableScreens } from "react-native-screens";
import { NavigationContainer } from "@react-navigation/native";
import {
  createStackNavigator,
  StackScreenProps,
} from "@react-navigation/stack";
import tailwind from "twrnc";

import {
  AlignInteraction1,
  ImageUpload,
  InputPasswordCheck,
  MenuInteraction,
  ShareAnimationConceptScreen,
  SharedElementConceptOne,
  SpotifyScreen,
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
};

type RootStackProps = StackScreenProps<
  UIInteractionParamList,
  "UI Interactions"
>;

const RootStack = (props: RootStackProps) => {
  return (
    <SafeAreaView>
      <View style={tailwind.style("bg-gray-100 px-4")}>
        {rootStackScreens.map(item => {
          return (
            <Pressable
              onPress={() => props.navigation.push(item.name)}
              key={item.name}
            >
              <Text
                style={tailwind.style("text-base text-[#171717 font-medium")}
              >
                {item.name}
              </Text>
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
];

const App = () => {
  return (
    <SafeAreaProvider>
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
          </Stack.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

export default App;
