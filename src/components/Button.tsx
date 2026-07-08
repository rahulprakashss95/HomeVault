import {
  TouchableHighlight,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useMemo } from "react";
import { useTheme } from "../context/ThemeContext";
import { ThemeColors } from "../utils/Color";

type IButton = {
  title: string;
  buttonStyle?: any;
  titleStyle?: any;
  /** Swaps the label for a spinner and blocks further presses. */
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

const Button = (props: IButton) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const isInteractive = !props.loading && !props.disabled;

  return (
    <TouchableHighlight
      onPress={isInteractive ? props.onPress : undefined}
      disabled={!isInteractive}
      underlayColor={colors.background}
      accessibilityRole="button"
      accessibilityLabel={props.title}
      accessibilityState={{ busy: !!props.loading, disabled: !isInteractive }}
    >
      <View
        style={[
          styles.button,
          props.buttonStyle,
          !isInteractive && styles.buttonInactive,
        ]}
      >
        {props.loading ? (
          // Rendered at the label's height so the button doesn't resize.
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={colors.onPrimary} />
          </View>
        ) : (
          <Text style={[styles.buttonText, props.titleStyle]}>
            {props.title}
          </Text>
        )}
      </View>
    </TouchableHighlight>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    button: {
      width: 200,
      alignItems: "center",
      borderRadius: 8,
      backgroundColor: colors.primary,
    },
    buttonInactive: {
      opacity: 0.7,
    },
    buttonText: {
      textAlign: "center",
      padding: 16,
      color: colors.onPrimary,
    },
    loadingRow: {
      // Matches buttonText's box (16px padding top/bottom + ~19px line height)
      // so swapping the label for a spinner doesn't change the button height.
      height: 51,
      justifyContent: "center",
    },
  });

export default Button;
