"""Efficiency statistics for an allocation run.

Kept separate from the algorithm so the greedy logic stays clean: the allocator
decides *what* to assign, this module measures *how good* the result is.
"""

from __future__ import annotations


def compute_metrics(
    exams: list[dict],
    allocations: list[dict],
    unallocated: list[dict],
    conflicts: int,
) -> dict:
    """Build the metrics block returned by POST /api/allocate."""

    total_exams = len(exams)
    allocated_exams = len(allocations)
    unallocated_exams = len(unallocated)

    # Distinct rooms that received at least one exam.
    total_rooms_used = len({a["room_id"] for a in allocations})

    # Students across ALL exams (allocated or not).
    total_students = sum(e["students"] for e in exams)
    # Students that actually received a room.
    students_allocated = sum(a["students"] for a in allocations)

    # Seats offered by the rooms we actually used, versus seats filled.
    total_capacity_used = sum(a["capacity"] for a in allocations)
    total_unused_seats = total_capacity_used - students_allocated

    utilization = (
        round(students_allocated / total_capacity_used * 100, 2)
        if total_capacity_used
        else 0.0
    )

    return {
        "total_exams": total_exams,
        "allocated_exams": allocated_exams,
        "unallocated_exams": unallocated_exams,
        "total_rooms_used": total_rooms_used,
        "total_students": total_students,
        "students_allocated": students_allocated,
        "total_capacity_used": total_capacity_used,
        "total_unused_seats": total_unused_seats,
        "utilization_percentage": utilization,
        "conflicts": conflicts,
    }
