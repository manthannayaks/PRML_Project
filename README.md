`Folder structure`:

|-Dataset/
|       |-Art
|       |-Clipart
|       |-Product
|       |-Real World
|-requirements.txt
|-config.py
|-dataset.py
|-inference.py
|-losses.py
|-metrics.py
|-model.py
|-run_pipeline.bat
|-test.py
|-train.py
|-utils.py
|-val.py
|-EDA.py
|-create_csv.py
|-plot_config_scores.py


`requirements`:
 torch
 numpy
 pandas
 matplotlib
 torchvision
 tqdm
 transformers
 scikit-learn
 Pillow


 ` How to run` :
 run `.\run_pipeline.bat` from the project root in a terminal. It will create the virtual environment, install dependencies, run EDA, train all configurations, evaluate the best model on test, build rankings, and generate retrieval samples.

 `Main output folders`:

`outputs/checkpoints/`
- best checkpoint for each configuration

`outputs/logs/`
- training history csv
- per-config loss plot

`outputs/reports/`
- validation reports
- test reports
- best model summary
- validation ranking csv and validation bar plot
- test ranking csv for the single best model


`outputs/embeddings/`
- saved train, val, and test embeddings

`outputs/samples/`
- qualitative retrieval examples

`outputs/eda/`
- contains all the saved plot of dataset analysis after splitting

`Good_samples/`
-manually picked some good generated samples

`Bad_samples/`
-manually picked some bad generated samples

Files and Their Roles:
`create_csv.py`
- builds `dataset_index.csv` by scanning the dataset folders and assigning train/val/test splits per class-domain folder

`EDA.py`
- performs exploratory data analysis 

`config.py`
- stores hyperparameters, paths, model options, augmentation settings, and output locations

`dataset.py`
- loads split-wise data
- creates training triplets
- creates evaluation datasets

`model.py`
- builds pretrained backbones
- adds the trainable head
- adds embedding projection
- adds class classifier
- adds GRL and domain classifier

`losses.py`
- defines class cross-entropy loss
- defines domain cross-entropy loss

`train.py`
- trains each experiment configuration
- saves history and best checkpoints
- selects the best model using the score

`val.py`
- runs retrieval evaluation for a split
- saves metrics, retrieval outputs, t-SNE, and embeddings

`test.py`
- builds test ranking csv across checkpoints
- evaluates the best validation model on the test split
- saves test metrics and summary csv files

`metrics.py`
- generates embeddings
- computes cosine similarity
- computes retrieval metrics

`utils.py`
- helper utilities for transforms, checkpoints, history plots, and score calculation

`inference.py`
- saves qualitative retrieval example images
