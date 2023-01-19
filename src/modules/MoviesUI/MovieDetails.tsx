import BottomSheet, {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import React, {useCallback, useMemo, useRef} from 'react';
import {StyleSheet} from 'react-native';
import {Text, View} from 'react-native';
import tailwind from 'twrnc';

const MovieDetails = () => {
  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // variables
  const snapPoints = useMemo(() => ['25%', '50%'], []);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  return (
    <View>
      <BottomSheet
        detached
        handleIndicatorStyle={[
          tailwind.style('w-8 h-[6px] rounded-[21px]]'),
          styles.handleStyle,
        ]}
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}>
        <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
          <Text>Awesome 🎉</Text>
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  handleStyle: {
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
});

export default MovieDetails;
