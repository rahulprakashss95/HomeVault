import { Pressable, Text, View, StyleSheet } from "react-native";
import { useMemo } from "react";
import moment from "moment";
import { amountFormat } from "../utils/Utils";
import { FixedDepositModel } from "../models/FixedDepositModel";
import { useTheme } from "../context/ThemeContext";
import { ThemeColors, tint } from "../utils/Color";
import { DATE_FORMAT, parseMaturity } from "../utils/deposits";

type IFDCard = {
  fixedDeposit: FixedDepositModel;
  onClickCard: (data: FixedDepositModel) => void;
};

type Status = { label: string; tone: "matured" | "active" | "none" };

const maturityStatus = (maturityDate: any): Status => {
  const maturity = parseMaturity(maturityDate);
  if (!maturity) {
    return { label: "No maturity date", tone: "none" };
  }
  if (maturity.isBefore(moment(), "day")) {
    return { label: "Matured", tone: "matured" };
  }
  return { label: `Matures ${maturity.fromNow()}`, tone: "active" };
};

const FDCard = (props: IFDCard) => {
  const { fixedDeposit, onClickCard } = props;
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const status = maturityStatus(fixedDeposit.maturityDate);
  const toneColors: Record<Status["tone"], string> = {
    active: colors.positive,
    matured: colors.accentAmber,
    none: colors.textMuted,
  };
  const toneColor = toneColors[status.tone];

  return (
    <Pressable
      onPress={() => onClickCard(fixedDeposit)}
      accessibilityRole="button"
      accessibilityLabel={`${fixedDeposit.name}, ${status.label}`}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.topRow}>
        <Text style={styles.bankName} numberOfLines={1}>
          {fixedDeposit.name}
        </Text>
        <View style={[styles.pill, { backgroundColor: tint(toneColor) }]}>
          <Text style={[styles.pillText, { color: toneColor }]}>
            {status.label}
          </Text>
        </View>
      </View>

      <Text style={styles.depositor}>
        {fixedDeposit.depositorName} · {fixedDeposit.interestPercentage}% p.a.
      </Text>

      <Text style={styles.amount}>₹ {amountFormat(fixedDeposit.amount)}</Text>
      <Text style={styles.interest}>
        + ₹ {amountFormat(fixedDeposit.interest)} interest
      </Text>

      <View style={styles.divider} />

      <View style={styles.dateRow}>
        <View>
          <Text style={styles.dateLabel}>Deposited</Text>
          <Text style={styles.dateValue}>
            {fixedDeposit.depositedDate || "—"}
          </Text>
        </View>
        <View style={styles.dateColumnEnd}>
          <Text style={styles.dateLabel}>Matures</Text>
          <Text style={styles.dateValue}>
            {parseMaturity(fixedDeposit.maturityDate)?.format(DATE_FORMAT) ??
              "—"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      padding: 16,
      marginHorizontal: 16,
      marginBottom: 14,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.18,
      shadowRadius: 8,
      elevation: 2,
    },
    cardPressed: {
      opacity: 0.65,
    },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    bankName: {
      flex: 1,
      fontSize: 17,
      fontWeight: "600",
      color: colors.text,
      marginRight: 12,
    },
    pill: {
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    pillText: {
      fontSize: 11,
      fontWeight: "600",
    },
    depositor: {
      fontSize: 13,
      color: colors.textMuted,
      marginTop: 4,
    },
    amount: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.text,
      marginTop: 12,
      fontVariant: ["tabular-nums"],
    },
    interest: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.positive,
      marginTop: 2,
      fontVariant: ["tabular-nums"],
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
      marginVertical: 14,
    },
    dateRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    dateColumnEnd: {
      alignItems: "flex-end",
    },
    dateLabel: {
      fontSize: 12,
      color: colors.textMuted,
    },
    dateValue: {
      fontSize: 14,
      color: colors.text,
      marginTop: 2,
    },
  });

export default FDCard;
