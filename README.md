# Plataforma de Eventos — App Mobile (React Native + Expo)

Aplicativo para consultar eventos e realizar inscrições. Consome a API do projeto
[eventos-web](https://github.com/isaac-nicollas/eventos-web) (Next.js).

O cadastro e a edição de eventos são feitos apenas pelo administrador no painel web:
**o aplicativo não cria nem edita eventos.**

> Atividade avaliativa de Desenvolvimento Mobile — IFMA, Campus Timon.
> **Autores:** Isaac Nicollas e Ismael Lucas.

## Tecnologias

- [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/) — navegação baseada em arquivos
- Context API — gerenciamento global da autenticação
- `fetch` — consumo da API REST
- `expo-secure-store` — armazenamento seguro da sessão
- `expo-image` — exibição das imagens dos eventos

## Funcionalidades

1. Criar conta e fazer login
2. Ver a lista de eventos (com atualização por pull-to-refresh)
3. Ver os detalhes de um evento
4. Inscrever-se em um evento
5. Ver as próprias inscrições e cancelar uma inscrição
6. Encerrar a sessão (logout)

A sessão fica salva no aparelho, então o usuário continua autenticado ao reabrir o app. Todas as telas,
exceto login e cadastro, ficam no grupo `(auth)` e só abrem com usuário autenticado. Se o token expirar,
o app encerra a sessão e volta para o login.

## Pré-requisitos

- Node.js 20 ou superior
- Aplicativo **Expo Go** no celular (ou um emulador Android/iOS)
- A API do projeto **eventos-web** em execução (siga o README dele)

## Como executar

```bash
# 1. Instalar as dependências
npm install

# 2. Criar o arquivo de configuração
cp .env.example .env          # Windows: copy .env.example .env

# 3. Iniciar o app
npx expo start -c
```

Depois, escaneie o QR Code com o Expo Go (celular e computador na mesma rede Wi-Fi) ou abra em um emulador.

### Configurando o endereço da API

Edite o `.env` e defina `EXPO_PUBLIC_API_URL` (sempre terminando em `/api`):

| Onde o app roda | Valor |
|---|---|
| Celular físico (Expo Go) | `http://<IP-do-computador>:3000/api` — ex.: `http://192.168.0.10:3000/api` |
| Emulador Android | `http://10.0.2.2:3000/api` (padrão) |
| Simulador iOS | `http://localhost:3000/api` (padrão) |

Para descobrir o IP do computador: `ipconfig` (Windows) ou `ifconfig` / `ip a` (Mac/Linux).
Sempre que alterar o `.env`, reinicie com `npx expo start -c`.

## Roteiro de teste

1. **Cadastro:** crie uma conta e volte para o login.
2. **Login:** entre com a conta criada; a lista de eventos aparece.
3. **Detalhes:** abra um evento e confira imagem, descrição, data, horário e local.
4. **Inscrição:** toque em "Inscrever-se no evento".
5. **Minhas inscrições:** confira a inscrição na lista e cancele-a.
6. **Sessão:** feche e reabra o app — o usuário continua logado.
7. **Logout:** toque em "Sair" e confirme que as telas internas não abrem mais sem login.

## Estrutura do projeto

```
src/
  app/
    _layout.tsx               AuthProvider + navegação (Stack)
    login.tsx                 tela de login
    register.tsx              tela de cadastro
    (auth)/                   rotas protegidas
      _layout.tsx             redireciona para /login quando não há token
      index.tsx               tela inicial: lista de eventos
      event/[id].tsx          detalhes do evento e inscrição
      my-registrations.tsx    minhas inscrições e cancelamento
  context/
    AuthContext.tsx           Context API: token, usuário, login, logout e apiFetch
  lib/
    api.ts                    função request (fetch, timeout e tratamento de erros)
    format.ts                 formatação de datas
  config/
    api.ts                    URL base da API
  components/
    ScreenState.tsx           estados de carregamento e de erro
  types.ts                    tipos User, Event e Registration
```

## Como funciona

- **Autenticação:** o login retorna `{ user, token }`. O `AuthContext` salva os dois com `expo-secure-store`
  e os recarrega ao abrir o app.
- **Proteção de rotas:** o `_layout` de `(auth)` verifica o token e redireciona para `/login` quando ele não existe.
- **Requisições:** o `apiFetch` do contexto envia o header `Authorization: Bearer <token>` e faz logout
  automático quando a API responde 401.
- **Erros e carregamento:** o `request` aplica timeout de 15 segundos e converte falhas de rede e respostas de
  erro em mensagens amigáveis. As telas exibem indicador de carregamento e um botão "Tentar novamente".

## Endpoints utilizados

| Método | Endpoint | Uso |
|---|---|---|
| POST | `/auth/register` | Criar conta |
| POST | `/auth/login` | Login |
| GET | `/events` | Listar eventos |
| GET | `/events/:id` | Detalhes do evento |
| POST | `/events/:id/registrations` | Inscrever-se |
| GET | `/registrations` | Minhas inscrições |
| DELETE | `/registrations/:id` | Cancelar inscrição |

## Solução de problemas

| Problema | Solução |
|---|---|
| "Não foi possível conectar ao servidor" | Confira o IP no `.env`, reinicie com `npx expo start -c` e teste `http://<IP>:3000/api/events` no navegador do celular. No Windows, libere a porta 3000 no firewall |
| Imagem do evento não aparece | A URL da imagem cadastrada no painel é inválida; edite o evento com uma URL que abra no navegador |
| Expo Go informa versão incompatível | Atualize o Expo Go na loja de aplicativos |
| Alterei o `.env` e nada mudou | Reinicie o Expo com `npx expo start -c` |
