import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.audio_router import router as audio_router

app = FastAPI(
    title="Audio Transcription System",
    version="0.1.0"
)

# Em produção defina ALLOWED_ORIGINS com as origens permitidas separadas por vírgula.
# Exemplo: ALLOWED_ORIGINS="https://meuapp.com,https://www.meuapp.com"
# Para desabilitar a restrição (desenvolvimento local), mantenha o valor padrão "*".
_raw_origins = os.getenv("ALLOWED_ORIGINS", "*")
allow_all_origins = _raw_origins.strip() == "*"

if allow_all_origins:
    origins = ["*"]
else:
    origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    # allow_credentials é incompatível com allow_origins=["*"] conforme a spec CORS
    allow_credentials=not allow_all_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(audio_router)