"""
Modèle LayoutLMv3 pour la classification de documents.
"""

import torch
import os
from transformers import LayoutLMv3TokenizerFast, LayoutLMv3ForSequenceClassification, AutoProcessor


class LayoutLMv3Classifier:
    """
    Wrapper pour charger LayoutLMv3 pour la classification de documents (arrete/relever).
    """

    def __init__(
        self,
        model_name: str = "microsoft/layoutlmv3-base",
        num_labels: int = 2,
        checkpoint_path: str = None
    ):
        """
        Initialise le modèle LayoutLMv3.

        Args:
            model_name: nom du modèle HF (préentraîné ou base)
            num_labels: nombre de classes (2: arrete, relever)
            checkpoint_path: chemin vers un dossier checkpoint fine-tuné
        """

        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.num_labels = num_labels
        
        # Labels de classification
        self.id2label = {0: "arrete", 1: "relever"}
        self.label2id = {"arrete": 0, "relever": 1}

        # Charger depuis checkpoint fine-tuné ou modèle de base
        if checkpoint_path and os.path.exists(checkpoint_path):
            print(f"[INFO] Loading fine-tuned model from {checkpoint_path}")
            self.processor = AutoProcessor.from_pretrained(checkpoint_path)
            self.model = LayoutLMv3ForSequenceClassification.from_pretrained(
                checkpoint_path,
                num_labels=num_labels,
                id2label=self.id2label,
                label2id=self.label2id
            ).to(self.device)
        else:
            print(f"[INFO] Loading base model: {model_name}")
            self.processor = AutoProcessor.from_pretrained(model_name)
            self.model = LayoutLMv3ForSequenceClassification.from_pretrained(
                model_name,
                num_labels=num_labels,
                id2label=self.id2label,
                label2id=self.label2id
            ).to(self.device)

        # Tokenizer pour le texte seul
        self.tokenizer = LayoutLMv3TokenizerFast.from_pretrained(
            checkpoint_path if checkpoint_path and os.path.exists(checkpoint_path) else model_name
        )

        self.model.eval()

    def get_tokenizer(self):
        return self.tokenizer

    def get_processor(self):
        return self.processor

    def get_model(self):
        return self.model

    def get_device(self):
        return self.device
    
    def get_labels(self):
        return self.id2label


# Chemin vers le checkpoint (relatif au projet unifié)
# Le checkpoint doit être copié depuis ClassificationAI/models/layoutlm/checkpoints
CHECKPOINT_PATH = "app/classification/checkpoints"

# Chemin alternatif si exécuté depuis la racine du projet
if not os.path.exists(CHECKPOINT_PATH):
    CHECKPOINT_PATH = os.path.join(os.path.dirname(__file__), "checkpoints")

layoutlmv3_instance = LayoutLMv3Classifier(
    model_name="microsoft/layoutlmv3-base",
    num_labels=2,
    checkpoint_path=CHECKPOINT_PATH if os.path.exists(CHECKPOINT_PATH) else None
)
