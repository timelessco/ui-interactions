import React from "react";
import { StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import MoviesUI from "../modules/MoviesUI";
import { MoviesList } from "../modules/MoviesUI/data";
import MovieDetails from "../modules/MoviesUI/MovieDetails";

export type RootStackParamList = {
  List: undefined;
  Details: { item: MoviesList };
};

const Stack = createStackNavigator<RootStackParamList>();

export const SharedElementConceptOne = () => {
  return (
    <NavigationContainer independent>
      <StatusBar barStyle={"dark-content"} />
      <Stack.Navigator>
        <Stack.Screen
          options={{ headerShown: false }}
          name="List"
          component={MoviesUI}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="Details"
          component={MovieDetails}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
