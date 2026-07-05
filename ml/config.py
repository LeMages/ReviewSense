import os
from pathlib import Path

ML_DIR = Path(__file__).resolve().parent

DATA_PATH = ML_DIR / "data" / "reviews_raw.csv"
DVC_FILE_PATH = ML_DIR / "data" / "reviews_raw.csv.dvc"
MODEL_OUTPUT_PATH = ML_DIR / "models" / "model.pkl"

MLFLOW_TRACKING_URI = os.environ.get("MLFLOW_TRACKING_URI", "http://localhost:5000")
MLFLOW_EXPERIMENT_NAME = "reviewsense-sentiment"
MODEL_NAME = "reviewsense-sentiment"

RANDOM_STATE = 42
TEST_SIZE = 0.2

MAX_FEATURES = 10000
NGRAM_RANGE = (1, 2)
C = 1.0
MAX_ITER = 1000
