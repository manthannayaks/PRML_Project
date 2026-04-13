import torch
from torch.utils.data import DataLoader
import pandas as pd
from tqdm import tqdm

import config
from dataset import OfficeHomeTripletDataset, build_label_mapping
from losses import ClassCrossEntropyLoss, DomainCrossEntropyLoss
from model import build_model
from utils import (
    compute_score,
    load_checkpoint,
    plot_history,
    save_checkpoint,
    save_history_csv,
    save_row_csv,
    set_seed,
    get_transforms,
)
from val import run_validation


def move_triplet_batch_to_device(batch):
    device = config.DEVICE
    use_cuda = (device == "cuda")

    anchor = batch["anchor"].to(device, non_blocking=use_cuda)
    positive = batch["positive"].to(device, non_blocking=use_cuda)
    negative = batch["negative"].to(device, non_blocking=use_cuda)

    anchor_label = batch["anchor_label"].long().to(device)
    positive_label = batch["positive_label"].long().to(device)
    negative_label = batch["negative_label"].long().to(device)

    anchor_domain = batch["anchor_domain_label"].long().to(device)
    positive_domain = batch["positive_domain_label"].long().to(device)
    negative_domain = batch["negative_domain_label"].long().to(device)

    result = {
        "anchor": anchor,
        "positive": positive,
        "negative": negative,
        "anchor_label": anchor_label,
        "positive_label": positive_label,
        "negative_label": negative_label,
        "anchor_domain_label": anchor_domain,
        "positive_domain_label": positive_domain,
        "negative_domain_label": negative_domain,
    }

    return result



def compute_total_loss(model, batch, class_fn, domain_fn):
   
    _, a_cls, a_dom = model.forward_with_domain(batch["anchor"], config.GRL_LAMBDA)
    _, p_cls, p_dom = model.forward_with_domain(batch["positive"], config.GRL_LAMBDA)
    _, n_cls, n_dom = model.forward_with_domain(batch["negative"], config.GRL_LAMBDA)


    class_logits = torch.cat((a_cls, p_cls, n_cls), dim=0)
    class_labels = torch.cat((
        batch["anchor_label"],
        batch["positive_label"],
        batch["negative_label"]
    ), dim=0)

    class_loss = class_fn(class_logits, class_labels)


    domain_logits = torch.cat((a_dom, p_dom, n_dom), dim=0)
    domain_labels = torch.cat((
        batch["anchor_domain_label"],
        batch["positive_domain_label"],
        batch["negative_domain_label"]
    ), dim=0)

    domain_loss = domain_fn(domain_logits, domain_labels)


    total_loss = (
        config.CLASS_LOSS_WEIGHT * class_loss +
        config.DOMAIN_LOSS_WEIGHT * domain_loss
    )

    return total_loss, class_loss, domain_loss



def make_loader(split, label_map, is_train):
    dataset = OfficeHomeTripletDataset(
        config.CSV_PATH,
        label_map,
        split=split,
        transform=get_transforms(is_train),
    )

    loader = DataLoader(
        dataset,
        batch_size=config.BATCH_SIZE,
        shuffle=is_train,
        num_workers=config.NUM_WORKERS,
        pin_memory=(config.DEVICE == "cuda"),
        persistent_workers=(config.NUM_WORKERS > 0),
    )

    return loader


@torch.no_grad()
def evaluate_val_loss(model, loader, class_fn, domain_fn):
    model.eval()

    total_loss = 0.0
    count = 0

    for batch in loader:
        device_batch = move_triplet_batch_to_device(batch)

        loss, _, _ = compute_total_loss(model, device_batch, class_fn, domain_fn)

        total_loss += loss.item()
        count += 1

    if count == 0:
        return 0.0

    return total_loss / count


def train_model(model_name, head_depth, lr, label_map):
    print("\nStarting:", model_name, "depth:", head_depth, "lr:", lr)

    config.NUM_CLASSES = len(label_map)
    experiment_name = config.get_experiment_name(model_name, head_depth, lr)

    train_loader = make_loader("train", label_map, True)
    val_loader = make_loader("val", label_map, False)

    model = build_model(model_name, head_depth)
    model = model.to(config.DEVICE)


    parameters = []
    for p in model.parameters():
        if p.requires_grad:
            parameters.append(p)

    optimizer = torch.optim.Adam(parameters, lr=lr)

    class_fn = ClassCrossEntropyLoss()
    domain_fn = DomainCrossEntropyLoss()

    best_val_loss = float("inf")
    history_rows = []

    checkpoint_path = config.CHECKPOINT_DIR / (experiment_name + "_best.pth")

   
    for epoch in range(1, config.EPOCHS + 1):
        model.train()

        epoch_loss = 0.0
        batch_count = 0

        progress = tqdm(train_loader)

        for batch in progress:
            device_batch = move_triplet_batch_to_device(batch)

            loss, cls_loss, dom_loss = compute_total_loss(
                model,
                device_batch,
                class_fn,
                domain_fn
            )

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            epoch_loss += loss.item()
            batch_count += 1

            progress.set_postfix(
                loss=round(loss.item(), 4),
                cls=round(cls_loss.item(), 4),
                dom=round(dom_loss.item(), 4),
            )

      
        if batch_count == 0:
            train_loss = 0.0
        else:
            train_loss = epoch_loss / batch_count


        val_loss = evaluate_val_loss(model, val_loader, class_fn, domain_fn)

        print("Epoch:", epoch, "Train:", train_loss, "Val:", val_loss)

        history_rows.append({
            "epoch": epoch,
            "train_loss": train_loss,
            "val_loss": val_loss,
        })

  
        if val_loss < best_val_loss:
            best_val_loss = val_loss

            save_checkpoint(
                checkpoint_path,
                model,
                optimizer,
                epoch,
                {"val_loss": val_loss},
                model_name,
                head_depth,
                lr,
                experiment_name,
            )


    result = run_validation(checkpoint_path=checkpoint_path, split="val")

    save_history_csv(config.LOGS_DIR / experiment_name / "train_history.csv", history_rows)

    return {
        "experiment_name": experiment_name,
        "checkpoint_path": str(checkpoint_path),
        "model_name": model_name,
        "head_depth": head_depth,
        "lr": lr,
        "score": result["metrics"]["score"],
        "metrics": result["metrics"],
    }



def main():
    set_seed()

    label_map = build_label_mapping(config.CSV_PATH)
    config.NUM_CLASSES = len(label_map)

    all_results = []

    for model_name in config.MODEL_NAMES:
        for depth in config.HEAD_DEPTHS:
            for lr in config.LRS:
                result = train_model(model_name, depth, lr, label_map)
                all_results.append(result)

    best = None
    best_score = -1

    for r in all_results:
        score = compute_score(r["metrics"])
        if score > best_score:
            best_score = score
            best = r

    save_row_csv(config.BEST_MODEL_PATH, best)

    print("\nBest model:")
    print(best)


if __name__ == "__main__":
    main()
