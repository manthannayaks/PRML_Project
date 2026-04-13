import random
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import torch
from sklearn.manifold import TSNE
from torchvision import transforms

import config



def set_seed():
    seed = config.SEED

    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)

    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)



def get_transforms(train=True):
    normalize = transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    )

    resize = transforms.Resize((config.IMAGE_SIZE, config.IMAGE_SIZE))
    to_tensor = transforms.ToTensor()

    if train:
        flip = transforms.RandomHorizontalFlip(p=config.HFLIP_PROB)
        rotation = transforms.RandomRotation(degrees=config.ROTATION_DEGREES)
        color_jitter = transforms.ColorJitter(
            brightness=config.COLOR_JITTER_BRIGHTNESS,
            contrast=config.COLOR_JITTER_CONTRAST,
            saturation=config.COLOR_JITTER_SATURATION,
        )

        transform_list = [
            resize,
            flip,
            rotation,
            color_jitter,
            to_tensor,
            normalize,
        ]
    else:
        transform_list = [
            resize,
            to_tensor,
            normalize,
        ]

    transform_pipeline = transforms.Compose(transform_list)

    return transform_pipeline


def compute_score(metrics):
    if "recall@1_cross_domain" in metrics and "map_cross_domain" in metrics:
        return (
            float(metrics["recall@1_cross_domain"]) +
            float(metrics["map_cross_domain"])
        )

    if "recall@1" in metrics and "map" in metrics:
        return float(metrics["recall@1"]) + float(metrics["map"])

    return 0.0



def save_metrics_csv(path, metrics):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)

    rows = []

    for key in metrics:
        value = metrics[key]
        row = {"metric": key, "value": value}
        rows.append(row)

    df = pd.DataFrame(rows)
    df.to_csv(path, index=False)



def save_row_csv(path, row):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)

    df = pd.DataFrame([row])
    df.to_csv(path, index=False)



def save_checkpoint(path, model, optimizer, epoch, metrics, model_name, head_depth, lr, experiment_name):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)

    checkpoint = {}

    checkpoint["epoch"] = epoch
    checkpoint["model_state_dict"] = model.state_dict()
    checkpoint["optimizer_state_dict"] = optimizer.state_dict()
    checkpoint["metrics"] = metrics
    checkpoint["model_name"] = model_name
    checkpoint["head_depth"] = head_depth
    checkpoint["lr"] = lr
    checkpoint["experiment_name"] = experiment_name

    torch.save(checkpoint, path)


def _rename_old_checkpoint_keys(state_dict):
    renamed = {}

    for key in state_dict:
        value = state_dict[key]

        if key.startswith("feature_head."):
            new_key = "head." + key[len("feature_head."):]
        elif key.startswith("embedding_projection."):
            new_key = "project." + key[len("embedding_projection."):]
        else:
            new_key = key

        renamed[new_key] = value

    return renamed



def load_checkpoint(path, model, optimizer=None):
    checkpoint = torch.load(path, map_location=config.DEVICE)

    state_dict = checkpoint["model_state_dict"]
    state_dict = _rename_old_checkpoint_keys(state_dict)
    state_dict = {
        k: v for k, v in state_dict.items()
        if not k.startswith("head")
    }
    model.load_state_dict(state_dict,strict=False)

    if optimizer is not None:
        optimizer_state = checkpoint["optimizer_state_dict"]
        optimizer.load_state_dict(optimizer_state)

    return checkpoint



def save_history_csv(path, history_rows):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)

    df = pd.DataFrame(history_rows)
    df.to_csv(path, index=False)



def plot_history(path, history_rows, title):
    if len(history_rows) == 0:
        return

    df = pd.DataFrame(history_rows)

    fig, ax = plt.subplots(figsize=(8, 5))
    fig.suptitle(title)

    epochs = df["epoch"]
    train_loss = df["train_loss"]

    ax.plot(epochs, train_loss, marker="o", label="train")

    if "val_loss" in df.columns:
        val_loss = df["val_loss"]

        if not val_loss.isna().all():
            ax.plot(epochs, val_loss, marker="o", label="val")

    ax.set_title("Train and Val Loss")
    ax.set_xlabel("Epoch")
    ax.set_ylabel("Loss")
    ax.legend()

    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)

    plt.tight_layout()
    plt.savefig(path)
    plt.close(fig)



def plot_tsne(path, embeddings, metadata_df, title, max_points):
    if len(embeddings) == 0:
        return

    
    if len(embeddings) > max_points:
        indices = np.random.choice(len(embeddings), size=max_points, replace=False)

        embeddings = embeddings[indices]
        metadata_df = metadata_df.iloc[indices].reset_index(drop=True)


    num_points = len(embeddings)

    if num_points <= 1:
        return

    perplexity = min(30, max(5, num_points - 1))

    tsne = TSNE(
        n_components=2,
        perplexity=perplexity,
        init="random",
        learning_rate="auto",
        random_state=config.SEED,
    )

    coords = tsne.fit_transform(embeddings)


    fig, axes = plt.subplots(1, 2, figsize=(12, 5))
    fig.suptitle(title)

    class_codes, _ = pd.factorize(metadata_df["class_name"])
    domain_codes, _ = pd.factorize(metadata_df["domain"])

    axes[0].scatter(
        coords[:, 0],
        coords[:, 1],
        c=class_codes,
        s=10,
        cmap="tab20",
        alpha=0.8,
    )
    axes[0].set_title("Colored By Class")
    axes[0].set_xticks([])
    axes[0].set_yticks([])

    axes[1].scatter(
        coords[:, 0],
        coords[:, 1],
        c=domain_codes,
        s=10,
        cmap="tab10",
        alpha=0.8,
    )
    axes[1].set_title("Colored By Domain")
    axes[1].set_xticks([])
    axes[1].set_yticks([])

    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)

    plt.tight_layout()
    plt.savefig(path, dpi=150, bbox_inches="tight")
    plt.close(fig)
