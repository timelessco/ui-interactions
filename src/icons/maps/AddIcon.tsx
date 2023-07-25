import Svg, { G, Path } from "react-native-svg";

type AddIconProps = {
  stroke?: string;
};

export const AddIcon = ({ stroke = "#3478F6" }: AddIconProps) => {
  return (
    <Svg width="34" height="34" viewBox="0 0 34 34" fill="none">
      <G id="e-add 1">
        <G id="Group">
          <Path
            id="Vector"
            d="M16.9204 7.2001V26.8001"
            stroke={stroke}
            strokeWidth="2"
            strokeMiterlimit="10"
            strokeLinecap="round"
          />
          <Path
            id="Vector_2"
            d="M26.7204 17.0001H7.12036"
            stroke={stroke}
            strokeWidth="2"
            strokeMiterlimit="10"
            strokeLinecap="round"
          />
        </G>
      </G>
    </Svg>
  );
};
