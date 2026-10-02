"""Pydantic models for ExamOpt.

These define the shape of exams, rooms, and the allocation request/response.
Validation is intentionally strict and beginner-friendly: bad input produces a
clear error message instead of a crash.
"""

from __future__ import annotations

import re
from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator, model_validator

# A time must look like 09:00 or 14:30 (24-hour clock).
TIME_PATTERN = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")
# A date must look like 2025-11-10.
DATE_PATTERN = re.compile(r"^\d{4}-\d{2}-\d{2}$")


class Exam(BaseModel):
    """One examination to be scheduled."""

    id: Optional[str] = None
    subject: str = Field(..., min_length=1, description="Subject name")
    students: int = Field(..., ge=0, description="Number of students (>= 0)")
    date: str = Field(..., description="Exam date, YYYY-MM-DD")
    start_time: str = Field(..., description="Start time, HH:MM")
    end_time: str = Field(..., description="End time, HH:MM")

    @field_validator("subject")
    @classmethod
    def subject_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Subject name cannot be blank")
        return v.strip()

    @field_validator("date")
    @classmethod
    def date_format(cls, v: str) -> str:
        if not DATE_PATTERN.match(v):
            raise ValueError("Date must be in YYYY-MM-DD format")
        return v

    @field_validator("start_time", "end_time")
    @classmethod
    def time_format(cls, v: str) -> str:
        if not TIME_PATTERN.match(v):
            raise ValueError("Time must be in HH:MM 24-hour format")
        return v

    @model_validator(mode="after")
    def end_after_start(self) -> "Exam":
        if to_minutes(self.end_time) <= to_minutes(self.start_time):
            raise ValueError("end_time must be later than start_time")
        return self


class Room(BaseModel):
    """One examination hall / room."""

    id: Optional[str] = None
    name: str = Field(..., min_length=1, description="Room name, e.g. A101")
    capacity: int = Field(..., ge=0, description="Seating capacity (>= 0)")

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Room name cannot be blank")
        return v.strip()


class AllocateRequest(BaseModel):
    """Body of POST /api/allocate."""

    exams: list[Exam]
    rooms: list[Room]


class CandidateRoom(BaseModel):
    """Why a particular room was or was not chosen for an exam."""

    room: str
    capacity: int
    status: Literal["selected", "not_needed", "insufficient", "occupied"]


class AllocationItem(BaseModel):
    """A successfully allocated exam."""

    exam_id: str
    subject: str
    students: int
    date: str
    start_time: str
    end_time: str
    room_id: str
    room: str
    capacity: int
    utilization: float
    unused_seats: int
    status: Literal["allocated"] = "allocated"


class UnallocatedItem(BaseModel):
    """An exam that could not be placed."""

    exam_id: str
    subject: str
    students: int
    date: str
    start_time: str
    end_time: str
    status: Literal["unallocated"] = "unallocated"
    reason: str


class Metrics(BaseModel):
    """Aggregate statistics for one allocation run."""

    total_exams: int
    allocated_exams: int
    unallocated_exams: int
    total_rooms_used: int
    total_students: int
    students_allocated: int
    total_capacity_used: int
    total_unused_seats: int
    utilization_percentage: float
    conflicts: int


class Decision(BaseModel):
    """One step of the greedy decision process (for the visualisation)."""

    exam_id: str
    subject: str
    students: int
    date: str
    start_time: str
    end_time: str
    candidates: list[CandidateRoom]
    chosen: Optional[CandidateRoom] = None
    reason: str


class AllocateResponse(BaseModel):
    """Body of the POST /api/allocate response."""

    allocations: list[AllocationItem]
    unallocated: list[UnallocatedItem]
    metrics: Metrics
    decisions: list[Decision]


class DemoDataResponse(BaseModel):
    """Body of GET /api/demo-data."""

    dataset: str
    exams: list[Exam]
    rooms: list[Room]


# ----------------------------------------------------------------- helpers
def to_minutes(value: str) -> int:
    """Convert 'HH:MM' to minutes since midnight (used for overlap checks)."""
    hours, minutes = value.split(":")
    return int(hours) * 60 + int(minutes)
