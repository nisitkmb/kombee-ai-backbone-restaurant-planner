"""Cost Policy Engine — budget enforcement and per-request cost tracking."""
from __future__ import annotations
import threading
from dataclasses import dataclass, field
from datetime import date, datetime

MODEL_PRICING: dict[str, dict[str, float]] = {
    "gemini-2.0-flash": {"input": 0.075, "output": 0.30},
    # "o1-preview":       {"input": 15.0,  "output": 60.0},
    # "claude-haiku-3-5": {"input": 0.80,  "output": 4.0},
    # "gpt-4o-mini":      {"input": 0.15,  "output": 0.60},
    # "codestral":        {"input": 0.20,  "output": 0.60},
}

@dataclass
class CostRecord:
    model: str; input_tokens: int; output_tokens: int; cost_usd: float
    task_type: str = ""; timestamp: datetime = field(default_factory=datetime.utcnow)

@dataclass
class BudgetCheck:
    allowed: bool; remaining_tokens: int; reason: str | None = None


class CostPolicyEngine:
    def __init__(self, daily_budget: int = 1_000_000):
        self._budget = daily_budget
        self._lock = threading.Lock()
        self._daily: dict[date, int] = {}
        self._history: list[CostRecord] = []
        self._total_cost = 0.0

    def check_budget(self, estimated_tokens: int = 1000) -> BudgetCheck:
        today = date.today()
        with self._lock:
            used = self._daily.get(today, 0)
            remaining = self._budget - used
            if estimated_tokens > remaining:
                return BudgetCheck(allowed=False, remaining_tokens=remaining,
                                   reason=f"Daily budget exceeded: {used}/{self._budget}")
            return BudgetCheck(allowed=True, remaining_tokens=remaining)

    def record(self, model: str, input_tokens: int, output_tokens: int, task_type: str = "") -> CostRecord:
        p = MODEL_PRICING.get(model, {"input": 0.0, "output": 0.0})
        cost = input_tokens / 1_000_000 * p["input"] + output_tokens / 1_000_000 * p["output"]
        rec = CostRecord(model=model, input_tokens=input_tokens, output_tokens=output_tokens,
                         cost_usd=cost, task_type=task_type)
        with self._lock:
            self._daily[date.today()] = self._daily.get(date.today(), 0) + input_tokens + output_tokens
            self._history.append(rec)
            self._total_cost += cost
        return rec

    def get_summary(self) -> dict:
        today = date.today()
        with self._lock:
            used = self._daily.get(today, 0)
            return {"total_cost_usd": round(self._total_cost, 6), "daily_tokens_used": used,
                    "daily_token_budget": self._budget, "total_requests": len(self._history),
                    "budget_utilization": round(used / self._budget * 100, 2)}

    def get_history(self, limit: int = 50) -> list[dict]:
        with self._lock:
            return [{"model":r.model,"input_tokens":r.input_tokens,"output_tokens":r.output_tokens,
                     "cost_usd":r.cost_usd,"task_type":r.task_type,"timestamp":r.timestamp.isoformat()}
                    for r in self._history[-limit:]]


cost_engine = CostPolicyEngine()
