import time

from fastapi import APIRouter, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.metrics import (
    prediction_errors_total,
    prediction_latency_seconds,
    prediction_requests_total,
)
from app.services.model_loader import model_loader
from app.services.prediction_logger import log_prediction

router = APIRouter()


class PredictRequest(BaseModel):
    text: str


class PredictResponse(BaseModel):
    sentiment: str
    confidence: float
    model_version: str


@router.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest, background_tasks: BackgroundTasks):
    if not model_loader.is_loaded:
        prediction_errors_total.inc()
        return JSONResponse(
            status_code=503,
            content={
                "error": "No model loaded",
                "detail": "The ML model is not available. Check MLflow configuration.",
            },
        )

    start_time = time.perf_counter()
    try:
        sentiment, confidence = model_loader.predict(request.text)
    except Exception:
        prediction_errors_total.inc()
        return JSONResponse(status_code=500, content={"error": "Prediction failed"})
    finally:
        prediction_latency_seconds.observe(time.perf_counter() - start_time)

    prediction_requests_total.labels(sentiment=sentiment).inc()
    background_tasks.add_task(
        log_prediction,
        text=request.text,
        sentiment=sentiment,
        confidence=confidence,
        model_version=model_loader.model_version,
    )

    return PredictResponse(
        sentiment=sentiment,
        confidence=confidence,
        model_version=model_loader.model_version or "unknown",
    )
