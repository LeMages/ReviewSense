import argparse
import pickle

from sklearn.metrics import classification_report

import config
from data_utils import compute_metrics, load_data, split_data


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Evaluate a trained sentiment model on the test set.")
    parser.add_argument("--model-path", type=str, default=str(config.MODEL_OUTPUT_PATH))
    parser.add_argument("--model-uri", type=str, default=None, help="MLflow model URI, e.g. models:/reviewsense-sentiment/Staging")
    parser.add_argument("--test-size", type=float, default=config.TEST_SIZE)
    return parser.parse_args()


def load_model(args: argparse.Namespace):
    if args.model_uri:
        import mlflow.sklearn

        mlflow.set_tracking_uri(config.MLFLOW_TRACKING_URI)
        return mlflow.sklearn.load_model(args.model_uri)

    with open(args.model_path, "rb") as f:
        return pickle.load(f)


def main() -> None:
    args = parse_args()

    df = load_data()
    _, X_test, _, y_test = split_data(df, test_size=args.test_size)

    model = load_model(args)
    y_pred = model.predict(X_test)

    metrics = compute_metrics(y_test, y_pred)

    print("Evaluation metrics:")
    for name, value in metrics.items():
        print(f"  {name:16s} = {value:.4f}")
    print()
    print("Classification report:")
    print(classification_report(y_test, y_pred, zero_division=0))


if __name__ == "__main__":
    main()
