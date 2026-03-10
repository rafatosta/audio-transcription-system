from fastapi import APIRouter, UploadFile, File
from app.services.audio_service import save_audio_file, transcribe_audio

router = APIRouter(
    prefix="/audio",
    tags=["audio"]
)


@router.post("/upload")
async def upload_audio(file: UploadFile = File(...)):

    file_path = save_audio_file(file)

    transcription = transcribe_audio(file_path)

    return {
        "message": "Arquivo processado com sucesso",
        "filename": file.filename,
        "transcription": transcription
    }