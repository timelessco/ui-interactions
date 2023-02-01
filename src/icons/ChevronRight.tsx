import React from "react";
import { Path, Svg } from "react-native-svg";

export const ChevronRight = () => {
  return (
    <Svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="#151414"
      width={24}
      height={24}
    >
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 4.5l7.5 7.5-7.5 7.5"
      />
    </Svg>
  );
};
