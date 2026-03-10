# Backend — Audio Transcription System

Backend da aplicação **Audio Transcription System**, desenvolvido em **FastAPI**, responsável por receber arquivos de áudio enviados pelo frontend e armazená-los no servidor para processamento posterior.

Este backend foi estruturado para permitir evolução futura para um pipeline completo de **transcrição automática de áudio (speech-to-text)**.

---

# Tecnologias Utilizadas

* Python 3.10+
* FastAPI
* Uvicorn
* Pydantic
* python-multipart

---

# Estrutura do Backend

```
backend/
│
├── app/
│   │
│   ├── main.py                # Inicialização da aplicação FastAPI
│   │
│   ├── routers/               # Definição dos endpoints da API
│   │   └── audio_router.py
│   │
│   ├── services/              # Regras de negócio da aplicação
│   │   └── audio_service.py
│   │
│   ├── schemas/               # Modelos de dados (Pydantic)
│   │   └── audio_schema.py
│   │
│   └── config/                # Configurações da aplicação
│       └── settings.py
│
├── uploads/                   # Diretório onde os áudios são armazenados
│
├── requirements.txt
└── README.md
```

---

# Responsabilidade dos Módulos

### main.py

Arquivo principal da aplicação.

Responsável por:

* inicializar o FastAPI
* registrar os routers da aplicação

---

### routers

Define os **endpoints da API**.

Responsabilidades:

* receber requisições
* validar parâmetros
* encaminhar para os services

---

### services

Contém a **lógica de negócio da aplicação**.

Exemplo:

* salvar arquivos
* iniciar processamento de áudio
* integração com serviços externos

---

### schemas

Define os **modelos de dados utilizados pela API**, utilizando **Pydantic**.

Responsabilidades:

* validação de dados
* estrutura de respostas da API

---

### config

Centraliza configurações da aplicação.

Exemplo:

* diretórios do sistema
* variáveis de ambiente
* paths de armazenamento

---

# Instalação

## 1 — Criar ambiente virtual

```
python -m venv venv
```

---

## 2 — Ativar ambiente virtual

### Linux / macOS

```
source venv/bin/activate
```

### Windows

```
venv\Scripts\activate
```

---

## 3 — Instalar dependências

```
pip install -r requirements.txt
```

---

# Executando o servidor

A partir da pasta **backend**:

```
uvicorn app.main:app --reload
```

Servidor disponível em:

```
http://localhost:8000
```

---

# Documentação automática da API

FastAPI gera automaticamente a documentação interativa.

### Swagger UI

```
http://localhost:8000/docs
```

### ReDoc

```
http://localhost:8000/redoc
```

---

# Endpoint de Upload de Áudio

## POST /audio/upload

Recebe um arquivo de áudio enviado pelo cliente e armazena no servidor.

---

## Parâmetros

| Nome | Tipo       | Descrição                                        |
| ---- | ---------- | ------------------------------------------------ |
| file | UploadFile | Arquivo de áudio enviado via multipart/form-data |

---

## Exemplo de requisição (curl)

```
curl -X POST "http://localhost:8000/audio/upload" \
-H "accept: application/json" \
-H "Content-Type: multipart/form-data" \
-F "file=@audio.mp3"
```

---

## Exemplo de resposta

```
{
  "message": "Arquivo salvo com sucesso",
  "filename": "audio.mp3"
}
```

---

# Armazenamento de Arquivos

Todos os arquivos enviados são armazenados no diretório:

```
backend/uploads/
```

Esse diretório é criado automaticamente caso não exista.

---

# Melhorias Futuras

Funcionalidades planejadas para evolução do backend:

* geração automática de nomes únicos para arquivos
* validação de tipos de áudio
* limite de tamanho de upload
* processamento assíncrono de tarefas
* integração com modelos de transcrição de áudio
* armazenamento de transcrições em banco de dados

---

# Evolução Arquitetural Planejada

A arquitetura do sistema foi preparada para evoluir para um pipeline de processamento como o seguinte:

```
Upload de áudio
      ↓
Armazenamento do arquivo
      ↓
Fila de processamento
      ↓
Worker de transcrição
      ↓
Armazenamento do texto
      ↓
Consulta das transcrições pela API
```

Possíveis tecnologias futuras:

* Redis / RabbitMQ (fila de tarefas)
* Celery / RQ (workers)
* Whisper ou outros modelos de speech-to-text

---

# Licença

Definir conforme a política do projeto.