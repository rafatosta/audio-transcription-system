# Audio Transcription System

Sistema para **upload, processamento e transcrição de áudios**, composto por um **frontend web** e um **backend em FastAPI** responsável pelo recebimento e processamento inicial dos arquivos.

O projeto foi concebido para permitir a evolução futura para um pipeline completo de transcrição de áudio utilizando modelos de **Speech-to-Text**.

---

# Arquitetura do Projeto

```
audio-transcription-system
│
├── backend/        # API responsável por receber e armazenar os áudios
├── frontend/       # Interface web para envio e visualização de transcrições
├── docs/           # Documentação adicional do projeto
└── README.md
```

---

# Objetivos do Projeto

* Receber arquivos de áudio via interface web
* Armazenar os arquivos enviados
* Processar os áudios para transcrição
* Disponibilizar as transcrições para consulta

---

# Tecnologias Utilizadas

## Backend

* Python
* FastAPI
* Uvicorn

## Frontend

*(definir conforme evolução do projeto)*

Possíveis tecnologias:

* React
* TailwindCSS

---

# Fluxo básico do sistema

```
Frontend
   ↓
Upload de áudio
   ↓
Backend (FastAPI)
   ↓
Armazenamento do arquivo
   ↓
Processamento / Transcrição (futuro)
   ↓
Retorno do texto transcrito
```

---

# Status do Projeto

Fase inicial de desenvolvimento.

Funcionalidades atuais:

* Upload de arquivos de áudio
* Armazenamento local dos arquivos

Funcionalidades planejadas:

* Transcrição automática
* Histórico de áudios enviados
* Download das transcrições
* Processamento assíncrono de tarefas

---

# Backend

A documentação completa da API pode ser encontrada em:

```
backend/README.md
```

---

# Execução (visão geral)

### 1 - Clonar o repositório

```
git clone <repo>
cd audio-transcription-system
```

### 2 - Executar o backend

```
cd backend
uvicorn main:app --reload
```

### 3 - Acessar a documentação da API

```
http://localhost:8000/docs
```

---

# Licença

Definir conforme política do projeto.
