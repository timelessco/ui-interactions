import React, { useState } from "react";
import { SharedValue, useSharedValue } from "react-native-reanimated";

interface AnimatedValuesContextType {
  scrollOffset: SharedValue<number>;
  scrollViewSize: SharedValue<number>;
  containerSize: SharedValue<number>;
  currentHoverOffset: SharedValue<number>;
  autoScrolling: boolean;
  setAutoScrolling: React.Dispatch<React.SetStateAction<boolean>>;
}

const AnimatedValuesContext = React.createContext<
  AnimatedValuesContextType | undefined
>(undefined);

const useAnimatedValues = (): AnimatedValuesContextType => {
  const context = React.useContext(AnimatedValuesContext);
  if (!context) {
    throw new Error(
      "useAnimatedValues: `AnimatedValuesContext` is undefined. Seems you forgot to wrap component within the CalendarProvider",
    );
  }

  return context;
};

const AnimatedValuesProvider: React.FC<
  Partial<AnimatedValuesContextType & { children: React.ReactNode }>
> = props => {
  const { children } = props;

  const scrollOffset = useSharedValue(0);
  const scrollViewSize = useSharedValue(0);
  const containerSize = useSharedValue(0);
  const currentHoverOffset = useSharedValue(0);
  const [autoScrolling, setAutoScrolling] = useState(false);

  return (
    <AnimatedValuesContext.Provider
      value={{
        scrollOffset,
        scrollViewSize,
        containerSize,
        currentHoverOffset,
        autoScrolling,
        setAutoScrolling,
      }}
    >
      {children}
    </AnimatedValuesContext.Provider>
  );
};

export { AnimatedValuesProvider, useAnimatedValues };
