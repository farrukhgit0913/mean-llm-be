# mean-llm-be

Backend API for an **AI Assistant built with the MEAN stack, Ollama LLM, and RAG (Retrieval-Augmented Generation)**.

The backend is responsible for handling chat requests, communicating with the local LLM through **Ollama**, retrieving relevant information through the **RAG pipeline**, and exposing APIs for the frontend.

## 🚀 Tech Stack

* **Node.js**
* **Express.js**
* **MongoDB**
* **Ollama**
* **LLM**
* **RAG (Retrieval-Augmented Generation)**
* **JavaScript / TypeScript**

## 🏗️ Architecture

```text
Angular Frontend
       │
       │ HTTP API
       ▼
Node.js + Express Backend
       │
       ├── Chat API
       │
       ├── RAG Pipeline
       │      │
       │      └── Context Retrieval
       │
       ├── Ollama
       │      │
       │      └── Local LLM
       │
       └── MongoDB
```

## ✨ Features

* AI-powered conversational API
* Local LLM execution using Ollama
* Retrieval-Augmented Generation (RAG)
* Context-aware responses
* MongoDB integration
* REST API architecture
* Streaming-friendly AI response architecture
* Designed to work with the Angular frontend

## 📋 Prerequisites

Make sure the following are installed:

* Node.js
* npm
* MongoDB
* Ollama

Verify Node.js and npm:

```bash
node -v
npm -v
```

Verify Ollama:

```bash
ollama --version
```

## 🤖 Ollama Setup

Install Ollama and pull the model you want to use.

Example:

```bash
ollama pull llama3.2
```

Start Ollama:

```bash
ollama serve
```

The backend can then communicate with the locally running Ollama service.

## 📦 Installation

Clone the repository:

```bash
git clone <BACKEND_REPOSITORY_URL>
```

Go to the backend directory:

```bash
cd mean-llm-be
```

Install dependencies:

```bash
npm install
```

## ⚙️ Environment Variables

Create a `.env` file in the backend root:

```env
PORT=3000

MONGODB_URI=mongodb://localhost:27017/mean-llm

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

> Do not commit `.env` or other files containing secrets to GitHub.

## ▶️ Run the Backend

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

The API will be available at:

```text
http://localhost:3000
```

## 🔌 API

The backend provides APIs for:

### Chat

Send a user message to the AI assistant.

```http
POST /api/chat
```

Example request:

```json
{
  "message": "What is Retrieval-Augmented Generation?"
}
```

The backend processes the request through the RAG/LLM pipeline and returns the generated response.

## 🧠 RAG Pipeline

The RAG workflow follows this general process:

```text
User Question
      │
      ▼
Query Processing
      │
      ▼
Relevant Context Retrieval
      │
      ▼
Context + User Question
      │
      ▼
Ollama LLM
      │
      ▼
AI Response
```

RAG allows the application to provide the LLM with relevant retrieved context before generating an answer.

## 🗂️ Project Structure

```text
mean-llm-be/
│
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── rag/
│   └── ...
│
├── .env
├── .gitignore
├── package.json
└── README.md
```

> The structure may evolve as the application grows.

## 🔐 Security

* Keep `.env` files out of Git.
* Never commit API keys or credentials.
* Validate incoming API requests.
* Restrict production database access.
* Use appropriate authentication and authorization for production deployments.

## 🔗 Related Project

Frontend:

**mean-llm-fe** — Angular frontend for the AI Assistant.

The frontend communicates with this backend through REST APIs.

## 📄 License

This project is for learning and development purposes.
