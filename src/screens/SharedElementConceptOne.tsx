import React from "react";
import { createSharedElementStackNavigator } from "react-navigation-shared-element";
import { StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { TransitionSpecs } from "@react-navigation/stack";

import MoviesUI from "../modules/MoviesUI";
import { MoviesList } from "../modules/MoviesUI/data";
import MovieDetails from "../modules/MoviesUI/MovieDetails";

export type RootStackParamList = {
  List: undefined;
  Details: { item: MoviesList };
};

const sharedElementTransition: typeof TransitionSpecs.TransitionIOSSpec = {
  animation: "spring",
  config: {
    mass: 1,
    damping: 23,
    stiffness: 189,
  },
};

const Stack = createSharedElementStackNavigator<RootStackParamList>({});

export const SharedElementConceptOne = () => {
  return (
    <NavigationContainer independent>
      <StatusBar barStyle={"dark-content"} />
      <Stack.Navigator mode="modal" headerMode={"none"}>
        <Stack.Screen name="List" component={MoviesUI} />
        <Stack.Screen
          name="Details"
          component={MovieDetails}
          options={() => ({
            gestureEnabled: false,
            transitionSpec: {
              open: sharedElementTransition,
              close: sharedElementTransition,
            },
            cardOverlayEnabled: true,
            cardShadowEnabled: false,
            cardStyleInterpolator: ({ current: { progress: opacity } }) => {
              return { cardStyle: { opacity } };
            },
            cardStyle: {
              backgroundColor: "rgba(255,255,255,0.9)",
            },
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
