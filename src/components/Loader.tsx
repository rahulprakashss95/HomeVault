import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

type ILoader = {
  loading: boolean;
};

const Loader = (props: ILoader) => {
  const { loading } = props;
  const { colors } = useTheme();

  if (!loading) {
    return null;
  }

  return (
    <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
});

export default Loader;
