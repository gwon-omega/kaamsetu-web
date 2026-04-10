import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  QueryClientProvider,
  QueryClient,
  MutationCache,
} from "@tanstack/react-query";
import { PaperProvider, MD3LightTheme } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Platform } from "react-native";
import { colors } from "@shram-sewa/ui-tokens";
import { useEffect } from "react";
import {
  configureAndroidNotificationChannel,
  getSupabaseClient,
  isSupabaseConfigured,
  reportAndroidMutationFailure,
  registerForPushNotificationsAsync,
  setupAndroidGlobalErrorMonitoring,
} from "../src/lib";
import { pushTokensApi } from "@shram-sewa/shared/api";

// Configure custom theme matching Shram Sewa design
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.crimson[500],
    primaryContainer: colors.crimson[100],
    onPrimaryContainer: colors.crimson[900],
    secondary: colors.gold[500],
    secondaryContainer: "#FFF8E6",
    onSecondary: colors.mountain[900],
    onSecondaryContainer: colors.mountain[700],
    surface: colors.terrain[50],
    background: colors.terrain[50],
    surfaceVariant: colors.terrain[100],
    outline: colors.terrain[300],
    onSurface: colors.mountain[700],
    onSurfaceVariant: colors.terrain[500],
    error: "#991B1B",
    onPrimary: "#FFFFFF",
  },
  roundness: 12,
};

const mutationCache = new MutationCache({
  onError: (error, variables, _context, mutation) => {
    void reportAndroidMutationFailure("react-query", error, {
      mutationKey: mutation.options.mutationKey,
      variables,
    });
  },
});

const queryClient = new QueryClient({
  mutationCache,
  defaultOptions: {
    queries: {
      networkMode: "offlineFirst",
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 15, // 15 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      networkMode: "offlineFirst",
      retry: 1,
    },
  },
});

export default function RootLayout() {
  useEffect(() => {
    setupAndroidGlobalErrorMonitoring();

    if (!isSupabaseConfigured()) {
      return;
    }

    let isMounted = true;

    const bootstrapAsync = async () => {
      try {
        const supabase = getSupabaseClient();

        await configureAndroidNotificationChannel();

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user || !isMounted) {
          return;
        }

        const pushToken = await registerForPushNotificationsAsync();
        if (!pushToken || !isMounted) {
          return;
        }

        const platform =
          Platform.OS === "ios"
            ? "ios"
            : Platform.OS === "android"
              ? "android"
              : "web";

        await pushTokensApi.register({
          token: pushToken,
          platform,
        });
      } catch (error) {
        console.warn("Notification bootstrap failed:", error);
      }
    };

    void bootstrapAsync();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <PaperProvider theme={theme}>
            <Stack
              screenOptions={{
                headerStyle: {
                  backgroundColor: "#FAF7F0",
                },
                headerTintColor: "#1C3557",
                headerTitleStyle: {
                  fontWeight: "600",
                },
                animation: "simple_push",
                animationDuration: 220,
                gestureEnabled: true,
                headerShadowVisible: false,
                contentStyle: {
                  backgroundColor: "#FAF7F0",
                },
              }}
            >
              <Stack.Screen
                name="(tabs)"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="worker/[id]"
                options={{
                  title: "Worker Details",
                  presentation: "card",
                  animation: "slide_from_right",
                  animationDuration: 220,
                }}
              />
              <Stack.Screen
                name="hire/[id]"
                options={{
                  title: "Hire Worker",
                  presentation: "modal",
                  animation: "slide_from_bottom",
                  animationDuration: 260,
                }}
              />
              <Stack.Screen
                name="login"
                options={{
                  title: "Login",
                  presentation: "modal",
                  headerShown: false,
                  animation: "fade_from_bottom",
                  animationDuration: 210,
                }}
              />
            </Stack>
            <StatusBar style="dark" />
          </PaperProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
