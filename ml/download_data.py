"""Download or generate the raw reviews dataset."""

import csv
import random
import sys
from pathlib import Path

OUTPUT_PATH = Path(__file__).parent / "data" / "reviews_raw.csv"
MAX_ROWS = 20_000


def download_from_huggingface() -> bool:
    try:
        from datasets import load_dataset

        print("Downloading Amazon Reviews Polarity from HuggingFace...")
        ds = load_dataset("amazon_polarity", split=f"train[:{MAX_ROWS}]")
        with OUTPUT_PATH.open("w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=["text", "sentiment"])
            writer.writeheader()
            for row in ds:
                sentiment = "positive" if row["label"] == 1 else "negative"
                writer.writerow({"text": row["content"].replace("\n", " "), "sentiment": sentiment})
        print(f"Saved {len(ds)} rows to {OUTPUT_PATH}")
        return True
    except Exception as e:
        print(f"HuggingFace download failed: {e}", file=sys.stderr)
        return False


def generate_synthetic() -> None:
    print("Generating synthetic dataset (100 rows)...")
    sentiments = ["positive", "negative", "neutral"]
    templates = {
        "positive": [
            "This product is absolutely amazing, I love it.",
            "Great quality and fast shipping, highly recommend.",
            "Exceeded my expectations, will buy again.",
            "Perfect item, exactly as described.",
            "Works flawlessly, very happy with this purchase.",
        ],
        "negative": [
            "Terrible quality, broke after one day.",
            "Very disappointed, not as advertised.",
            "Waste of money, do not buy this.",
            "Poor craftsmanship and bad customer service.",
            "Stopped working after a week, awful product.",
        ],
        "neutral": [
            "It is okay, nothing special about it.",
            "Average product, does what it says.",
            "Decent quality for the price.",
            "Not bad but not great either.",
            "Serves its purpose, no complaints.",
        ],
    }

    random.seed(42)
    rows = []
    for _ in range(100):
        sentiment = random.choice(sentiments)
        text = random.choice(templates[sentiment])
        rows.append({"text": text, "sentiment": sentiment})

    with OUTPUT_PATH.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["text", "sentiment"])
        writer.writeheader()
        writer.writerows(rows)
    print(f"Saved {len(rows)} synthetic rows to {OUTPUT_PATH}")


if __name__ == "__main__":
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    if not download_from_huggingface():
        generate_synthetic()
