import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Rotas públicas: login e cadastro. O grupo (auth) é protegido pelo seu próprio _layout. */}
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack>
    </AuthProvider>
  );
}
