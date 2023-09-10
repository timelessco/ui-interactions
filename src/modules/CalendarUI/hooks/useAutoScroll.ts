import {
  runOnJS,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  LIST_ITEM_HEIGHT,
  PAGE_HEADER,
  SCREEN_HEIGHT,
  SECTION_HEADER_HEIGHT,
  WEEK_STRIP,
} from "../constants";
import { useAnimatedValues } from "../context/AnimatedValues";
import { useDraggableContext } from "../context/DraggableProvider";
import { useRefsContext } from "../context/RefsProvider";

const SCROLL_POSITION_TOLERANCE = 2;

export function useAutoScroll() {
  const { agendaListRef: flatlistRef } = useRefsContext();
  const { top } = useSafeAreaInsets();

  const topThreshold = top + PAGE_HEADER + WEEK_STRIP;
  const bottomThreshold =
    SCREEN_HEIGHT - (SECTION_HEADER_HEIGHT + LIST_ITEM_HEIGHT);

  const autoscrollThreshold = 30;
  const autoscrollSpeed = 100;

  const {
    scrollOffset,
    // scrollViewSize,
    // containerSize,
    currentHoverOffset,
    setAutoScrolling,
    autoScrolling,
  } = useAnimatedValues();
  const { currentDraggingItem: activeIndexAnim } = useDraggableContext();

  const scrollTarget = useSharedValue(0);

  // Check if the scroll top is reached
  // const isScrolledUp = useDerivedValue(() => {
  //   return scrollOffset.value - SCROLL_POSITION_TOLERANCE <= 0;
  // }, []);

  // Check if the scroll bottom is reached
  // const isScrolledDown = useDerivedValue(() => {
  //   return (
  //     scrollOffset.value + containerSize.value + SCROLL_POSITION_TOLERANCE >=
  //     scrollViewSize.value
  //   );
  // }, []);

  // The distance to top edge
  const distToTopEdge = useDerivedValue(() => {
    return Math.max(0, currentHoverOffset.value - topThreshold);
  }, []);

  // The distance to bottom edge
  const distToBottomEdge = useDerivedValue(() => {
    return Math.max(0, bottomThreshold - currentHoverOffset.value);
  }, []);

  // Check if top has reached
  const isAtTopEdge = useDerivedValue(() => {
    return distToTopEdge.value <= autoscrollThreshold;
  }, []);

  // Check if bottom has reached
  const isAtBottomEdge = useDerivedValue(() => {
    return distToBottomEdge.value <= autoscrollThreshold;
  }, []);

  useAnimatedReaction(
    () => activeIndexAnim.value,
    (nextVal, prevVal) => {
      if (nextVal !== prevVal) {
        scrollTarget.value = scrollOffset.value;
      }
    },
  );

  const shouldAutoScroll = useDerivedValue(() => {
    if (autoScrolling) {
      return false;
    }
    const scrollTargetDiff = Math.abs(scrollTarget.value - scrollOffset.value);
    const hasScrolledToTarget = scrollTargetDiff < SCROLL_POSITION_TOLERANCE;

    const isAtEdge = isAtTopEdge.value || isAtBottomEdge.value;

    // const topDisabled = isAtTopEdge.value && isScrolledUp.value;
    // const bottomDisabled = isAtBottomEdge.value && isScrolledDown.value;

    // this case when the scroll view has scrolled to the end on
    // either directions
    // const isEdgeDisabled = topDisabled || bottomDisabled;

    const cellIsActive = activeIndexAnim.value > 0;

    return hasScrolledToTarget && isAtEdge && cellIsActive;
  }, []);

  function scrollToInternal(offset: number) {
    if (flatlistRef && "current" in flatlistRef) {
      setAutoScrolling(true);
      flatlistRef.current?.scrollToOffset({ offset, animated: true });
    }
  }

  useDerivedValue(() => {
    if (!shouldAutoScroll.value) {
      // scrollTarget.value = scrollOffset.value;
      return;
    } else {
      const distFromEdge = isAtTopEdge.value
        ? distToTopEdge.value
        : distToBottomEdge.value;
      const speedPct = 1 - distFromEdge / autoscrollThreshold!;
      const offset = speedPct * autoscrollSpeed;
      const targetOffset = isAtTopEdge.value
        ? scrollOffset.value - offset
        : scrollOffset.value + offset;

      scrollTarget.value = Math.round(targetOffset);

      // Reanimated scrollTo is crashing on android. use 'regular' scrollTo until figured out.
      // scrollTo(flatlistRef, 0, targetOffset, true);
      runOnJS(scrollToInternal)(scrollTarget.value);
    }
  }, []);

  return null;
}
