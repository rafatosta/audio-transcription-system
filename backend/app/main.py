from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.audio_router import router as audio_router

app = FastAPI(
    title="Audio Transcription System",
    version="0.1.0"
)

# Origens permitidas
origins = [
    "http://localhost:5173",  # frontend Vite
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(audio_router)