import { API_URL } from "../config/api";

const TIMEOUT_MS = 15000;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type RequestOptions = RequestInit & { token?: string | null };

/**
 * Faz uma requisição à API usando `fetch`.
 * - envia o token (se houver) no header Authorization;
 * - converte falhas de rede/timeout e respostas de erro em ApiError com uma mensagem amigável.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...rest,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers as Record<string, string> | undefined),
      },
    });
  } catch {
    throw new ApiError(
      "Não foi possível conectar ao servidor. Verifique sua conexão e o endereço da API.",
      0,
    );
  } finally {
    clearTimeout(timer);
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = (data as { error?: string } | null)?.error ?? "Erro ao comunicar com o servidor.";
    throw new ApiError(message, response.status);
  }

  return data as T;
}
