import { Image } from "expo-image";
import { Link, router } from "expo-router";
import { useContext, useEffect, useState } from "react";
import {
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
import type { Event } from "../../types";

export default function HomeScreen() {
  const { user, logout, apiFetch } = useContext(AuthContext);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Carrega a lista de eventos (de novo sempre que reloadKey muda)
  useEffect(() => {
    let active = true;
    apiFetch<Event[]>("/events")
      .then((data) => {
        if (active) setEvents(data);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Erro ao carregar eventos.");
      })
      .finally(() => {
        if (active) {
          setLoading(false);
          setRefreshing(false);
        }
      });
    return () => {
      active = false;
    };
  }, [apiFetch, reloadKey]);

  const retry = () => {
    setError(null);
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const onRefresh = () => {
    setError(null);
    setRefreshing(true);
    setReloadKey((k) => k + 1);
  };

  const handleLogout = () => {
    Alert.alert("Sair", "Deseja encerrar sua sessão?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: logout },
    ]);
  };

  if (loading) return <LoadingView />;
  if (error && events.length === 0) return <ErrorView message={error} onRetry={retry} />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Próximos eventos</Text>
          {user && <Text style={styles.subtitle}>Olá, {user.name}</Text>}
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.btnText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.registrationsBtn}
        onPress={() => router.push("/my-registrations")}
      >
        <Text style={styles.btnText}>Minhas inscrições</Text>
      </TouchableOpacity>

      {error && <Text style={styles.inlineError}>{error}</Text>}

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.cardImage} contentFit="cover" />
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardInfo}>📅 {formatDate(item.date)} às {item.time}</Text>
              <Text style={styles.cardInfo}>📍 {item.location}</Text>

              <Link
                href={{ pathname: "/event/[id]", params: { id: item.id } }}
                asChild
              >
                <TouchableOpacity style={styles.detailsBtn}>
                  <Text style={styles.btnText}>Ver detalhes</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum evento encontrado.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6", paddingHorizontal: 20 },
  header: { flexDirection: "row", alignItems: "center", marginVertical: 16 },
  title: { fontSize: 22, fontWeight: "bold", color: "#111827" },
  subtitle: { fontSize: 14, color: "#6b7280", marginTop: 2 },
  logoutBtn: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: "#ef4444",
    borderRadius: 6,
  },
  registrationsBtn: {
    backgroundColor: "#8b5cf6",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  btnText: { color: "#fff", fontWeight: "bold" },
  inlineError: { color: "#b91c1c", textAlign: "center", marginBottom: 10 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
    overflow: "hidden",
  },
  cardImage: { width: "100%", height: 150 },
  cardBody: { padding: 15 },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#1f2937", marginBottom: 5 },
  cardInfo: { fontSize: 14, color: "#4b5563", marginBottom: 3 },
  detailsBtn: {
    marginTop: 12,
    backgroundColor: "#10b981",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  emptyText: { textAlign: "center", color: "#6b7280", marginTop: 20 },
});
