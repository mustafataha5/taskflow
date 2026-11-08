
from datetime import datetime


# -----------------------------------
# HELPER: CREATE TASK
# -----------------------------------

def create_task(
    client,
    title="Test task",
    priority="medium",
    category="personal",
    task_status="todo",
    due_date=None,
):
    payload = {
        "title": title,
        "priority": priority,
        "category": category,
        "status": task_status,
    }

    if due_date is not None:
        payload["due_date"] = due_date

    response = client.post("/tasks", json=payload)
    assert response.status_code == 201
    return response.json()


# -----------------------------------
# HEALTH CHECK
# -----------------------------------

def test_health_check(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


# -----------------------------------
# CREATE TASK
# -----------------------------------

def test_create_task(client):
    task = create_task(client, title="Learn FastAPI")

    assert task["id"] is not None
    assert task["title"] == "Learn FastAPI"
    assert task["status"] == "todo"
    assert task["priority"] == "medium"
    assert task["category"] == "personal"
    assert task["created_at"] is not None
    assert task["updated_at"] is not None


def test_create_task_with_new_category(client):
    task = create_task(
        client,
        title="Review expenses",
        category="finance",
        task_status="in_progress"
    )

    assert task["category"] == "finance"
    assert task["status"] == "in_progress"


def test_create_task_with_health_category(client):
    task = create_task(
        client,
        title="Morning exercise",
        category="health"
    )

    assert task["category"] == "health"


# -----------------------------------
# GET TASK
# -----------------------------------

def test_get_task(client):
    task = create_task(client)

    response = client.get(f"/tasks/{task['id']}")

    assert response.status_code == 200
    assert response.json()["id"] == task["id"]


def test_get_missing_task(client):
    response = client.get("/tasks/9999")

    assert response.status_code == 404


# -----------------------------------
# UPDATE TASK
# -----------------------------------

def test_update_task_and_timestamp(client):
    task = create_task(client)

    response = client.patch(
        f"/tasks/{task['id']}",
        json={
            "status": "completed",
            "priority": "high"
        }
    )

    assert response.status_code == 200

    updated = response.json()

    assert updated["status"] == "completed"
    assert updated["priority"] == "high"
    assert updated["created_at"] == task["created_at"]

    before = datetime.fromisoformat(task["updated_at"])
    after = datetime.fromisoformat(updated["updated_at"])

    assert after >= before


def test_empty_patch_preserves_timestamp(client):
    task = create_task(client)

    response = client.patch(
        f"/tasks/{task['id']}",
        json={}
    )

    assert response.status_code == 200
    assert response.json()["updated_at"] == task["updated_at"]


def test_reject_null_title(client):
    task = create_task(client)

    response = client.patch(
        f"/tasks/{task['id']}",
        json={"title": None}
    )

    assert response.status_code == 422


def test_reject_null_status(client):
    task = create_task(client)

    response = client.patch(
        f"/tasks/{task['id']}",
        json={"status": None}
    )

    assert response.status_code == 422


def test_clear_due_date(client):
    task = create_task(
        client,
        due_date="2026-12-20T10:00:00Z"
    )

    response = client.patch(
        f"/tasks/{task['id']}",
        json={"due_date": None}
    )

    assert response.status_code == 200
    assert response.json()["due_date"] is None


# -----------------------------------
# VALIDATION
# -----------------------------------

def test_invalid_priority(client):
    response = client.post(
        "/tasks",
        json={
            "title": "Invalid priority",
            "priority": "urgent"
        }
    )

    assert response.status_code == 422


def test_invalid_status(client):
    response = client.post(
        "/tasks",
        json={
            "title": "Invalid status",
            "status": "unknown"
        }
    )

    assert response.status_code == 422


def test_invalid_category(client):
    response = client.post(
        "/tasks",
        json={
            "title": "Invalid category",
            "category": "unknown"
        }
    )

    assert response.status_code == 422


def test_reject_legacy_completed_field(client):
    response = client.post(
        "/tasks",
        json={
            "title": "Old format",
            "completed": True
        }
    )

    assert response.status_code == 422


# -----------------------------------
# DELETE TASK
# -----------------------------------

def test_delete_task(client):
    task = create_task(client)

    response = client.delete(f"/tasks/{task['id']}")

    assert response.status_code == 204

    check = client.get(f"/tasks/{task['id']}")

    assert check.status_code == 404


# -----------------------------------
# PAGINATION
# -----------------------------------

def test_pagination(client):
    for i in range(12):
        create_task(client, title=f"Task {i + 1}")

    response = client.get(
        "/tasks",
        params={"page": 2, "page_size": 5}
    )

    assert response.status_code == 200
    assert len(response.json()) == 5

    # Sorted newest first, with ID as tie-breaker.
    assert response.json()[0]["title"] == "Task 7"


def test_invalid_pagination(client):
    response = client.get(
        "/tasks",
        params={"page": 0, "page_size": 1000}
    )

    assert response.status_code == 422


# -----------------------------------
# FILTERING
# -----------------------------------

def test_filter_by_priority_and_category(client):
    create_task(
        client, "Learning Python", "high", "learning"
    )
    create_task(
        client, "Office work", "high", "work"
    )
    create_task(
        client, "Read book", "low", "learning"
    )

    response = client.get(
        "/tasks",
        params={
            "priority": "high",
            "category": "learning"
        }
    )

    assert response.status_code == 200

    tasks = response.json()

    assert len(tasks) == 1
    assert tasks[0]["title"] == "Learning Python"


def test_filter_by_status(client):
    completed_task = create_task(
        client,
        title="Completed task",
        task_status="completed"
    )

    create_task(
        client,
        title="Pending task",
        task_status="todo"
    )

    response = client.get(
        "/tasks",
        params={"status": "completed"}
    )

    assert response.status_code == 200

    tasks = response.json()

    assert len(tasks) == 1
    assert tasks[0]["id"] == completed_task["id"]
    assert tasks[0]["status"] == "completed"


def test_filter_by_archived_status(client):
    task = create_task(client)

    response = client.patch(
        f"/tasks/{task['id']}",
        json={"status": "archived"}
    )

    assert response.status_code == 200

    response = client.get(
        "/tasks",
        params={"status": "archived"}
    )

    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["id"] == task["id"]
    assert response.json()[0]["status"] == "archived"


def test_invalid_status_filter(client):
    response = client.get(
        "/tasks",
        params={"status": "unknown"}
    )

    assert response.status_code == 422


# -----------------------------------
# SORTING
# -----------------------------------

def test_sort_by_due_date(client):
    create_task(
        client,
        "Later task",
        due_date="2026-12-20T10:00:00Z"
    )

    create_task(
        client,
        "Earlier task",
        due_date="2026-11-20T10:00:00Z"
    )

    response = client.get(
        "/tasks",
        params={
            "sort_by": "due_date",
            "order": "asc"
        }
    )

    assert response.status_code == 200

    assert [
        task["title"] for task in response.json()
    ] == ["Earlier task", "Later task"]


def test_invalid_sort_field(client):
    response = client.get(
        "/tasks",
        params={"sort_by": "unknown"}
    )

    assert response.status_code == 422
