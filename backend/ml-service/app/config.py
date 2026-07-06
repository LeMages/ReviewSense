from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Try multiple possible .env locations
_possible_env_paths = [
    Path(__file__).resolve().parents[3] / ".env" if len(Path(__file__).resolve().parents) > 3 else None,
    Path(__file__).resolve().parents[2] / ".env" if len(Path(__file__).resolve().parents) > 2 else None,
    Path("/app/.env"),
    Path(".env"),
]

ROOT_ENV_FILE = None
for p in _possible_env_paths:
    if p and p.exists():
        ROOT_ENV_FILE = p
        break


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=str(ROOT_ENV_FILE) if ROOT_ENV_FILE else None, extra="ignore")

    MONGO_URI: str = "mongodb://localhost:27017"
    MLFLOW_TRACKING_URI: str = "http://localhost:5000"
    MODEL_NAME: str = "reviewsense-sentiment"
    MODEL_STAGE: str = "Production"


settings = Settings()
