import { Redirect, Stack } from "expo-router";
import { useContext } from "react";
import { LoadingView } from "../../components/ScreenState";
import { AuthContext } from "../../context/AuthContext";

// Proteção de rotas: tudo dentro de (auth) exige usuário autenticado.
export default function AuthLayout() {
  const { token, isLoading } = useContext(AuthContext);

  if (isLoading) return <LoadingView />;
  if (!token) return <Redirect href="/login" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
