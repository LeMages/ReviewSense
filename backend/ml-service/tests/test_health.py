from fastapi.testclient import TestClient

from app.main import app
from app.services.model_loader import model_loader


def test_health_model_not_loaded():
    model_loader.model = None
    model_loader.model_version = None

    client = TestClient(app)
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "model_loaded": False}


def test_health_model_loaded():
    model_loader.model = object()
    model_loader.model_version = "fallback:local-pickle"

    client = TestClient(app)
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "model_loaded": True}

    model_loader.model = None
    model_loader.model_version = None
