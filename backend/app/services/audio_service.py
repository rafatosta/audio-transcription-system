from pathlib import Path
from fastapi import UploadFile
import shutil
import whisper

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Carrega o modelo apenas uma vez
model = whisper.load_model("base")


def save_audio_file(file: UploadFile) -> Path:

    file_path = UPLOAD_DIR / file.filename

    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return file_path


def transcribe_audio(file_path: Path) -> str:

    result = model.transcribe(str(file_path))

    return result["text"]