"""Tests for the ExamOpt greedy allocator, metrics and API.

Run from the backend/ directory:   pytest -q
"""

from __future__ import annotations

from fastapi.testclient import TestClient

from app.algorithms.greedy_allocator import greedy_allocate
from app.data.demo_data import get_dataset
from app.main import app
from app.services.metrics import compute_metrics

client = TestClient(app)

SLOT = {"date": "2025-11-10", "start_time": "09:00", "end_time": "12:00"}


def exam(eid, subject, students, **times):
    return {"id": eid, "subject": subject, "students": students, **SLOT, **times}


def room(rid, name, capacity):
    return {"id": rid, "name": name, "capacity": capacity}


# ------------------------------------------------------------------ 1. basic
def test_basic_allocation_matches_example():
    exams = [
        exam("E1", "Mathematics", 120),
        exam("E2", "Physics", 80),
        exam("E3", "Data Structures", 65),
        exam("E4", "DBMS", 40),
    ]
    rooms = [
        room("R1", "A101", 50),
        room("R2", "A102", 70),
        room("R3", "A103", 100),
        room("R4", "A104", 150),
    ]
    result = greedy_allocate(exams, rooms)
    allocated = {a["subject"]: a["room"] for a in result["allocations"]}
    assert len(result["allocations"]) == 4
    assert result["unallocated"] == []
    assert allocated["DBMS"] == "A101"
    assert allocated["Data Structures"] == "A102"
    assert allocated["Physics"] == "A103"
    assert allocated["Mathematics"] == "A104"


# --------------------------------------------------- 2. smallest suitable room
def test_picks_smallest_suitable_room():
    exams = [exam("E1", "Data Structures", 65)]
    rooms = [room("R1", "A101", 50), room("R2", "A102", 70),
             room("R3", "A103", 100), room("R4", "A104", 150)]
    result = greedy_allocate(exams, rooms)
    chosen = result["allocations"][0]
    assert chosen["room"] == "A102"
    assert chosen["capacity"] == 70  # not 100 or 150


# ------------------------------------------------------- 3. conflict detection
def test_conflict_detection_same_slot():
    exams = [exam("E1", "Exam A", 90), exam("E2", "Exam B", 90)]
    rooms = [room("R1", "A101", 100)]
    result = greedy_allocate(exams, rooms)
    assert len(result["allocations"]) == 1
    assert len(result["unallocated"]) == 1
    assert result["conflicts"] == 1
    assert "occupied" in result["unallocated"][0]["reason"].lower()


# --------------------------------------------------- 4. room reuse across slots
def test_room_reuse_across_time_slots():
    exams = [
        exam("E1", "Morning Exam", 50),
        exam("E2", "Afternoon Exam", 50, start_time="14:00", end_time="17:00"),
    ]
    rooms = [room("R1", "A101", 100)]
    result = greedy_allocate(exams, rooms)
    assert len(result["allocations"]) == 2
    assert result["conflicts"] == 0
    assert {a["room"] for a in result["allocations"]} == {"A101"}


# ------------------------------------------- 5. exam larger than every room
def test_exam_larger_than_all_rooms():
    exams = [exam("E1", "Huge Exam", 500)]
    rooms = [room("R1", "A101", 50), room("R2", "A102", 100)]
    result = greedy_allocate(exams, rooms)
    assert result["allocations"] == []
    assert len(result["unallocated"]) == 1
    assert result["conflicts"] == 0
    assert "large enough" in result["unallocated"][0]["reason"].lower()


# --------------------------------------------------------------- 6. empty input
def test_empty_input_is_safe():
    result = greedy_allocate([], [])
    assert result["allocations"] == []
    assert result["unallocated"] == []
    metrics = compute_metrics([], [], [], 0)
    assert metrics["total_exams"] == 0
    assert metrics["utilization_percentage"] == 0.0
    assert metrics["total_unused_seats"] == 0


def test_exams_but_no_rooms():
    exams = [exam("E1", "Orphan Exam", 10)]
    result = greedy_allocate(exams, [])
    assert len(result["unallocated"]) == 1


# ------------------------------------------------------------- 7. invalid input
def test_invalid_negative_students_rejected():
    payload = {
        "exams": [{"subject": "Bad", "students": -5, "date": "2025-11-10",
                   "start_time": "09:00", "end_time": "12:00"}],
        "rooms": [{"name": "A101", "capacity": 50}],
    }
    response = client.post("/api/allocate", json=payload)
    assert response.status_code == 422
    assert "Invalid input" in response.json()["detail"]


