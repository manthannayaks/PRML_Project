import pandas as pd
import torch
from torch.utils.data import DataLoader
from torch.utils.data import ConcatDataset

import config
from dataset import OfficeHomeEvalDataset, build_label_mapping
from metrics import (
    evaluate_retrieval,
    generate_embeddings,
    load_embeddings_csv,
    save_embeddings_csv,
)
from model import build_model
from utils import compute_score, get_transforms, load_checkpoint, plot_tsne, save_metrics_csv



def run_validation(
    model=None,
    checkpoint_path=None,
    split="val",
    model_name=None,
    save_outputs=True,
    show_progress=False,
    use_cached_embeddings=False,
):
    
    
    label_map = build_label_mapping(config.CSV_PATH)
    num_classes = len(label_map)
    config.NUM_CLASSES = num_classes

   
    if split == "test":
        gallery_splits = ["train", "val"]
    else:
        gallery_splits = ["train"]

    gallery_datasets = []

    for gallery_split in gallery_splits:
        dataset = OfficeHomeEvalDataset(
            config.CSV_PATH,
            label_map,
            split=gallery_split,
            transform=get_transforms(False),
        )
        gallery_datasets.append(dataset)

    if len(gallery_datasets) == 1:
        gallery_dataset = gallery_datasets[0]
    else:
        gallery_dataset = ConcatDataset(gallery_datasets)

    query_dataset = OfficeHomeEvalDataset(
        config.CSV_PATH,
        label_map,
        split=split,
        transform=get_transforms(False),
    )

   
    use_cuda = (config.DEVICE == "cuda")

    gallery_loader = DataLoader(
        gallery_dataset,
        batch_size=config.EVAL_BATCH_SIZE,
        shuffle=False,
        num_workers=config.NUM_WORKERS,
        pin_memory=use_cuda,
        persistent_workers=(config.NUM_WORKERS > 0),
    )

    query_loader = DataLoader(
        query_dataset,
        batch_size=config.EVAL_BATCH_SIZE,
        shuffle=False,
        num_workers=config.NUM_WORKERS,
        pin_memory=use_cuda,
        persistent_workers=(config.NUM_WORKERS > 0),
    )

    
    if model is None:
        checkpoint = torch.load(checkpoint_path, map_location=config.DEVICE)

        model_name = checkpoint["model_name"]
        head_depth = checkpoint["head_depth"]

        model = build_model(model_name, head_depth)
        model = model.to(config.DEVICE)

        load_checkpoint(checkpoint_path, model)

        if "experiment_name" in checkpoint:
            experiment_name = checkpoint["experiment_name"]
        else:
            experiment_name = model_name

    else:
        experiment_name = model_name

    model.eval()

    gallery_embeddings_path = config.EMBEDDINGS_DIR / experiment_name / "train_embeddings.csv"
    query_embeddings_path = config.EMBEDDINGS_DIR / experiment_name / (split + "_embeddings.csv")

    can_use_cache = (
        use_cached_embeddings and
        gallery_embeddings_path.exists() and
        query_embeddings_path.exists()
    )

    
    if can_use_cache:
        gallery_embeddings, gallery_df = load_embeddings_csv(gallery_embeddings_path)
        query_embeddings, query_df = load_embeddings_csv(query_embeddings_path)
    else:
        gallery_embeddings, gallery_df = generate_embeddings(
            model,
            gallery_loader,
            config.DEVICE,
            progress_desc=(f"{split} gallery embeddings" if show_progress else None),
        )

        query_embeddings, query_df = generate_embeddings(
            model,
            query_loader,
            config.DEVICE,
            progress_desc=(f"{split} query embeddings" if show_progress else None),
        )

   
    metrics, query_results_df, ranked_indices, similarity_matrix = evaluate_retrieval(
        gallery_embeddings,
        gallery_df,
        query_embeddings,
        query_df,
    )
    metrics["score"] = compute_score(metrics)

    
    if save_outputs:
        report_folder = config.REPORTS_DIR / experiment_name / split
        report_folder.mkdir(parents=True, exist_ok=True)

        
        if not can_use_cache:
            save_embeddings_csv(
                gallery_embeddings_path,
                gallery_df,
                gallery_embeddings,
            )

            save_embeddings_csv(
                query_embeddings_path,
                query_df,
                query_embeddings,
            )

      
        results_path = report_folder / (split + "_retrieval_results.csv")
        query_results_df.to_csv(results_path, index=False)

        
        metrics_path = report_folder / (split + "_metrics.csv")
        save_metrics_csv(metrics_path, metrics)

     
        tsne_path = config.REPORTS_DIR / experiment_name / split / (split + "_tsne.png")

        plot_tsne(
            tsne_path,
            query_embeddings,
            query_df,
            experiment_name + " " + split + " t-SNE",
            config.TSNE_MAX_POINTS,
        )

    result = {}
    result["metrics"] = metrics
    result["query_results_df"] = query_results_df
    result["gallery_df"] = gallery_df
    result["query_df"] = query_df
    result["ranked_indices"] = ranked_indices
    result["similarity_matrix"] = similarity_matrix
    result["experiment_name"] = experiment_name

    return result


if __name__ == "__main__":

    if config.BEST_MODEL_PATH.exists():

        best_df = pd.read_csv(config.BEST_MODEL_PATH)

        checkpoint_path = best_df.iloc[0]["checkpoint_path"]

        result = run_validation(
            checkpoint_path=checkpoint_path,
            split="val"
        )

        print(result["metrics"])
