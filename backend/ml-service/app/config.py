from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    MONGO_URI: str = "mongodb://localhost:27017"
    MLFLOW_TRACKING_URI: str = "http://localhost:5000"
    MODEL_NAME: str = "reviewsense-sentiment"
    MODEL_STAGE: str = "Production"


settings = Settings()
