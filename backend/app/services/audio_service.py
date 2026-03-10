from pathlib import Path
from fastapi import UploadFile
from typing import Any
import shutil
import whisper

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

VALID_MODELS = ['tiny', 'base', 'small', 'medium', 'large']

# Cache of loaded models to avoid reloading the same model multiple times
_model_cache: dict[str, Any] = {}


def load_model(model_name: str) -> Any:
    if model_name not in VALID_MODELS:
        raise ValueError(f"Modelo inválido: {model_name}. Modelos permitidos: {VALID_MODELS}")
    if model_name not in _model_cache:
        _model_cache[model_name] = whisper.load_model(model_name)
    return _model_cache[model_name]


def save_audio_file(file: UploadFile) -> Path:

    file_path = UPLOAD_DIR / file.filename

    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return file_path


def transcribe_audio(file_path: Path, model_name: str = "base") -> str:

    model = load_model(model_name)
    result = model.transcribe(str(file_path))

    return result["text"]