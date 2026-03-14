"""
AI Backbone Orchestrator — wires all layers with self-healing loop.
"""
from __future__ import annotations
import os, time, uuid
from dataclasses import dataclass, field
import structlog

from .classifier import classify, TaskType
from .complexity_engine import score as complexity_score
from .cost_policy import cost_engine
from .model_router import route
from .validator import validate_response, ValidationStatus
from .observability import observe

logger = structlog.get_logger(__name__)
MAX_RETRIES = 2


@dataclass
class BackboneRequest:
    text: str
    context_docs: list[str] = field(default_factory=list)
    expect_json: bool = False
    json_schema: dict | None = None
    system_prompt: str | None = None
    session_id: str = field(default_factory=lambda: str(uuid.uuid4()))


@dataclass
class BackboneResponse:
    output: str
    task_type: str
    model_used: str
    complexity_score: float
    complexity_tier: str
    input_tokens: int
    output_tokens: int
    cost_usd: float
    latency_ms: int
    validation_status: str
    retries: int
    session_id: str
    trace_id: str = field(default_factory=lambda: str(uuid.uuid4()))


class AIBackbone:
    def __init__(self, llm_client=None):
        self._llm = llm_client

    def _get_llm(self):
        """Always return a working LLM — load Groq if not set."""
        if self._llm is None:
            from langchain_groq import ChatGroq
            self._llm = ChatGroq(
                api_key=os.getenv("GROQ_API_KEY"),
                model_name="llama-3.3-70b-versatile",
                temperature=0.2,
                max_tokens=int(os.getenv("MAX_TOKENS_PER_REQUEST", "4096")),
            )
            logger.info("llm_auto_loaded", model="llama-3.3-70b-versatile")
        return self._llm

    async def process(self, req: BackboneRequest) -> BackboneResponse:
        start = time.monotonic()

        # 1. Classify
        classification = classify(req.text)
        task_type = classification.task_type
        logger.info("classified", task=task_type.value, confidence=classification.confidence)

        # 2. Complexity
        complexity = complexity_score(req.text, task_type)
        logger.info("complexity", score=complexity.score, tier=complexity.tier)

        # 3. Budget check
        budget = cost_engine.check_budget(estimated_tokens=complexity.token_estimate + 1000)
        if not budget.allowed:
            return self._error_response(req, "Daily token budget exceeded", start, task_type)

        # 4. Route model
        routing = route(task_type, complexity)
        logger.info("routed", model=routing.model_id)

        # 5. Build prompt with RAG context
        prompt = self._build_prompt(req)

        # 6. LLM + self-healing loop
        raw_output = ""
        retries = 0
        validation = None
        for attempt in range(MAX_RETRIES + 1):
            raw_output = await self._call_llm(routing.model_id, prompt, req.system_prompt)
            validation = validate_response(
                text=raw_output, task_type=task_type.value,
                expect_json=req.expect_json, json_schema=req.json_schema,
            )
            if validation.status == ValidationStatus.PASSED:
                break
            if attempt < MAX_RETRIES:
                retries += 1
                logger.warning("self_heal", attempt=attempt+1, errors=validation.errors)
                prompt = self._repair_prompt(prompt, validation.errors, attempt + 1)
            else:
                logger.error("validation_failed", errors=validation.errors)

        # 7. Record cost
        in_tok  = len(prompt.split())
        out_tok = len(raw_output.split())
        cost_rec = cost_engine.record(routing.model_id, in_tok, out_tok, task_type.value)

        latency = int((time.monotonic() - start) * 1000)
        resp = BackboneResponse(
            output=validation.sanitized_output or raw_output,
            task_type=task_type.value, model_used=routing.model_id,
            complexity_score=complexity.score, complexity_tier=complexity.tier,
            input_tokens=in_tok, output_tokens=out_tok, cost_usd=cost_rec.cost_usd,
            latency_ms=latency,
            validation_status=validation.status.value if validation else "unknown",
            retries=retries, session_id=req.session_id,
        )
        observe(resp)
        return resp

    def _build_prompt(self, req: BackboneRequest) -> str:
        parts = []
        if req.context_docs:
            ctx = "\n\n".join(f"[Doc {i+1}]\n{d}" for i, d in enumerate(req.context_docs))
            parts.append(f"Use the following retrieved context:\n\n{ctx}\n\n---")
        parts.append(req.text)
        return "\n\n".join(parts)

    def _repair_prompt(self, original: str, errors: list[str], attempt: int) -> str:
        return (f"{original}\n\n[SELF-HEAL ATTEMPT {attempt}]\n"
                f"Fix these issues: {'; '.join(errors)}\nRespond correctly.")

    async def _call_llm(self, model_id: str, prompt: str, system_prompt: str | None) -> str:
        llm = self._get_llm()
        from langchain_core.messages import HumanMessage, SystemMessage
        messages = []
        if system_prompt:
            messages.append(SystemMessage(content=system_prompt))
        messages.append(HumanMessage(content=prompt))
        response = await llm.ainvoke(messages)
        return response.content

    def _error_response(self, req, message, start, task_type) -> BackboneResponse:
        return BackboneResponse(
            output=message, task_type=task_type.value, model_used="none",
            complexity_score=0.0, complexity_tier="none",
            input_tokens=0, output_tokens=0, cost_usd=0.0,
            latency_ms=int((time.monotonic() - start) * 1000),
            validation_status="error", retries=0, session_id=req.session_id,
        )


backbone = AIBackbone()