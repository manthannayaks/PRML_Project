from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import pandas as pd

import config


EDA_DIR = config.OUTPUTS_DIR / "eda"


def save_bar_plot(series, path, title, xlabel, ylabel, rotation=0, figsize=(8, 5)):
    if series.empty:
        return

    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)

    fig, ax = plt.subplots(figsize=figsize)
    series.plot(kind="bar", ax=ax, color="#4C78A8")
    ax.set_title(title)
    ax.set_xlabel(xlabel)
    ax.set_ylabel(ylabel)
    ax.tick_params(axis="x", rotation=rotation)
    plt.tight_layout()
    plt.savefig(path, dpi=150, bbox_inches="tight")
    plt.close(fig)


def save_heatmap(table, path, title):
    if table.empty:
        return

    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)

    fig_width = max(8, table.shape[1] * 1.4)
    fig_height = max(6, table.shape[0] * 0.18)
    fig, ax = plt.subplots(figsize=(fig_width, fig_height))

    image = ax.imshow(table.values, aspect="auto", cmap="Blues")
    ax.set_title(title)
    ax.set_xticks(range(len(table.columns)))
    ax.set_xticklabels(table.columns, rotation=45, ha="right")
    ax.set_yticks(range(len(table.index)))
    ax.set_yticklabels(table.index)
    fig.colorbar(image, ax=ax, fraction=0.025, pad=0.02)

    plt.tight_layout()
    plt.savefig(path, dpi=150, bbox_inches="tight")
    plt.close(fig)


def save_summary_panel(path, total_rows, num_domains, num_classes, num_splits):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)

    fig, ax = plt.subplots(figsize=(8, 4.5))
    ax.axis("off")

    summary_text = (
        f"Total Samples: {total_rows}\n"
        f"Domains: {num_domains}\n"
        f"Classes: {num_classes}\n"
        f"Splits: {num_splits}"
    )

    ax.text(
        0.5,
        0.5,
        summary_text,
        ha="center",
        va="center",
        fontsize=18,
        bbox={"boxstyle": "round,pad=0.6", "facecolor": "#E8F1FB", "edgecolor": "#4C78A8"},
    )
    ax.set_title("Dataset Summary", fontsize=16, pad=16)

    plt.tight_layout()
    plt.savefig(path, dpi=150, bbox_inches="tight")
    plt.close(fig)


def main():
    EDA_DIR.mkdir(parents=True, exist_ok=True)

    df = pd.read_csv(config.CSV_PATH)

    split_counts = df["split"].value_counts().sort_index()
    domain_counts = df["domain"].value_counts().sort_index()
    class_counts = df["class_name"].value_counts().sort_values(ascending=False)

    split_domain_table = pd.crosstab(df["split"], df["domain"])
    domain_class_table = pd.crosstab(df["class_name"], df["domain"])

    save_summary_panel(
        EDA_DIR / "summary.png",
        len(df),
        df["domain"].nunique(),
        df["class_name"].nunique(),
        df["split"].nunique(),
    )

    save_bar_plot(
        split_counts,
        EDA_DIR / "split_counts.png",
        "Samples Per Split",
        "Split",
        "Count",
    )
    save_bar_plot(
        domain_counts,
        EDA_DIR / "domain_counts.png",
        "Samples Per Domain",
        "Domain",
        "Count",
        rotation=20,
    )
    save_bar_plot(
        class_counts.head(20),
        EDA_DIR / "top20_classes.png",
        "Top 20 Classes By Sample Count",
        "Class",
        "Count",
        rotation=75,
        figsize=(12, 5),
    )
    save_heatmap(
        split_domain_table,
        EDA_DIR / "split_domain_heatmap.png",
        "Split vs Domain Counts",
    )
    save_heatmap(
        domain_class_table,
        EDA_DIR / "domain_class_heatmap.png",
        "Class vs Domain Counts",
    )

    print("[INFO] EDA saved to", EDA_DIR)


if __name__ == "__main__":
    main()
