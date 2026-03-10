from fastapi import APIRouter, UploadFile, File
from app.services.audio_service import save_audio_file

router = APIRouter(
    prefix="/audio",
    tags=["audio"]
)


@router.post("/upload")
async def upload_audio(file: UploadFile = File(...)):
    
    saved_file = save_audio_file(file)

    return {
        "message": "Arquivo salvo com sucesso",
        "filename": saved_file
    }