# Cross-Domain Image Retrieval and Classification (Office-Home)

[![Python](https://img.shields.io/badge/Python-3.8%2B-blue.svg)](https://www.python.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0%2B-EE4C2C.svg)](https://pytorch.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A state-of-the-art implementation of **Domain-Adversarial Neural Networks (DANN)** for multi-domain image retrieval and classification using the **Office-Home** dataset. This project leverages **Gradient Reversal Layers (GRL)** and **Triplet-based data sampling** to learn domain-invariant features across four distinct visual domains: Art, Clipart, Product, and Real World.

## 📌 Project Overview

In real-world computer vision, models often perform poorly when the visual style changes (e.g., training on photos but testing on sketches). This project addresses this "Domain Gap" by training a model that recognizes the underlying object (65 classes) while ignoring the domain-specific artistic style.

### Key Objectives:
- **Domain Generalization:** Learning features that are consistent across different visual domains.
- **Robust Retrieval:** Building a high-performance cross-domain image retrieval system.
- **Comparison of Backbones:** Evaluating performance across ResNet-50, VGG-16, and DenseNet-121 architectures.

---

## 🚀 Methodology

### 1. Domain-Adversarial Training (DANN)
We implement a DANN architecture which consists of:
- **Feature Extractor:** A CNN backbone (e.g., ResNet50) used to extract high-dimensional features.
- **Label Classifier:** Predicts the object category (65 classes) using standard Cross-Entropy loss.
- **Domain Classifier:** An adversarial branch that tries to predict which domain (Art, Clipart, etc.) the image belongs to.
- **Gradient Reversal Layer (GRL):** During the backward pass, the GRL flips the sign of the gradients from the domain classifier. This forces the feature extractor to learn representations that **actively confuse** the domain classifier, resulting in domain-invariant features.

### 2. Triplet-Based Sampling
The `OfficeHomeTripletDataset` samples triplets consisting of an **Anchor**, a **Positive** (same class, different domain), and a **Negative** (different class). This ensures that each training batch contains cross-domain pairings, encouraging the model to group similar objects together regardless of their source domain.

---

## 📂 Project Structure

```text
├── Dataset/                # Raw image data (Art, Clipart, Product, Real World)
├── outputs/                # Auto-generated reports, plots, and checkpoints
├── model.py                # DANN Architecture with GRL implementation
├── train.py                # Multi-experiment training pipeline
├── config.py               # Global hyperparameters and path configurations
├── dataset.py              # Triplet sampling and evaluative dataset logic
├── metrics.py              # retrieval evaluation (mAP, Recall@k, Precision@k)
├── create_csv.py           # Dataset indexing and split generation
├── EDA.py                  # Exploratory Data Analysis and distribution plots
├── inference.py            # Result visualization and qualitative sampling
└── run_pipeline.bat        # Automated end-to-end execution script
```

---

## 🛠️ Installation & Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/manthannayaks/PRML_Project.git
   cd PRML_Project
   ```

2. **Environment Setup:**
   It is recommended to use a virtual environment.
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Requirements:**
   - `torch`, `torchvision`
   - `pandas`, `numpy`, `matplotlib`, `scikit-learn`
   - `tqdm`, `Pillow`, `transformers`

---

## 🏃 Usage Guide

### 1. Data Initialization
Generate the dataset index and perform EDA:
```bash
python create_csv.py
python EDA.py
```

### 2. Automated Pipeline
Run the full experiment suite (covers all backbones, learning rates, and head depths):
```bash
# On Windows
.\run_pipeline.bat
```

### 3. Manual Training
To train a specific configuration:
```bash
python train.py
```

### 4. Evaluation & Visualization
After training, generate retrieval samples and t-SNE visualizations:
```bash
python inference.py
```

---

## 📊 Evaluation Metrics

The system evaluates performance using standard retrieval metrics with a focus on **Cross-Domain consistency**:
- **Accuracy@1:** Top-1 classification accuracy.
- **mAP (Mean Average Precision):** Evaluated specifically for cross-domain queries.
- **Recall@k & Precision@k:** Top-k retrieval performance metrics.
- **Same-Domain Ratio:** Tracks how often the model retrieves images from the same style vs. different styles.

---

## 📉 Outputs

All results are saved in the `outputs/` directory:
- `/checkpoints/`: Best model weights for each configuration.
- `/logs/`: Training history CSVs and loss curves.
- `/reports/`: Precision/Recall bars and the final "Best Model" summary.
- `/samples/`: Visual retrieval results showing Query image vs. Top matches.
- `/embeddings/`: Saved feature vectors for t-SNE analysis.

---

## 👥 Contributors

- **Manthan Nayak** - [GitHub](https://github.com/manthannayaks)

---
*Developed as part of the PRML (Pattern Recognition and Machine Learning) Course Project.*