def test_invalid_time_format_rejected():
    payload = {
        "exams": [{"subject": "Bad", "students": 10, "date": "2025-11-10",
                   "start_time": "9am", "end_time": "12:00"}],
        "rooms": [{"name": "A101", "capacity": 50}],
    }
    response = client.post("/api/allocate", json=payload)
    assert response.status_code == 422


# ------------------------------------------- 8. multiple exams at the same time
def test_multiple_exams_same_time_use_different_rooms():
    exams = [exam("E1", "A", 90), exam("E2", "B", 90), exam("E3", "C", 90)]
    rooms = [room("R1", "A101", 100), room("R2", "A102", 100)]
    result = greedy_allocate(exams, rooms)
    assert len(result["allocations"]) == 2
    assert len(result["unallocated"]) == 1
    rooms_used = [a["room"] for a in result["allocations"]]
    assert len(set(rooms_used)) == 2  # never the same room twice in one slot


# ------------------------------------------------------- 9. utilization numbers
def test_utilization_calculation():
    exams = [exam("E1", "Exam", 80)]
    rooms = [room("R1", "A101", 100)]
    result = greedy_allocate(exams, rooms)
    metrics = compute_metrics(exams, result["allocations"], result["unallocated"], result["conflicts"])
    assert metrics["utilization_percentage"] == 80.0
    assert metrics["total_unused_seats"] == 20
    assert metrics["total_capacity_used"] == 100
    assert metrics["students_allocated"] == 80


# --------------------------------------------------------------- demo datasets
def test_normal_demo_allocates_everything():
    data = get_dataset("normal")
    result = greedy_allocate(data["exams"], data["rooms"])
    assert len(result["allocations"]) == len(data["exams"])
    assert result["unallocated"] == []


def test_stress_demo_has_one_unallocated():
    data = get_dataset("stress")
    result = greedy_allocate(data["exams"], data["rooms"])
    assert len(result["unallocated"]) == 1
    assert result["unallocated"][0]["subject"] == "Advanced Cryptography"


def test_conflict_demo_falls_back_to_available_room_and_reports_blocked_exam():
    data = get_dataset("conflict")
    result = greedy_allocate(data["exams"], data["rooms"])

    allocated_rooms = {item["subject"]: item["room"] for item in result["allocations"]}
    assert allocated_rooms["Advanced Mathematics"] == "A203"
    assert allocated_rooms["Computer Science"] == "A201"
    assert allocated_rooms["Database Systems"] == "A202"
    assert len(result["unallocated"]) == 1
    assert result["unallocated"][0]["subject"] == "Statistics"
    assert "occupied" in result["unallocated"][0]["reason"].lower()
    assert result["conflicts"] == 1

    fallback = next(d for d in result["decisions"] if d["subject"] == "Database Systems")
    candidate_status = {candidate["room"]: candidate["status"] for candidate in fallback["candidates"]}
    assert candidate_status["A201"] == "occupied"
    assert candidate_status["A202"] == "selected"
    assert "A201" in fallback["reason"]
    assert "occupied" in fallback["reason"].lower()


# ------------------------------------------------------------------- API tests
def test_health_endpoint():
    assert client.get("/api/health").json()["status"] == "ok"


def test_demo_data_endpoint():
    normal = client.get("/api/demo-data").json()
    assert normal["dataset"] == "normal"
    assert len(normal["exams"]) == 12
    stress = client.get("/api/demo-data", params={"dataset": "stress"}).json()
    assert stress["dataset"] == "stress"
    conflict = client.get("/api/demo-data", params={"dataset": "conflict"}).json()
    assert conflict["dataset"] == "conflict"
    assert len(conflict["exams"]) == 4


def test_allocate_endpoint_end_to_end():
    data = get_dataset("normal")
    response = client.post("/api/allocate", json={"exams": data["exams"], "rooms": data["rooms"]})
    assert response.status_code == 200
    body = response.json()
    assert body["metrics"]["allocated_exams"] == 12
    assert body["metrics"]["unallocated_exams"] == 0
    assert len(body["decisions"]) == 12
    # every decision explains itself
    assert all(d["reason"] for d in body["decisions"])
