"""Use Case Classification Layer — detects intent and maps to TaskType."""
from __future__ import annotations
import re
from dataclasses import dataclass
from enum import Enum


class TaskType(str, Enum):
    INVENTORY_PLANNING = "inventory_planning"
    MENU_EXTRACTION    = "menu_extraction"
    QTY_PREDICTION     = "qty_prediction"
    STOCK_LOOKUP       = "stock_lookup"
    RAG_QUERY          = "rag_query"
    CLASSIFICATION     = "classification"
    CODE_GENERATION    = "code_generation"
    REASONING          = "reasoning"
    GENERAL_QA         = "general_qa"


_PATTERNS: list[tuple[TaskType, list[str]]] = [
    (TaskType.INVENTORY_PLANNING, [r"inventory", r"restock", r"purchase.{0,20}plan", r"what.{0,20}order", r"cart", r"buy.{0,20}ingredient"]),
    (TaskType.MENU_EXTRACTION,    [r"extract.{0,20}menu", r"dishes.{0,20}menu", r"parse.{0,20}menu", r"what.{0,30}dish", r"food item"]),
    (TaskType.QTY_PREDICTION,     [r"predict.{0,20}quant", r"how much.{0,20}should", r"forecast", r"demand.{0,20}next", r"quantity.{0,20}next"]),
    (TaskType.STOCK_LOOKUP,       [r"current stock", r"available.{0,20}stock", r"in stock", r"stock level", r"how much.{0,20}have"]),
    (TaskType.CODE_GENERATION,    [r"write.{0,20}code", r"function", r"script", r"sql query", r"python"]),
    (TaskType.REASONING,          [r"explain why", r"analyze", r"compare", r"strategy", r"recommendation"]),
]


@dataclass
class ClassificationResult:
    task_type: TaskType
    confidence: float
    matched_pattern: str | None
    fallback_used: bool = False


def classify(text: str) -> ClassificationResult:
    text_lower = text.lower()
    best_type: TaskType | None = None
    best_pattern: str | None = None
    match_count = 0
    for task_type, patterns in _PATTERNS:
        for pattern in patterns:
            if re.search(pattern, text_lower):
                match_count += 1
                if best_type is None:
                    best_type = task_type
                    best_pattern = pattern
    if best_type is None:
        return ClassificationResult(task_type=TaskType.RAG_QUERY, confidence=0.45, matched_pattern=None, fallback_used=True)
    return ClassificationResult(task_type=best_type, confidence=min(0.55 + match_count * 0.12, 0.99), matched_pattern=best_pattern)
