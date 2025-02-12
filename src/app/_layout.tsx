import { Stack } from "expo-router";
import RootProvider from "../context/Root";

export default function RootLayout() {
  return (
    <RootProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </RootProvider>
  );
}
