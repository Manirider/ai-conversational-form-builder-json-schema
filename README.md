# 🤖 AI-Powered Conversational Form Builder

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://docker.com/)

> Generate complex forms using conversational AI. Describe what you need in natural language, and get a fully validated JSON Schema Draft-07 with live form preview.

![AI Form Builder](https://img.shields.io/badge/AI-Form_Builder-6366f1?style=for-the-badge&logo=openai&logoColor=white)



## ✨ Features

### Core
- 🧠 **AI-Powered Generation** — Describe forms in natural language, get valid JSON Schema
- 🔄 **Multi-Turn Conversations** — Iteratively refine forms through conversation
- ❓ **Ambiguity Detection** — Asks clarifying questions for vague requests
- ✅ **Schema Validation** — Every generated schema validated with AJV Draft-07
- 🔁 **Auto-Retry** — Silently retries up to 3 times on invalid generations
- 📊 **Schema Evolution** — Merges changes instead of regenerating from scratch

### AI Providers
- **OpenAI** (GPT-4o)
- **Google Gemini** (Gemini 2.0 Flash)
- **Anthropic** (Claude Sonnet)
- **Mock Provider** (no API keys needed)

### Frontend
- 🎨 **Premium Dark UI** — Glass morphism, gradients, micro-animations
- 💬 **Chat Interface** — Full conversation with typing indicators
- 📋 **Live Form Preview** — Renders forms directly from JSON Schema
- 🔀 **Schema Diff** — Visual diff of changes between versions
- 📤 **Export Panel** — JSON, cURL, sample data, clipboard
- 🔲 **Conditional Fields** — Dynamic visibility via `x-show-when`
- ⌨️ **Keyboard Friendly** — Enter to send, full keyboard navigation

### Production
- 🐳 **Fully Dockerized** — Single `docker-compose up --build`
- 🔒 **Security** — Helmet, CORS, rate limiting, prompt injection protection
- 🧪 **Tested** — Jest, Supertest, unit + integration tests
- 📝 **TypeScript** — Strict typing throughout



## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                         │
│  ┌──────────┐  ┌──────────────┐  ┌──────────┐  ┌────────────┐  │
│  │   Chat   │  │ Form Renderer│  │Schema Diff│  │Export Panel │  │
│  │  Panel   │  │   (RJSF)    │  │  (+/-/~)  │  │ JSON/cURL  │  │
│  └────┬─────┘  └──────────────┘  └──────────┘  └────────────┘  │
│       │             Zustand Store                               │
└───────┼─────────────────────────────────────────────────────────┘
        │ HTTP POST
┌───────▼─────────────────────────────────────────────────────────┐
│                     Backend (Express)                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │
│  │Controller│→ │  Service  │→ │  Retry   │→ │  AI Provider   │  │
│  │  (Zod)  │  │(Orchestr.)│  │ Engine   │  │  (Abstraction) │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │ Validator│  │Conversation│ │  Memory  │                      │
│  │  (AJV)  │  │  Engine   │  │  Store   │                      │
│  └──────────┘  └──────────┘  └──────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```



## 📁 Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── config/          # Zod-validated env configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── conversation/    # Prompt templates
│   │   ├── middlewares/      # Error handler, rate limiter, security
│   │   ├── providers/       # AI provider abstraction (OpenAI, Gemini, Anthropic, Mock)
│   │   ├── routes/          # Express routes
│   │   ├── services/        # Business logic, retry engine
│   │   ├── storage/         # In-memory conversation store
│   │   ├── types/           # TypeScript interfaces
│   │   ├── utils/           # Logger, sanitizer, schema diff
│   │   ├── validators/      # AJV schema validation
│   │   ├── app.ts           # Express app assembly
│   │   └── server.ts        # Server entry point
│   ├── tests/               # Jest + Supertest tests
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API client
│   │   ├── store/           # Zustand state management
│   │   ├── types/           # TypeScript interfaces
│   │   ├── App.tsx          # Main layout
│   │   ├── main.tsx         # Entry point
│   │   └── index.css        # Design system
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docker-compose.yml
├── .env.example
├── .gitignore
├── LICENSE
└── README.md
```



## 🚀 Getting Started

### Prerequisites
- **Node.js** 20+
- **npm** 9+
- **Docker** & **Docker Compose** (for containerized setup)

### Quick Start (Docker)

```bash
# Clone the repository
git clone <repo-url>
cd Ai-Conversational-Form-Builder

# Start everything
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Health: http://localhost:3001/health

### Local Development

```bash
# Backend
cd backend
cp .env.example .env  # Or use the default .env
npm install
npm run dev           # Starts on port 3001

# Frontend (in a new terminal)
cd frontend
npm install
npm run dev           # Starts on port 5173
```



## 🔧 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Backend server port |
| `NODE_ENV` | `development` | Environment mode |
| `AI_PROVIDER` | `mock` | AI provider: `openai`, `gemini`, `anthropic`, `mock` |
| `OPENAI_API_KEY` | — | OpenAI API key |
| `OPENAI_MODEL` | `gpt-4o` | OpenAI model |
| `GEMINI_API_KEY` | — | Google Gemini API key |
| `GEMINI_MODEL` | `gemini-2.0-flash` | Gemini model |
| `ANTHROPIC_API_KEY` | — | Anthropic API key |
| `ANTHROPIC_MODEL` | `claude-sonnet-4-20250514` | Anthropic model |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed CORS origin |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Max requests per window |
| `MAX_RETRIES` | `3` | Max retry attempts for invalid schemas |



## 📡 API Documentation

### Health Check

```
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "provider": "mock"
}
```

### Generate Form

```
POST /api/form/generate
```

Request:
```json
{
  "prompt": "Create a user registration form with name, email, and password",
  "conversationId": "optional-uuid",
  "mock_llm_failure": false
}
```

**Success Response** (200):
```json
{
  "status": "success",
  "conversationId": "uuid",
  "version": 1,
  "schema": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "User Registration Form",
    "type": "object",
    "properties": {
      "name": { "type": "string", "title": "Full Name" },
      "email": { "type": "string", "format": "email" },
      "password": { "type": "string", "minLength": 8 }
    },
    "required": ["name", "email", "password"]
  }
}
```

**Clarification Response** (200):
```json
{
  "status": "clarification_needed",
  "conversationId": "uuid",
  "questions": [
    "How many participants should the form support?",
    "Do you need recurring booking options?"
  ]
}
```

**Error Response** (500):
```json
{
  "error": "Failed to generate valid schema after multiple attempts."
}
```



## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Run with coverage
npm test -- --coverage
```

