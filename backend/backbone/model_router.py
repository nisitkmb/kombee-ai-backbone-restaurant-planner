"""Model Router — selects the best model based on complexity score."""
from __future__ import annotations
import os
from dataclasses import dataclass
from .classifier import TaskType
from .complexity_engine import ComplexityResult


@dataclass
class RoutingDecision:
    model_id: str; model_name: str; reason: str
    complexity_score: float; estimated_cost_tier: str


def get_llm():
    """Return Groq LLM instance — call this anywhere you need a fresh LLM."""
    from langchain_groq import ChatGroq
    return ChatGroq(
        api_key=os.getenv("GROQ_API_KEY"),
        model_name="llama-3.3-70b-versatile",
        temperature=0.2,
        max_tokens=int(os.getenv("MAX_TOKENS_PER_REQUEST", "4096")),
    )


def route(task_type: TaskType, complexity: ComplexityResult) -> RoutingDecision:
    """
    FREE TIER: all tasks → Groq llama-3.3-70b-versatile
    14,400 requests/day — no quota issues.

    MULTI-MODEL (uncomment when paid keys available):
    ┌─────────────┬──────────────────────┐
    │ score > 0.85│ o1-preview           │
    │ code + 0.65 │ codestral            │
    │ 0.40–0.65   │ claude-haiku-3-5     │
    │ < 0.40      │ gpt-4o-mini          │
    └─────────────┴──────────────────────┘
    """
    return RoutingDecision(
        model_id="llama-3.3-70b-versatile",
        model_name="Llama 3.3 70B (Groq)",
        reason=f"Free tier — Groq llama-3.3-70b handles all tasks (score={complexity.score:.2f})",
        complexity_score=complexity.score,
        estimated_cost_tier=complexity.tier,
    )

    # ── PRODUCTION ROUTING (uncomment) ────────────────────────────────────
    # score = complexity.score
    # if score > 0.85:
    #     return RoutingDecision("o1-preview","GPT o1-preview",f"High complexity ({score:.2f})",score,complexity.tier)
    # if score > 0.65 and task_type == TaskType.CODE_GENERATION:
    #     return RoutingDecision("codestral","Codestral",f"Code task ({score:.2f})",score,complexity.tier)
    # if score > 0.40:
    #     return RoutingDecision("claude-haiku-3-5","Claude Haiku 3.5",f"Medium ({score:.2f})",score,complexity.tier)
    # return RoutingDecision("gpt-4o-mini","GPT-4o mini",f"Low complexity ({score:.2f})",score,complexity.tier)