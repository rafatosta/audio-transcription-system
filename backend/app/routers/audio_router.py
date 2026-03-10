from fastapi import APIRouter, UploadFile, File, Query, HTTPException
from app.services.audio_service import save_audio_file, transcribe_audio, VALID_MODELS

router = APIRouter(
    prefix="/audio",
    tags=["audio"]
)


@router.post("/upload")
async def upload_audio(
    file: UploadFile = File(...),
    model: str = Query("base", description="Modelo Whisper a ser utilizado")
):
    if model not in VALID_MODELS:
        raise HTTPException(
            status_code=400,
            detail=f"Modelo inválido: '{model}'. Modelos permitidos: {VALID_MODELS}"
        )

    file_path = save_audio_file(file)

    transcription = transcribe_audio(file_path, model)

    return {
        "message": "Arquivo processado com sucesso",
        "filename": file.filename,
        "transcription": transcription
    }