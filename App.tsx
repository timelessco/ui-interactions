/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { enableScreens } from "react-native-screens";
import tailwind from "twrnc";

import { SharedElementConceptOne } from "./src/screens/SharedElementConceptOne";

enableScreens();

const App = () => {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView
        style={tailwind.style("flex-1 justify-center bg-gray-100")}
      >
        <SharedElementConceptOne />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

export default App;
