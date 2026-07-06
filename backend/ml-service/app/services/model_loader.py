import logging
import pickle
from pathlib import Path
from typing import Any, Optional

import mlflow
import mlflow.sklearn

from app.config import settings

logger = logging.getLogger(__name__)

FALLBACK_MODEL_PATH = Path(__file__).resolve().parent.parent / "fallback_model.pkl"


class ModelLoader:
    def __init__(self) -> None:
        self.model: Optional[Any] = None
        self.model_version: Optional[str] = None

    def load(self) -> None:
        if self._load_from_mlflow():
            return
        if self._load_fallback():
            return
        logger.warning("No model available. /predict will return 503.")

    def _load_from_mlflow(self) -> bool:
        try:
            mlflow.set_tracking_uri(settings.MLFLOW_TRACKING_URI)
            model_uri = f"models:/{settings.MODEL_NAME}/{settings.MODEL_STAGE}"
            self.model = mlflow.sklearn.load_model(model_uri)
            self.model_version = f"mlflow:{settings.MODEL_NAME}/{settings.MODEL_STAGE}"
            logger.info("Loaded model from MLflow registry: %s", model_uri)
            return True
        except Exception:
            logger.exception("Failed to load model from MLflow registry")
            return False

    def _load_fallback(self) -> bool:
        if not FALLBACK_MODEL_PATH.exists():
            logger.warning("No fallback model found at %s", FALLBACK_MODEL_PATH)
            self.model = None
            self.model_version = None
            return False

        try:
            with open(FALLBACK_MODEL_PATH, "rb") as f:
                self.model = pickle.load(f)
            self.model_version = "fallback:local-pickle"
            logger.info("Loaded fallback model from %s", FALLBACK_MODEL_PATH)
            return True
        except Exception:
            logger.exception("Failed to load fallback model")
            self.model = None
            self.model_version = None
            return False

    @property
    def is_loaded(self) -> bool:
        return self.model is not None

    def predict(self, text: str) -> tuple[str, float]:
        if self.model is None:
            raise RuntimeError("No model loaded")

        label = self.model.predict([text])[0]
        probas = self.model.predict_proba([text])[0]
        confidence = float(probas.max())

        return str(label), confidence


model_loader = ModelLoader()
