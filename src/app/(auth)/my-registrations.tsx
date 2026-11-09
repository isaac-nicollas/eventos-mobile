import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useContext, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ErrorView, LoadingView } from "../../components/ScreenState";
import { AuthContext } from "../../context/AuthContext";
import { formatDate } from "../../lib/format";
import type { Registration } from "../../types";

export default function MyRegistrationsScreen() {
  const { apiFetch } = useContext(AuthContext);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const load = useCallback(async () => {
    try {
      setRegistrations(await apiFetch<Registration[]>("/registrations"));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar suas inscrições.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [apiFetch]);

  // Recarrega a lista sempre que a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const retry = () => {
    setError(null);
    setLoading(true);
    load();
  };

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const handleCancel = (registration: Registration) => {
    Alert.alert("Cancelar inscrição", `Cancelar sua inscrição em "${registration.event.title}"?`, [
      { text: "Não", style: "cancel" },
      {
        text: "Sim, cancelar",
        style: "destructive",
        onPress: async () => {
          setCancelingId(registration.id);
          try {
            await apiFetch(`/registrations/${registration.id}`, { method: "DELETE" });
            // Remove o item da lista na hora, sem precisar recarregar
            setRegistrations((prev) => prev.filter((r) => r.id !== registration.id));
          } catch (err) {
            Alert.alert("Erro", err instanceof Error ? err.message : "Não foi possível cancelar.");
          } finally {
            setCancelingId(null);
          }
        },
      },
    ]);
  };

  if (loading) return <LoadingView />;
  if (error && registrations.length === 0) return <ErrorView message={error} onRetry={retry} />;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Minhas inscrições</Text>

      {error && <Text style={styles.inlineError}>{error}</Text>}

      <FlatList
        data={registrations}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.event.image }} style={styles.cardImage} contentFit="cover" />
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.event.title}</Text>
              <Text style={styles.cardInfo}>
                📅 {formatDate(item.event.date)} às {item.event.time}
              </Text>
              <Text style={styles.cardInfo}>📍 {item.event.location}</Text>

              <TouchableOpacity
                style={[styles.cancelBtn, cancelingId === item.id && styles.disabled]}
                onPress={() => handleCancel(item)}
                disabled={cancelingId === item.id}
              >
                {cancelingId === item.id ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.cancelText}>Cancelar inscrição</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Você ainda não se inscreveu em nenhum evento.</Text>
        }
      />

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6", paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "#111827", marginVertical: 16 },
  inlineError: { color: "#b91c1c", textAlign: "center", marginBottom: 10 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
    overflow: "hidden",
  },
  cardImage: { width: "100%", height: 120 },
  cardBody: { padding: 15 },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#1f2937", marginBottom: 5 },
  cardInfo: { fontSize: 14, color: "#4b5563", marginBottom: 3 },
  cancelBtn: {
    marginTop: 12,
    backgroundColor: "#ef4444",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  disabled: { opacity: 0.6 },
  cancelText: { color: "#fff", fontWeight: "bold" },
  backButton: {
    backgroundColor: "#6b7280",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  backButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  emptyText: { textAlign: "center", color: "#6b7280", marginTop: 20 },
});
