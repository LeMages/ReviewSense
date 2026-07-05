from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app
from app.services.model_loader import model_loader


def test_predict_no_model_returns_503():
    model_loader.model = None
    model_loader.model_version = None

    client = TestClient(app)
    response = client.post("/predict", json={"text": "great product"})

    assert response.status_code == 503
    assert response.json() == {"error": "No model loaded"}


def test_predict_returns_sentiment_and_confidence():
    model_loader.model = object()
    model_loader.model_version = "fallback:local-pickle"

    with patch.object(model_loader, "predict", return_value=("positive", 0.92)), patch(
        "app.routes.predict.log_prediction"
    ):
        client = TestClient(app)
        response = client.post("/predict", json={"text": "great product"})

    assert response.status_code == 200
    assert response.json() == {"sentiment": "positive", "confidence": 0.92}

    model_loader.model = None
    model_loader.model_version = None
