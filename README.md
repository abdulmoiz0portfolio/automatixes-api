# ⚡ Automatixes API

<p align="center">
  <img src="https://automatixes.com/logo.png" alt="Automatixes" width="180" onerror="this.style.display='none'"/>
</p>

<p align="center">
  <strong>Enterprise WhatsApp Multi-Device Gateway, Conversational AI & Webhook Automation Engine</strong>
</p>

<p align="center">
  <a href="https://automatixes.com"><img src="https://img.shields.io/badge/Platform-Automatixes-00C48C?style=for-the-badge" alt="Automatixes" /></a>
  <a href="https://automatixes.com"><img src="https://img.shields.io/badge/Author-Moiz%20Baig-0A84FF?style=for-the-badge" alt="Author" /></a>
  <a href="#license"><img src="https://img.shields.io/badge/License-Proprietary-FF9F0A?style=for-the-badge" alt="License" /></a>
  <a href="https://hub.docker.com"><img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" /></a>
</p>

<p align="center">
  <a href="https://automatixes.com">Official Website</a> &middot;
  <a href="#quick-start">Quick Start</a> &middot;
  <a href="#api-reference">API Reference</a> &middot;
  <a href="#n8n--webhook-integration">n8n Integration</a> &middot;
  <a href="mailto:contact@automatixes.com">Contact Support</a>
</p>

---

## 🚀 Overview

