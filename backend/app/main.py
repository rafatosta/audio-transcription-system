import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.audio_router import router as audio_router

app = FastAPI(
    title="Audio Transcription System",
    version="0.1.0"
)

# Origens permitidas – separe múltiplas origens por vírgula na variável de ambiente.
# Exemplo: ALLOWED_ORIGINS="http://localhost:5173,https://192.168.1.100:5173"
_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,https://localhost:5173")
origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(audio_router)