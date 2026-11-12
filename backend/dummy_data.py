
import json
from datetime import datetime, timedelta, timezone
from urllib.error import HTTPError
from urllib.request import Request, urlopen

tasks = [
    ("Connect Angular to FastAPI", "todo", "high", "work", 1),
    ("Practice RxJS switchMap", "in_progress", "medium", "learning", 3),
    ("Review monthly expenses", "todo", "medium", "finance", 5),
    ("Plan weekend outing", "todo", "low", "personal", 4),
    ("Schedule a morning walk", "in_progress", "low", "health", 2),
    ("Review API endpoint tests", "completed", "high", "work", 6),
    ("Organize project notes", "archived", "low", "other", 12),
    ("Write HTTP service tests", "todo", "high", "learning", 7),
    ("Check invoice records", "in_progress", "high", "finance", 8),
    ("Update the project README", "completed", "medium", "work", 9),
    ("Clear old downloads", "archived", "low", "personal", 11),
    ("Prepare meals for the week", "completed", "medium", "health", 10),
]

now = datetime.now(timezone.utc)

for title, status, priority, category, days in tasks:
    payload = {
        "title": title,
        "description": "TaskFlow development sample",
        "status": status,
        "priority": priority,
        "category": category,
        "due_date": (now + timedelta(days=days)).isoformat(),
    }

    request = Request(
        "http://127.0.0.1:8000/tasks",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urlopen(request, timeout=10) as response:
            task = json.load(response)
    except HTTPError as error:
        raise SystemExit(f"{title}: HTTP {error.code} — {error.read().decode()}")

    print(f"Created #{task['id']} — {task['title']}")

