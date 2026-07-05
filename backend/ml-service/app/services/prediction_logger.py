import logging
from datetime import datetime, timezone

from pymongo import MongoClient

from app.config import settings

logger = logging.getLogger(__name__)

_client: MongoClient | None = None


def get_client() -> MongoClient:
    global _client
    if _client is None:
        _client = MongoClient(settings.MONGO_URI)
    return _client


def log_prediction(text: str, sentiment: str, confidence: float, model_version: str | None) -> None:
    try:
        db = get_client().get_database("reviewsense")
        db.predictions.insert_one(
            {
                "text": text,
                "sentiment": sentiment,
                "confidence": confidence,
                "model_version": model_version,
                "timestamp": datetime.now(timezone.utc),
            }
        )
    except Exception:
        logger.exception("Failed to log prediction to MongoDB")
