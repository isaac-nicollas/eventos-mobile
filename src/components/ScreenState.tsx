import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function LoadingView() {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );
}

export function ErrorView({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.center}>
      <Text style={styles.errorText}>{message}</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
        <Text style={styles.retryText}>Tentar novamente</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  errorText: { color: "#b91c1c", textAlign: "center", marginBottom: 16, fontSize: 15 },
  retryBtn: {
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryText: { color: "#fff", fontWeight: "bold" },
});
