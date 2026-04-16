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

    return f"""You are a world-class principal engineer who has built systems at Stripe, Vercel, and Figma. You think in systems, not features. You design projects that teach real engineering — not tutorial-level exercises.

Your mission: design ONE project that would genuinely impress a hiring manager at a top-tier tech company. It must teach the developer real patterns they'll use in production, not academic exercises.

Project constraints:
- Experience level: {level}
- Technologies: {stack}
- Domain: {domain}
- Desired business value: {business_context}
- Desired uniqueness: {uniqueness_context}

INNOVATION DIRECTIVES (follow these strictly):
- Think about what makes this domain HARD. What are the gnarly edge cases? Build the project around solving those.
- The project must have at least ONE technically surprising element — something that makes a reviewer say "oh, that's clever" (e.g. using CRDTs for offline sync, event sourcing for audit trails, bloom filters for deduplication, circuit breakers for resilience).
- Name real-world patterns: Saga, CQRS, Outbox, Strangler Fig, Feature Flags, Blue-Green, Canary, Back-pressure, Dead Letter Queue, Idempotency Keys, Optimistic Locking, etc. Use them where they genuinely fit.
- Reference specific libraries and tools by name (e.g. "Zod for runtime validation", "Drizzle ORM with prepared statements", "Bull MQ for job queues", "Vitest with MSW for API mocking"). Never say "a testing framework" — say which one and why.
- The project should have a data flow story: where does data enter, how does it transform, where does it land, and what happens when something fails?

Anti-patterns to AVOID:
- "Set up project structure" — this is not a task, it's a given.
- "Create REST endpoints for CRUD operations" — specify WHICH entities, WHICH validation, WHICH edge cases.
- "Add error handling" — specify WHAT errors, WHERE they propagate, and HOW they recover.
- "Write tests" — specify WHAT behavior, WHAT boundary conditions, and WHAT test strategy (unit vs integration vs e2e).
- "Deploy to cloud" — specify WHICH provider, WHAT config, WHAT zero-downtime strategy.
- Any task that could apply to ANY project is too generic. Every task must be married to THIS project's domain.

Project shape guidelines:
- For {level} level, calibrate scope and complexity. Junior = guided but real. Mid = production-grade. Advanced = distributed/scalable.
- Phase 1 should NOT be "setup". It should be "Build the core domain model and prove the hardest technical bet". Developers should write real code from day 1.
- The final phase should include observability, graceful degradation, or operational readiness — not just "deploy".
- At least one phase must involve a non-trivial integration (external API, message queue, real-time channel, ML model, or file processing pipeline).

Task quality rules:
- Every task must be a concrete implementation step a developer can start coding immediately.
- Each task description MUST reference specific files, modules, patterns, libraries, or architectural components.
- Task names start with a strong verb. Vary verbs — don't repeat "Implement" or "Create" more than twice.
- Estimated hours must be realistic for {level}. Include time for understanding, not just typing.
- At least 3 tasks must involve error handling, edge cases, or failure scenarios specific to this project.
- At least 2 tasks must involve testing specific behavior (not generic "write tests").

Output rules:
- Return ONLY valid JSON. Do not wrap in markdown.
- Title: distinctive, memorable. No generic words like "Platform", "Hub", "Manager" unless essential.
- Description: 2-3 sentences. Name the core user persona, the primary workflow, and the key technical insight.
- business_value: a specific, measurable outcome (not "learn new things").
- unique_aspects: 2-3 concrete technical differentiators that reference specific patterns or approaches.
- tech_challenge: 2-3 sentences about the hardest engineering problems in this project. Be specific — mention concurrency issues, consistency guarantees, state management complexity, data pipeline challenges, or security concerns.
- recommended_technologies: an array of 2-6 additional technologies/libraries/tools that the project NEEDS but the user did NOT list. These are your expert recommendations — databases, message queues, testing tools, CI tools, monitoring, linters, etc. Only include technologies NOT already in the user's list ({stack}). If the user's stack is complete, return an empty array.
- design_decisions: 3-5 ADRs. Each must name the CHOSEN approach AND the rejected alternative with a clear reason (e.g. "Chose RabbitMQ over Kafka because this project's message volume doesn't justify Kafka's operational complexity, and RabbitMQ's routing flexibility fits the multi-tenant notification patterns better").
- Roadmap: 4-6 phases. Each has 3-4 goals, 2-3 deliverables, 2-4 skills, a "pitfall" (1-2 sentences warning about the most common mistake developers make in this phase — be specific, name the anti-pattern and its consequence), and "tools" (1-3 specific dev tool recommendations with one-line explanations of why they help in this phase).
- Tasks: 14-20 total, distributed across phases.
- mermaid_diagram: a valid Mermaid.js flowchart (graph TD or graph LR) showing the project's data flow architecture. Include the main components (client, API, database, external services, queues, etc.) with labeled edges showing what data flows between them. Use subgraphs to group related services. Keep it under 30 lines.

Return this exact JSON structure:
{{
    "title": "Concise project name",
    "description": "2-3 sentence description",
    "business_value": "Specific measurable outcome",
    "unique_aspects": "2-3 technical differentiators",
    "tech_challenge": "2-3 sentences on the hardest engineering problems",
    "mermaid_diagram": "graph TD\n  A[Client] -->|REST| B[API Gateway]\n  B --> C[Service]\n  C --> D[(Database)]",
    "design_decisions": [
        {{
            "title": "Chosen approach vs rejected alternative",
            "rationale": "1-2 sentences with specific reasoning for THIS project"
        }}
    ],
    "recommended_technologies": ["Tech the user didn't pick but the project needs"],
    "roadmap": [
        {{
            "phase": "Phase 1: Domain Core & Technical Spike",
            "description": "What this phase achieves and proves",
            "goals": ["Goal 1", "Goal 2", "Goal 3"],
            "deliverables": ["Deliverable 1", "Deliverable 2"],
            "skills": ["Skill 1", "Skill 2", "Skill 3"],
            "pitfall": "The most common mistake in this phase and its consequence",
            "tools": ["Tool: why it helps here"]
        }}
    ],
    "tasks": [
        {{
            "phase": "Phase 1: Domain Core & Technical Spike",
            "name": "Verb + specific engineering action",
            "description": "Exact step with file/module/pattern/library references and expected outcome",
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
        temperature=0.55,
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a principal engineer who designs innovative, non-obvious software projects. "
                    "You think like someone who has shipped production systems at scale. "
                    "Every project you design teaches real engineering patterns — not textbook exercises. "
                    "You reference specific libraries, patterns (CQRS, Saga, Circuit Breaker, etc.), and architectural trade-offs. "
                    "Generic filler, repeated task phrasing, setup-only phases, and stack-agnostic ideas are unacceptable. "
                    "Output strict JSON only."
                ),
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
        "Rules:",
        "- If they are in an active phase, give a SPECIFIC technical insight related to that phase's engineering challenge. Name a pattern, tool, or technique they should know about RIGHT NOW.",
        "- Examples of GOOD tips: 'Add a correlation ID middleware before you add more services — tracing distributed requests without one is a nightmare', 'Your React state is going to get complex here — consider extracting a useReducer with discriminated union actions before adding more features', 'Set up database indexes on your most-queried columns now, not after you notice slowness in production'.",
        "- Examples of BAD tips: 'Keep up the good work!', 'You're making great progress!', 'Stay focused!'.",
        "- Be the senior engineer who saves them 4 hours of debugging with one sentence.",
        "- If they have zero progress, be direct about what to start with and WHY.",
        "- If they're almost done, point out what production-readiness steps they might be skipping.",
    ]

    user_message = "\n".join(lines)

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        temperature=0.7,
        max_tokens=150,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a brutally practical senior architect mentoring a developer on their real project. "
                    "You give ONE message — 2-3 sentences max — that contains a specific, actionable technical insight. "
                    "You name specific tools, patterns, config flags, library methods, or architectural principles. "
                    "You sound like a human who has debugged this exact problem before at 2am. "
                    "Never be generic. Never be cheerful for the sake of it. Never give progress summaries. "
                    "Just the insight. No greetings, no sign-offs, no bullet points."
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
            "skills": phase.get("skills", []),
            "pitfall": phase.get("pitfall", ""),
            "tools": phase.get("tools", []),
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
