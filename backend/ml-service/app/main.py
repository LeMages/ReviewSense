import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator

from app.routes import health, predict
from app.services.model_loader import model_loader

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    model_loader.load()
    yield


app = FastAPI(title="ReviewSense ML Service", lifespan=lifespan)

Instrumentator().instrument(app).expose(app)

app.include_router(health.router)
app.include_router(predict.router)
