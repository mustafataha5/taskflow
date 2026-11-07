
from datetime import datetime


def create_task(
    client,
    title="Test task",
    priority="medium",
    category="personal",
    due_date=None,
):
    payload = {
        "title": title,
        "priority": priority,
        "category": category,
    }

    if due_date is not None:
        payload["due_date"] = due_date

    response = client.post("/tasks", json=payload)
    assert response.status_code == 201
    return response.json()


def test_health_check(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_task(client):
    task = create_task(client, title="Learn FastAPI")

    assert task["id"] is not None
    assert task["title"] == "Learn FastAPI"
    assert task["completed"] is False
    assert task["priority"] == "medium"
    assert task["created_at"] is not None
    assert task["updated_at"] is not None


def test_get_task(client):
    task = create_task(client)

    response = client.get(f"/tasks/{task['id']}")

    assert response.status_code == 200
    assert response.json()["id"] == task["id"]


def test_get_missing_task(client):
    response = client.get("/tasks/9999")

    assert response.status_code == 404


def test_update_task_and_timestamp(client):
    task = create_task(client)

    response = client.patch(
        f"/tasks/{task['id']}",
        json={
            "completed": True,
            "priority": "high"
        }
    )

    assert response.status_code == 200

    updated = response.json()

    assert updated["completed"] is True
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


def test_invalid_priority(client):
    response = client.post(
        "/tasks",
        json={
            "title": "Invalid priority",
            "priority": "urgent"
        }
    )

    assert response.status_code == 422


def test_reject_null_title(client):
    task = create_task(client)

    response = client.patch(
        f"/tasks/{task['id']}",
        json={"title": None}
    )

    assert response.status_code == 422


def test_delete_task(client):
    task = create_task(client)

    response = client.delete(f"/tasks/{task['id']}")

    assert response.status_code == 204

    check = client.get(f"/tasks/{task['id']}")

    assert check.status_code == 404


def test_pagination(client):
    for i in range(12):
        create_task(client, title=f"Task {i + 1}")

    response = client.get(
        "/tasks",
        params={"page": 2, "page_size": 5}
    )

    assert response.status_code == 200
    assert len(response.json()) == 5

    # Sorted by newest first
    assert response.json()[0]["title"] == "Task 7"


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


def test_filter_by_completed(client):
    task = create_task(client)

    client.patch(
        f"/tasks/{task['id']}",
        json={"completed": True}
    )

    response = client.get(
        "/tasks",
        params={"completed": "true"}
    )

    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["completed"] is True


def test_sort_by_due_date(client):
    create_task(
        client, "Later task",
        due_date="2026-12-20T10:00:00Z"
    )
    create_task(
        client, "Earlier task",
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


def test_invalid_pagination(client):
    response = client.get(
        "/tasks",
        params={"page": 0, "page_size": 1000}
    )

    assert response.status_code == 422
