import React, { useRef } from "react";
import BottomSheet from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";

interface RefsContextType {
  agendaListRef: React.RefObject<FlashList<string>>;
  weekListRef: React.RefObject<FlashList<string>>;
  sheetRef: React.RefObject<BottomSheet>;
}

const RefsContext = React.createContext<RefsContextType | undefined>(undefined);

const useRefsContext = (): RefsContextType => {
  const context = React.useContext(RefsContext);
  if (!context) {
    throw new Error(
      "useRefsContext: `RefsContext` is undefined. Seems you forgot to wrap component within the CalendarProvider",
    );
  }

  return context;
};

const RefsProvider: React.FC<
  Partial<RefsContextType & { children: React.ReactNode }>
> = props => {
  const aref = useRef<FlashList<string>>(null);
  const wref = useRef<FlashList<string>>(null);
  const sheetRef = useRef<BottomSheet>(null);

  const { children } = props;

  return (
    <RefsContext.Provider
      value={{
        agendaListRef: aref,
        weekListRef: wref,
        sheetRef,
      }}
    >
      {children}
    </RefsContext.Provider>
  );
};

export { RefsProvider, useRefsContext };
