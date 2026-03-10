from fastapi import FastAPI
from app.routers.audio_router import router as audio_router

app = FastAPI(
    title="Audio Transcription System",
    version="0.1.0"
)

app.include_router(audio_router)