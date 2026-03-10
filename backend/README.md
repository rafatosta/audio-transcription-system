# Backend — Audio Transcription System

Backend da aplicação **Audio Transcription System**, desenvolvido em **FastAPI**, responsável por:

* receber arquivos de áudio enviados pelo frontend
* armazenar os arquivos no servidor
* gerar automaticamente a **transcrição do áudio utilizando Whisper**
* retornar o texto transcrito para o cliente

O backend foi estruturado para permitir evolução futura para um pipeline completo de **speech-to-text** com processamento assíncrono.

---

# Tecnologias Utilizadas

* Python 3.10+
* FastAPI
* Uvicorn
* Pydantic
* python-multipart
* Whisper (OpenAI)
* PyTorch

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
├── run_backend.py             # Script para automatizar execução do backend
├── requirements.txt
└── README.md
```

---

# Responsabilidade dos Módulos

## main.py

Arquivo principal da aplicação.

Responsável por:

* inicializar o FastAPI
* registrar os routers da aplicação

---

## routers

Define os **endpoints da API**.

Responsabilidades:

* receber requisições
* validar parâmetros
* encaminhar chamadas para os services

---

## services

Contém a **lógica de negócio da aplicação**.

Responsabilidades:

* salvar arquivos de áudio
* executar a transcrição usando Whisper
* retornar o resultado da transcrição

---

## schemas

Define os **modelos de dados utilizados pela API**, utilizando **Pydantic**.

Responsabilidades:

* validação de dados
* estrutura das respostas da API

---

## config

Centraliza configurações da aplicação.

Exemplo:

* diretórios do sistema
* paths de armazenamento
* variáveis de ambiente

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

As dependências incluem o **Whisper**, que será utilizado para realizar a transcrição automática do áudio.

---

# Execução Automatizada

O backend pode ser iniciado com o script:

```
python run_backend.py
```

Esse script automaticamente:

* cria o ambiente virtual (se necessário)
* atualiza o pip
* instala as dependências
* cria o diretório `uploads`
* inicia o servidor FastAPI

---

# Executando manualmente

Também é possível iniciar o servidor manualmente:

```
uvicorn app.main:app --reload
```

Servidor disponível em:

```
http://localhost:8000
```

---

# Documentação automática da API

FastAPI gera automaticamente documentação interativa.

### Swagger

```
http://localhost:8000/docs
```

### ReDoc

```
http://localhost:8000/redoc
```

---

# Endpoint de Upload e Transcrição

## POST /audio/upload

Recebe um arquivo de áudio, salva no servidor e executa a **transcrição automática utilizando Whisper**.

---

## Parâmetros

| Nome | Tipo       | Descrição                                        |
| ---- | ---------- | ------------------------------------------------ |
| file | UploadFile | Arquivo de áudio enviado via multipart/form-data |

---

## Exemplo de requisição

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
  "message": "Arquivo processado com sucesso",
  "filename": "audio.mp3",
  "transcription": "Olá, este é um exemplo de transcrição de áudio."
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

# Modelos Whisper

O Whisper possui diferentes modelos com diferentes níveis de precisão e desempenho.

| Modelo | Velocidade   | Qualidade |
| ------ | ------------ | --------- |
| tiny   | muito rápido | baixa     |
| base   | rápido       | boa       |
| small  | médio        | melhor    |
| medium | lento        | alta      |
| large  | mais lento   | excelente |

Exemplo utilizado no projeto:

```
model = whisper.load_model("base")
```

---

# Fluxo de Processamento

```
Upload de áudio
      ↓
Armazenamento do arquivo
      ↓
Processamento com Whisper
      ↓
Geração da transcrição
      ↓
Retorno do texto pela API
```

---

# Melhorias Futuras

Funcionalidades planejadas para evolução do backend:

* geração automática de nomes únicos para arquivos
* validação de tipos de áudio
* limite de tamanho de upload
* transcrição assíncrona
* armazenamento de transcrições em banco de dados
* histórico de áudios processados
* API para consulta de transcrições

---

# Evolução Arquitetural Planejada

Arquitetura futura do sistema:

```
Upload de áudio
      ↓
Armazenamento
      ↓
Fila de processamento
      ↓
Worker Whisper
      ↓
Armazenamento da transcrição
      ↓
Consulta via API
```

Possíveis tecnologias:

* Redis / RabbitMQ
* Celery / RQ
* banco de dados para armazenar transcrições

---

# Licença

Definir conforme a política do projeto.