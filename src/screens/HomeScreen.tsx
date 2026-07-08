import React, { useEffect, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { ThemeColors } from "../utils/Color";
import { biometricAuthentication } from "../components/BiometricAuthentication";
import FeatureTile from "../components/FeatureTile";
import { NavigationProp } from "../utils/Utils";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

type Props = {
  navigation: NavigationProp;
};

const greetingForHour = (hour: number) => {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const HomeScreen = ({ navigation }: Props) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const greeting = useMemo(() => greetingForHour(new Date().getHours()), []);

  useEffect(() => {
    // biometricAuthentication();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>{greeting}</Text>
        {!!user?.username && (
          <Text style={styles.name} numberOfLines={1}>
            {user.username}
          </Text>
        )}
      </View>

      <Text style={styles.sectionTitle}>Manage</Text>

      <View style={styles.grid}>
        <FeatureTile
          title="Deposits"
          subtitle="Fixed deposits & clients"
          accent={colors.accentBlue}
          renderIcon={(color) => (
            <FontAwesome name="credit-card" size={22} color={color} />
          )}
          onPress={() => navigation.navigate("Deposit")}
        />
        <FeatureTile
          title="Crypto"
          subtitle="Track your portfolio"
          accent={colors.accentAmber}
          renderIcon={(color) => (
            <FontAwesome name="bitcoin" size={24} color={color} />
          )}
          onPress={() => navigation.navigate("CryptoPortfolio")}
        />
      </View>

      <View style={styles.wideRow}>
        <FeatureTile
          wide
          badge="Soon"
          title="Calculator"
          subtitle="Interest & maturity"
          accent={colors.accentViolet}
          renderIcon={(color) => (
            <Ionicons name="calculator-outline" size={24} color={color} />
          )}
        />
      </View>
    </ScrollView>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
      paddingBottom: 32,
    },
    header: {
      marginTop: 8,
      marginBottom: 28,
    },
    greeting: {
      fontSize: 15,
      color: colors.textMuted,
    },
    name: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.text,
      marginTop: 2,
      textTransform: "capitalize",
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.6,
      color: colors.textMuted,
      marginBottom: 12,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    wideRow: {
      marginTop: 14,
    },
  });

export default HomeScreen;
