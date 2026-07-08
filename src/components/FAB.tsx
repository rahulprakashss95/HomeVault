import { StyleSheet, TouchableHighlight, View } from "react-native";
import React, { useMemo } from "react";
import { AntDesign } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { ThemeColors } from "../utils/Color";

type IFAB = {
  onPress: () => void;
  accessibilityLabel?: string;
};

const FAB = (props: IFAB) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <TouchableHighlight
      style={styles.container}
      onPress={props.onPress}
      underlayColor={colors.primary}
      accessibilityRole="button"
      accessibilityLabel={props.accessibilityLabel ?? "Add"}
    >
      <View style={styles.button}>
        <AntDesign name="plus" size={24} color={colors.onPrimary} />
      </View>
    </TouchableHighlight>
  );
};

export default FAB;

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      justifyContent: "center",
      alignItems: "center",
      position: "absolute",
      bottom: 16,
      right: 16,
      borderRadius: 50,
      width: 60,
      height: 60,
      backgroundColor: colors.primary,
    },
    button: {
      width: 60,
      height: 60,
      borderRadius: 50,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },
  });
