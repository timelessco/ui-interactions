import React, { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DraggableFlatList, {
  OpacityDecorator,
  RenderItemParams,
  ScaleDecorator,
  ShadowDecorator,
} from "react-native-draggable-flatlist";

import { Item, mapIndexToData } from "../utils";

const NUM_ITEMS = 100;

const initialData: Item[] = [...Array(NUM_ITEMS)].map(mapIndexToData);

export const DNDFlatlist = () => {
  const [data, setData] = useState(initialData);
  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<Item>) => {
      const extendedStyle = {
        backgroundColor: isActive ? "blue" : item.backgroundColor,
      };
      return (
        <ShadowDecorator>
          <ScaleDecorator>
            <OpacityDecorator>
              <TouchableOpacity
                activeOpacity={1}
                onLongPress={drag}
                disabled={isActive}
                style={[styles.rowItem, extendedStyle]}
              >
                <Text style={styles.text}>{item.text}</Text>
              </TouchableOpacity>
            </OpacityDecorator>
          </ScaleDecorator>
        </ShadowDecorator>
      );
    },
    [],
  );

  return (
    <DraggableFlatList
      data={data}
      onDragEnd={({
        // eslint-disable-next-line @typescript-eslint/no-shadow
        data,
      }) => setData(data)}
      keyExtractor={item => item.key}
      renderItem={renderItem}
      renderPlaceholder={() => <View style={styles.placeholder} />}
    />
  );
};

const styles = StyleSheet.create({
  rowItem: {
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  placeholder: { flex: 1, backgroundColor: "tomato" },
});
