"""RAG Retriever — top-K similarity search using FAISS."""
from __future__ import annotations
import time
from dataclasses import dataclass
import structlog
from .ingestion import _load_index, _embeddings

logger = structlog.get_logger(__name__)
TOP_K = 5


@dataclass
class RetrievedChunk:
    text: str; score: float; source: str; chunk_index: int


def retrieve(query: str, collection_name: str = "menu_docs", k: int = TOP_K) -> list[RetrievedChunk]:
    start = time.monotonic()
    index = _load_index(collection_name)
    if index is None:
        return []

    embeddings = _embeddings()
    docs_and_scores = index.similarity_search_with_score(query, k=k)

    latency = int((time.monotonic() - start) * 1000)
    chunks = []
    for doc, score in docs_and_scores:
        chunks.append(RetrievedChunk(
            text=doc.page_content,
            score=round(float(1 / (1 + score)), 4),
            source=doc.metadata.get("source", "unknown"),
            chunk_index=doc.metadata.get("chunk_index", 0),
        ))

    logger.info("retrieval", query=query[:60], n=len(chunks), latency_ms=latency)
    return chunks


def retrieve_multi(query: str, k: int = TOP_K) -> list[RetrievedChunk]:
    all_chunks: list[RetrievedChunk] = []
    for col in ["menu_docs", "ingredient_kb"]:
        all_chunks.extend(retrieve(query, col, k))
    seen: set[str] = set()
    unique: list[RetrievedChunk] = []
    for c in sorted(all_chunks, key=lambda x: x.score, reverse=True):
        if c.text not in seen:
            seen.add(c.text)
            unique.append(c)
        if len(unique) >= k:
            break
    return unique


def build_context(chunks: list[RetrievedChunk]) -> str:
    if not chunks:
        return ""
    parts = ["=== Retrieved Context ==="]
    for i, c in enumerate(chunks, 1):
        parts.append(f"[Source {i}: {c.source} | score={c.score:.3f}]\n{c.text}")
    return "\n\n".join(parts)