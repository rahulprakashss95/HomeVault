import { View, StyleSheet } from "react-native";
import { useMemo } from "react";
import { useTheme } from "../context/ThemeContext";
import { ThemeColors } from "../utils/Color";

type ICard = {
  children: React.ReactNode;
  customStyle?: any;
};

const Card = (props: ICard) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return <View style={[styles.card, props.customStyle]}>{props.children}</View>;
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 6,
      padding: 16,
      margin: 16,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 3,
    },
  });

export default Card;
