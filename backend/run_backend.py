import os
import subprocess
import sys
import platform
from pathlib import Path

# Nome do ambiente virtual
VENV_DIR = "venv"

# Diretório de uploads
UPLOAD_DIR = Path("uploads")

# Detecta sistema operacional
IS_WINDOWS = platform.system() == "Windows"

print(f"Sistema Operacional: {platform.system()}")

# Define caminhos
if IS_WINDOWS:
    PYTHON_BIN = os.path.join(VENV_DIR, "Scripts", "python.exe")
    PIP_BIN = os.path.join(VENV_DIR, "Scripts", "pip.exe")
else:
    PYTHON_BIN = os.path.join(VENV_DIR, "bin", "python")
    PIP_BIN = os.path.join(VENV_DIR, "bin", "pip")

# -------------------------------------------------------------------
# Criar ambiente virtual
# -------------------------------------------------------------------

if not os.path.exists(VENV_DIR):
    print("Criando ambiente virtual...")
    subprocess.run([sys.executable, "-m", "venv", VENV_DIR], check=True)

# -------------------------------------------------------------------
# Atualizar pip
# -------------------------------------------------------------------

print("Atualizando pip...")
subprocess.run([PYTHON_BIN, "-m", "pip", "install", "--upgrade", "pip"], check=True)

# -------------------------------------------------------------------
# Instalar dependências
# -------------------------------------------------------------------

requirements_file = "requirements.txt"

if os.path.exists(requirements_file):
    print("Instalando dependências...")
    subprocess.run([PIP_BIN, "install", "-r", requirements_file], check=True)
else:
    print("Arquivo requirements.txt não encontrado.")
    sys.exit(1)

# -------------------------------------------------------------------
# Criar pasta uploads
# -------------------------------------------------------------------

if not UPLOAD_DIR.exists():
    print("Criando diretório uploads...")
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# -------------------------------------------------------------------
# Iniciar servidor FastAPI
# -------------------------------------------------------------------

print("\nIniciando servidor FastAPI...\n")

subprocess.run([
    PYTHON_BIN,
    "-m",
    "uvicorn",
    "app.main:app",
    "--reload",
    "--host",
    "0.0.0.0",
    "--port",
    "8000"
])