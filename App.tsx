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

const Stack = createSharedElementStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <SafeAreaProvider style={tailwind.style('flex-1')}>
      <NavigationContainer>
        <StatusBar barStyle={'dark-content'} />
        <Stack.Navigator headerMode={'none'}>
          <Stack.Screen name="List" component={MoviesUI} />
          <Stack.Screen
            name="Details"
            component={MovieDetails}
            options={() => ({
              gestureEnabled: false,
              transitionSpec: {
                open: TransitionSpecs.TransitionIOSSpec,
                close: TransitionSpecs.TransitionIOSSpec,
              },
              cardOverlayEnabled: true,
              cardStyleInterpolator: ({current: {progress}}) => {
                return {
                  cardStyle: {
                    opacity: progress,
                  },
                };
              },
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
