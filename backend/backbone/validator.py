"""Validation & Guardrail Layer — JSON, hallucination, code lint, tool call checks."""
from __future__ import annotations
import ast, json, re
from dataclasses import dataclass
from enum import Enum


class ValidationStatus(str, Enum):
    PASSED = "passed"; FAILED = "failed"; HEALED = "healed"


@dataclass
class ValidationResult:
    status: ValidationStatus
    checks: dict[str, bool]
    errors: list[str]
    sanitized_output: str | None = None


_HALLUCINATION_SIGNALS = [
    r"as of my (knowledge|training) (cutoff|date)",
    r"i (don't|do not) have (access|information)",
    r"i (cannot|can't) (verify|confirm)",
    r"i (made up|invented|fabricated)",
    r"i (don't|do not) actually know",
]


def validate_json(text: str, schema: dict | None = None) -> tuple[bool, str | None]:
    m = re.search(r"```(?:json)?\s*([\s\S]+?)```", text)
    json_str = m.group(1).strip() if m else text.strip()
    try:
        parsed = json.loads(json_str)
        if schema:
            for key in schema.get("required", []):
                if key not in parsed:
                    return False, f"Missing key: '{key}'"
        return True, None
    except json.JSONDecodeError as e:
        return False, f"JSON error: {e}"


def detect_hallucination(text: str) -> tuple[bool, str | None]:
    for p in _HALLUCINATION_SIGNALS:
        if re.search(p, text.lower()):
            return True, p
    return False, None


def lint_code(text: str) -> tuple[bool, str | None]:
    for block in re.findall(r"```(?:python)?\s*([\s\S]+?)```", text):
        try:
            ast.parse(block)
        except SyntaxError as e:
            return False, str(e)
    return True, None


def validate_response(text: str, task_type: str = "", expect_json: bool = False,
                      json_schema: dict | None = None, has_code: bool = False) -> ValidationResult:
    checks: dict[str, bool] = {}
    errors: list[str] = []

    if expect_json:
        ok, err = validate_json(text, json_schema)
        checks["json_valid"] = ok
        if not ok: errors.append(f"JSON: {err}")

    is_h, sig = detect_hallucination(text)
    checks["no_hallucination"] = not is_h
    if is_h: errors.append(f"Hallucination: {sig}")

    if has_code:
        ok, err = lint_code(text)
        checks["code_valid"] = ok
        if not ok: errors.append(f"Lint: {err}")

    checks["non_empty"] = len(text.strip()) > 10
    if not checks["non_empty"]: errors.append("Response too short")

    if errors:
        return ValidationResult(status=ValidationStatus.FAILED, checks=checks, errors=errors)
    return ValidationResult(status=ValidationStatus.PASSED, checks=checks, errors=[], sanitized_output=text.strip())
