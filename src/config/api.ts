import { Platform } from "react-native";

// Endereço da API (Next.js). Defina EXPO_PUBLIC_API_URL no arquivo .env, por exemplo:
//   EXPO_PUBLIC_API_URL=http://192.168.0.10:3000/api   (celular físico: IP do computador na rede)
// Valores padrão: emulador Android usa 10.0.2.2; simulador iOS usa localhost.
const defaultUrl =
  Platform.OS === "android" ? "http://10.0.2.2:3000/api" : "http://localhost:3000/api";

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? defaultUrl;