**Automatixes API** is an enterprise-grade WhatsApp automation gateway and REST orchestration platform created by **Moiz Baig** ([Automatixes](https://automatixes.com)).

It delivers seamless WhatsApp connectivity across multiple phone numbers and instances, paired with intelligent voice note transcription (Speech-to-Text), human-like conversational responses (Urdu / Roman Urdu / English), call rejection protection, and 2-way event forwarding to workflow automation tools like **n8n**, **Flowise**, **Typebot**, **Chatwoot**, and **Dify**.

```
                           +------------------------+
                           |  WhatsApp Multi-Device |
                           |  (Baileys / Meta API)  |
                           +-----------+------------+
                                       |
                                       v
                     +------------------------------------+
                     |         AUTOMATIXES API            |
                     |  - Multi-Instance Controller       |
                     |  - Call Auto-Shield                |
                     |  - Speech-to-Text Transcriber      |
                     |  - Humanized Conversational Brain  |
                     +-----------------+------------------+
                                       |
           +---------------------------+---------------------------+
           |                           |                           |
           v                           v                           v
+---------------------+     +--------------------+     +-----------------------+
|  n8n / Webhooks     |     |  Automatixes UI    |     |  Redis & PostgreSQL   |
|  Universal 2-Way    |     |  Manager Web App   |     |  Enterprise Storage   |
+---------------------+     +--------------------+     +-----------------------+
```

---

## ✨ Key Features

- 📱 **Multi-Device WhatsApp Engine**: Connect any number via QR code or pairing code utilizing enhanced Baileys sockets.
- 🎙️ **Voice Note STT Transcription**: Auto-converts WhatsApp `.ogg`/`.opus` voice notes to text with multilingual support (Urdu `ur-PK` and English `en-US`).
- 🤖 **Humanized Conversational AI**: Natural conversational Roman Urdu responses that mirror human behavior without robotic giveaways.
- 🛡️ **Call Shield Protection**: Auto-reject incoming WhatsApp voice and video calls with a custom polite SMS notice.
- ⚡ **Full n8n Integration**: Auto-forwards all incoming text, media, voice transcripts, and call alerts directly to n8n webhooks, with full REST API for n8n to send outbound messages.
- 🖥️ **Automatixes Manager Dashboard**: Interactive React + Tailwind web UI to view instances, live connection statuses, QR codes, and chat histories.
- 🔐 **Secure REST Gateway**: Authenticate requests with global API keys, granular CORS policies, and rate-limiting.
- 📦 **Docker Ready**: Complete multi-container `docker-compose.yaml` with Postgres, Redis, and API pre-configured.

---

## 🛠️ Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- FFmpeg (for voice note transcription)
- Docker & Docker Compose (Optional for containerized setup)

### 1. Installation

```bash
# Clone your repository
git clone https://github.com/automatixes/automatixes-api.git
cd automatixes-api

# Install dependencies
npm install
```

### 2. Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

Configure your credentials in `.env`:
```env
# Server
SERVER_PORT=8080
AUTHENTICATION_API_KEY=your-secure-api-key

# Database
DATABASE_PROVIDER=postgresql
DATABASE_CONNECTION_URI=postgresql://user:pass@localhost:5432/automatixes_db

# Redis
REDIS_ENABLED=true
REDIS_URI=redis://localhost:6379

# Webhook Forwarding (n8n)
WEBHOOK_GLOBAL_ENABLED=true
WEBHOOK_GLOBAL_URL=http://localhost:5678/webhook/whatsapp
```

### 3. Running with Docker Compose (Recommended)

```bash
docker compose up -d
```

Your services will be available at:
- **Automatixes API**: `http://localhost:8080`
- **Automatixes Manager UI**: `http://localhost:3000`

---

## 📡 API Reference

All requests must include your API key in the headers:
```http
apikey: your-secure-api-key
Content-Type: application/json
```

### 1. Create an Instance
```http
POST /instance/create
{
  "instanceName": "support",
  "token": "custom-token-optional",
  "qrcode": true,
  "rejectCall": true,
  "msgCall": "Abhi call pick nahi kar sakta. Text message kar dein, free ho kar rabta karta hoon."
}
```

### 2. Connect & Get QR Code
```http
GET /instance/connect/support
```
Returns a base64 QR code image to scan with your phone's WhatsApp.

### 3. Send Text Message
```http
POST /message/sendText/support
{
  "number": "923366920141",
  "text": "Assalam-o-Alaikum! Automatixes API se automated message deliver ho gaya hai."
}
```

### 4. Send Media / Voice Note
```http
POST /message/sendMedia/support
{
  "number": "923366920141",
  "mediatype": "audio",
  "media": "https://example.com/audio.mp3",
  "caption": "Voice note"
}
```

### 5. Fetch Chat History & Base64 Audio
```http
POST /chat/getBase64FromMediaMessage/support
{
  "message": { ... },
  "convertToMp4": false
}
```

---

## 🔗 n8n & External Webhook Integration

Configure your instance to stream real-time events to your automation pipelines:

```http
POST /webhook/set/support
{
  "enabled": true,
  "url": "https://your-n8n-instance.com/webhook/whatsapp-receiver",
  "byEvents": false,
  "events": [
    "MESSAGES_UPSERT",
    "MESSAGES_UPDATE",
    "CALL"
  ]
}
```

Every incoming event contains:
- Sender number and contact name
- Message payload (text, media URL, or voice note binary)
- Transcribed text (if audio message)
- Timestamp and message ID

---

## 🏗️ Architecture & Modules

```
automatixes-api/
├── Docker/                 # Deployment scripts & database init
├── prisma/                 # PostgreSQL & SQLite schemas
├── public/                 # Static assets & dashboard styles
├── manager/                # React Vite frontend dashboard
├── src/
│   ├── api/
│   │   ├── controllers/    # Express route handlers
│   │   ├── guards/         # API key, instance & telemetry guards
│   │   ├── integrations/   # Baileys, Typebot, Chatwoot, n8n, S3
│   │   ├── repository/     # Prisma database layer
│   │   ├── routes/         # REST API endpoints
│   │   └── services/       # Core business & socket logic
│   ├── config/             # Environment, logger & path configs
│   ├── utils/              # Media decoders, FFmpeg & formatters
│   └── main.ts             # Application entrypoint & ASCII banner
├── .env.example            # Environment blueprint
├── docker-compose.yaml     # Production container orchestration
├── package.json            # Node.js manifest
└── tsconfig.json           # TypeScript configuration
```

---

## 👨‍💻 Author & Credits

- **Platform Architect**: **Moiz Baig**
- **Company**: **Automatixes** ([https://automatixes.com](https://automatixes.com))
- **Base Acknowledgments**: Built with foundation support from [WhiskeySockets/Baileys](https://github.com/WhiskeySockets/Baileys).

---

## 📄 License

Proprietary © 2026 **Automatixes**. All rights reserved.  
Developed by **Moiz Baig** for enterprise multi-channel automation.
