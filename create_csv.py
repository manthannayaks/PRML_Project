from pathlib import Path
import pandas as pd
import random

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
DOMAINS = ["Art", "Clipart", "Product", "Real World"]

def assign_split_random(images):
    random.shuffle(images)  
    total = len(images)
    splits = []
    for i in range(total):
        if total < 3 or i < int(total * 0.7):
            splits.append("train")
        elif i < int(total * 0.85):
            splits.append("val")
        else:
            splits.append("test")
    return splits

def build_dataframe(root: Path):
    rows = []
    for domain in DOMAINS:
        domain_dir = root / domain
        if not domain_dir.exists():
            continue
        for class_dir in sorted(domain_dir.iterdir()):
            if not class_dir.is_dir():
                continue
            images = [p for p in class_dir.iterdir() if p.suffix.lower() in IMAGE_EXTENSIONS]
            splits = assign_split_random(images)
            for img, split in zip(images, splits):
                rows.append({
                    "path": str(img.resolve()),
                    "domain": domain,
                    "class_name": class_dir.name,
                    "split": split
                })
    return pd.DataFrame(rows)

if __name__ == "__main__":
    dataset_root = Path("Dataset")
    output_csv = Path("dataset_index.csv")
    df = build_dataframe(dataset_root)
    output_csv.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_csv, index=False)
    print(f"Saved {len(df)} entries to {output_csv}")