### Test Coverage
- **Unit Tests**: Schema validator, sanitizer, schema diff, clarification detection
- **Integration Tests**: Full API flow with mock provider
- **API Tests**: Health check, form generation, multi-turn conversation, error handling



## 🔒 Security

- **Helmet** — HTTP security headers
- **CORS** — Origin-based access control
- **Rate Limiting** — 100 requests per 15-minute window
- **Input Sanitization** — XSS prevention, length limiting
- **Prompt Injection Protection** — Detects common injection patterns
- **Error Masking** — Internal details hidden in production



## 📊 Conversation Flow

```
User: "Create a registration form"
  → Backend validates input
  → Checks ambiguity (not ambiguous)
  → Sends to AI Provider with system prompt
  → Validates response (AJV Draft-07)
  → Stores in conversation history
  → Returns schema v1

User: "Add a phone number"
  → Loads conversation context
  → Adds evolution prompt with current schema
  → Generates updated schema
  → Merges with existing schema
  → Computes diff (added: phone)
  → Returns schema v2 + diff

User: "Make a form for booking a meeting room"
  → Detected as ambiguous
  → Returns clarification questions
  → No schema generated
```



## 🛣️ Future Improvements

- [ ] Persistent storage (PostgreSQL / Redis)
- [ ] WebSocket streaming for real-time generation
- [ ] Schema templates library
- [ ] Form submission handling
- [ ] Multi-user collaboration
- [ ] Schema import (upload existing schemas)
- [ ] Custom theme builder
- [ ] Playwright E2E tests
- [ ] CI/CD with GitHub Actions
- [ ] API authentication (JWT)



## 📄 License

[MIT](LICENSE) — See LICENSE file for details.


## Author
*MANIKANTA SURYASAI* 

*AIML ENGINEER | DEVELOPER*