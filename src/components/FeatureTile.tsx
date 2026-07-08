import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { ThemeColors, tint } from "../utils/Color";

type IFeatureTile = {
  title: string;
  subtitle: string;
  /** A resolved accent colour, e.g. `colors.accentBlue`. */
  accent: string;
  renderIcon: (color: string) => React.ReactNode;
  /** Omit to render a non-interactive, dimmed tile. */
  onPress?: () => void;
  /** Full width row instead of a half-width grid cell. */
  wide?: boolean;
  /** Short status label shown in place of the arrow, e.g. "Soon". */
  badge?: string;
};

const FeatureTile = (props: IFeatureTile) => {
  const { title, subtitle, accent, renderIcon, onPress, wide, badge } = props;
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const disabled = !onPress;

  const content = (
    <>
      <View
        style={[
          styles.iconChip,
          wide && styles.wideIconChip,
          { backgroundColor: tint(accent) },
        ]}
      >
        {renderIcon(accent)}
      </View>

      {wide ? (
        <View style={styles.wideText}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      ) : (
        <>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        </>
      )}

      {badge ? (
        <Text style={[styles.badge, !wide && styles.gridBadge]}>{badge}</Text>
      ) : (
        <Ionicons
          name="arrow-forward"
          size={16}
          color={colors.textMuted}
          style={wide ? styles.wideArrow : styles.gridArrow}
        />
      )}
    </>
  );

  if (disabled) {
    return (
      <View
        accessibilityLabel={badge ? `${title}, ${badge}` : title}
        style={[styles.tile, wide && styles.wideTile, styles.tileDisabled]}
      >
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.tile,
        wide && styles.wideTile,
        pressed && styles.tilePressed,
      ]}
    >
      {content}
    </Pressable>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    tile: {
      // Explicit width + the parent's space-between rather than `gap`, which
      // react-native-web 0.18 silently drops.
      width: "48%",
      minHeight: 158,
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      padding: 16,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.18,
      shadowRadius: 8,
      elevation: 2,
    },
    wideTile: {
      width: "100%",
      minHeight: 0,
      flexDirection: "row",
      alignItems: "center",
    },
    wideText: {
      flex: 1,
    },
    tilePressed: {
      opacity: 0.65,
    },
    tileDisabled: {
      opacity: 0.55,
    },
    iconChip: {
      width: 48,
      height: 48,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
    },
    wideIconChip: {
      marginBottom: 0,
      marginRight: 14,
    },
    title: {
      fontSize: 17,
      fontWeight: "600",
      color: colors.text,
    },
    subtitle: {
      fontSize: 13,
      color: colors.textMuted,
      marginTop: 3,
      lineHeight: 18,
    },
    gridArrow: {
      marginTop: "auto",
      alignSelf: "flex-end",
    },
    wideArrow: {
      marginLeft: 12,
    },
    badge: {
      marginLeft: 12,
      fontSize: 11,
      fontWeight: "600",
      letterSpacing: 0.4,
      textTransform: "uppercase",
      color: colors.textMuted,
      backgroundColor: colors.inputBackground,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
      overflow: "hidden",
    },
    gridBadge: {
      marginLeft: 0,
      marginTop: "auto",
      alignSelf: "flex-start",
    },
  });

export default FeatureTile;
