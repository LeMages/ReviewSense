import hashlib
import subprocess
from pathlib import Path

import pandas as pd
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split

import config


def load_data(path: Path = config.DATA_PATH) -> pd.DataFrame:
    return pd.read_csv(path)


def split_data(
    df: pd.DataFrame,
    test_size: float = config.TEST_SIZE,
    random_state: int = config.RANDOM_STATE,
):
    return train_test_split(
        df["text"],
        df["sentiment"],
        test_size=test_size,
        stratify=df["sentiment"],
        random_state=random_state,
    )


def compute_metrics(y_true, y_pred) -> dict:
    return {
        "accuracy": accuracy_score(y_true, y_pred),
        "f1_macro": f1_score(y_true, y_pred, average="macro"),
        "precision_macro": precision_score(y_true, y_pred, average="macro", zero_division=0),
        "recall_macro": recall_score(y_true, y_pred, average="macro"),
    }


def get_data_version(dvc_file: Path = config.DVC_FILE_PATH) -> str:
    try:
        result = subprocess.run(
            ["dvc", "status", str(dvc_file)],
            capture_output=True,
            text=True,
            timeout=15,
            check=False,
        )
        if result.returncode == 0 and result.stdout.strip():
            return result.stdout.strip()
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass

    return hashlib.md5(dvc_file.read_bytes()).hexdigest()


def get_git_commit() -> str:
    try:
        result = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            capture_output=True,
            text=True,
            timeout=15,
            check=False,
        )
        if result.returncode == 0:
            return result.stdout.strip()
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass

    return "unknown"
