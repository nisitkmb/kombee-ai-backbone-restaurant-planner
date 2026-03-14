# Kombee AI Backbone v2.0

> Central AI orchestration layer for all Kombee AI products.
> Demonstrated through a RAG-powered Restaurant Inventory Planning Assistant for Zepto.

---

## 🚀 Quick Start

### Step 1 — PostgreSQL Setup (2 minutes)
```bash
# Create the database and tables
psql -U postgres -f backend/db/setup_db.sql
```

### Step 2 — Backend Setup
```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Upgrade LangChain packages (required)
pip install langchain-core langchain-text-splitters --upgrade

# Configure environment
# Edit .env and add your API keys:
# - GROQ_API_KEY (get free key at: https://console.groq.com/)
# - GOOGLE_API_KEY (for embeddings: https://aistudio.google.com/)

# Seed database — 10 users, 50K products, 20K orders (~20 min)
python -m db.seed

# Start API server
python main.py
# → http://localhost:8000
# → http://localhost:8000/docs  (Swagger UI)
```

### Step 3 — Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
# → http://localhost:5173
```

---

## 📁 Project Structure

```
kombee-ai/
├── frontend/                  ← React 18 + Vite + Tailwind + Inter Font
│   └── src/
│       ├── pages/             ← 7 pages (Dashboard, Chat, Analytics, etc.)
│       │   ├── Dashboard.jsx  ← Main dashboard with stats
│       │   ├── ChatPage.jsx   ← AI chat with RAG + file upload
│       │   ├── AnalyticsPage.jsx ← Performance metrics
│       │   ├── BackbonePage.jsx  ← AI pipeline monitoring
│       │   ├── ModelRouterPage.jsx ← Model routing config
│       │   ├── RAGPage.jsx    ← Document management
│       │   └── LogsPage.jsx   ← System logs
│       ├── components/        ← Layout, Sidebar, UI primitives
│       │   ├── Layout.jsx     ← Main app layout
│       │   ├── Sidebar.jsx    ← Navigation sidebar
│       │   └── ui.jsx         ← Reusable UI components
│       └── lib/mockData.js    ← Mock data + feed generator
│
├── backend/
│   ├── main.py                ← FastAPI app entry point
│   ├── .env                   ← API keys (GROQ_API_KEY, GOOGLE_API_KEY)
│   ├── backbone/              ← AI orchestration layers
│   │   ├── orchestrator.py    ← Main AI pipeline
│   │   ├── model_router.py    ← Complexity-based routing
│   │   ├── classifier.py      ← Task classification
│   │   ├── complexity_engine.py ← Complexity scoring
│   │   ├── validator.py       ← Response validation
│   │   ├── cost_policy.py     ← Cost optimization
│   │   └── observability.py   ← Monitoring & logging
│   ├── rag/                   ← ChromaDB ingestion + retrieval
│   │   ├── ingestion.py       ← PDF/text document processing
│   │   └── retriever.py       ← Vector similarity search
│   ├── db/                    ← SQLAlchemy models + seed data
│   │   ├── models.py          ← Database schema
│   │   ├── queries.py         ← Business logic queries
│   │   ├── seed.py            ← Sample data generator
│   │   └── setup_db.sql       ← Database initialization
│   ├── api/                   ← REST endpoints
│   │   ├── chat.py            ← Chat, upload, cart generation
│   │   └── analytics.py       ← Performance metrics
│   ├── chroma_db/             ← Vector database storage
│   └── faiss_db/              ← Alternative vector storage
│
└── docs/
    └── architecture.md        ← Full architecture documentation
```

---

## 🔧 Environment Variables (.env)

```bash
# Required API Keys
GROQ_API_KEY=your_groq_key_here          ← Primary LLM (free at console.groq.com)
GOOGLE_API_KEY=your_google_key_here      ← Embeddings (free at aistudio.google.com)

# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/kombee_ai

# Vector Database
CHROMA_PERSIST_DIR=./chroma_db

# Optional: Model Configuration
DEFAULT_MODEL=llama-3.3-70b-versatile    ← Groq model
EMBEDDING_MODEL=text-embedding-004       ← Google embeddings
```

---

## ✨ Key Features

### 🤖 AI Backbone Pipeline
- **7-layer orchestration**: Classification → Complexity → Routing → Processing → Validation → Cost → Observability
- **Groq Llama 3.3 70B**: High-performance LLM for complex reasoning
- **Smart routing**: Complexity-based model selection
- **Cost optimization**: Token usage tracking and optimization

### 📚 RAG System
- **Document ingestion**: PDF and text file processing
- **ChromaDB**: Vector database for semantic search
- **LangChain integration**: Text splitting and embeddings
- **Multi-document retrieval**: Context-aware document chunks

### 🍽️ Restaurant Intelligence
- **Menu analysis**: Automatic dish and ingredient extraction
- **Inventory prediction**: 5-factor prediction algorithm
- **Smart cart generation**: Priority-based ordering recommendations
- **Stock optimization**: Seasonal and usage pattern analysis

### 🎨 Modern UI/UX
- **Inter font**: Professional typography
- **Dark/Light hybrid**: Sophisticated color scheme
- **Real-time updates**: Live system monitoring
- **Responsive design**: Mobile-friendly interface

---

## 🏗️ Architecture

See `docs/architecture.md` for comprehensive documentation covering:
- **Backbone Pipeline**: 7-layer AI orchestration system
- **Model Routing**: Complexity-based LLM selection strategy  
- **RAG Design**: Document ingestion and retrieval architecture
- **Guardrails**: Response validation and safety measures
- **Prediction Algorithm**: Multi-factor inventory forecasting
- **Database Schema**: Relational design for restaurant operations

---

## 🚀 API Endpoints

### Chat & AI
- `POST /api/chat` - AI conversation with RAG context
- `POST /api/upload-menu` - PDF/text menu processing
- `POST /api/generate-cart` - Smart inventory recommendations

### Analytics
- `GET /api/analytics/overview` - System performance metrics
- `GET /api/analytics/models` - Model usage statistics
- `GET /api/analytics/costs` - Token usage and cost tracking

### Documentation
- `GET /docs` - Interactive Swagger UI
- `GET /redoc` - Alternative API documentation

---

## 🛠️ Tech Stack

**Frontend:**
- React 18 + Vite
- Tailwind CSS + Inter Font
- Modern component architecture

**Backend:**
- FastAPI + Python 3.11+
- SQLAlchemy + PostgreSQL
- ChromaDB vector database

**AI/ML:**
- Groq Llama 3.3 70B (primary LLM)
- Google text-embedding-004
- LangChain framework
- Custom orchestration pipeline

**DevOps:**
- Structured logging
- Error tracking
- Performance monitoring
- Cost optimization
