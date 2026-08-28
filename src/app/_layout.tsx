import "@/styles/global.css";
import { getAppLockEnabled } from "@/utils/NoteStorage";
import * as LocalAuthentication from "expo-local-authentication";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, AppState, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const [locked, setLocked] = useState(true);

  useEffect(() => {
    let mounted = true;

    const authenticate = async () => {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Unlock NoteLo",
        promptDescription: "Authenticate to access your notes.",
      });

      if (mounted) {
        setLocked(!result.success);
      }
    };

    const checkLock = async () => {
      const enabled = await getAppLockEnabled();

      if (!enabled) {
        if (mounted) setLocked(false);
        return;
      }

      if (mounted) setLocked(true);
      await authenticate();
    };

    checkLock();

    const subscription = AppState.addEventListener("change", (state) => {
      // if (state !== "active") {
      //   setLocked(true);
      // } else {
      //   checkLock();
      // }
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack
          screenOptions={{ headerShown: false, animation: "slide_from_right" }}
        >
          <Stack.Screen name="(drawer)" />
          <Stack.Screen name="note/[id]/detail" />
        </Stack>
        {locked && (
          <View
            style={{
              ...StyleSheet.absoluteFill,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#22b6c6",
            }}
          >
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
