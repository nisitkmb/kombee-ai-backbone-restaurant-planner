"""Task Complexity Engine — scores 0.0–1.0 to drive model selection."""
from __future__ import annotations
from dataclasses import dataclass
from .classifier import TaskType

_BASELINES: dict[TaskType, float] = {
    TaskType.CLASSIFICATION:     0.15,
    TaskType.STOCK_LOOKUP:       0.25,
    TaskType.RAG_QUERY:          0.40,
    TaskType.MENU_EXTRACTION:    0.45,
    TaskType.INVENTORY_PLANNING: 0.55,
    TaskType.QTY_PREDICTION:     0.60,
    TaskType.CODE_GENERATION:    0.70,
    TaskType.REASONING:          0.80,
    TaskType.GENERAL_QA:         0.35,
}
_COMPLEX_KW = ["explain","analyze","compare","why","strategy","recommend","optimize","predict","forecast","seasonal","trend"]
_SIMPLE_KW  = ["list","show","what is","how many","current","today","just","quick","simple"]


@dataclass
class ComplexityResult:
    score: float
    tier: str        # micro | low | medium | high
    token_estimate: int
    reasoning: str


def score(text: str, task_type: TaskType) -> ComplexityResult:
    base = _BASELINES.get(task_type, 0.40)
    delta = 0.0
    token_estimate = max(1, int(len(text) * 0.75))
    for threshold, bonus in [(200,0.05),(500,0.10),(1000,0.15),(2000,0.20)]:
        if token_estimate > threshold:
            delta += bonus
    t = text.lower()
    for kw in _COMPLEX_KW:
        if kw in t: delta += 0.03
    for kw in _SIMPLE_KW:
        if kw in t: delta -= 0.02
    final = round(min(max(base + delta, 0.0), 1.0), 3)
    tier = "micro" if final < 0.40 else "low" if final < 0.65 else "medium" if final < 0.85 else "high"
    return ComplexityResult(score=final, tier=tier, token_estimate=token_estimate,
                            reasoning=f"base={base:.2f} delta={delta:.2f} → {final:.3f} ({tier})")
