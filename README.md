# ExamOpt

**Greedy-Powered Examination Scheduling** — a DAA hackathon prototype.

ExamOpt schedules university examinations into rooms so that every exam gets the
**smallest room that can still seat it**, minimising unused seats and preventing
two exams from sharing a room at the same time.

---

## Problem Statement

A university must schedule many examinations on the same day. Each examination
has a subject, a number of students, a date and a start/end time. The university
has a set of rooms, each with a fixed seating capacity.

The problem:

> Assign each examination to a room so that the room is always big enough, no
> room hosts two overlapping examinations, and the amount of **unused seating**
> is as small as possible.

Naively giving every exam the largest room wastes seats. We want a simple,
fast, explainable rule instead.

---

## Solution

ExamOpt uses a **best-fit greedy algorithm**:

1. Process examinations from **largest to smallest** (largest exams have the
   fewest room options).
2. Scan rooms from **smallest capacity to largest**.
3. Give each exam the **first room whose capacity is greater than or equal to
   its number of students** — i.e. the smallest room that still fits.
4. Reserve that room for the exam's time interval so overlapping exams cannot
   reuse it.
5. Repeat. Any exam with no suitable free room is reported as **unallocated**,
   with a clear reason.

---

## Why Greedy?

At every step we make the locally best choice: **the smallest available room
that can accommodate the current examination.**

- It never wastes a large room on a small exam.
- It leaves large rooms free for the large exams that come later.
- It is simple, deterministic and easy to explain — the same input always gives
  the same plan, and every decision can be justified.

> Note: greedy is *not* guaranteed to be globally optimal for every possible
> input. It is a fast, good-quality heuristic. The UI therefore reports
> **"Seat Utilization"** rather than claiming optimality.

---

## Algorithm (pseudocode)

```
GREEDY_ALLOCATE(exams, rooms):
    sort exams by students DESCENDING          # largest first
    sort rooms by capacity ASCENDING           # smallest first
    reservations = []                          # rooms already booked

    for each exam in exams:
        busy = rooms already booked during exam's time slot
        chosen = NULL

        for each room in rooms:                # smallest -> largest
            if room.capacity < exam.students:  skip (too small)
            elif room in busy:                 skip (time conflict)
            else:
                chosen = room                  # first fit = smallest fit
                break

        if chosen is not NULL:
            reserve chosen for exam's interval
            record allocation
        else:
            record exam as unallocated, with a reason

    return allocations, unallocated, conflicts
```

**Time-overlap check:** two exams clash only if they are on the **same date**
and their time ranges intersect:

```
overlap = (start_a < end_b) AND (start_b < end_a)
```

A room used from 09:00–12:00 is free again for a 14:00–17:00 exam.

---

## Complexity Analysis

Let **E** = number of exams, **R** = number of rooms.

| Step | Cost |
| --- | --- |
| Sort exams by students | O(E log E) |
| Sort rooms by capacity | O(R log R) |
| Allocation loop (per exam: scan R rooms, check up to E reservations) | O(E · (R + E)) = O(E·R + E²) |
| **Total time** | **O(E log E + R log R + E·R + E²)** |
| **Space** | **O(E + R)** (reservations + results) |

The implementation uses simple linear scans so the greedy logic stays readable.
For realistic university sizes (tens of exams, tens of rooms) this is instant.

---

## Features

- Greedy room allocation (smallest suitable room)
- Time-conflict detection and room reuse across slots
- Room utilisation, unused seats and efficiency metrics
- Unallocated-exam detection with reasons
- Interactive dashboard, exam and room management
- Normal, stress-test and time-conflict demo datasets
- **Greedy Decision Process** visualisation (candidate rooms + reasons)
- Clear empty / loading / error / demo-mode states
- Backend unavailable → clearly-labelled **Demo Mode** (local computation)

---

## Tech Stack

- **Frontend:** React + Vite, Tailwind CSS, Lucide React, Recharts
- **Backend:** Python, FastAPI, Pydantic
- **Algorithm:** our own greedy implementation (no ML, no solver libraries)
- No database, no authentication.

---

## Project Structure

```
ExamOpt/
├── backend/
│   ├── requirements.txt
│   ├── app/
│   │   ├── main.py                     # FastAPI app + endpoints
│   │   ├── models.py                   # Pydantic models + validation
│   │   ├── algorithms/greedy_allocator.py   # THE greedy algorithm
│   │   ├── services/metrics.py         # efficiency statistics
│   │   └── data/demo_data.py           # normal, stress + conflict datasets
│   └── tests/test_greedy.py            # 17 backend tests
└── frontend/
    ├── .env                            # VITE_API_URL
    └── src/
        ├── components/                 # Sidebar, Header, StatCard, tables,
        │                               # EfficiencyChart, GreedyExplanation …
        ├── pages/                      # Dashboard, Exams, Rooms, Allocation, Algorithm
        ├── services/api.js             # API client (uses VITE_API_URL)
        ├── services/localAllocator.js  # Demo-Mode fallback (clearly labelled)
        ├── data/demoData.js            # local copies of the demo datasets
        └── context/AppContext.jsx      # shared app state
```

---

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | health check |
| GET | `/api/demo-data?dataset=normal\|stress\|conflict` | demo datasets |
| POST | `/api/allocate` | run the greedy allocation |
| POST | `/api/exams` | validate a single exam |
| POST | `/api/rooms` | validate a single room |

`POST /api/allocate` body:

```json
{ "exams": [ ... ], "rooms": [ ... ] }
```

Response:

```json
{
  "allocations": [ ... ],
  "unallocated": [ ... ],
  "metrics": {
    "total_exams": 12, "allocated_exams": 12, "unallocated_exams": 0,
    "total_rooms_used": 9, "total_students": 1003, "students_allocated": 1003,
    "total_capacity_used": 1150, "total_unused_seats": 147,
    "utilization_percentage": 87.22, "conflicts": 0
  },
  "decisions": [ ... ]
}
```

---

## How to Run

### Backend

```bash
cd backend
python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
```

macOS/Linux:

```bash
source venv/bin/activate
```

Then:

```bash
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**.

The API URL is configurable — edit `frontend/.env`:

```
VITE_API_URL=http://localhost:8000
```

### Tests

```bash
cd backend
pytest -q
```

---

## Demo Flow (≈3 minutes)

1. **Dashboard** — 12 exams, 10 rooms, 0 allocation yet.
2. Explain the problem: assign exams to rooms without wasting seats or clashing.
3. Click **Generate Optimal Allocation**.
4. Show the allocation table, **87.2%** seat utilisation and **147** unused seats.
5. Open **Allocation → Greedy Decision Process** and step through one exam:
   *"65 students → 50 is too small → 70 is the smallest suitable room → selected."*
6. Open **Algorithm** — steps and complexity.
7. Click **Load Stress Test**, generate again, and show
   **"1 examination could not be allocated."** (Advanced Cryptography, 500 students
   — no room is large enough).

---

## Datasets

- **Normal** — 12 exams across two time slots (09:00–12:00 and 14:00–17:00),
  10 rooms. Every exam is allocated; seat utilisation ≈ 87%.
- **Stress** — the normal set plus Quantum Computing (190) and Advanced
  Cryptography (500) in the morning slot. Exactly one exam (500 students) cannot
  be allocated because no room is large enough.

---

## Edge Cases Handled

No rooms · no exams · zero students · negative students (rejected) · zero
capacity · exam larger than every room · multiple exams in the same slot · same
room requested by overlapping exams · exams in different slots (room reuse) ·
empty input. Invalid input returns a readable 422 error; nothing crashes.
