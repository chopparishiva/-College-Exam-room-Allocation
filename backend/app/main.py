"""ExamOpt FastAPI application.

Endpoints
---------
GET  /api/health       - service health check
GET  /api/demo-data    - demo dataset (normal | stress)
POST /api/allocate     - run the greedy allocation on supplied exams + rooms
POST /api/exams        - validate a single exam
POST /api/rooms        - validate a single room

There is no database and no authentication: this is a focused DAA prototype.
"""

from __future__ import annotations

from fastapi import FastAPI, Query, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.algorithms.greedy_allocator import greedy_allocate
from app.data.demo_data import get_dataset
from app.models import (
    AllocateRequest,
    AllocateResponse,
    Exam,
    Room,
)
from app.services.metrics import compute_metrics

app = FastAPI(
    title="ExamOpt API",
    description="Greedy examination room allocation — DAA hackathon prototype.",
    version="1.0.0",
)

# The frontend runs on a different port during development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------------------------------------------------ errors
@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Return clean, readable validation errors instead of a raw 422 dump."""
    messages = []
    for error in exc.errors():
        location = " -> ".join(str(part) for part in error.get("loc", []) if part != "body")
        messages.append(f"{location}: {error.get('msg', 'invalid value')}")
    return JSONResponse(
        status_code=422,
        content={"detail": "Invalid input.", "errors": messages},
    )


# ------------------------------------------------------------------ routes
@app.get("/api/health")
def health() -> dict:
    """Simple liveness check used by the frontend."""
    return {"status": "ok", "service": "ExamOpt"}


@app.get("/api/demo-data")
def demo_data(dataset: str = Query("normal", pattern="^(normal|stress|conflict)$")) -> dict:
    """Return a ready-made normal, stress, or conflict dataset."""
    return get_dataset(dataset)


@app.post("/api/allocate", response_model=AllocateResponse)
def allocate(payload: AllocateRequest) -> dict:
    """Run the greedy allocation and return allocations, metrics and decisions."""
    exams = [exam.model_dump() for exam in payload.exams]
    rooms = [room.model_dump() for room in payload.rooms]

    result = greedy_allocate(exams, rooms)
    metrics = compute_metrics(
        exams=exams,
        allocations=result["allocations"],
        unallocated=result["unallocated"],
        conflicts=result["conflicts"],
    )

    return {
        "allocations": result["allocations"],
        "unallocated": result["unallocated"],
        "metrics": metrics,
        "decisions": result["decisions"],
    }


@app.post("/api/exams")
def create_exam(exam: Exam) -> dict:
    """Validate one exam. Returns the normalised exam (no persistence)."""
    return {"status": "valid", "exam": exam.model_dump()}


@app.post("/api/rooms")
def create_room(room: Room) -> dict:
    """Validate one room. Returns the normalised room (no persistence)."""
    return {"status": "valid", "room": room.model_dump()}
