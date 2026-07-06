import argparse
import itertools
import sys
import time

if sys.stdout.encoding is not None and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

import mlflow.sklearn
from mlflow.tracking import MlflowClient
from sklearn.metrics import accuracy_score

import config
from data_utils import load_data, split_data


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run quality gates and promote the Staging model to Production.")
    parser.add_argument("--min-accuracy", type=float, default=0.70)
    parser.add_argument("--max-latency-ms", type=float, default=500.0)
    parser.add_argument("--num-latency-predictions", type=int, default=100)
    return parser.parse_args()


def fail(message: str) -> None:
    print(f"❌ Quality gate failed: {message}")
    sys.exit(1)


def main() -> None:
    args = parse_args()

    mlflow.set_tracking_uri(config.MLFLOW_TRACKING_URI)
    client = MlflowClient()

    staging_versions = client.get_latest_versions(config.MODEL_NAME, stages=["Staging"])
    if not staging_versions:
        fail(f"no model version found in stage 'Staging' for '{config.MODEL_NAME}'")

    model_version = staging_versions[0]
    model_uri = f"models:/{config.MODEL_NAME}/Staging"
    model = mlflow.sklearn.load_model(model_uri)

    df = load_data()
    _, X_test, _, y_test = split_data(df)
    X_test = list(X_test)

    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)

    if accuracy < args.min_accuracy:
        fail(f"accuracy {accuracy:.4f} is below minimum threshold {args.min_accuracy:.4f}")

    samples = list(itertools.islice(itertools.cycle(X_test), args.num_latency_predictions))
    start = time.perf_counter()
    for text in samples:
        model.predict([text])
    elapsed = time.perf_counter() - start
    avg_latency_ms = (elapsed / len(samples)) * 1000

    if avg_latency_ms > args.max_latency_ms:
        fail(f"average latency {avg_latency_ms:.2f}ms exceeds maximum {args.max_latency_ms:.2f}ms")

    client.transition_model_version_stage(
        name=config.MODEL_NAME,
        version=model_version.version,
        stage="Production",
        archive_existing_versions=True,
    )

    print(f"  accuracy    = {accuracy:.4f} (min {args.min_accuracy:.4f})")
    print(f"  avg latency = {avg_latency_ms:.2f}ms (max {args.max_latency_ms:.2f}ms)")
    print("✅ All quality gates passed. Model promoted to Production.")
    sys.exit(0)


if __name__ == "__main__":
    main()
