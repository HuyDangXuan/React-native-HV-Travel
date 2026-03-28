declare module "@ptomasroos/react-native-multi-slider" {
  import { ComponentType } from "react";
  import { StyleProp, ViewStyle } from "react-native";

  export interface MultiSliderProps {
    values: number[];
    min?: number;
    max?: number;
    step?: number;
    sliderLength?: number;
    onValuesChange?: (values: number[]) => void;
    allowOverlap?: boolean;
    snapped?: boolean;
    selectedStyle?: StyleProp<ViewStyle>;
    unselectedStyle?: StyleProp<ViewStyle>;
    markerStyle?: StyleProp<ViewStyle>;
    pressedMarkerStyle?: StyleProp<ViewStyle>;
    trackStyle?: StyleProp<ViewStyle>;
    containerStyle?: StyleProp<ViewStyle>;
  }

  const MultiSlider: ComponentType<MultiSliderProps>;
  export default MultiSlider;
}
