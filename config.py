from pathlib import Path

import torch


PROJECT_ROOT = Path(__file__).resolve().parent
CSV_PATH = PROJECT_ROOT / "dataset_index.csv"

OUTPUTS_DIR = PROJECT_ROOT / "outputs"
CHECKPOINT_DIR = OUTPUTS_DIR / "checkpoints"
REPORTS_DIR = OUTPUTS_DIR / "reports"
EMBEDDINGS_DIR = OUTPUTS_DIR / "embeddings"
SAMPLES_DIR = OUTPUTS_DIR / "samples"
LOGS_DIR = OUTPUTS_DIR / "logs"

for folder in [OUTPUTS_DIR, CHECKPOINT_DIR, REPORTS_DIR, EMBEDDINGS_DIR, SAMPLES_DIR, LOGS_DIR]:
    folder.mkdir(parents=True, exist_ok=True)

DEVICE = "cuda" if torch.cuda.is_available() else ("mps" if torch.backends.mps.is_available() else "cpu")
SEED = 42

IMAGE_SIZE = 128
EMBED_DIM = 256
HEAD_HIDDEN_DIM = 512
HEAD_DROPOUT = 0.2
NUM_CLASSES = 65

HFLIP_PROB = 0.5
ROTATION_DEGREES = 8
COLOR_JITTER_BRIGHTNESS = 0.1
COLOR_JITTER_CONTRAST = 0.1
COLOR_JITTER_SATURATION = 0.05

BATCH_SIZE = 32
EVAL_BATCH_SIZE = 32
EPOCHS = 10
NUM_WORKERS = 3
CLASS_LOSS_WEIGHT = 1.0
DOMAIN_LOSS_WEIGHT = 0.2
GRL_LAMBDA = 1.0
DOMAIN_NAMES = ["Art", "Clipart", "Product", "Real World"]

MODEL_NAMES = ["resnet50", "vgg16_bn", "densenet121"]
HEAD_DEPTHS = [1, 2, 3]
LRS = [0.001, 0.003, 0.01]

def get_experiment_name(model_name, head_depth, lr):
    lr_text = str(lr).replace(".", "_")
    return f"{model_name}_head{head_depth}_lr{lr_text}"

TOP_KS = [1, 5, 10]
WEIGHTED_K = 5

INFERENCE_SPLIT = "test"
INFERENCE_SAMPLES = 5
INFERENCE_TOP_K = 50
TSNE_MAX_POINTS = 5000

BEST_MODEL_PATH = REPORTS_DIR / "best_model.csv"
TEST_REPORT_PATH = REPORTS_DIR / "test_report.csv"
TEST_RANKING_PATH = REPORTS_DIR / "test_ranking.csv"
TEST_RANKING_PLOT_PATH = REPORTS_DIR / "test_top_scores.png"
TOP_CONFIGS_PLOT_COUNT = 27
