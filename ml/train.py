import argparse
import pickle
import sys

if sys.stdout.encoding is not None and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

import mlflow
import mlflow.sklearn
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

import config
from data_utils import compute_metrics, get_data_version, get_git_commit, load_data, split_data


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train the ReviewSense sentiment model.")
    parser.add_argument("--max-features", type=int, default=config.MAX_FEATURES)
    parser.add_argument("--c", type=float, default=config.C)
    parser.add_argument("--test-size", type=float, default=config.TEST_SIZE)
    return parser.parse_args()


def build_pipeline(max_features: int, c: float) -> Pipeline:
    return Pipeline(
        [
            (
                "tfidf",
                TfidfVectorizer(max_features=max_features, ngram_range=config.NGRAM_RANGE),
            ),
            ("clf", LogisticRegression(C=c, max_iter=config.MAX_ITER)),
        ]
    )


def main() -> None:
    args = parse_args()

    df = load_data()
    X_train, X_test, y_train, y_test = split_data(df, test_size=args.test_size)

    pipeline = build_pipeline(max_features=args.max_features, c=args.c)
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    metrics = compute_metrics(y_test, y_pred)

    config.MODEL_OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(config.MODEL_OUTPUT_PATH, "wb") as f:
        pickle.dump(pipeline, f)

    try:
        mlflow.set_tracking_uri(config.MLFLOW_TRACKING_URI)
        mlflow.set_experiment(config.MLFLOW_EXPERIMENT_NAME)

        with mlflow.start_run():
            mlflow.log_params(
                {
                    "max_features": args.max_features,
                    "ngram_range": config.NGRAM_RANGE,
                    "C": args.c,
                    "max_iter": config.MAX_ITER,
                    "test_size": args.test_size,
                }
            )
            mlflow.log_metrics(metrics)
            mlflow.set_tag("data_version", get_data_version())
            mlflow.set_tag("git_commit", get_git_commit())
            mlflow.sklearn.log_model(
                pipeline,
                "model",
                registered_model_name=config.MODEL_NAME,
            )
    except Exception:
        print("⚠️ MLflow unreachable, skipping remote logging")

    print("Training complete.")
    print(f"  max_features   = {args.max_features}")
    print(f"  ngram_range    = {config.NGRAM_RANGE}")
    print(f"  C              = {args.c}")
    print(f"  max_iter       = {config.MAX_ITER}")
    print(f"  test_size      = {args.test_size}")
    print("Test set metrics:")
    for name, value in metrics.items():
        print(f"  {name:16s} = {value:.4f}")
    print(f"Model saved locally to {config.MODEL_OUTPUT_PATH}")


if __name__ == "__main__":
    main()
