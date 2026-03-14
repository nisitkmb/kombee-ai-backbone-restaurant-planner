"""Analytics API — stats, traces, cost, logs, RAG stats, seed."""
from __future__ import annotations
from fastapi import APIRouter, Query
from pydantic import BaseModel
from backbone.observability import get_stats, get_traces
from backbone.cost_policy import cost_engine
from rag.ingestion import get_collection_stats

router = APIRouter(prefix="/api", tags=["analytics"])


@router.get("/analytics/stats")
async def analytics_stats(window_hours: int = Query(24, ge=1, le=720)):
    return get_stats(window_hours=window_hours)


@router.get("/analytics/traces")
async def analytics_traces(limit: int = Query(100, ge=1, le=1000), task_type: str | None = None):
    return {"traces": get_traces(limit=limit, task_type=task_type)}


@router.get("/analytics/cost")
async def analytics_cost():
    return {"summary": cost_engine.get_summary(), "history": cost_engine.get_history(200)}


class LogEntry(BaseModel):
    timestamp: str; level: str; task_type: str; model: str
    latency_ms: int; tokens_in: int; tokens_out: int
    cost_usd: float; validation: str; retries: int; session_id: str


@router.get("/logs", response_model=list[LogEntry])
async def get_logs(limit: int = Query(100, ge=1, le=1000), level: str | None = None):
    traces = get_traces(limit=limit * 3)

    def _level(t: dict) -> str:
        if t.get("retries", 0) > 0:       return "WARN"
        if t.get("validation_status") == "failed": return "ERROR"
        if t.get("validation_status") == "passed": return "SUCCESS"
        return "INFO"

    entries = []
    for t in traces:
        lv = _level(t)
        if level and lv != level.upper():
            continue
        entries.append(LogEntry(
            timestamp=t.get("observed_at", ""), level=lv,
            task_type=t.get("task_type", ""), model=t.get("model_used", ""),
            latency_ms=t.get("latency_ms", 0), tokens_in=t.get("input_tokens", 0),
            tokens_out=t.get("output_tokens", 0), cost_usd=t.get("cost_usd", 0.0),
            validation=t.get("validation_status", ""), retries=t.get("retries", 0),
            session_id=t.get("session_id", ""),
        ))
        if len(entries) >= limit:
            break
    return entries


@router.get("/rag/stats")
async def rag_stats():
    try:
        return get_collection_stats()
    except Exception:
        return {"menu_docs": {"count": 0}, "ingredient_kb": {"count": 0}, "seasonal_data": {"count": 0}}


@router.post("/admin/seed")
async def seed_database():
    import asyncio, concurrent.futures
    from db.seed import run_seed
    loop = asyncio.get_event_loop()
    with concurrent.futures.ThreadPoolExecutor() as pool:
        await loop.run_in_executor(pool, run_seed)
    return {"status": "ok", "message": "Database seeded successfully"}
