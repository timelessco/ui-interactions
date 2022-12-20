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
import {SafeAreaProvider} from 'react-native-safe-area-context';
import tailwind from 'twrnc';

const App = () => {
  return (
    <SafeAreaProvider
      style={tailwind.style(
        'flex-1 bg-white justify-center items-center mx-8',
      )}>
      <StatusBar barStyle={'light-content'} />
    </SafeAreaProvider>
  );
};

export default App;
