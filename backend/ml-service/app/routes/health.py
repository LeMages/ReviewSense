from fastapi import APIRouter
from pydantic import BaseModel

from app.services.model_loader import model_loader

router = APIRouter()


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok", model_loaded=model_loader.is_loaded)
