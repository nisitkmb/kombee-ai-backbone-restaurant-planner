"""RAG Ingestion — PDF → PyMuPDF → LangChain chunks → FAISS vector store."""
from __future__ import annotations
import os, pickle
from pathlib import Path
from typing import BinaryIO
import structlog

logger = structlog.get_logger(__name__)

FAISS_DIR     = os.getenv("CHROMA_PERSIST_DIR", "./faiss_db")
CHUNK_SIZE    = 512
CHUNK_OVERLAP = 50


def _embeddings():
    try:
        from langchain_huggingface import HuggingFaceEmbeddings
    except ImportError:
        from langchain_community.embeddings import HuggingFaceEmbeddings
    return HuggingFaceEmbeddings(
        model_name="all-MiniLM-L6-v2",
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True},
    )


def extract_text(file: BinaryIO, filename: str) -> str:
    ext = Path(filename).suffix.lower()
    if ext == ".pdf":
        import fitz
        doc = fitz.open(stream=file.read(), filetype="pdf")
        text = "\n\n".join(page.get_text() for page in doc)
        doc.close()
        return text
    return file.read().decode("utf-8", errors="replace")


def chunk_text(text: str) -> list[str]:
    from langchain_text_splitters import RecursiveCharacterTextSplitter
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP,
        separators=["\n\n", "\n", ".", " ", ""],
    )
    return splitter.split_text(text)


def _index_path(collection_name: str) -> str:
    os.makedirs(FAISS_DIR, exist_ok=True)
    return os.path.join(FAISS_DIR, f"{collection_name}.pkl")


def _load_index(collection_name: str):
    path = _index_path(collection_name)
    if os.path.exists(path):
        with open(path, "rb") as f:
            return pickle.load(f)
    return None


def _save_index(index, collection_name: str):
    with open(_index_path(collection_name), "wb") as f:
        pickle.dump(index, f)


def ingest_document(file: BinaryIO, filename: str,
                    collection_name: str = "menu_docs",
                    metadata: dict | None = None) -> dict:
    from langchain_community.vectorstores import FAISS
    from langchain_core.documents import Document

    logger.info("ingestion_start", filename=filename)
    text   = extract_text(file, filename)
    chunks = chunk_text(text)
    logger.info("chunked", n=len(chunks))

    embeddings = _embeddings()
    docs = [
        Document(
            page_content=c,
            metadata={"source": filename, "chunk_index": i, **(metadata or {})}
        )
        for i, c in enumerate(chunks)
    ]

    existing = _load_index(collection_name)
    if existing:
        existing.add_documents(docs)
        index = existing
    else:
        index = FAISS.from_documents(docs, embeddings)

    _save_index(index, collection_name)

    stats = {
        "filename": filename,
        "collection": collection_name,
        "char_count": len(text),
        "chunk_count": len(chunks),
        "vector_count": index.index.ntotal,
    }
    logger.info("ingestion_complete", **stats)
    return stats


def get_collection_stats() -> dict:
    result = {}
    for name in ["menu_docs", "ingredient_kb", "seasonal_data"]:
        idx = _load_index(name)
        result[name] = {"count": idx.index.ntotal if idx else 0}
    return result