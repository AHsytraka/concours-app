# ENI IA Services

API unifiée des services IA de l'ENI regroupant la classification de documents et la délibération intelligente de concours.

## 📋 Table des matières

- [Structure du projet](#structure-du-projet)
- [Installation](#installation)
- [Configuration](#configuration)
- [Démarrage](#démarrage)
- [Services disponibles](#services-disponibles)
- [Documentation API](#documentation-api)

## 📁 Structure du projet

```
eni-ia-services/
├── main.py                      # Point d'entrée de l'application
├── requirements.txt             # Dépendances Python
├── README.md                    # Ce fichier
├── app/
│   ├── __init__.py
│   ├── classification/          # Module Classification de Documents
│   │   ├── __init__.py
│   │   ├── model.py             # Modèle LayoutLMv3
│   │   ├── predict.py           # Fonctions de prédiction
│   │   ├── preprocess.py        # Prétraitement des images
│   │   ├── routes.py            # Endpoints API
│   │   ├── schemas.py           # Modèles Pydantic
│   │   ├── service.py           # Logique métier
│   │   └── checkpoints/         # Checkpoint du modèle fine-tuné (à copier)
│   └── deliberation/            # Module Délibération & Sélection
│       ├── __init__.py
│       ├── concours_service.py  # Service délibération concours
│       ├── selection_service.py # Service sélection dossiers
│       ├── routes.py            # Endpoints API
│       └── schemas.py           # Modèles Pydantic
└── dataset/                     # (optionnel) Données d'entraînement
```

## 🚀 Installation

### Prérequis

- Python 3.10+
- pip ou conda

### Installation des dépendances

```bash
# Créer un environnement virtuel
python -m venv venv

# Activer l'environnement
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt
```

### Configuration du modèle de classification

Le modèle LayoutLMv3 fine-tuné doit être copié depuis l'ancien projet:

```bash
# Copier le checkpoint
cp -r ../ClassificationAi/models/layoutlm/checkpoints ./app/classification/checkpoints/
```

## ⚙️ Configuration

Les paramètres peuvent être configurés via variables d'environnement:

| Variable | Description | Défaut |
|----------|-------------|--------|
| `HOST` | Adresse d'écoute | `0.0.0.0` |
| `PORT` | Port de l'API | `8000` |
| `RELOAD` | Mode rechargement auto | `true` |

## 🖥️ Démarrage

```bash
# Démarrage simple
python main.py

# Ou avec uvicorn directement
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

L'API sera accessible sur: http://localhost:8000

## 📚 Services disponibles

### 1. Classification de Documents (`/api/v1/classification/`)

Classification automatique de documents administratifs avec LayoutLMv3.

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/classify/` | POST | Classifie un document |
| `/classify/batch` | POST | Classifie plusieurs documents |
| `/labels` | GET | Liste des catégories |

**Types de documents supportés:**
- `arrete` - Arrêtés administratifs
- `relever` - Relevés de notes

**Formats acceptés:** PNG, JPG, JPEG

### 2. Délibération de Concours (`/api/v1/deliberation/concours/`)

Délibération intelligente avec calcul de moyennes et classement.

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/deliberation` | POST | Lance la délibération |
| `/saisie-notes` | POST | Formate les notes pour délibération |

**Exemple de requête:**
```json
{
    "candidats": [
        {
            "id": "C001",
            "nom": "Rakoto",
            "prenom": "Jean",
            "notes": [
                {"matiere": "Mathématiques", "note": 15, "coefficient": 4},
                {"matiere": "Physique", "note": 12, "coefficient": 3}
            ]
        }
    ],
    "criteres": {
        "moyenne_minimum": 10,
        "nombre_places": 50,
        "note_eliminatoire": 5
    }
}
```

### 3. Sélection de Dossiers (`/api/v1/deliberation/selection/`)

Analyse intelligente des dossiers de candidature.

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/analyser` | POST | Analyse plusieurs dossiers |
| `/evaluer-un` | POST | Évalue un seul dossier |

**Exemple de requête:**
```json
{
    "dossiers": [
        {
            "id": "D001",
            "nom": "Razafy",
            "prenom": "Marie",
            "notes": [
                {"matiere": "Mathématiques", "note": 14},
                {"matiere": "Informatique", "note": 16}
            ],
            "mention": "Bien"
        }
    ],
    "criteres": {
        "moyenne_minimum": 12,
        "criteres_texte": "Bonne maîtrise des mathématiques et informatique",
        "filiere_cible": "Master Informatique"
    }
}
```

## 📖 Documentation API

La documentation interactive Swagger est disponible sur:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## 🔍 Endpoints utilitaires

| Endpoint | Description |
|----------|-------------|
| `/` | Informations sur l'API |
| `/health` | État de santé des services |
| `/model/info` | Informations sur les modèles chargés |

## 🛠️ Développement

### Tests

```bash
# Lancer les tests (à implémenter)
pytest tests/
```

### Structure pour extension

Pour ajouter un nouveau module:

1. Créer un dossier dans `app/`
2. Ajouter les fichiers: `__init__.py`, `routes.py`, `schemas.py`, `service.py`
3. Enregistrer le router dans `main.py`

## 📝 Notes de migration

Ce projet unifie les anciens projets:
- **ClassificationAI** → `app/classification/`
- **concours-ia** → `app/deliberation/`

Les deux modules fonctionnent indépendamment et peuvent être utilisés séparément.
