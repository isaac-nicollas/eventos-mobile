import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ErrorView, LoadingView } from "../../../components/ScreenState";
import { AuthContext } from "../../../context/AuthContext";
import { formatDate } from "../../../lib/format";
import type { Event, Registration } from "../../../types";

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { apiFetch } = useContext(AuthContext);

  const [event, setEvent] = useState<Event | null>(null);
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Carrega o evento e verifica se o usuário já está inscrito nele
  useEffect(() => {
    let active = true;
    Promise.all([
      apiFetch<Event>(`/events/${id}`),
      apiFetch<Registration[]>("/registrations"),
    ])
      .then(([eventData, registrations]) => {
        if (!active) return;
        setEvent(eventData);
        setRegistered(registrations.some((r) => r.eventId === id));
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Erro ao carregar o evento.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, apiFetch, reloadKey]);

  const retry = () => {
    setError(null);
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const handleRegistration = async () => {
    setSubmitting(true);
    try {
      await apiFetch(`/events/${id}/registrations`, { method: "POST" });
      setRegistered(true);
      Alert.alert("Sucesso!", "Inscrição realizada com sucesso!", [
        { text: "Ver minhas inscrições", onPress: () => router.replace("/my-registrations") },
        { text: "OK" },
      ]);
    } catch (err) {
      Alert.alert("Aviso", err instanceof Error ? err.message : "Erro ao realizar inscrição.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingView />;
  if (error || !event) {
    return <ErrorView message={error ?? "Evento não encontrado."} onRetry={retry} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image source={{ uri: event.image }} style={styles.image} contentFit="cover" />

      <Text style={styles.title}>{event.title}</Text>

      <View style={styles.card}>
        <Text style={styles.info}>📍 Local: {event.location}</Text>
        <Text style={styles.info}>📅 Data: {formatDate(event.date)}</Text>
        <Text style={styles.info}>⏰ Horário: {event.time}</Text>
        <Text style={styles.description}>{event.description}</Text>
      </View>

      {registered ? (
        <View style={styles.registeredBox}>
          <Text style={styles.registeredText}>✓ Você já está inscrito neste evento</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleRegistration}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Inscrever-se no evento</Text>
          )}
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Voltar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  content: { padding: 20, paddingTop: 50 },
  image: { width: "100%", height: 200, borderRadius: 10, marginBottom: 16 },
  title: { fontSize: 26, fontWeight: "bold", color: "#111827", marginBottom: 16 },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    elevation: 3,
    marginBottom: 25,
  },
  info: { fontSize: 16, color: "#4b5563", marginBottom: 12, fontWeight: "600" },
  description: { fontSize: 15, color: "#6b7280", marginTop: 6, lineHeight: 24 },
  button: {
    backgroundColor: "#10b981",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  registeredBox: {
    backgroundColor: "#d1fae5",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  registeredText: { color: "#065f46", fontWeight: "bold", fontSize: 16 },
  backButton: {
    backgroundColor: "#6b7280",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 30,
  },
});
