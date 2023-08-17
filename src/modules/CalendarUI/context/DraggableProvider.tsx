import React, { useState } from "react";
import { SharedValue, useSharedValue } from "react-native-reanimated";

import { CalendarEvent } from "../types/calendarTypes";

interface DraggableContextType {
  draggingItem: CalendarEvent | null;
  setDraggingItem: React.Dispatch<React.SetStateAction<CalendarEvent | null>>;
  dragY: SharedValue<number>;
  dragX: SharedValue<number>;
  positionY: SharedValue<number>;
  currentDraggingItem: SharedValue<number>;
  dropIndex: SharedValue<number>;
}

const DraggableContext = React.createContext<DraggableContextType | undefined>(
  undefined,
);

const useDraggableContext = (): DraggableContextType => {
  const context = React.useContext(DraggableContext);
  if (!context) {
    throw new Error(
      "useDraggableContext: `CalendarContext` is undefined. Seems you forgot to wrap component within the CalendarProvider",
    );
  }

  return context;
};

const DraggableProvider: React.FC<
  Partial<DraggableContextType & { children: React.ReactNode }>
> = props => {
  const { children } = props;
  const [draggingItem, setDraggingItem] = useState<CalendarEvent | null>(null);

  const dragY = useSharedValue(0);
  const dragX = useSharedValue(0);
  const positionY = useSharedValue(0);
  const currentDraggingItem = useSharedValue(0);
  const dropIndex = useSharedValue(0);

  return (
    <DraggableContext.Provider
      value={{
        draggingItem,
        setDraggingItem,
        dragY,
        dragX,
        positionY,
        currentDraggingItem,
        dropIndex,
      }}
    >
      {children}
    </DraggableContext.Provider>
  );
};

export { DraggableProvider, useDraggableContext };
