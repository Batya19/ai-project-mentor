from unittest.mock import patch


def register_and_login(client, email: str = "user@example.com", password: str = "password123") -> str:
    register_response = client.post(
        "/api/auth/register",
        json={"email": email, "password": password},
    )
    assert register_response.status_code == 201

    login_response = client.post(
        "/api/auth/login",
        json={"email": email, "password": password},
    )
    assert login_response.status_code == 200
    return login_response.json()["access_token"]


def auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_auth_me_returns_current_user(client) -> None:
    token = register_and_login(client)

    me_response = client.get("/api/auth/me", headers=auth_headers(token))

    assert me_response.status_code == 200
    body = me_response.json()
    assert body["email"] == "user@example.com"
    assert "id" in body


def test_create_project_persists_extended_fields(client) -> None:
    token = register_and_login(client)
    payload = {
        "title": "AI Sprint Planner",
        "description": "Plan engineering work across milestones with automated prioritization.",
        "level": "mid",
        "domain": "ai",
        "business_value": "Helps teams prioritize high-impact work.",
        "unique_aspects": "Combines roadmap planning with task scoring.",
        "technologies": ["FastAPI", "React"],
        "roadmap": [{"phase": "Phase 1", "goals": ["Set up API"]}],
        "tasks": [{"phase": "Phase 1", "name": "Create models"}],
        "progress": 15,
    }

    response = client.post("/api/projects", json=payload, headers=auth_headers(token))

    assert response.status_code == 201
    body = response.json()
    assert body["domain"] == "ai"
    assert body["business_value"] == payload["business_value"]
    assert body["unique_aspects"] == payload["unique_aspects"]
    assert body["progress"] == 15


def test_project_crud_flow(client) -> None:
    token = register_and_login(client)
    create_response = client.post(
        "/api/projects",
        json={
            "title": "Mentor Dashboard",
            "description": "Track project progress across phases and tasks.",
            "level": "junior",
            "domain": "web",
            "business_value": "Improves visibility into delivery status.",
            "unique_aspects": "Phase-based task tracking.",
            "technologies": ["FastAPI"],
            "roadmap": [],
            "tasks": [],
            "progress": 0,
        },
        headers=auth_headers(token),
    )
    assert create_response.status_code == 201
    project_id = create_response.json()["id"]

    list_response = client.get("/api/projects", headers=auth_headers(token))
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1

    get_response = client.get(f"/api/projects/{project_id}", headers=auth_headers(token))
    assert get_response.status_code == 200
    assert get_response.json()["title"] == "Mentor Dashboard"

    update_response = client.put(
        f"/api/projects/{project_id}",
        json={"progress": 60, "title": "Mentor Dashboard v2"},
        headers=auth_headers(token),
    )
    assert update_response.status_code == 200
    assert update_response.json()["progress"] == 60
    assert update_response.json()["title"] == "Mentor Dashboard v2"

    delete_response = client.delete(f"/api/projects/{project_id}", headers=auth_headers(token))
    assert delete_response.status_code == 204

    missing_response = client.get(f"/api/projects/{project_id}", headers=auth_headers(token))
    assert missing_response.status_code == 404


def test_generate_project_uses_ai_payload_shape(client) -> None:
    token = register_and_login(client)
    ai_payload = {
        "title": "Smart Hiring Assistant",
        "description": "Analyze candidate pipelines and surface bottlenecks.",
        "business_value": "Improves recruiting efficiency.",
        "unique_aspects": "Blends analytics with workflow automation.",
        "roadmap": [
            {
                "phase": "Phase 1: Setup & Foundation",
                "description": "Lay the groundwork.",
                "goals": ["Set up backend", "Design schema"],
                "deliverables": ["Initial API", "DB schema"],
            }
        ],
        "tasks": [
            {
                "phase": "Phase 1: Setup & Foundation",
                "name": "Create database models",
                "description": "Add initial persistence layer.",
                "estimated_hours": 4,
                "completed": False,
            }
        ],
    }

    with patch("app.api.routes.projects.generate_project_idea", return_value=ai_payload):
        response = client.post(
            "/api/projects/generate",
            json={"level": "mid", "technologies": ["FastAPI", "React"], "domain": "ai"},
            headers=auth_headers(token),
        )

    assert response.status_code == 201
    body = response.json()
    assert body["title"] == ai_payload["title"]
    assert body["domain"] == "ai"
    assert body["roadmap"][0]["phase"] == "Phase 1: Setup & Foundation"
    assert body["tasks"][0]["name"] == "Create database models"


def test_generate_project_defaults_optional_fields(client) -> None:
    token = register_and_login(client, email="generate-defaults@example.com")
    ai_payload = {
        "title": "General Mentor Platform",
        "description": "Generate plans without a selected domain.",
        "business_value": "AI fallback business value.",
        "unique_aspects": "AI fallback uniqueness.",
        "roadmap": [],
        "tasks": [],
    }

    with patch("app.api.routes.projects.generate_project_idea", return_value=ai_payload):
        response = client.post(
            "/api/projects/generate",
            json={"level": "mid", "technologies": ["FastAPI", "React"]},
            headers=auth_headers(token),
        )

    assert response.status_code == 201
    body = response.json()
    assert body["domain"] == "general"
    assert body["business_value"] == ai_payload["business_value"]
    assert body["unique_aspects"] == ai_payload["unique_aspects"]