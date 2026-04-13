import pandas as pd

import config
from utils import save_metrics_csv, save_row_csv
from val import run_validation


def build_test_ranking():
    ranking_rows = []

    checkpoint_paths = sorted(config.CHECKPOINT_DIR.glob("*_best.pth"))

    for checkpoint_path in checkpoint_paths:
        result = run_validation(
            checkpoint_path=checkpoint_path,
            split="test",
            save_outputs=False,
            show_progress=False,
            use_cached_embeddings=True,
        )

        row = {
            "checkpoint_path": str(checkpoint_path),
            "experiment_name": result["experiment_name"],
        }

        for key, value in result["metrics"].items():
            row[key] = value

        ranking_rows.append(row)

    ranking_df = pd.DataFrame(ranking_rows)
    if len(ranking_df) == 0:
        return ranking_df

    ranking_df = ranking_df.sort_values(
        by=["score", "recall@1_cross_domain", "map_cross_domain"],
        ascending=False,
    ).reset_index(drop=True)

    ranking_df["rank"] = range(1, len(ranking_df) + 1)

    ranking_df.to_csv(config.TEST_RANKING_PATH, index=False)

    return ranking_df


def main():
    config.NUM_WORKERS = 0
    test_ranking_df = build_test_ranking()

    summary = pd.read_csv(config.BEST_MODEL_PATH)
    checkpoint_path = summary.iloc[0]["checkpoint_path"]

    train_result = run_validation(
        checkpoint_path=checkpoint_path,
        split="train",
        save_outputs=False,
        show_progress=True,
    )

    val_result = run_validation(
        checkpoint_path=checkpoint_path,
        split="val",
        save_outputs=False,
        show_progress=True,
    )

    result = run_validation(
        checkpoint_path=checkpoint_path,
        split="test",
        show_progress=True,
    )

    train_metrics = train_result["metrics"]
    val_metrics = val_result["metrics"]
    metrics = result["metrics"]

   
    row = {
        "checkpoint_path": checkpoint_path,
        "experiment_name": result["experiment_name"],
        "train_accuracy_top1": train_metrics["accuracy_top1"],
        "val_accuracy_top1": val_metrics["accuracy_top1"],
    }

   
    for key, value in metrics.items():
        row[key] = value

    
    row["is_domain_biased"] = int(metrics["same_domain_top1_ratio"] > 0.6)
    row["score"] = metrics["score"]

    
    save_row_csv(config.TEST_REPORT_PATH, row)

    save_metrics_csv(
        config.REPORTS_DIR
        / result["experiment_name"]
        / "test"
        / "test_metrics.csv",
        metrics,
    )

    comparison_row = {
        "experiment_name": result["experiment_name"],
        "train_accuracy_top1": train_metrics["accuracy_top1"],
        "val_accuracy_top1": val_metrics["accuracy_top1"],
        "test_accuracy_top1": metrics["accuracy_top1"],
    }
    save_row_csv(
        config.REPORTS_DIR
        / result["experiment_name"]
        / "test"
        / "accuracy_comparison.csv",
        comparison_row,
    )

    print("\n===== TEST RESULTS =====")
    print(f"Checkpoint: {checkpoint_path}")
    print(f"Experiment: {result['experiment_name']}")

    print("\n--- Core Metrics ---")
    print(f"Train Accuracy@1: {train_metrics['accuracy_top1']:.4f}")
    print(f"Val Accuracy@1: {val_metrics['accuracy_top1']:.4f}")
    print(f"Accuracy@1: {metrics['accuracy_top1']:.4f}")
    print(f"Precision@1 (cross-domain): {metrics['precision@1_cross_domain']:.4f}")
    print(f"mAP (cross-domain): {metrics['map_cross_domain']:.4f}")

    print("\n--- Recall / Precision (Cross-Domain) ---")
    for k in config.TOP_KS:
        print(f"Recall@{k}: {metrics[f'recall@{k}_cross_domain']:.4f}")
        print(f"Precision@{k}: {metrics[f'precision@{k}_cross_domain']:.4f}")

    print("\n--- Domain Bias ---")
    print(f"Same-domain Top1 ratio: {metrics['same_domain_top1_ratio']:.4f}")

    if metrics["same_domain_top1_ratio"] > 0.6:
        print(" Model is domain biased")
    else:
        print(" Model is reasonably domain invariant")

    print("\n--- Final Score ---")
    print(f"Score: {row['score']:.4f}")

    if len(test_ranking_df) > 0:
        top_test = test_ranking_df.iloc[0]
        print("\n--- Top Test Config ---")
        print(f"Rank 1: {top_test['experiment_name']}")
        print(f"Top test score: {top_test['score']:.4f}")


if __name__ == "__main__":
    main()
