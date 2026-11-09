# Plataforma de Eventos — App Mobile (React Native + Expo)

Aplicativo para consultar eventos e realizar inscrições. Consome a API do projeto
[eventos-web](https://github.com/isaac-nicollas/eventos-web) (Next.js). O cadastro e a edição de eventos
são feitos apenas no painel web — o app não cria nem edita eventos.

**Tecnologias:** React Native, Expo, Expo Router (navegação), Context API (autenticação), `fetch`, `expo-secure-store`.

## Funcionalidades

1. Criar conta e fazer login
2. Ver a lista de eventos (com pull-to-refresh)
3. Ver os detalhes de um evento
4. Inscrever-se em um evento
5. Ver as próprias inscrições e cancelar uma inscrição
6. Encerrar a sessão (logout)

A sessão fica salva no aparelho (`expo-secure-store`), então o usuário continua autenticado ao reabrir o app.
Todas as telas, exceto login e cadastro, ficam em `src/app/(auth)/` e só abrem com usuário autenticado.

## Como executar

1. Suba a API e o banco seguindo o README do projeto **eventos-web** (`npm run dev`).
2. Instale as dependências:

   ```bash
   npm install
   ```

3. Configure o endereço da API:

   ```bash
   cp .env.example .env
   ```

   Edite `EXPO_PUBLIC_API_URL`:
   - **Celular físico (Expo Go):** IP do computador na mesma rede Wi-Fi, ex.: `http://192.168.0.10:3000/api`
   - **Emulador Android:** `http://10.0.2.2:3000/api` (padrão)
   - **Simulador iOS:** `http://localhost:3000/api` (padrão)

4. Inicie o app:

   ```bash
   npx expo start
   ```

   Depois abra no Expo Go (QR Code) ou em um emulador. Se mudar o `.env`, reinicie com `npx expo start -c`.

## Estrutura

```
src/
  app/
    _layout.tsx             AuthProvider + Stack
    login.tsx, register.tsx telas públicas
    (auth)/                 rotas protegidas
      _layout.tsx           redireciona para /login se não houver token
      index.tsx             lista de eventos (tela inicial)
      event/[id].tsx        detalhes do evento + inscrição
      my-registrations.tsx  minhas inscrições + cancelamento
  context/AuthContext.tsx   Context API: token, usuário, login, logout e apiFetch
  lib/api.ts                função request (fetch + tratamento de erros e timeout)
  config/api.ts             URL da API
  components/ScreenState.tsx  estados de carregamento e erro
```

## Endpoints utilizados

`POST /auth/register`, `POST /auth/login`, `GET /events`, `GET /events/:id`,
`POST /events/:id/registrations`, `GET /registrations`, `DELETE /registrations/:id`.
