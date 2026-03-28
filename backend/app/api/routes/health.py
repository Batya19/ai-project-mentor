from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
async def healthcheck() -> dict[str, str]:
    # Keep a lightweight endpoint for uptime checks and Docker health probes.
    return {"status": "ok"}
