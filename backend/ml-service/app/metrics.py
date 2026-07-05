from prometheus_client import Counter, Histogram

prediction_requests_total = Counter(
    "prediction_requests_total",
    "Total number of prediction requests",
    ["sentiment"],
)

prediction_latency_seconds = Histogram(
    "prediction_latency_seconds",
    "Latency of prediction requests in seconds",
)

prediction_errors_total = Counter(
    "prediction_errors_total",
    "Total number of prediction errors",
)
