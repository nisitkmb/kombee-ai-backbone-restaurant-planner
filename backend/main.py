"""
Kombee AI Backbone — FastAPI Application Entry Point
"""
from __future__ import annotations
import os
from contextlib import asynccontextmanager
import structlog
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

load_dotenv()
logger = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("startup", service="kombee-ai-backbone")

    llm = None
    try:
        from langchain_groq import ChatGroq
        llm = ChatGroq(
            api_key=os.getenv("GROQ_API_KEY"),
            model_name="llama-3.3-70b-versatile",
            temperature=0.2,
            max_tokens=int(os.getenv("MAX_TOKENS_PER_REQUEST", "4096")),
        )
        logger.info("llm_ready", model="llama-3.3-70b-versatile")
    except Exception as e:
        logger.warning("llm_init_failed", error=str(e), note="Running in mock mode")

    # Commented: other model clients — uncomment when API keys available
    # from langchain_openai import ChatOpenAI
    # reasoning_llm = ChatOpenAI(model="o1-preview", api_key=os.getenv("OPENAI_API_KEY"))
    #
    # from langchain_anthropic import ChatAnthropic
    # haiku_llm = ChatAnthropic(model="claude-haiku-3-5-20251001", api_key=os.getenv("ANTHROPIC_API_KEY"))
    #
    # from langchain_mistralai import ChatMistralAI
    # codestral = ChatMistralAI(model="codestral-latest", api_key=os.getenv("MISTRAL_API_KEY"))

    from backbone.orchestrator import backbone
    backbone._llm = llm

    try:
        from db.models import create_all
        create_all()
        logger.info("db_ready")
    except Exception as e:
        logger.warning("db_init_failed", error=str(e))

    logger.info("startup_complete")
    yield

    logger.info("shutdown")


app = FastAPI(
    title="Kombee AI Backbone",
    description="Central AI orchestration layer — model routing, RAG, validation, self-healing.",
    version="2.0.0",
    docs_url="/docs",
    lifespan=lifespan,
)

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
app.add_middleware(CORSMiddleware, allow_origins=CORS_ORIGINS, allow_credentials=True,
                   allow_methods=["*"], allow_headers=["*"])
app.add_middleware(GZipMiddleware, minimum_size=1000)

from api.chat import router as chat_router
from api.analytics import router as analytics_router
app.include_router(chat_router)
app.include_router(analytics_router)


@app.get("/health", tags=["system"])
async def health():
    from backbone.cost_policy import cost_engine
    return {"status": "ok", "service": "kombee-ai-backbone", "version": "2.0.0",
            "cost_summary": cost_engine.get_summary()}


@app.get("/", tags=["system"])
async def root():
    return {
        "service": "Kombee AI Backbone", "version": "2.0.0",
        "docs": "/docs", "health": "/health",
        "endpoints": [
            "POST /api/chat",
            "POST /api/upload-menu",
            "POST /api/generate-cart",
            "GET  /api/analytics/stats",
            "GET  /api/analytics/traces",
            "GET  /api/analytics/cost",
            "GET  /api/logs",
            "GET  /api/rag/stats",
            "POST /api/admin/seed",
        ],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True,
                log_level=os.getenv("LOG_LEVEL", "info").lower())