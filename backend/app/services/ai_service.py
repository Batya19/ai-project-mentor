"""AI service for generating project ideas using Google Gemini (free tier)."""

import json
from typing import Any

import google.generativeai as genai

from app.core.config import settings

# Fallback mock templates when API key is not configured
# Mock project templates for different combinations
PROJECT_TEMPLATES = {
    ("junior", "web"): {
        "title": "Personal Blog Platform",
        "description": "A modern blogging platform where users can create, edit, and share blog posts with markdown support, tagging system, and comment functionality. Perfect for learning full-stack development.",
        "business_value": "Build a portfolio project that demonstrates full-stack proficiency and teaches fundamental web development concepts.",
        "unique_aspects": "Focus on clean UI, user authentication, and real-time interactions using modern web technologies.",
    },
    ("junior", "ai"): {
        "title": "Sentiment Analysis Dashboard",
        "description": "A web application that analyzes sentiment from user-provided text or tweets. Display results with interactive charts and historical analysis.",
        "business_value": "Learn machine learning integration with web services while building a practical tool for social media analysis.",
        "unique_aspects": "Combines NLP, data visualization, and web development in one cohesive project.",
    },
    ("junior", "devops"): {
        "title": "Docker Orchestration Dashboard",
        "description": "A monitoring dashboard that displays Docker container status, resource usage, and logs. Includes container management capabilities.",
        "business_value": "Master containerization and DevOps fundamentals by building practical monitoring tools.",
        "unique_aspects": "Hands-on experience with Docker APIs, real-time metrics, and infrastructure visualization.",
    },
    ("mid", "web"): {
        "title": "Real-Time Collaborative Document Editor",
        "description": "A Google Docs-like collaborative editor with real-time synchronization, version history, commenting system, and rich text formatting.",
        "business_value": "Showcase advanced websockets, conflict resolution, and scalable architecture design.",
        "unique_aspects": "Demonstrates expertise in real-time technologies, state management, and complex UX patterns.",
    },
    ("mid", "ai"): {
        "title": "Intelligent Recommendation Engine",
        "description": "A recommendation system using collaborative filtering and content-based algorithms. Includes A/B testing framework and performance analytics.",
        "business_value": "Portfolio-ready project showing advanced ML techniques and production-level system design.",
        "unique_aspects": "Combines machine learning with web scale, includes performance optimization and data pipeline design.",
    },
    ("advanced", "web"): {
        "title": "Distributed Payment Processing System",
        "description": "A robust payment system with PCI compliance, webhook handlers, reconciliation logic, idempotency guarantees, and fraud detection.",
        "business_value": "Demonstrates advanced backend architecture, security practices, and production readiness.",
        "unique_aspects": "High reliability, complex error handling, and financial data management.",
    },
}


def generate_project_idea(
    level: str, technologies: list[str], domain: str
) -> dict[str, Any]:
    """
    Generate a project idea using Google Gemini (free tier).
    Falls back to mock templates if GEMINI_API_KEY is not configured.
    
    Args:
        level: Project level (junior, mid, advanced)
        technologies: List of technologies to use
        domain: Project domain (web, ai, devops, games)
    
    Returns:
        Dictionary with generated project data
    """
    if settings.gemini_api_key and settings.gemini_api_key != "your_gemini_api_key_here":
        return _generate_with_gemini(level, technologies, domain)
    
    return _generate_mock(level, domain)


def _generate_with_gemini(level: str, technologies: list[str], domain: str) -> dict[str, Any]:
    """Call Gemini API to generate a project idea."""
    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel("gemini-1.5-flash")
    
    prompt = f"""You are a senior software architect. Generate a detailed, portfolio-ready project idea.

Constraints:
- Experience level: {level}
- Technologies: {', '.join(technologies)}
- Domain: {domain}

Return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{{
    "title": "Concise project name",
    "description": "2-3 sentence description of the project",
    "business_value": "Why this project has real-world value",
    "unique_aspects": "What makes this project stand out in a portfolio",
    "roadmap": [
        {{
            "phase": "Phase 1: Setup & Foundation",
            "description": "What this phase achieves",
            "goals": ["Specific goal 1", "Specific goal 2", "Specific goal 3"],
            "deliverables": ["Deliverable 1", "Deliverable 2"]
        }},
        {{
            "phase": "Phase 2: Core Features",
            "description": "What this phase achieves",
            "goals": ["Specific goal 1", "Specific goal 2"],
            "deliverables": ["Deliverable 1", "Deliverable 2"]
        }},
        {{
            "phase": "Phase 3: Polish & Deploy",
            "description": "What this phase achieves",
            "goals": ["Specific goal 1", "Specific goal 2"],
            "deliverables": ["Deliverable 1", "Deliverable 2"]
        }}
    ],
    "tasks": [
        {{
            "phase": "Phase 1: Setup & Foundation",
            "name": "Specific task name",
            "description": "What exactly needs to be done",
            "estimated_hours": 3,
            "completed": false
        }}
    ]
}}

Include 3-5 roadmap phases and 8-12 tasks spread across phases. Tailor complexity to {level} level."""

    response = model.generate_content(prompt)
    raw = response.text.strip()
    
    # Strip markdown code fences if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()
    
    return json.loads(raw)


