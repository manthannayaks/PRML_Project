from pathlib import Path

import numpy as np
import pandas as pd
import torch
from tqdm import tqdm

import config



@torch.no_grad()
def generate_embeddings(model, dataloader, device, progress_desc=None):
    model.eval()
    all_embeddings = []
    records = []

    iterator = dataloader
    if progress_desc is not None:
        iterator = tqdm(dataloader, desc=progress_desc, leave=False)

    for batch in iterator:
        images = batch["image"].to(device, non_blocking=(device == "cuda"))
        embeddings = model(images).cpu().numpy()
        all_embeddings.append(embeddings)

        batch_size = embeddings.shape[0]
        for i in range(batch_size):
            records.append(
                {
                    "path": batch["path"][i],
                    "label": int(batch["label"][i]),
                    "class_name": batch["class_name"][i],
                    "domain": batch["domain"][i],
                }
            )

    embedding_matrix = np.concatenate(all_embeddings, axis=0).astype(np.float32)
    return embedding_matrix, pd.DataFrame(records)


def save_embeddings_csv(path, metadata_df, embedding_matrix):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)

    embedding_df = pd.DataFrame(
        embedding_matrix,
        columns=[f"emb_{i}" for i in range(embedding_matrix.shape[1])],
    )

    df = pd.concat([metadata_df.reset_index(drop=True), embedding_df], axis=1)
    df.to_csv(path, index=False)


def load_embeddings_csv(path):
    df = pd.read_csv(path)

    embedding_columns = [col for col in df.columns if col.startswith("emb_")]
    metadata_columns = [col for col in df.columns if not col.startswith("emb_")]

    metadata_df = df[metadata_columns].copy()
    embedding_matrix = df[embedding_columns].to_numpy(dtype=np.float32)

    return embedding_matrix, metadata_df



def compute_cosine_similarity_matrix(query_embeddings, gallery_embeddings):
    return np.matmul(query_embeddings, gallery_embeddings.T)



def _average_precision_cross_domain(
    ranked_labels,
    ranked_domains,
    target_label,
    query_domain,
):
    relevant = np.array([
        (l == target_label and d != query_domain)
        for l, d in zip(ranked_labels, ranked_domains)
    ]).astype(np.float32)

    if relevant.sum() == 0:
        return 0.0

    cumulative_hits = np.cumsum(relevant)
    ranks = np.arange(1, len(relevant) + 1, dtype=np.float32)
    precision_at_k = cumulative_hits / ranks

    return float((precision_at_k * relevant).sum() / relevant.sum())



def evaluate_retrieval(
    gallery_embeddings,
    gallery_df,
    query_embeddings,
    query_df,
    top_ks=config.TOP_KS,
    weighted_k=config.WEIGHTED_K,
):
    similarity_matrix = compute_cosine_similarity_matrix(
        query_embeddings, gallery_embeddings
    )

    ranked_indices = np.argsort(-similarity_matrix, axis=1)

    gallery_labels = gallery_df["label"].to_numpy()
    gallery_domains = gallery_df["domain"].to_numpy()

    recall_hits = {k: 0 for k in top_ks}
    precision_sums = {k: 0.0 for k in top_ks}
    average_precisions = []
    query_rows = []

    correct = 0
    same_domain_top1_count = 0

    for query_index, ranking in enumerate(ranked_indices):
        query_row = query_df.iloc[query_index]
        query_label = int(query_row["label"])
        query_domain = query_row["domain"]

        sorted_labels = gallery_labels[ranking]
        sorted_domains = gallery_domains[ranking]
        sorted_scores = similarity_matrix[query_index][ranking]

        
        prediction = int(sorted_labels[0])
        correct += int(prediction == query_label)

        if sorted_domains[0] == query_domain:
            same_domain_top1_count += 1

  
        for k in top_ks:
            top_k_indices = ranking[:k]
            cross_domain_relevant = (
                (gallery_labels[top_k_indices] == query_label) &
                (gallery_domains[top_k_indices] != query_domain)
            )

            recall_hits[k] += int(np.any(cross_domain_relevant))
            precision_sums[k] += float(np.mean(cross_domain_relevant))

        
        ap = _average_precision_cross_domain(
            sorted_labels,
            sorted_domains,
            query_label,
            query_domain,
        )
        average_precisions.append(ap)

        
        top_k_labels = sorted_labels[:weighted_k].tolist()
        top_k_scores = [float(s) for s in sorted_scores[:weighted_k]]

        query_rows.append(
            {
                "query_path": query_row["path"],
                "query_label": query_label,
                "query_class_name": query_row["class_name"],
                "query_domain": query_domain,

                "top1_label": int(sorted_labels[0]),
                "top1_domain": sorted_domains[0],
                "top1_cosine_similarity": float(sorted_scores[0]),

                "correct_top1": int(prediction == query_label),
                "same_domain_top1": int(sorted_domains[0] == query_domain),

                "average_precision_cross_domain": ap,

                "top_k_labels": "|".join(map(str, top_k_labels)),
                "top_k_cosine_similarities": "|".join(
                    f"{s:.6f}" for s in top_k_scores
                ),
                "top_matches": "|".join(
                    gallery_df.iloc[ranking[:10]]["path"].tolist()
                ),
            }
        )

   
    total_queries = len(query_df)

    metrics = {
        "accuracy_top1": correct / total_queries,
        "map_cross_domain": float(np.mean(average_precisions)),
        "same_domain_top1_ratio": same_domain_top1_count / total_queries,
    }

    for k in top_ks:
        metrics[f"recall@{k}_cross_domain"] = recall_hits[k] / total_queries
        metrics[f"precision@{k}_cross_domain"] = precision_sums[k] / total_queries

    return metrics, pd.DataFrame(query_rows), ranked_indices, similarity_matrix
