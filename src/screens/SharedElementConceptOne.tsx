import React from "react";
import { createSharedElementStackNavigator } from "react-navigation-shared-element";
import { Easing, StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";

import MoviesUI from "../modules/MoviesUI";
import { MoviesList } from "../modules/MoviesUI/data";
import MovieDetails from "../modules/MoviesUI/MovieDetails";

export type RootStackParamList = {
  List: undefined;
  Details: { item: MoviesList };
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
              open: {
                animation: "timing",
                config: {
                  duration: 400,
                  easing: Easing.bezier(0.27, 0.37, 0.01, 1.03),
                },
              },
              close: {
                animation: "timing",
                config: {
                  duration: 400,
                  easing: Easing.bezier(0.27, 0.37, 0.01, 1.03),
                },
              },
            },
            cardOverlayEnabled: true,
            cardShadowEnabled: false,
            cardStyleInterpolator: ({ current: { progress: opacity } }) => {
              return { cardStyle: { opacity } };
            },
            cardStyle: {
              backgroundColor: "rgba(255,255,255,0)",
            },
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
