import Svg, { Circle, Path } from "react-native-svg";

export const CloseIcon = () => {
  return (
    <Svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <Circle cx="13" cy="13" r="13" fill="black" fill-opacity="0.22" />
      <Path
        d="M17.8 8.19971L8.20001 17.7997"
        stroke="white"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M8.20001 8.19971L17.8 17.7997"
        stroke="white"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </Svg>
  );
};
