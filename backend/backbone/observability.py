"""Observability — trace logging and aggregate stats."""
from __future__ import annotations
import threading
from datetime import datetime, timedelta
from collections import defaultdict
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .orchestrator import BackboneResponse

_lock = threading.Lock()
_traces: list[dict] = []
_MAX = 10_000


def observe(response: "BackboneResponse") -> None:
    trace = {
        "task_type": response.task_type, "model_used": response.model_used,
        "complexity_score": response.complexity_score, "complexity_tier": response.complexity_tier,
        "input_tokens": response.input_tokens, "output_tokens": response.output_tokens,
        "cost_usd": response.cost_usd, "latency_ms": response.latency_ms,
        "validation_status": response.validation_status, "retries": response.retries,
        "session_id": response.session_id, "observed_at": datetime.utcnow().isoformat(),
    }
    with _lock:
        _traces.append(trace)
        if len(_traces) > _MAX:
            _traces.pop(0)


def get_traces(limit: int = 100, task_type: str | None = None) -> list[dict]:
    with _lock:
        data = list(reversed(_traces))
    if task_type:
        data = [t for t in data if t.get("task_type") == task_type]
    return data[:limit]


def get_stats(window_hours: int = 24) -> dict:
    cutoff = datetime.utcnow() - timedelta(hours=window_hours)
    with _lock:
        recent = [t for t in _traces if datetime.fromisoformat(t["observed_at"]) > cutoff]
    if not recent:
        return {"window_hours":window_hours,"total_requests":0,"total_tokens":0,"total_cost_usd":0.0,
                "avg_latency_ms":0.0,"p95_latency_ms":0.0,"retried_requests":0,"failed_requests":0,
                "validation_pass_rate":100.0,"by_task":{},"by_model":{}}
    total = len(recent)
    latencies = [t["latency_ms"] for t in recent]
    by_task: dict = defaultdict(int)
    by_model: dict = defaultdict(int)
    for t in recent:
        by_task[t["task_type"]] += 1
        by_model[t["model_used"]] += 1
    retried = sum(1 for t in recent if t.get("retries", 0) > 0)
    failed  = sum(1 for t in recent if t.get("validation_status") == "failed")
    s = sorted(latencies)
    p95 = s[int(len(s) * 0.95)] if s else 0
    return {
        "window_hours": window_hours, "total_requests": total,
        "total_tokens": sum(t["input_tokens"] + t["output_tokens"] for t in recent),
        "total_cost_usd": round(sum(t["cost_usd"] for t in recent), 6),
        "avg_latency_ms": round(sum(latencies) / total, 1),
        "p95_latency_ms": p95, "retried_requests": retried, "failed_requests": failed,
        "validation_pass_rate": round((total - failed) / total * 100, 2),
        "by_task": dict(by_task), "by_model": dict(by_model),
    }
