import { ActivityIndicator, View } from "react-native";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";

import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from "./src/screens/HomeScreen";
import DepositScreen from "./src/screens/DepositScreen";
import FixedDepositListScreen from "./src/screens/FixedDepositListScreen";
import FixedDepositAddEditScreen from "./src/screens/FixedDepositAddEditScreen";
import OverviewScreen from "./src/screens/OverviewScreen";
import ClientScreen from "./src/screens/ClientScreen";
import CryptoPortfolioPage from "./src/screens/CryptoScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import HeaderActions from "./src/components/HeaderActions";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Deposit: undefined;
  Clients: undefined;
  FixedDepositList: undefined;
  FixedDepositAddEdit: any;
  OverView: undefined;
  CryptoPortfolio: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const { user, isRestoring } = useAuth();
  const { colors, isDark } = useTheme();

  const navigationTheme = {
    ...(isDark ? NavigationDarkTheme : NavigationDefaultTheme),
    colors: {
      ...(isDark ? NavigationDarkTheme : NavigationDefaultTheme).colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
    },
  };

  // Wait for the persisted session before deciding which stack to show,
  // otherwise the login screen flashes on every cold start.
  if (isRestoring) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {user == null ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: "Login" }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={({ navigation }) => ({
                title: "Home",
                headerRight: () => <HeaderActions navigation={navigation} />,
              })}
            />
            <Stack.Screen
              name="Deposit"
              component={DepositScreen}
              options={{ title: "Deposits" }}
            />
            <Stack.Screen
              name="Clients"
              component={ClientScreen}
              options={{ title: "Clients" }}
            />
            <Stack.Screen
              name="FixedDepositList"
              component={FixedDepositListScreen}
              options={{ title: "Fixed Deposits" }}
            />
            <Stack.Screen
              name="FixedDepositAddEdit"
              component={FixedDepositAddEditScreen}
              options={{ title: "Fixed Deposit" }}
            />
            <Stack.Screen
              name="OverView"
              component={OverviewScreen}
              options={{ title: "Overview" }}
            />
            <Stack.Screen
              name="CryptoPortfolio"
              component={CryptoPortfolioPage}
              options={{ title: "Crypto" }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ title: "Settings" }}
            />
          </>
        )}
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
