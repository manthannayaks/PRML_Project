from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import pandas as pd

import config
from utils import compute_score


def load_metrics_csv(metrics_path):
    df = pd.read_csv(metrics_path)
    metrics = dict(zip(df["metric"], df["value"]))
    return {key: float(value) for key, value in metrics.items()}


def collect_rankings(split):
    rows = []
    best_experiment_name = None

    if split == "test" and config.BEST_MODEL_PATH.exists():
        best_df = pd.read_csv(config.BEST_MODEL_PATH)
        if not best_df.empty:
            best_experiment_name = best_df.iloc[0]["experiment_name"]

    pattern = f"*/{split}/{split}_metrics.csv"
    for metrics_path in sorted(config.REPORTS_DIR.glob(pattern)):
        experiment_name = metrics_path.parent.parent.name

        if best_experiment_name is not None and experiment_name != best_experiment_name:
            continue

        metrics = load_metrics_csv(metrics_path)
        metrics["score"] = compute_score(metrics)

        row = {
            "experiment_name": experiment_name,
            "split": split,
            "metrics_path": str(metrics_path),
        }
        row.update(metrics)
        rows.append(row)

    if len(rows) == 0:
        return pd.DataFrame()

    ranking_df = pd.DataFrame(rows)
    ranking_df = ranking_df.sort_values(
        by=["score", "recall@1_cross_domain", "map_cross_domain"],
        ascending=False,
    ).reset_index(drop=True)
    ranking_df["rank"] = range(1, len(ranking_df) + 1)

    ordered_columns = [
        "rank",
        "experiment_name",
        "split",
        "score",
        "recall@1_cross_domain",
        "map_cross_domain",
        "accuracy_top1",
        "same_domain_top1_ratio",
        "precision@1_cross_domain",
        "recall@5_cross_domain",
        "precision@5_cross_domain",
        "recall@10_cross_domain",
        "precision@10_cross_domain",
        "metrics_path",
    ]
    existing_columns = [col for col in ordered_columns if col in ranking_df.columns]
    remaining_columns = [col for col in ranking_df.columns if col not in existing_columns]
    return ranking_df[existing_columns + remaining_columns]


def save_top_scores_plot(path, ranking_df, split, top_n):
    top_df = ranking_df.head(top_n).copy()
    if top_df.empty:
        return

    top_df = top_df.sort_values("score", ascending=True)

    fig_height = max(6, 0.5 * len(top_df) + 2)
    fig, ax = plt.subplots(figsize=(12, fig_height))
    bars = ax.barh(top_df["experiment_name"], top_df["score"], color="teal")

    ax.set_title(f"Top {len(top_df)} {split.title()} Configurations by Cross-Domain Score")
    ax.set_xlabel("Score")
    ax.set_ylabel("Configuration")
    ax.grid(axis="x", alpha=0.25)

    x_max = max(top_df["score"].max() * 1.12, 0.1)
    ax.set_xlim(0, x_max)

    for bar, (_, row) in zip(bars, top_df.iterrows()):
        ax.text(
            row["score"] + 0.01,
            bar.get_y() + bar.get_height() / 2,
            (
                f"{row['score']:.3f} "
                f"(R@1={row['recall@1_cross_domain']:.3f}, "
                f"mAP={row['map_cross_domain']:.3f})"
            ),
            va="center",
            fontsize=9,
        )

    fig.text(
        0.5,
        0.02,
        "Score formula: recall@1_cross_domain + map_cross_domain",
        ha="center",
        fontsize=10,
    )

    path.parent.mkdir(parents=True, exist_ok=True)
    plt.tight_layout(rect=(0, 0.05, 1, 1))
    plt.savefig(path, dpi=150, bbox_inches="tight")
    plt.close(fig)


def build_outputs(split, top_n):
    ranking_df = collect_rankings(split)
    if ranking_df.empty:
        print(f"No {split} metrics CSV files found.")
        return

    ranking_path = config.REPORTS_DIR / f"{split}_ranking.csv"

    ranking_df.to_csv(ranking_path, index=False)

    print(f"Saved {split} ranking to: {ranking_path}")
    if split == "val":
        plot_path = config.REPORTS_DIR / f"{split}_top_scores.png"
        save_top_scores_plot(plot_path, ranking_df, split, min(top_n, len(ranking_df)))
        print(f"Saved {split} plot to: {plot_path}")
    print()
    print(ranking_df[[
        "rank",
        "experiment_name",
        "score",
        "recall@1_cross_domain",
        "map_cross_domain",
    ]].head(top_n).to_string(index=False))


def main():
    build_outputs("val", config.TOP_CONFIGS_PLOT_COUNT)
    build_outputs("test", config.TOP_CONFIGS_PLOT_COUNT)


if __name__ == "__main__":
    main()
