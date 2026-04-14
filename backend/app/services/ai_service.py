"""AI service for generating project ideas using Groq."""

import json
from typing import Any

from groq import Groq

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
    level: str,
    technologies: list[str],
    domain: str,
    business_value: str = "",
    unique_aspects: str = "",
) -> dict[str, Any]:
    """
    Generate a project idea using Groq.
    Falls back to mock templates if GROQ_API_KEY is not configured or the API fails.
    """
    if settings.groq_api_key and settings.groq_api_key != "your_groq_api_key_here":
        try:
            return _generate_with_groq(
                level,
                technologies,
                domain,
                business_value=business_value,
                unique_aspects=unique_aspects,
            )
        except Exception:
            # Fall back to mock on any API error.
            pass
    
    return _generate_mock(level, domain)


def _build_generation_prompt(
    level: str,
    technologies: list[str],
    domain: str,
    business_value: str = "",
    unique_aspects: str = "",
) -> str:
    stack = ", ".join(technologies)
    business_context = business_value.strip() or "Infer a concrete business outcome tied to the chosen domain."
    uniqueness_context = unique_aspects.strip() or "Invent 2-3 specific differentiators that are technically credible for this stack."

    return f"""You are a principal software architect and startup product strategist.

Design one project that feels specific, credible, and portfolio-worthy for this exact input.

Project constraints:
- Experience level: {level}
- Technologies: {stack}
- Domain: {domain}
- Desired business value: {business_context}
- Desired uniqueness: {uniqueness_context}

Quality bar:
- Avoid generic ideas such as basic CRUD dashboards, task managers, blogs, e-commerce clones, generic chat apps, or "AI assistant" wrappers unless the input explicitly requires them.
- Make the concept domain-specific with named user personas, real data objects, and a concrete workflow.
- Use the provided technologies in a believable way. The roadmap and tasks must reference stack-specific implementation choices, not vague placeholders.
- Every phase must move the product toward a real outcome, not just "build frontend" or "set up backend".
- Every task must be concrete, implementation-ready, and tied to a feature, integration, data model, or operational concern.
- Estimated hours must be realistic for a {level} engineer.
- Repetition is failure. Vary the project shape, terminology, and roadmap structure.

Output rules:
- Return ONLY valid JSON.
- Do not wrap JSON in markdown.
- Use the exact schema below.
- Title must be distinctive and not contain generic suffixes like "Platform", "Dashboard", or "System" unless strongly justified by the concept.
- Description must be 2-3 sentences and include the core user, primary workflow, and why the idea matters.
- business_value must name a measurable or operational benefit.
- unique_aspects must mention 2-3 concrete differentiators.
- Create 4-6 roadmap phases.
- Create 10-14 tasks total.
- Each roadmap phase must have 3-4 goals and 2-3 deliverables.
- Each task name must start with a strong verb and avoid repeating the same verb too often.
- At least 70% of tasks must mention a domain entity, workflow, integration, validation rule, analytics surface, automation, or deployment concern.

Return this exact JSON structure:
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
}}"""


def _generate_with_groq(
    level: str,
    technologies: list[str],
    domain: str,
    business_value: str = "",
    unique_aspects: str = "",
) -> dict[str, Any]:
    """Call Groq API to generate a project idea."""
    client = Groq(api_key=settings.groq_api_key)
    prompt = _build_generation_prompt(
        level,
        technologies,
        domain,
        business_value=business_value,
        unique_aspects=unique_aspects,
    )

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        temperature=0.45,
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": "You generate specific, non-generic software project plans as strict JSON. Generic filler, repeated task phrasing, and stack-agnostic ideas are unacceptable.",
            },
            {"role": "user", "content": prompt},
        ],
    )
    raw = response.choices[0].message.content.strip()
    
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


def generate_coach_message(
    project_title: str,
    level: str,
    domain: str,
    done_tasks: int,
    total_tasks: int,
    completed_phases: int,
    total_phases: int,
    daily_streak: int,
    active_phase: str | None = None,
) -> str:
    """
    Generate a short AI coaching message based on real project progress stats.
    Returns an empty string when no API key is configured or the call fails,
    so callers can fall back to deterministic copy without any error handling.
    """
    if not (settings.groq_api_key and settings.groq_api_key != "your_groq_api_key_here"):
        return ""
    try:
        return _generate_coach_with_groq(
            project_title=project_title,
            level=level,
            domain=domain,
            done_tasks=done_tasks,
            total_tasks=total_tasks,
            completed_phases=completed_phases,
            total_phases=total_phases,
            daily_streak=daily_streak,
            active_phase=active_phase,
        )
    except Exception:
        return ""


def _generate_coach_with_groq(
    project_title: str,
    level: str,
    domain: str,
    done_tasks: int,
    total_tasks: int,
    completed_phases: int,
    total_phases: int,
    daily_streak: int,
    active_phase: str | None,
) -> str:
    """Call Groq to generate a short, project-specific coaching message."""
    client = Groq(api_key=settings.groq_api_key)

    progress_pct = round((done_tasks / total_tasks) * 100) if total_tasks > 0 else 0

    lines = [
        f'Project: "{project_title}"',
        f"Level: {level} | Domain: {domain}",
        "",
        "Current state:",
        f"- Tasks completed: {done_tasks}/{total_tasks} ({progress_pct}%)",
        f"- Phases closed: {completed_phases}/{total_phases}",
        f"- Active build streak (consecutive days with at least one completed task): {daily_streak} day(s)",
    ]
    if active_phase:
        lines.append(f"- Currently active phase: {active_phase}")
    else:
        lines.append("- No active phase remaining (all work is done or not started)")

    lines += [
        "",
        "Write a coaching message for this developer right now.",
    ]

    user_message = "\n".join(lines)

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        temperature=0.65,
        max_tokens=90,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a direct, experienced technical mentor. "
                    "Your job is to give one coaching message (2 sentences maximum) "
                    "that is specific to the developer's real project progress. "
                    "Reference the project by name or domain when it adds value. "
                    "Be honest and tactical, not generic or cheerful. "
                    "No greetings, no sign-offs, no bullet points — just the message."
                ),
            },
            {"role": "user", "content": user_message},
        ],
    )
    return response.choices[0].message.content.strip()


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
