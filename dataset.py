import random
from pathlib import Path

import pandas as pd
from PIL import Image
from torch.utils.data import Dataset

import config


# ---------------- LABEL MAP ----------------
def build_label_mapping(csv_path):
    df = pd.read_csv(csv_path, encoding="utf-8-sig")

    class_list = df["class_name"].unique()
    class_list = sorted(class_list)

    label_map = {}

    for index in range(len(class_list)):
        class_name = class_list[index]
        label_map[class_name] = index

    print("[INFO] Total classes:", len(label_map))

    return label_map


# ---------------- LOAD SPLIT ----------------
def load_split_dataframe(csv_path, split):
    df = pd.read_csv(csv_path)

    df = df[df["split"] == split]
    df = df.reset_index(drop=True)

    if len(df) == 0:
        raise ValueError("No data for split=" + str(split))

    return df


# ---------------- TRAIN DATASET ----------------
class OfficeHomeTripletDataset(Dataset):

    def __init__(self, csv_path, label_map, split="train", transform=None):

        # ---- LOAD DATA ----
        self.df = load_split_dataframe(csv_path, split)

        # ---- ADD LABEL COLUMN ----
        self.df["label"] = self.df["class_name"].map(label_map)

        self.transform = transform

        # ---- CLASS LIST ----
        class_list = self.df["class_name"].unique()
        class_list = sorted(class_list)
        self.all_classes = class_list

        # ---- STRUCTURES ----
        self.domain_groups = {}
        self.positive_domain_options = {}

        # ---- GROUP BY CLASS ----
        grouped = self.df.groupby("class_name")

        for class_name in grouped.groups:
            group = grouped.get_group(class_name)

            domains = group["domain"].unique()
            domains = list(domains)

            # ---- DOMAIN GROUPS ----
            for domain in domains:
                key = (class_name, domain)

                domain_rows = group[group["domain"] == domain]
                domain_rows = domain_rows.reset_index(drop=True)

                self.domain_groups[key] = domain_rows

                # ---- VALID POSITIVE DOMAINS ----
                valid_domains = []

                for d in domains:
                    if d != domain:
                        if not self._is_blocked_positive_pair(domain, d):
                            valid_domains.append(d)

                if len(valid_domains) > 0:
                    self.positive_domain_options[key] = valid_domains

        # ---- VALID ANCHORS ----
        valid_keys = set(self.positive_domain_options.keys())

        valid_rows = []

        for i in range(len(self.df)):
            row = self.df.iloc[i]
            key = (row["class_name"], row["domain"])

            if key in valid_keys:
                valid_rows.append(row)

        self.anchor_df = pd.DataFrame(valid_rows).reset_index(drop=True)

        if len(self.anchor_df) == 0:
            raise ValueError("No valid anchors")

        # ---- CLASS TO ROWS ----
        self.class_to_rows = {}

        for class_name in grouped.groups:
            group = grouped.get_group(class_name)
            group = group.reset_index(drop=True)
            self.class_to_rows[class_name] = group

        print("[INFO]", split, "samples:", len(self.anchor_df))


    # ---------------- LENGTH ----------------
    def __len__(self):
        return len(self.anchor_df)


    # ---------------- IMAGE LOAD ----------------
    def _load_image(self, path):
        img = Image.open(path)
        img = img.convert("RGB")

        if self.transform is not None:
            img = self.transform(img)

        return img


    # ---------------- DOMAIN LABEL ----------------
    @staticmethod
    def _domain_label(domain):
        return config.DOMAIN_NAMES.index(domain)


    # ---------------- BLOCK RULE ----------------
    @staticmethod
    def _is_blocked_positive_pair(a, b):
        pair = {a, b}
        return pair == {"Product", "Real World"}


    # ---------------- GET ITEM ----------------
    def __getitem__(self, idx):

        # ---- ANCHOR ----
        anchor = self.anchor_df.iloc[idx]

        cls = anchor["class_name"]
        d1 = anchor["domain"]

        # ---- POSITIVE ----
        key = (cls, d1)
        domain_options = self.positive_domain_options[key]

        d2 = random.choice(domain_options)

        pos_candidates = self.domain_groups[(cls, d2)]
        pos = pos_candidates.sample(1).iloc[0]

        # ---- NEGATIVE ----
        neg_classes = []

        for c in self.all_classes:
            if c != cls:
                neg_classes.append(c)

        neg_cls = random.choice(neg_classes)

        neg_candidates = self.class_to_rows[neg_cls]
        neg = neg_candidates.sample(1).iloc[0]

        # ---- RETURN ----
        result = {}

        result["anchor"] = self._load_image(anchor["path"])
        result["positive"] = self._load_image(pos["path"])
        result["negative"] = self._load_image(neg["path"])

        result["anchor_label"] = int(anchor["label"])
        result["positive_label"] = int(pos["label"])
        result["negative_label"] = int(neg["label"])

        result["anchor_domain_label"] = self._domain_label(anchor["domain"])
        result["positive_domain_label"] = self._domain_label(pos["domain"])
        result["negative_domain_label"] = self._domain_label(neg["domain"])

        return result


# ---------------- EVAL DATASET ----------------
class OfficeHomeEvalDataset(Dataset):

    def __init__(self, csv_path, label_map, split="val", transform=None):

        self.df = load_split_dataframe(csv_path, split)

        self.df["label"] = self.df["class_name"].map(label_map)

        self.transform = transform

        print("[INFO]", split, "samples:", len(self.df))


    def __len__(self):
        return len(self.df)


    def __getitem__(self, idx):

        row = self.df.iloc[idx]

        path = row["path"]

        img = Image.open(path)
        img = img.convert("RGB")

        if self.transform is not None:
            img = self.transform(img)

        result = {}

        result["image"] = img
        result["label"] = int(row["label"])
        result["class_name"] = row["class_name"]
        result["domain"] = row["domain"]
        result["path"] = str(Path(path))

        return result