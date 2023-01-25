/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React from 'react';
import {StatusBar} from 'react-native';

import {NavigationContainer} from '@react-navigation/native';
import {TransitionSpecs} from '@react-navigation/stack';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {enableScreens} from 'react-native-screens';
import {createSharedElementStackNavigator} from 'react-navigation-shared-element';
import tailwind from 'twrnc';
import MoviesUI from './src/modules/MoviesUI';
import {MoviesList} from './src/modules/MoviesUI/data';
import MovieDetails from './src/modules/MoviesUI/MovieDetails';

enableScreens();

export type RootStackParamList = {
  List: undefined;
  Details: {item: MoviesList};
};

const sharedElementTransition: typeof TransitionSpecs.TransitionIOSSpec = {
  animation: 'spring',
  config: {
    mass: 1,
    damping: 23,
    stiffness: 189,
  },
};

const Stack = createSharedElementStackNavigator<RootStackParamList>({});

const App = () => {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={tailwind.style('flex-1')}>
        <NavigationContainer>
          <StatusBar barStyle={'dark-content'} />
          <Stack.Navigator mode="modal" headerMode={'none'}>
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
                cardStyleInterpolator: ({current: {progress: opacity}}) => {
                  return {cardStyle: {opacity}};
                },
                cardStyle: {
                  backgroundColor: 'rgba(255,255,255,0.9)',
                },
              })}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

export default App;
