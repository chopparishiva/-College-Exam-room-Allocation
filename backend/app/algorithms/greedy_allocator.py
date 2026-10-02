"""Greedy room allocation for ExamOpt.

This module contains the core Design-and-Analysis-of-Algorithms contribution of
the project. It is deliberately written in plain, readable Python with no
hidden helper libraries, so the greedy logic is easy to explain to a jury.

THE GREEDY IDEA
---------------
At every step we make the locally best choice:

    "Assign the current exam to the SMALLEST available room that can still
     seat it."

Choosing the smallest sufficient room keeps the large rooms free for the large
exams that follow, which is exactly what the greedy strategy is designed to do.

TIME SLOTS / CONFLICTS
----------------------
A room cannot host two exams whose time intervals overlap on the same date.
We keep a list of reservations and, before choosing, we only consider rooms
that are free during the exam's interval. A room used from 09:00-12:00 is free
again for a 14:00-17:00 exam.
"""

from __future__ import annotations


def _to_minutes(value: str) -> int:
    """Convert 'HH:MM' to minutes since midnight (e.g. '09:30' -> 570)."""
    hours, minutes = value.split(":")
    return int(hours) * 60 + int(minutes)


def _overlaps(reservation: dict, exam: dict) -> bool:
    """True when a reservation and an exam clash in time.

    Two intervals overlap only if they are on the same date AND their time
    ranges intersect (start_a < end_b and start_b < end_a).
    """
    if reservation["date"] != exam["date"]:
        return False
    exam_start = _to_minutes(exam["start_time"])
    exam_end = _to_minutes(exam["end_time"])
    return exam_start < reservation["end"] and reservation["start"] < exam_end


def greedy_allocate(exams: list[dict], rooms: list[dict]) -> dict:
    """Run the greedy allocation.

    Parameters
    ----------
    exams : list of dicts with keys id, subject, students, date,
            start_time, end_time
    rooms : list of dicts with keys id, name, capacity

    Returns
    -------
    dict with keys: allocations, unallocated, decisions, conflicts
    """
    # STEP 1 — Greedy ordering.
    # Process the LARGEST exams first. Large exams have the fewest room
    # options, so deciding for them early avoids blocking them later.
    ordered_exams = sorted(exams, key=lambda e: e["students"], reverse=True)

    # Rooms sorted by capacity ASCENDING. When we scan this list we meet the
    # smallest rooms first, so the first room that fits is the greedy choice.
    rooms_ascending = sorted(rooms, key=lambda r: r["capacity"])

    reservations: list[dict] = []  # rooms already booked for some interval
    allocations: list[dict] = []
    unallocated: list[dict] = []
    decisions: list[dict] = []
    conflicts = 0

    for index, exam in enumerate(ordered_exams, start=1):
        exam_id = exam.get("id") or f"E{index:02d}"

        # STEP 2 — Which rooms are already busy during this exam's slot?
        busy_room_ids = {
            res["room_id"] for res in reservations if _overlaps(res, exam)
        }

        # STEP 3 — Scan rooms from smallest to largest and pick the first fit.
        candidates: list[dict] = []
        chosen: dict | None = None
        for room in rooms_ascending:
            if room["capacity"] < exam["students"]:
                status = "insufficient"          # cannot seat the students
            elif room["id"] in busy_room_ids:
                status = "occupied"              # big enough, but busy in this slot
            elif chosen is None:
                status = "selected"              # smallest room that fits -> take it
                chosen = room
            else:
                status = "not_needed"            # a smaller room was already enough
            candidates.append(
                {"room": room["name"], "capacity": room["capacity"], "status": status}
            )

        if chosen is not None:
            # STEP 4 — Reserve the chosen room for this exam's interval.
            reservations.append(
                {
                    "room_id": chosen["id"],
                    "date": exam["date"],
                    "start": _to_minutes(exam["start_time"]),
                    "end": _to_minutes(exam["end_time"]),
                }
            )
            unused_seats = chosen["capacity"] - exam["students"]
            utilization = round(exam["students"] / chosen["capacity"] * 100, 1) if chosen["capacity"] else 0.0
            allocations.append(
                {
                    "exam_id": exam_id,
                    "subject": exam["subject"],
                    "students": exam["students"],
                    "date": exam["date"],
                    "start_time": exam["start_time"],
                    "end_time": exam["end_time"],
                    "room_id": chosen["id"],
                    "room": chosen["name"],
                    "capacity": chosen["capacity"],
                    "utilization": utilization,
                    "unused_seats": unused_seats,
                    "status": "allocated",
                }
            )
            occupied_smaller = [
                candidate for candidate in candidates
                if candidate["status"] == "occupied" and candidate["capacity"] < chosen["capacity"]
            ]
            if occupied_smaller:
                blocked = ", ".join(
                    f"{candidate['room']} ({candidate['capacity']} seats)"
                    for candidate in occupied_smaller
                )
                reason = (
                    f"{blocked} {'is' if len(occupied_smaller) == 1 else 'are'} occupied in this time slot; "
                    f"{chosen['name']} ({chosen['capacity']} seats) is the smallest available room "
                    f"that can seat {exam['students']} students."
                )
            else:
                reason = (
                    f"{chosen['name']} ({chosen['capacity']} seats) is the smallest "
                    f"available room that can seat {exam['students']} students."
                )
            chosen_candidate = {"room": chosen["name"], "capacity": chosen["capacity"], "status": "selected"}
        else:
            # STEP 5 — Nothing fits. Explain WHY, so the failure is honest.
            big_enough = [r for r in rooms_ascending if r["capacity"] >= exam["students"]]
            if not big_enough:
                reason = "No room in the university is large enough for this exam."
            elif all(r["id"] in busy_room_ids for r in big_enough):
                # A room exists, but every large-enough room is busy in this slot.
                reason = "Every room large enough was already occupied by an overlapping exam."
                conflicts += 1
            else:
                reason = "No suitable room was available for this exam."
            unallocated.append(
                {
                    "exam_id": exam_id,
                    "subject": exam["subject"],
                    "students": exam["students"],
                    "date": exam["date"],
                    "start_time": exam["start_time"],
                    "end_time": exam["end_time"],
                    "status": "unallocated",
                    "reason": reason,
                }
            )
            chosen_candidate = None

        decisions.append(
            {
                "exam_id": exam_id,
                "subject": exam["subject"],
                "students": exam["students"],
                "date": exam["date"],
                "start_time": exam["start_time"],
                "end_time": exam["end_time"],
                "candidates": candidates,
                "chosen": chosen_candidate,
                "reason": reason,
            }
        )

    return {
        "allocations": allocations,
        "unallocated": unallocated,
        "decisions": decisions,
        "conflicts": conflicts,
    }