def _generate_mock(level: str, domain: str) -> dict[str, Any]:
    """Fallback mock generator when no API key is configured."""
    level_key = level.lower()
    domain_key = domain.lower()

    key = (level_key, domain_key)
    template = PROJECT_TEMPLATES.get(key, PROJECT_TEMPLATES.get(("mid", "web"), PROJECT_TEMPLATES[("junior", "web")]))

    # Generate roadmap based on level
    if level_key == "junior":
        roadmap = [
            {
                "phase": "Phase 1: Project Setup & Local Development",
                "description": "Initialize project, set up development environment",
                "goals": ["Create project structure", "Set up version control", "Configure development tools"],
                "deliverables": ["Project scaffold", "README with setup instructions", "Initial commit"],
            },
            {
                "phase": "Phase 2: Core Features Implementation",
                "description": "Build main functionality",
                "goals": ["Implement primary features", "Add user authentication", "Create database models"],
                "deliverables": ["Functional backend API", "Database schema", "Core frontend screens"],
            },
            {
                "phase": "Phase 3: Enhancement & Deployment",
                "description": "Polish and deploy",
                "goals": ["Add error handling", "Write tests", "Deploy to production"],
                "deliverables": ["Polished UI", "Test coverage", "Live deployment"],
            },
        ]
    elif level_key == "mid":
        roadmap = [
            {
                "phase": "Phase 1: Architecture & Infrastructure Design",
                "description": "Plan scalable architecture",
                "goals": ["Design system architecture", "Set up CI/CD pipeline", "Configure monitoring"],
                "deliverables": ["Architecture documentation", "CI/CD setup", "Infrastructure as code"],
            },
            {
                "phase": "Phase 2: Implementation & Integration",
                "description": "Build complex features",
                "goals": ["Implement advanced features", "Integration testing", "Performance optimization"],
                "deliverables": ["Feature-rich backend", "Optimized frontend", "Integration tests"],
            },
            {
                "phase": "Phase 3: Production Hardening",
                "description": "Security and scalability",
                "goals": ["Security audit", "Load testing", "Documentation"],
                "deliverables": ["Security report", "Performance benchmarks", "Complete docs"],
            },
            {
                "phase": "Phase 4: Launch & Monitoring",
                "description": "Go live and monitor",
                "goals": ["Production deployment", "Set up monitoring", "Plan maintenance"],
                "deliverables": ["Live service", "Monitoring dashboard", "SLA documentation"],
            },
        ]
    else:  # advanced
        roadmap = [
            {
                "phase": "Phase 1: Advanced Architecture & Design",
                "description": "Enterprise-grade system design",
                "goals": [
                    "Design fault-tolerant architecture",
                    "Plan for scalability (10x growth)",
                    "Define security strategy",
                ],
                "deliverables": ["Architecture ADRs", "Security model", "Scalability plan"],
            },
            {
                "phase": "Phase 2: Core Platform Development",
                "description": "Build resilient core systems",
                "goals": [
                    "Implement distributed systems patterns",
                    "Build resilience mechanisms",
                    "Create observability layer",
                ],
                "deliverables": ["Core services", "Resilience tools", "Logging/tracing system"],
            },
            {
                "phase": "Phase 3: Advanced Features",
                "description": "Complex business logic",
                "goals": [
                    "Implement sophisticated algorithms",
                    "Build real-time systems",
                    "Add analytics/reporting",
                ],
                "deliverables": ["Advanced features", "Real-time engine", "Analytics platform"],
            },
            {
                "phase": "Phase 4: Enterprise Readiness",
                "description": "Production operations",
                "goals": [
                    "Multi-region deployment",
                    "Disaster recovery",
                    "Compliance & auditing",
                ],
                "deliverables": ["Multi-region setup", "DR procedures", "Compliance docs"],
            },
            {
                "phase": "Phase 5: Launch & Scale",
                "description": "Go live with confidence",
                "goals": ["Gradual rollout", "Performance tuning", "Team training"],
                "deliverables": ["Live service", "Performance report", "Runbooks"],
            },
        ]
    
    # Generate tasks based on level and roadmap
    tasks = []
    task_counts = {"junior": 8, "mid": 15, "advanced": 22}
    task_count = task_counts.get(level_key, 12)
    
    for i, phase in enumerate(roadmap):
        phase_tasks = task_count // len(roadmap)
        base_hours = {"junior": 4, "mid": 6, "advanced": 8}.get(level_key, 5)
        
        for j in range(phase_tasks):
            tasks.append({
                "phase": phase["phase"],
                "name": f"Task {i * phase_tasks + j + 1}: {phase['goals'][j % len(phase['goals'])]}",
                "description": f"Implement {phase['goals'][j % len(phase['goals'])]} as part of {phase['phase']}",
                "estimated_hours": base_hours + (j % 3),
                "completed": False,
            })
    
    return {
        "title": template["title"],
        "description": template["description"],
        "business_value": template["business_value"],
        "unique_aspects": template["unique_aspects"],
        "roadmap": roadmap,
        "tasks": tasks,
    }


def format_roadmap(roadmap_data: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Format roadmap data into expected structure."""
    formatted = []
    for i, phase in enumerate(roadmap_data, 1):
        formatted.append({
            "id": str(i),
            "phase": phase.get("phase", f"Phase {i}"),
            "description": phase.get("description", ""),
            "goals": phase.get("goals", []),
            "deliverables": phase.get("deliverables", []),
        })
    return formatted


def format_tasks(tasks_data: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Format tasks data into expected structure."""
    formatted = []
    for i, task in enumerate(tasks_data, 1):
        formatted.append({
            "id": str(i),
            "phase": task.get("phase", ""),
            "name": task.get("name", ""),
            "description": task.get("description", ""),
            "estimated_hours": task.get("estimated_hours", 0),
            "completed": task.get("completed", False),
        })
    return formatted
