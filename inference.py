import random
from pathlib import Path
import math

import matplotlib.pyplot as plt
import pandas as pd
from PIL import Image

import config
from val import run_validation



def load_image(path):
    img = Image.open(path)
    img = img.convert("RGB")
    return img



def get_unique_matches(query_path, ranking, gallery_df):
    match_infos = []

    seen_paths = set()
    seen_paths.add(query_path)

    for i in range(len(ranking)):
        gallery_index = int(ranking[i])
        gallery_row = gallery_df.iloc[gallery_index]
        match_path = gallery_row["path"]

        if match_path in seen_paths:
            continue

        seen_paths.add(match_path)

        info = {
            "path": match_path,
            "class_name": gallery_row["class_name"],
            "domain": gallery_row["domain"],
        }

        match_infos.append(info)

        if len(match_infos) == config.INFERENCE_TOP_K:
            break

    for i in range(len(match_infos)):
        match_infos[i]["rank"] = i + 1

    return match_infos


def compute_cross_domain_percentage(query_df, gallery_df, ranked_indices, top_k):
    total_same_class = 0
    cross_domain_same_class = 0

    num_queries = len(query_df)

    for q_idx in range(num_queries):
        query = query_df.iloc[q_idx]
        query_class = query["class_name"]
        query_domain = query["domain"]

        ranking = ranked_indices[q_idx]

        for rank in range(top_k):
            gallery_index = int(ranking[rank])
            gallery = gallery_df.iloc[gallery_index]

            if gallery["class_name"] == query_class:
                total_same_class += 1

                if gallery["domain"] != query_domain:
                    cross_domain_same_class += 1

    if total_same_class == 0:
        return 0.0

    return (cross_domain_same_class / total_same_class) * 100



def save_sample_figure(query_info, match_infos, output_path):
    total_tiles = 1 + len(match_infos)
    num_cols = min(4, total_tiles)
    num_rows = math.ceil(total_tiles / num_cols)

    fig, axes = plt.subplots(
        num_rows,
        num_cols,
        figsize=(4 * num_cols, 4.8 * num_rows),
    )

    if hasattr(axes, "ravel"):
        axes = axes.ravel().tolist()
    else:
        axes = [axes]

    # QUERY
    query_image = load_image(query_info["path"])
    axes[0].imshow(query_image)
    axes[0].axis("off")
    axes[0].set_title(
        f"Query\nclass: {query_info['class_name']}\ndomain: {query_info['domain']}",
        fontsize=10,
    )

   
    for i, match in enumerate(match_infos):
        img = load_image(match["path"])
        axes[i + 1].imshow(img)
        axes[i + 1].axis("off")

        axes[i + 1].set_title(
            f"Rank {match['rank']}\nclass: {match['class_name']}\ndomain: {match['domain']}",
            fontsize=10,
        )

    for i in range(total_tiles, len(axes)):
        axes[i].axis("off")

    fig.tight_layout()

    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(output_path, dpi=150, bbox_inches="tight")

    plt.close(fig)



def main():

   
    summary = pd.read_csv(config.BEST_MODEL_PATH)
    checkpoint_path = summary.iloc[0]["checkpoint_path"]

    
    result = run_validation(
        checkpoint_path=checkpoint_path,
        split=config.INFERENCE_SPLIT,
        use_cached_embeddings=True,
    )

    query_df = result["query_df"]
    gallery_df = result["gallery_df"]
    ranked_indices = result["ranked_indices"]

    
    top_k = config.INFERENCE_TOP_K

    cross_domain_percentage = compute_cross_domain_percentage(
        query_df,
        gallery_df,
        ranked_indices,
        top_k,
    )

    print("\n==============================")
    print(f"Cross-domain same-class retrieval @Top-{top_k}: {cross_domain_percentage:.2f}%")
    print("==============================\n")

    
    sample_folder = config.SAMPLES_DIR / result["experiment_name"] / config.INFERENCE_SPLIT
    sample_folder.mkdir(parents=True, exist_ok=True)

    total_queries = len(query_df)
    total_samples = min(config.INFERENCE_SAMPLES, total_queries)

    sampled_indices = random.sample(range(total_queries), total_samples)

    for i, query_index in enumerate(sampled_indices):
        query_row = query_df.iloc[query_index]

        query_info = {
            "path": query_row["path"],
            "class_name": query_row["class_name"],
            "domain": query_row["domain"],
        }

        ranking = ranked_indices[query_index]

        match_infos = get_unique_matches(
            query_row["path"],
            ranking,
            gallery_df,
        )

        output_path = sample_folder / f"sample_{str(i).zfill(3)}.png"

        save_sample_figure(
            query_info,
            match_infos,
            output_path,
        )

    print("Saved sample images to:", sample_folder)


# ---------------- ENTRY ----------------
if __name__ == "__main__":
    main()