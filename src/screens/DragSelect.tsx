import { useState } from "react";
import { LayoutChangeEvent, Text } from "react-native";
import { Gesture, GestureDetector, State } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Path, Svg } from "react-native-svg";
import tailwind from "twrnc";

const IMAGE_SIZE = 80;

type SquareContainerProps = {
  gesturePanContext: SharedValue<{
    absoluteX: number;
    absoluteY: number;
    translationX: number;
    translationY: number;
    x: number;
    y: number;
  }>;
  gestureState: State;
  index: number;
  startPoint: SharedValue<number | null>;
  endPoint: SharedValue<number | null>;
  range: SharedValue<{
    a: number;
    b: number;
  }>;
  selectedList: number[];
  setSelectedList: React.Dispatch<React.SetStateAction<number[]>>;
};

const SquareContainer = ({
  gesturePanContext,
  gestureState,
  index,
  startPoint,
  endPoint,
  range,
}: SquareContainerProps) => {
  const isSelected = useSharedValue(0);
  const tileLocationContext = useSharedValue({
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    x3: 0,
    y3: 0,
    x4: 0,
    y4: 0,
  });

  const isInsideGesture = useDerivedValue(() => {
    if (gestureState === State.BEGAN || gestureState === State.ACTIVE) {
      const isInside =
        gesturePanContext.value.x >=
          Math.min(
            tileLocationContext.value.x1,
            tileLocationContext.value.x2,
            tileLocationContext.value.x3,
            tileLocationContext.value.x4,
          ) &&
        gesturePanContext.value.x <=
          Math.max(
            tileLocationContext.value.x1,
            tileLocationContext.value.x2,
            tileLocationContext.value.x3,
            tileLocationContext.value.x4,
          ) &&
        gesturePanContext.value.y >=
          Math.min(
            tileLocationContext.value.y1,
            tileLocationContext.value.y2,
            tileLocationContext.value.y3,
            tileLocationContext.value.y4,
          ) &&
        gesturePanContext.value.y <=
          Math.max(
            tileLocationContext.value.y1,
            tileLocationContext.value.y2,
            tileLocationContext.value.y3,
            tileLocationContext.value.y4,
          );
      if (isInside) {
        if (gestureState === State.BEGAN && startPoint.value === null) {
          startPoint.value = index;
        }
        endPoint.value = index;
        return withSpring(0.9);
      } else {
        return withSpring(1);
      }
    } else {
      return withSpring(1);
    }
  }, [gesturePanContext.value]);

  const handleOnLayout = (event: LayoutChangeEvent) => {
    event.target.measure((x, y) => {
      tileLocationContext.value = {
        x1: x,
        y1: y,
        x2: x + IMAGE_SIZE,
        y2: y,
        x3: x,
        y3: y + IMAGE_SIZE,
        x4: x + IMAGE_SIZE,
        y4: y + IMAGE_SIZE,
      };
    });
  };

  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: isInsideGesture.value }],
    };
  }, [gesturePanContext.value]);

  useAnimatedReaction(
    () => {
      return { range, startPoint, endPoint };
    },
    (prev, _next) => {
      const between = (x: number, a: number, b: number) => {
        return x >= Math.min(a, b) && x <= Math.max(a, b);
      };
      isSelected.value = between(index, prev.range.value.a, prev.range.value.b)
        ? 1
        : 0;
    },
  );

  const selectedStyles = useAnimatedStyle(() => {
    return {
      opacity: isSelected.value,
    };
  });

  return (
    <Animated.View
      onLayout={handleOnLayout}
      style={[
        tailwind.style("h-20 w-20 rounded-xl bg-blue-600 m-1"),
        cardStyle,
      ]}
    >
      <Text>{index}</Text>
      <Animated.View
        style={[
          tailwind.style("absolute inset-0 bg-black rounded-xl"),
          selectedStyles,
        ]}
      >
        <Svg
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="white"
          height={24}
          width={24}
        >
          <Path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
};

export const DragSelect = () => {
  const [state, setGestureState] = useState<State>(State.UNDETERMINED);
  const range = useSharedValue({ a: 0, b: 0 });
  const [selectedList, setSelectedList] = useState<number[]>([]);
  const startPoint = useSharedValue<number | null>(null);
  const endPoint = useSharedValue<number | null>(null);
  const gesturePanContext = useSharedValue({
    absoluteX: 0,
    absoluteY: 0,
    translationX: 0,
    translationY: 0,
    x: 0,
    y: 0,
  });
  const gesturePan = Gesture.Pan()
    .onBegin(event => {
      runOnJS(setGestureState)(State.BEGAN);
      gesturePanContext.value = {
        absoluteX: event.absoluteX,
        absoluteY: event.absoluteY,
        translationX: 0,
        translationY: 0,
        x: event.x,
        y: event.y,
      };
    })
    .onUpdate(event => {
      runOnJS(setGestureState)(State.ACTIVE);
      gesturePanContext.value = {
        absoluteX: event.absoluteX,
        absoluteY: event.absoluteY,
        translationX: event.translationX,
        translationY: event.translationY,
        x: event.x,
        y: event.y,
      };
    })
    .onEnd(() => {
      gesturePanContext.value = {
        absoluteX: 0,
        absoluteY: 0,
        translationX: 0,
        translationY: 0,
        x: 0,
        y: 0,
      };
      runOnJS(setGestureState)(State.END);
    })
    .onFinalize(() => {
      startPoint.value = null;
      endPoint.value = null;
    });

  const longPressPan = Gesture.LongPress()
    .onBegin(event => {
      runOnJS(setGestureState)(State.BEGAN);
      gesturePanContext.value = {
        absoluteX: event.absoluteX,
        absoluteY: event.absoluteY,
        translationX: 0,
        translationY: 0,
        x: event.x,
        y: event.y,
      };
    })
    .onTouchesUp(() => {
      gesturePanContext.value = {
        absoluteX: 0,
        absoluteY: 0,
        translationX: 0,
        translationY: 0,
        x: 0,
        y: 0,
      };
      runOnJS(setGestureState)(State.END);
    })
    .onFinalize(() => {
      startPoint.value = null;
      endPoint.value = null;
    });

  useAnimatedReaction(
    () => [startPoint.value, endPoint.value],
    (prev, _next) => {
      if (prev[0] !== null && prev[1] !== null) {
        range.value = { a: prev[0], b: prev[1] };
      }
    },
  );

  const composed = Gesture.Exclusive(gesturePan, longPressPan);

  return (
    <SafeAreaView style={tailwind.style("flex-1 bg-gray-100 items-center")}>
      <GestureDetector gesture={composed}>
        <Animated.View
          style={tailwind.style("flex flex-row flex-wrap justify-center")}
        >
          {[...Array(20).keys()].map(item => {
            return (
              <SquareContainer
                selectedList={selectedList}
                setSelectedList={setSelectedList}
                range={range}
                startPoint={startPoint}
                endPoint={endPoint}
                index={item}
                key={item}
                gesturePanContext={gesturePanContext}
                gestureState={state}
              />
            );
          })}
        </Animated.View>
      </GestureDetector>
    </SafeAreaView>
  );
};
