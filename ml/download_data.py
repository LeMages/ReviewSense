"""Download the raw reviews dataset from HuggingFace."""

import csv
import sys
from collections import Counter
from pathlib import Path

OUTPUT_PATH = Path(__file__).parent / "data" / "reviews_raw.csv"
MAX_ROWS = 15_000

PRIMARY_LABEL_MAP = {0: "positive", 1: "neutral", 2: "negative"}


def stars_to_sentiment(stars: int) -> str:
    if stars >= 4:
        return "positive"
    if stars == 3:
        return "neutral"
    return "negative"


def write_rows(rows: list[dict]) -> None:
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_PATH.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["text", "sentiment"])
        writer.writeheader()
        writer.writerows(rows)


def print_summary(rows: list[dict]) -> None:
    counts = Counter(row["sentiment"] for row in rows)
    print(f"Saved {len(rows)} rows to {OUTPUT_PATH}")
    print("Sentiment distribution:")
    for sentiment, count in counts.most_common():
        print(f"  {sentiment}: {count}")


def download_multilingual_sentiments() -> bool:
    try:
        from datasets import load_dataset

        print("Downloading tyqiangz/multilingual-sentiments (english) from HuggingFace...")
        # Loaded via the auto-generated parquet export since `datasets` no longer
        # runs the dataset's loading script.
        url = (
            "https://huggingface.co/datasets/tyqiangz/multilingual-sentiments/"
            "resolve/refs%2Fconvert%2Fparquet/english/train/0000.parquet"
        )
        ds = load_dataset("parquet", data_files={"train": url}, split=f"train[:{MAX_ROWS}]")

        label_feature = ds.features.get("label")
        rows = []
        for row in ds:
            label = row["label"]
            if label_feature is not None and hasattr(label_feature, "int2str"):
                sentiment = label_feature.int2str(label)
            else:
                sentiment = PRIMARY_LABEL_MAP[label]
            rows.append({"text": row["text"].replace("\n", " "), "sentiment": sentiment})

        write_rows(rows)
        print_summary(rows)
        return True
    except Exception as e:
        print(f"HuggingFace download failed: {e}", file=sys.stderr)
        return False


def download_amazon_reviews_multi() -> bool:
    try:
        from datasets import load_dataset

        print("Falling back to mteb/amazon_reviews_multi (en) from HuggingFace...")
        url = (
            "https://huggingface.co/datasets/mteb/amazon_reviews_multi/"
            "resolve/refs%2Fconvert%2Fparquet/en/train/0000.parquet"
        )
        ds = load_dataset("parquet", data_files={"train": url}, split=f"train[:{MAX_ROWS}]")

        rows = []
        for row in ds:
            stars = row["label"] + 1  # label is 0-4, stars are 1-5
            sentiment = stars_to_sentiment(stars)
            rows.append({"text": row["text"].replace("\n", " "), "sentiment": sentiment})

        write_rows(rows)
        print_summary(rows)
        return True
    except Exception as e:
        print(f"HuggingFace fallback download failed: {e}", file=sys.stderr)
        return False


if __name__ == "__main__":
    if not download_multilingual_sentiments():
        if not download_amazon_reviews_multi():
            print("Both dataset downloads failed.", file=sys.stderr)
            sys.exit(1)
