import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { ThemeColors } from "../utils/Color";

export type BarDatum = {
  label: string;
  value: number;
};

type IBarList = {
  data: BarDatum[];
  /** Single hue — this encodes magnitude, not identity, so bars never cycle colors. */
  color: string;
  formatValue: (value: number) => string;
};

/**
 * Ranked horizontal bars. Every row is directly labelled with its category and
 * value, so meaning never rests on colour alone and no legend is needed.
 */
const BarList = ({ data, color, formatValue }: IBarList) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const rows = useMemo(
    () => [...data].sort((a, b) => b.value - a.value),
    [data]
  );

  // Scale against the largest bar. Guard against an all-zero dataset.
  const max = rows.length ? rows[0].value : 0;

  if (!rows.length) {
    return <Text style={styles.empty}>No data yet</Text>;
  }

  return (
    <View>
      {rows.map((row) => {
        const ratio = max > 0 ? row.value / max : 0;
        return (
          <View key={row.label} style={styles.row}>
            <View style={styles.labelRow}>
              <Text style={styles.label} numberOfLines={1}>
                {row.label}
              </Text>
              <Text style={styles.value}>{formatValue(row.value)}</Text>
            </View>
            <View style={styles.track}>
              <View
                style={[
                  styles.bar,
                  // Percentage width keeps the bar correct at any card width.
                  { width: `${Math.max(ratio * 100, 1)}%`, backgroundColor: color },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: {
      marginBottom: 14,
    },
    labelRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: 6,
    },
    label: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
      marginRight: 12,
    },
    value: {
      fontSize: 13,
      fontWeight: "600",
      // Values wear text ink, never the series colour.
      color: colors.textMuted,
      fontVariant: ["tabular-nums"],
    },
    track: {
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.chartTrack,
      overflow: "hidden",
    },
    bar: {
      height: 8,
      borderRadius: 4,
    },
    empty: {
      fontSize: 14,
      color: colors.textMuted,
    },
  });

export default BarList;
